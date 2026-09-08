import { Strings } from '../../i18n/strings';
import { formatCountdown } from '../timer/format';
import { ModeConfig } from '../timer/types';

const secs = (ms: number) => Math.round(ms / 1000);

/**
 * Home 의 `최근 운동` 행에 붙는 한 줄 요약.
 *
 * 타바타 문자열은 디자인의 recentMeta ("· 20초 / 10초 · 8라운드") 와
 * 정확히 일치해야 한다 — 그 값이 디자인이 의도한 서식이다.
 */
export function describeConfig(config: ModeConfig, t: Strings): string {
  switch (config.mode) {
    case 'tabata':
      return `· ${t.secondsShort(secs(config.workMs))} / ${t.secondsShort(
        secs(config.restMs),
      )} · ${t.roundsMeta(config.rounds)}`;
    case 'amrap':
      return `· ${formatCountdown(config.totalMs)} · ${
        config.countMethod === 'reps' ? t.reps : t.rounds
      }`;
    case 'emom':
      return `· ${config.count} × ${formatCountdown(config.intervalMs)}`;
    case 'fortime':
      return `· ${
        config.capMs === null ? t.noLimit : formatCountdown(config.capMs)
      }`;
  }
}
