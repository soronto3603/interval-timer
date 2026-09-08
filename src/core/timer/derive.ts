import { Anchor, Segment, TimerState } from './types';

/**
 * 세그먼트 리스트 + 앵커 + 현재 시각 → 타이머 상태.
 *
 * 상태를 저장하지 않고 매번 파생한다. 그래서:
 *   - 백그라운드 복귀 보정이 공짜다. now 를 다시 읽는 것이 곧 보정이다
 *   - 일시정지가 별도 코드 경로를 타지 않는다. pausedAt 이 시간을 고정시킨다
 *   - 클럭이 인자라서 시간에 얽힌 모든 규칙을 순수하게 테스트할 수 있다
 */
export function derive(
  segments: Segment[],
  anchor: Anchor,
  now: number,
): TimerState {
  // 일시정지 중이면 시간이 pausedAt 에 멈춰 있다.
  // 시계가 뒤로 뛰어도(NTP 보정 등) 음수로 새지 않게 클램프한다.
  const effNow = anchor.pausedAt ?? now;
  const elapsed = Math.max(
    0,
    effNow - anchor.startedAt - anchor.pausedTotalMs,
  );

  let remainder = elapsed;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    // 무제한 카운트업(cap 없는 For Time)은 스스로 끝나지 않는다.
    // 사용자가 FINISH 를 누를 때까지 여기 머문다.
    if (segment.durationMs === null) {
      return {
        phase: anchor.pausedAt === null ? 'running' : 'paused',
        segmentIndex: i,
        segment,
        remainingMs: null,
        elapsedInSegmentMs: remainder,
        totalElapsedMs: elapsed,
      };
    }

    if (remainder < segment.durationMs) {
      return {
        phase: anchor.pausedAt === null ? 'running' : 'paused',
        segmentIndex: i,
        segment,
        remainingMs: segment.durationMs - remainder,
        elapsedInSegmentMs: remainder,
        totalElapsedMs: elapsed,
      };
    }

    remainder -= segment.durationMs;
  }

  // 마지막 세그먼트를 지났다. 일시정지 중이라도 완료가 우선한다.
  return {
    phase: 'complete',
    segmentIndex: segments.length,
    segment: segments[segments.length - 1],
    remainingMs: 0,
    elapsedInSegmentMs: 0,
    totalElapsedMs: elapsed,
  };
}
