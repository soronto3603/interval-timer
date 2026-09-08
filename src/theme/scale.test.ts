import { DESIGN_WIDTH, scaleBy, scaleFactor } from './scale';

describe('scaleFactor', () => {
  it('디자인 폭에서는 1 이다', () => {
    expect(scaleFactor(DESIGN_WIDTH)).toBe(1);
  });

  it('좁은 화면에서는 비례해 줄인다', () => {
    expect(scaleFactor(360)).toBeCloseTo(360 / 390, 5);
  });

  it('아주 좁은 화면에서도 0.86 아래로는 줄이지 않는다', () => {
    expect(scaleFactor(280)).toBe(0.86);
  });

  it('넓은 화면에서도 1.15 위로는 키우지 않는다 — 태블릿에서 글자만 커지면 이상하다', () => {
    expect(scaleFactor(800)).toBe(1.15);
  });
});

describe('scaleBy', () => {
  it('정수로 반올림한다 — 소수 fontSize 는 Android 에서 흐려진다', () => {
    expect(scaleBy(150, 360)).toBe(Math.round(150 * (360 / 390)));
    expect(Number.isInteger(scaleBy(46, 360))).toBe(true);
  });

  it('디자인 폭에서는 원래 값을 그대로 낸다', () => {
    expect(scaleBy(150, DESIGN_WIDTH)).toBe(150);
    expect(scaleBy(22, DESIGN_WIDTH)).toBe(22);
  });

  it('좁은 화면에서 150px 타이머가 콘텐츠 폭 안에 들어간다', () => {
    // Anton 은 자폭이 약 0.45em. "00:17" 5글자 + 화면 좌우 여백 22 × 2
    const width = 360;
    const rendered = scaleBy(150, width) * 0.45 * 5;

    expect(rendered).toBeLessThan(width - 44);
  });
});
