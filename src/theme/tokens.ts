/**
 * 디자인 토큰. design/pulse-box-canvas.html 의 DESIGN TOKENS 블록을 그대로 옮긴 것.
 * 값을 바꾸려면 디자인 원본을 먼저 고친다.
 */

export const color = {
  /** 앱 배경 */
  void: '#070807',
  /** 화면 배경 */
  screen: '#0C0D0C',
  /** 행 · 입력 */
  surface: '#141614',
  /** 스테퍼의 −/+ 칸 */
  surfaceRaised: '#1A1D1A',
  /** 구분선 1px */
  line: '#202320',
  /** 외곽선 버튼 · 비활성 테두리 */
  lineStrong: '#2E332E',
  /** 미완료 라운드 도트 */
  dotIdle: '#2B2E2B',

  /** 운동 · 1차 액션 */
  work: '#B8FF2E',
  /** 운동 색 위에 얹는 글자 */
  onWork: '#0A0B0A',
  /** 휴식 */
  rest: '#FF6B1A',
  onRest: '#160A03',
  /** 준비 카운트다운 */
  prep: '#2E8DFF',
  onPrep: '#03101F',

  /** 본문 */
  ink: '#F4F6F2',
  inkDim: '#E6EAE4',
  /** 보조 */
  muted: '#8A918A',
  mutedStrong: '#9AA199',
  /** 라벨 · 셰브론 */
  faint: '#6E756E',
  faintAlt: '#7C837C',
  /** 최하위 (버전 표기 등) */
  ghost: '#4A504A',
  /** 스테퍼 −/+ 기호 */
  control: '#C9CFC7',
  /** For Time 대기 상태의 큰 숫자 */
  placeholder: '#22261F',

  /**
   * 발광. 디자인의 text-shadow / box-shadow 알파를 그대로 옮긴 것 —
   * 원색으로 넣으면 숫자 윤곽이 뭉개진다.
   */
  workGlow: 'rgba(184,255,46,0.22)',
  restGlow: 'rgba(255,107,26,0.22)',
  prepGlow: 'rgba(46,141,255,0.28)',
  workRing: 'rgba(184,255,46,0.18)',
  restRing: 'rgba(255,107,26,0.2)',
  prepRing: 'rgba(46,141,255,0.2)',

  /** 오버레이 */
  scrim: 'rgba(6,7,6,0.93)',
  scrimDialog: 'rgba(6,7,6,0.9)',
  dotGrid: '#191C19',
} as const;

/** 4pt 기반 */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 22,
  xl: 26,
  xxl: 34,
  xxxl: 52,
} as const;

export const layout = {
  /** 화면 좌우 여백 */
  screenX: 22,
  /** safe area 아래 여백 */
  safeBottom: 26,
  /** 헤더 위 여백 */
  screenTop: 28,
} as const;

export const radius = {
  row: 12,
  control: 14,
  dialog: 18,
  screen: 40,
  pill: 999,
} as const;

/** 터치 타겟 높이. 디자인의 touch 토큰. */
export const touch = {
  row: 72,
  stepper: 80,
  cta: 88,
  modeBar: 92,
  pause: 132,
} as const;

/** 라운드 도트가 한 줄에 들어가는 한계. 넘으면 진행 바로 대체한다. */
export const MAX_DOTS = 12;
