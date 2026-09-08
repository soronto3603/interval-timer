import { TimerState } from './types';

export type CueName = 'countdown' | 'workStart' | 'restStart';

/**
 * 이 간격을 넘겨 벌어진 틱은 백그라운드에 있다 돌아온 것으로 본다.
 * 그 전이의 큐를 전부 삼켜서, 5분 만에 복귀했을 때 지난 알림이 몰아 터지지 않게 한다.
 */
const BACKGROUND_GAP_MS = 1_500;

const COUNTDOWN_THRESHOLDS_MS = [3_000, 2_000, 1_000];

const START_CUE: Partial<Record<TimerState['segment']['kind'], CueName>> = {
  work: 'workStart',
  interval: 'workStart',
  amrap: 'workStart',
  fortime: 'workStart',
  rest: 'restStart',
  // prep 진입은 알리지 않는다 — 곧 이어질 3·2·1 이 그 역할을 한다
};

/**
 * 두 파생 상태를 비교해 이번 틱에 울려야 할 큐를 정한다.
 *
 * 엔진이 상태를 저장하지 않으므로 "무엇이 방금 일어났는가"는 이전 값과의 차이로만
 * 알 수 있다. 그 판정을 순수 함수로 두면 백그라운드 억제 같은 규칙을 실제로
 * 테스트할 수 있다.
 */
export function cuesFor(
  prev: TimerState | null,
  next: TimerState,
  gapMs: number,
): CueName[] {
  if (prev === null) return [];
  if (gapMs > BACKGROUND_GAP_MS) return [];
  if (next.phase !== 'running') return [];

  // 세그먼트가 바뀌었다면 시작 큐만 낸다. 세그먼트를 건너뛴 상태에서
  // 남은 시간을 비교하는 것은 의미가 없다.
  if (prev.segmentIndex !== next.segmentIndex) {
    const cue = START_CUE[next.segment.kind];
    return cue ? [cue] : [];
  }

  if (next.segment.countUp) return [];
  if (prev.remainingMs === null || next.remainingMs === null) return [];

  // 한 틱에 여러 임계가 지나가도 한 번만 울린다
  const crossed = COUNTDOWN_THRESHOLDS_MS.some(
    (t) => prev.remainingMs! > t && next.remainingMs! <= t,
  );
  return crossed ? ['countdown'] : [];
}
