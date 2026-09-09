import { TimerState } from './types';

/**
 * 울려야 할 신호. 단계가 붙는 것은 카운트다운뿐이다 — 3·2·1 이 서로 다른
 * 피치로 올라가야 해서, 어느 단계인지가 소리를 정한다.
 */
export type Cue =
  | { kind: 'readyEnter' }
  | { kind: 'countdown'; step: 3 | 2 | 1 }
  | { kind: 'warn10' }
  | { kind: 'workStart' }
  | { kind: 'restStart' }
  | { kind: 'complete' };

export type CueKind = Cue['kind'];

/**
 * 이 간격을 넘겨 벌어진 틱은 백그라운드에 있다 돌아온 것으로 본다.
 * 그 전이의 큐를 전부 삼켜서, 5분 만에 복귀했을 때 지난 알림이 몰아 터지지 않게 한다.
 */
const BACKGROUND_GAP_MS = 1_500;

/**
 * 3·2·1. 값이 곧 단계다.
 *
 * 오름차순으로 두는 이유: 한 틱에 여러 단계가 지나갔을 때 가장 **늦은** 단계를
 * 골라야 한다. 작은 단계부터 찾으면 처음 걸리는 것이 곧 가장 늦은 단계다.
 */
const COUNTDOWN_STEPS = [1, 2, 3] as const;

/** 막판 진입 알림 */
export const WARN_AT_MS = 10_000;

/**
 * 이보다 짧은 구간에서는 10초 경고를 내지 않는다.
 *
 * 타바타 기본 휴식이 10초다. 그대로 두면 경고가 rest_start 바로 뒤에 붙어
 * 두 소리가 겹치고, "막판 진입"이라는 뜻도 사라진다.
 */
export const WARN_MIN_SEGMENT_MS = 15_000;

const START_CUE: Partial<Record<TimerState['segment']['kind'], Cue>> = {
  work: { kind: 'workStart' },
  interval: { kind: 'workStart' },
  amrap: { kind: 'workStart' },
  fortime: { kind: 'workStart' },
  rest: { kind: 'restStart' },
  // prep 진입은 readyEnter 가 따로 담당한다
};

/**
 * 두 파생 상태를 비교해 이번 틱에 울려야 할 큐를 정한다.
 *
 * 엔진이 상태를 저장하지 않으므로 "무엇이 방금 일어났는가"는 이전 값과의 차이로만
 * 알 수 있다. 그 판정을 순수 함수로 두면 백그라운드 억제나 짧은 구간의 경고 생략
 * 같은 규칙을 실제로 테스트할 수 있다.
 */
export function cuesFor(
  prev: TimerState | null,
  next: TimerState,
  gapMs: number,
): Cue[] {
  if (gapMs > BACKGROUND_GAP_MS) return [];

  // 첫 틱. prep 이면 GET READY 진입을 알린다.
  if (prev === null) {
    return next.segment.kind === 'prep' && next.phase === 'running'
      ? [{ kind: 'readyEnter' }]
      : [];
  }

  // 완주는 마지막에 한 번만. derive 는 완료 상태에 계속 머문다.
  if (next.phase === 'complete') {
    return prev.phase === 'complete' ? [] : [{ kind: 'complete' }];
  }

  if (next.phase !== 'running') return [];

  // 세그먼트가 바뀌었다면 시작 큐만 낸다. 세그먼트를 건너뛴 상태에서
  // 남은 시간을 비교하는 것은 의미가 없다.
  if (prev.segmentIndex !== next.segmentIndex) {
    const cue = START_CUE[next.segment.kind];
    return cue ? [cue] : [];
  }

  if (next.segment.countUp) return [];
  if (prev.remainingMs === null || next.remainingMs === null) return [];

  const crossed = (threshold: number) =>
    prev.remainingMs! > threshold && next.remainingMs! <= threshold;

  // 한 틱에 여러 단계가 지나갔으면 가장 늦은 단계만 낸다.
  // 지나간 단계를 몰아 울리면 3·2·1 이 한꺼번에 터진다.
  const step = COUNTDOWN_STEPS.find((s) => crossed(s * 1_000));
  if (step !== undefined) return [{ kind: 'countdown', step }];

  const duration = next.segment.durationMs ?? 0;
  if (duration > WARN_MIN_SEGMENT_MS && crossed(WARN_AT_MS)) {
    return [{ kind: 'warn10' }];
  }

  return [];
}
