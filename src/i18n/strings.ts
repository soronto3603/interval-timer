/**
 * 문자열 테이블. ko/en 은 design/pulse-box-canvas.html 의 STRINGS 를 그대로 옮긴 것이고,
 * 그 뒤 블록만 이 구현에서 추가한 키다.
 *
 * 디자인 원본의 로컬라이제이션 규칙:
 *   PULSE BOX · TABATA · WORK · REST 등 디스플레이 워드는 두 언어판 공통으로 유지하고,
 *   기능 레이블만 전환한다. 그래서 아래 테이블에 모드명·상태 워드가 없다.
 */

export const STRINGS = {
  ko: {
    // --- 디자인 원본 ---
    selectWorkout: '운동 선택',
    recent: '최근 운동',
    viewAll: '전체 보기',
    recentMeta: '· 20초 / 10초 · 8라운드',
    tabataSetup: '타바타 설정',
    work: '운동',
    rest: '휴식',
    rounds: '라운드',
    totalTime: '총 시간',
    todaysTabata: '오늘의 타바타',
    holdToPause: '길게 눌러 일시정지',
    setupWorkout: '운동 설정',
    time: '시간',
    countMethod: '카운트 방식',
    minutes: '분',
    interval: '인터벌',
    timeLimit: '시간 제한',
    noLimit: '제한 없음',
    addTimeLimit: '시간 제한 추가',
    settings: '설정',
    language: '언어',
    sound: '사운드',
    vibration: '진동',
    keepAwake: '화면 유지',
    soundHaptics: '사운드 및 진동',
    countdownAlert: '카운트다운 알림',
    workStartAlert: '운동 시작 알림',
    restStartAlert: '휴식 시작 알림',
    resetBody: '현재 라운드와 시간이 초기화됩니다.',
    endBody: '진행 중인 운동을 종료합니다.',
    languageValue: '한국어',

    // --- 구현에서 추가 ---
    reps: '렙',
    resetTitle: '타이머 초기화?',
    endTitle: '운동 종료?',
    presets: '모드별 최근 설정',
    on: '켬',
    off: '끔',
    todaysWorkout: (mode: string) => `오늘의 ${mode}`,
    roundsMeta: (n: number) => `${n}라운드`,
    minutesMeta: (n: number) => `${n}분`,
    secondsShort: (n: number) => `${n}초`,
  },
  en: {
    // --- 디자인 원본 ---
    selectWorkout: 'Select workout',
    recent: 'Recent',
    viewAll: 'View all',
    recentMeta: '· 20s / 10s · 8 rounds',
    tabataSetup: 'Tabata setup',
    work: 'Work',
    rest: 'Rest',
    rounds: 'Rounds',
    totalTime: 'Total time',
    todaysTabata: "Today's Tabata",
    holdToPause: 'Hold to pause',
    setupWorkout: 'Workout setup',
    time: 'Time',
    countMethod: 'Count',
    minutes: 'Minutes',
    interval: 'Interval',
    timeLimit: 'Time cap',
    noLimit: 'None',
    addTimeLimit: 'Add time cap',
    settings: 'Settings',
    language: 'Language',
    sound: 'Sound',
    vibration: 'Vibration',
    keepAwake: 'Keep screen on',
    soundHaptics: 'Sound & haptics',
    countdownAlert: 'Countdown cue',
    workStartAlert: 'Work start cue',
    restStartAlert: 'Rest start cue',
    resetBody: 'Current round and time will be reset.',
    endBody: 'This ends the workout in progress.',
    languageValue: 'English',

    // --- 구현에서 추가 ---
    reps: 'Reps',
    resetTitle: 'Reset timer?',
    endTitle: 'End workout?',
    presets: 'Recent per mode',
    on: 'On',
    off: 'Off',
    todaysWorkout: (mode: string) => `Today's ${mode}`,
    roundsMeta: (n: number) => `${n} rounds`,
    minutesMeta: (n: number) => `${n} min`,
    secondsShort: (n: number) => `${n}s`,
  },
} as const;

export type Lang = keyof typeof STRINGS;

/**
 * ko 테이블의 모양은 그대로 쓰지만 리터럴 타입은 넓힌다.
 * `as const` 를 그대로 두면 en 의 "Select workout" 이 ko 의 "운동 선택" 타입에
 * 맞지 않아, 두 테이블을 같은 자리에 넣을 수 없다.
 */
export type Strings = {
  [K in keyof (typeof STRINGS)['ko']]: (typeof STRINGS)['ko'][K] extends (
    ...args: infer A
  ) => infer R
    ? (...args: A) => R
    : string;
};
