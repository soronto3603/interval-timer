import { MODE_LABEL } from '../config/defaults';
import { formatCountdown, formatCountup, formatPrepSeconds } from './format';
import { ModeConfig, TimerState } from './types';

export type Accent = 'work' | 'rest' | 'prep';

/** 03/04번 골격의 가변 슬롯에 무엇이 들어가는가 */
export type Slot = 'dots' | 'tally' | 'finish';

export type TimerView = {
  /** prep 은 디자인 06번의 전용 레이아웃이다 */
  layout: 'prep' | 'running';
  accent: Accent;
  /** 상단 Barlow 라벨 */
  sportsLabel: string;
  /** 큰 Anton 숫자 */
  timerText: string;
  /** 92 모드바 */
  modeLabel: string;
  /** prep 레이아웃의 하단 라벨 */
  footerLabel: string;
  slot: Slot;
  roundTotal: number;
  /** 0-based */
  roundCurrent: number;
  tallyKind: 'rounds' | 'reps' | null;
};

/**
 * 타이머 상태 + 설정 → 화면에 그릴 것.
 *
 * 디자인에 실행 화면이 있는 모드는 타바타뿐이라, AMRAP · EMOM · FOR TIME 의
 * 화면 규칙이 여기 모인다. 순수 함수로 두어 그 규칙을 테스트로 고정한다.
 */
export function present(state: TimerState, config: ModeConfig): TimerView {
  const { segment } = state;
  const roundTotal = segment.roundTotal;
  const roundCurrent = Math.max(0, segment.roundIndex);

  if (segment.kind === 'prep') {
    return {
      layout: 'prep',
      accent: 'prep',
      sportsLabel: '',
      timerText: formatPrepSeconds(state.remainingMs ?? 0),
      modeLabel: 'READY',
      footerLabel: prepFooter(config),
      slot: 'dots',
      roundTotal,
      roundCurrent,
      tallyKind: null,
    };
  }

  const base = {
    layout: 'running' as const,
    roundTotal,
    roundCurrent,
    footerLabel: '',
  };

  switch (segment.kind) {
    case 'work':
    case 'interval':
      return {
        ...base,
        accent: 'work',
        sportsLabel: `ROUND ${roundCurrent + 1} / ${roundTotal}`,
        timerText: formatCountdown(state.remainingMs ?? 0),
        modeLabel: 'WORK',
        slot: 'dots',
        tallyKind: null,
      };

    case 'rest':
      return {
        ...base,
        accent: 'rest',
        sportsLabel: `ROUND ${roundCurrent + 1} / ${roundTotal}`,
        timerText: formatCountdown(state.remainingMs ?? 0),
        modeLabel: 'REST',
        slot: 'dots',
        tallyKind: null,
      };

    case 'amrap':
      return {
        ...base,
        accent: 'work',
        sportsLabel: `AMRAP · ${formatCountdown(segment.durationMs ?? 0)}`,
        timerText: formatCountdown(state.remainingMs ?? 0),
        modeLabel: 'AMRAP',
        slot: 'tally',
        tallyKind: config.mode === 'amrap' ? config.countMethod : 'rounds',
      };

    case 'fortime':
      return {
        ...base,
        accent: 'work',
        // 제한이 있어도 큰 숫자는 경과 시간이다. For Time 은 기록을 세는 운동이고,
        // 제한은 그 기록의 상한일 뿐이다.
        sportsLabel:
          segment.durationMs === null
            ? 'COUNT UP'
            : `CAP ${formatCountdown(segment.durationMs)} · LEFT ${formatCountdown(
                state.remainingMs ?? 0,
              )}`,
        timerText: formatCountup(state.elapsedInSegmentMs),
        modeLabel: MODE_LABEL.fortime,
        slot: 'finish',
        tallyKind: null,
      };
  }
}

function prepFooter(config: ModeConfig): string {
  const label = MODE_LABEL[config.mode];
  switch (config.mode) {
    case 'tabata':
      return `${label} · ${config.rounds} ROUNDS`;
    case 'emom':
      return `${label} · ${config.count} ROUNDS`;
    case 'amrap':
      return `${label} · ${formatCountdown(config.totalMs)}`;
    case 'fortime':
      return label;
  }
}
