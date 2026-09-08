import { ModeConfig } from '../timer/types';

/**
 * 계획된 운동 시간. prep 은 제외한다 — 준비 카운트다운은 운동이 아니다.
 *
 * @returns 미리 알 수 없는 경우(cap 없는 For Time) null
 */
export function totalMsOf(config: ModeConfig): number | null {
  switch (config.mode) {
    case 'tabata':
      return config.rounds * (config.workMs + config.restMs);
    case 'emom':
      return config.count * config.intervalMs;
    case 'amrap':
      return config.totalMs;
    case 'fortime':
      return config.capMs;
  }
}
