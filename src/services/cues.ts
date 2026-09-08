import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { CueName } from '../core/timer/cues';

/**
 * 사운드 큐 재생. 큐가 실패해도 타이머는 계속 돈다 —
 * 이 파일의 모든 진입점이 예외를 삼키는 이유다.
 *
 * 플레이어를 미리 만들어 두고 재생 시점에는 seek + play 만 한다.
 * 세그먼트 경계에서 로드가 일어나면 소리가 늦는다.
 */

const SOURCES: Record<CueName, number> = {
  countdown: require('../../assets/sounds/countdown.wav'),
  workStart: require('../../assets/sounds/work-start.wav'),
  restStart: require('../../assets/sounds/rest-start.wav'),
};

const HAPTICS: Record<CueName, Haptics.ImpactFeedbackStyle> = {
  countdown: Haptics.ImpactFeedbackStyle.Light,
  workStart: Haptics.ImpactFeedbackStyle.Heavy,
  restStart: Haptics.ImpactFeedbackStyle.Medium,
};

let players: Partial<Record<CueName, AudioPlayer>> = {};
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

  for (const name of Object.keys(SOURCES) as CueName[]) {
    try {
      players[name] = createAudioPlayer(SOURCES[name]);
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

export type CueOptions = {
  /** 큐별 사운드 on/off (디자인 15번) */
  sound: Record<CueName, boolean>;
  /** 진동 전체 스위치 (디자인 13번 · 15번의 같은 값) */
  vibration: boolean;
};

export function playCue(name: CueName, options: CueOptions): void {
  if (options.sound[name]) {
    const player = players[name];
    try {
      // seekTo 는 Promise 를 돌려주지만 기다리지 않는다. 경계에서 한 틱이라도
      // 늦으면 소리가 밀린다. 대신 rejection 을 흘려서 처리하지 않은 예외로
      // 앱이 시끄러워지는 것을 막는다.
      player?.seekTo(0).catch(() => {});
      player?.play();
    } catch (err) {
      warnOnce(`${name} 재생`, err);
    }
  }

  if (options.vibration) {
    // 진동은 실패해도 조용히 넘긴다. 기기에 진동 모터가 없을 수 있다
    Haptics.impactAsync(HAPTICS[name]).catch(() => {});
  }
}

/** AMRAP 탭 집계 같은 UI 피드백. 큐 설정과 무관하게 진동 스위치만 본다. */
export function tapFeedback(vibration: boolean): void {
  if (!vibration) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
