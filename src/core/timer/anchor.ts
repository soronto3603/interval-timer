import { Anchor } from './types';

/** 이 값보다 작은 역주행은 derive 의 max(0, …) 클램프가 흡수한다. */
const REWIND_THRESHOLD_MS = 5_000;

export function start(now: number): Anchor {
  return { startedAt: now, pausedTotalMs: 0, pausedAt: null };
}

export function pause(anchor: Anchor, now: number): Anchor {
  if (anchor.pausedAt !== null) return anchor;
  return { ...anchor, pausedAt: now };
}

export function resume(anchor: Anchor, now: number): Anchor {
  if (anchor.pausedAt === null) return anchor;
  return {
    startedAt: anchor.startedAt,
    pausedTotalMs: anchor.pausedTotalMs + (now - anchor.pausedAt),
    pausedAt: null,
  };
}

/**
 * 시계가 뒤로 뛰었을 때(NTP 보정, 사용자의 수동 시각 변경) 타이머가 되감기지
 * 않도록 시작점을 옮긴다. 앞으로 뛴 경우는 백그라운드 복귀이므로 손대지 않는다.
 */
export function reanchorIfRewound(
  anchor: Anchor,
  lastNow: number,
  now: number,
): Anchor {
  if (now >= lastNow - REWIND_THRESHOLD_MS) return anchor;

  // 역주행 직전의 경과 시간을 새 시각 기준으로 다시 성립시킨다
  const elapsed = Math.max(
    0,
    lastNow - anchor.startedAt - anchor.pausedTotalMs,
  );
  return { ...anchor, startedAt: now - anchor.pausedTotalMs - elapsed };
}
