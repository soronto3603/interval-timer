import {
  AmrapConfig,
  EmomConfig,
  ForTimeConfig,
  ModeId,
  TabataConfig,
} from '../timer/types';

/** 디자인 02 · 10 · 11 · 12 번 화면에 찍혀 있는 초기값. */
export const DEFAULT_CONFIG: {
  tabata: TabataConfig;
  amrap: AmrapConfig;
  emom: EmomConfig;
  fortime: ForTimeConfig;
} = {
  tabata: { mode: 'tabata', workMs: 20_000, restMs: 10_000, rounds: 8 },
  amrap: { mode: 'amrap', totalMs: 720_000, countMethod: 'rounds' },
  emom: { mode: 'emom', count: 10, intervalMs: 60_000 },
  fortime: { mode: 'fortime', capMs: null },
};

export const MODE_IDS: ModeId[] = ['tabata', 'amrap', 'emom', 'fortime'];

/** 디스플레이 워드는 두 언어판 공통이다 (디자인 원본의 로컬라이제이션 규칙). */
export const MODE_LABEL: Record<ModeId, string> = {
  tabata: 'TABATA',
  amrap: 'AMRAP',
  emom: 'EMOM',
  fortime: 'FOR TIME',
};
