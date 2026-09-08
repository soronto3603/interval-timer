const pad2 = (n: number) => String(n).padStart(2, '0');

const clock = (totalSeconds: number) =>
  `${pad2(Math.floor(totalSeconds / 60))}:${pad2(totalSeconds % 60)}`;

/**
 * 남은 시간. 올림한다 — "01" 이 화면에 있는 동안은 아직 1초가 남아 있어야 한다.
 */
export function formatCountdown(ms: number): string {
  return clock(Math.ceil(Math.max(0, ms) / 1000));
}

/**
 * 경과 시간. 내림한다 — 아직 지나지 않은 초를 앞당겨 보여주지 않는다.
 */
export function formatCountup(ms: number): string {
  return clock(Math.floor(Math.max(0, ms) / 1000));
}

/** prep 전용 2자리 초. 디자인 06번의 "03". */
export function formatPrepSeconds(ms: number): string {
  return pad2(Math.ceil(Math.max(0, ms) / 1000));
}
