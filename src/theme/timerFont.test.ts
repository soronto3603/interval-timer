import { CLOCK_EM, PREP_EM, timerFontSize } from './timerFont';

/** 03/04번 세로 실행 화면 */
const portraitClock = (width: number, maxHeight = 9999) => ({
  width,
  maxHeight,
  landscape: false,
  base: 150,
  advanceEm: CLOCK_EM,
});

/** 가로 시계 모드 */
const landscapeClock = (width: number, maxHeight: number) => ({
  width,
  maxHeight,
  landscape: true,
  base: 150,
  advanceEm: CLOCK_EM,
});

describe('timerFontSize — 세로', () => {
  it('디자인 폭에서는 디자인 값을 그대로 낸다', () => {
    expect(timerFontSize(portraitClock(390))).toBe(150);
  });

  it('좁은 화면에서는 비례해 줄인다', () => {
    expect(timerFontSize(portraitClock(360))).toBe(
      Math.round(150 * (360 / 390)),
    );
  });

  it('아주 좁으면 배율 하한보다 폭 예산이 먼저 걸린다', () => {
    // 0.86 배(129)를 그대로 쓰면 129 × 2.25em = 290px 로 쓸 수 있는 236px 를 넘는다.
    // 배율 하한은 "이 이상 줄이지 말자"는 선호일 뿐 폭 예산을 이길 수 없다.
    expect(timerFontSize(portraitClock(280))).toBe(
      Math.floor((280 - 44) / CLOCK_EM),
    );
  });

  it('어떤 폭에서도 화면 밖으로 넘치지 않는다', () => {
    for (const width of [280, 320, 360, 390, 412, 480]) {
      const size = timerFontSize(portraitClock(width));
      expect(size * CLOCK_EM).toBeLessThanOrEqual(width - 44);
    }
  });

  it('넓어도 1.15 배 위로는 키우지 않는다 — 세로는 디자인 값이 기준이다', () => {
    expect(timerFontSize(portraitClock(800))).toBe(Math.floor(150 * 1.15));
  });

  it('쓸 수 있는 높이가 작으면 그것이 제약이 된다', () => {
    expect(timerFontSize(portraitClock(390, 100))).toBe(100);
  });
});

describe('timerFontSize — 가로 (시계 모드)', () => {
  it('세로보다 확실히 크다 — 눕히는 이유가 그것이다', () => {
    const landscape = timerFontSize(landscapeClock(915, 221));
    const portrait = timerFontSize(portraitClock(411));

    expect(landscape).toBeGreaterThan(portrait);
  });

  it('폭이 아니라 높이가 제약이 된다', () => {
    const size = timerFontSize(landscapeClock(915, 221));
    const widthLimit = (915 - 44) / CLOCK_EM;

    expect(size).toBe(221);
    expect(size).toBeLessThan(widthLimit);
  });

  it('폭이 좁으면 폭이 제약이 된다', () => {
    // 접는 폰처럼 폭이 좁고 높이가 넉넉한 가로
    const size = timerFontSize(landscapeClock(600, 520));

    expect(size).toBe(Math.floor((600 - 44) / CLOCK_EM));
  });

  it('태블릿에서도 상한을 넘지 않는다', () => {
    expect(timerFontSize(landscapeClock(1280, 800))).toBe(260);
  });

  it('세로 배율 규칙(0.86~1.15)에 묶이지 않는다', () => {
    // 가로는 디자인 값이 없으므로 남는 공간을 그대로 쓴다
    expect(timerFontSize(landscapeClock(915, 221))).toBeGreaterThan(150 * 1.15);
  });
});

describe('timerFontSize — prep (06번 READY)', () => {
  const prep = (width: number, maxHeight: number, landscape: boolean) => ({
    width,
    maxHeight,
    landscape,
    base: 210,
    advanceEm: PREP_EM,
  });

  it('세로 디자인 값은 210 이다', () => {
    expect(timerFontSize(prep(390, 9999, false))).toBe(210);
  });

  it('"03" 은 두 글자라 시계보다 폭에 여유가 있다', () => {
    expect(PREP_EM).toBeLessThan(CLOCK_EM);
  });

  it('가로에서는 상한까지 커진다', () => {
    // 261 만큼 높이가 남지만 상한이 260 이다
    expect(timerFontSize(prep(915, 261, true))).toBe(260);
  });
});

describe('timerFontSize — 하한', () => {
  it('아무리 좁아도 읽을 수 없을 만큼 작아지지는 않는다', () => {
    expect(timerFontSize(landscapeClock(200, 40))).toBeGreaterThanOrEqual(72);
  });
});
