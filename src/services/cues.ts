import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { Cue } from '../core/timer/cues';

/**
 * 사운드 큐 재생. 큐가 실패해도 타이머는 계속 돈다 —
 * 이 파일의 모든 진입점이 예외를 삼키는 이유다.
 *
 * 플레이어를 미리 만들어 두고 재생 시점에는 배속 설정 + seek + play 만 한다.
 * 세그먼트 경계에서 로드가 일어나면 소리가 늦는다.
 */

type SourceName =
  | 'uiTap'
  | 'readyTick'
  | 'warning10s'
  | 'workStart'
  | 'restStart'
  | 'workoutComplete';

const SOURCES: Record<SourceName, number> = {
  uiTap: require('../../assets/sounds/ui_tap.wav'),
  readyTick: require('../../assets/sounds/ready_tick.wav'),
  warning10s: require('../../assets/sounds/warning_10s.wav'),
  workStart: require('../../assets/sounds/work_start.wav'),
  restStart: require('../../assets/sounds/rest_start.wav'),
  workoutComplete: require('../../assets/sounds/workout_complete.wav'),
};

export type HapticTier = 'light' | 'medium' | 'heavy';

const IMPACT: Record<HapticTier, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

/**
 * `ready_tick` 하나를 배속만 바꿔 3·2·1 과 준비 진입에 재사용한다.
 * `shouldCorrectPitch = false` 로 두면 배속이 곧 피치다.
 */
const READY_TICK_RATE = {
  /** 준비 진입 — 낮게 깔아 카운트다운과 구분한다 */
  enter: 0.84,
  3: 1.0,
  2: 1.06,
  /** 출발 직전 — 가장 높게 */
  1: 1.19,
} as const;

/** 큐 하나가 무엇을 울리고 얼마나 떨게 하는가 */
type CuePlan = {
  source: SourceName | null;
  rate: number;
  haptic: HapticTier;
  /** 완주 보상 — 강한 탭 뒤에 짧은 후속 탭 */
  followUp?: { haptic: HapticTier; delayMs: number };
};

function planFor(cue: Cue): CuePlan {
  switch (cue.kind) {
    case 'readyEnter':
      return {
        source: 'readyTick',
        rate: READY_TICK_RATE.enter,
        haptic: 'medium',
      };
    case 'countdown':
      return {
        source: 'readyTick',
        rate: READY_TICK_RATE[cue.step],
        // 출발 직전인 1 초만 조금 세게
        haptic: cue.step === 1 ? 'medium' : 'light',
      };
    case 'warn10':
      return { source: 'warning10s', rate: 1, haptic: 'light' };
    case 'workStart':
      return { source: 'workStart', rate: 1, haptic: 'heavy' };
    case 'restStart':
      return { source: 'restStart', rate: 1, haptic: 'medium' };
    case 'complete':
      return {
        source: 'workoutComplete',
        rate: 1,
        haptic: 'heavy',
        followUp: { haptic: 'light', delayMs: 220 },
      };
  }
}

let players: Partial<Record<SourceName, AudioPlayer>> = {};
let warned = false;

function warnOnce(where: string, err: unknown) {
  if (warned) return;
  warned = true;
  console.warn(`[cues] ${where} 실패, 무음으로 진행합니다`, err);
}

/** 앱 시작 시 한 번 호출한다. */
export async function prepareCues(): Promise<void> {
  try {
    // 무음 모드에서도 울려야 하고, 다른 앱의 음악을 끊지 않아야 한다
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    });
  } catch (err) {
    warnOnce('오디오 모드 설정', err);
  }

  for (const name of Object.keys(SOURCES) as SourceName[]) {
    try {
      const player = createAudioPlayer(SOURCES[name]);
      // 배속으로 피치를 바꾸려면 보정을 꺼야 한다
      player.shouldCorrectPitch = false;
      players[name] = player;
    } catch (err) {
      warnOnce(`${name} 로드`, err);
    }
  }
}

export function releaseCues(): void {
  for (const player of Object.values(players)) {
    try {
      player?.remove();
    } catch {
      // 이미 해제된 경우. 무시한다
    }
  }
  players = {};
}

function playSource(name: SourceName, rate: number): void {
  const player = players[name];
  if (!player) return;
  try {
    if (player.playbackRate !== rate) player.setPlaybackRate(rate);
    // seekTo 는 Promise 를 돌려주지만 기다리지 않는다. 경계에서 한 틱이라도
    // 늦으면 소리가 밀린다. 대신 rejection 을 흘려서 처리하지 않은 예외로
    // 앱이 시끄러워지는 것을 막는다.
    player.seekTo(0).catch(() => {});
    player.play();
  } catch (err) {
    warnOnce(`${name} 재생`, err);
  }
}

function vibrate(tier: HapticTier): void {
  // 진동은 실패해도 조용히 넘긴다. 기기에 진동 모터가 없을 수 있다
  Haptics.impactAsync(IMPACT[tier]).catch(() => {});
}

export type CueOptions = {
  /**
   * 디자인 15번의 토글 3개.
   *
   * `countdown` 은 3·2·1 과 10초 경고, 준비 진입까지 묶는다 (전부 카운트다운 계열).
   * 완료음은 토글이 없고, 셋이 모두 꺼져 있을 때만 함께 무음이 된다.
   */
  sound: { countdown: boolean; workStart: boolean; restStart: boolean };
  /** 진동 전체 스위치 (디자인 13번 · 15번의 같은 값) */
  vibration: boolean;
};

function soundAllowed(cue: Cue, sound: CueOptions['sound']): boolean {
  switch (cue.kind) {
    case 'readyEnter':
    case 'countdown':
    case 'warn10':
      return sound.countdown;
    case 'workStart':
      return sound.workStart;
    case 'restStart':
      return sound.restStart;
    case 'complete':
      // 완주 보상은 끌 이유가 적어 별도 토글을 두지 않았다.
      // 다만 사운드를 전부 껐다면 이것도 울리지 않아야 한다.
      return sound.countdown || sound.workStart || sound.restStart;
  }
}

export function playCue(cue: Cue, options: CueOptions): void {
  const plan = planFor(cue);

  if (plan.source && soundAllowed(cue, options.sound)) {
    playSource(plan.source, plan.rate);
  }

  if (options.vibration) {
    vibrate(plan.haptic);
    if (plan.followUp) {
      setTimeout(() => vibrate(plan.followUp!.haptic), plan.followUp.delayMs);
    }
  }
}

/**
 * 화면 조작 피드백 — 모드 선택 · 스테퍼 · 토글 · AMRAP 집계.
 * 소리는 내지 않고 가벼운 촉각만 준다 (설계상 "조작 피드백만").
 */
export function tapFeedback(vibration: boolean): void {
  if (!vibration) return;
  vibrate('light');
}

/**
 * START 탭 — 운동 세션이 시작된다는 확인.
 * 조작 피드백보다 한 단계 위라 짧은 클릭음이 함께 난다.
 */
export function startFeedback(options: CueOptions): void {
  if (options.sound.workStart) playSource('uiTap', 1);
  if (options.vibration) vibrate('medium');
}

/** 일시정지 · 재개 · 리셋/종료 확인 — 운동 중엔 소음보다 즉각적인 촉각 */
export function controlFeedback(vibration: boolean): void {
  if (!vibration) return;
  vibrate('medium');
}
