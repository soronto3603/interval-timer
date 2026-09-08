/**
 * 타이머 엔진 타입. 이 디렉터리는 React 도 React Native 도 모른다 —
 * 시간에 의존하는 모든 규칙을 클럭 주입으로 테스트할 수 있게 하기 위한 경계다.
 */

export type ModeId = 'tabata' | 'amrap' | 'emom' | 'fortime';

export type SegmentKind =
  | 'prep'
  | 'work'
  | 'rest'
  | 'interval'
  | 'amrap'
  | 'fortime';

export type Segment = {
  kind: SegmentKind;
  /** null = 무제한 카운트업 (cap 없는 For Time) */
  durationMs: number | null;
  countUp: boolean;
  /** 0-based. prep 은 -1 */
  roundIndex: number;
  /** 라운드 개념이 없는 모드는 0 */
  roundTotal: number;
};

export type TabataConfig = {
  mode: 'tabata';
  workMs: number;
  restMs: number;
  rounds: number;
};

export type AmrapConfig = {
  mode: 'amrap';
  totalMs: number;
  countMethod: 'rounds' | 'reps';
};

export type EmomConfig = {
  mode: 'emom';
  /** 인터벌 개수. 디자인의 `분 / Minutes` 필드 */
  count: number;
  intervalMs: number;
};

export type ForTimeConfig = {
  mode: 'fortime';
  /** null = 제한 없음 */
  capMs: number | null;
};

export type ModeConfig =
  | TabataConfig
  | AmrapConfig
  | EmomConfig
  | ForTimeConfig;

/**
 * 타이머가 저장하는 전부. 이 3개 값과 현재 시각만으로 상태를 파생한다.
 * 일시정지 중에는 pausedAt 이 시간을 고정시킨다.
 */
export type Anchor = {
  startedAt: number;
  pausedTotalMs: number;
  pausedAt: number | null;
};

export type TimerPhase = 'running' | 'paused' | 'complete';

export type TimerState = {
  phase: TimerPhase;
  /** complete 일 때는 segments.length */
  segmentIndex: number;
  /** complete 일 때는 마지막 세그먼트 */
  segment: Segment;
  /** countUp 세그먼트는 null */
  remainingMs: number | null;
  elapsedInSegmentMs: number;
  totalElapsedMs: number;
};

export const PREP_MS = 3000;
