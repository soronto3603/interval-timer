import { STRINGS } from '../../i18n/strings';
import { describeConfig } from './describe';
import { DEFAULT_CONFIG } from './defaults';

describe('describeConfig — Home 의 최근 운동 메타', () => {
  it('타바타 기본값이 디자인의 문자열과 정확히 같다', () => {
    expect(describeConfig(DEFAULT_CONFIG.tabata, STRINGS.ko)).toBe(
      STRINGS.ko.recentMeta,
    );
  });

  it('영문판도 디자인의 문자열과 같다', () => {
    expect(describeConfig(DEFAULT_CONFIG.tabata, STRINGS.en)).toBe(
      STRINGS.en.recentMeta,
    );
  });

  it('AMRAP 은 시간과 카운트 방식을 낸다', () => {
    expect(describeConfig(DEFAULT_CONFIG.amrap, STRINGS.ko)).toBe(
      '· 12:00 · 라운드',
    );
  });

  it('EMOM 은 개수와 인터벌을 낸다', () => {
    expect(describeConfig(DEFAULT_CONFIG.emom, STRINGS.ko)).toBe(
      '· 10 × 01:00',
    );
  });

  it('For Time 은 제한 없음을 그대로 알린다', () => {
    expect(describeConfig(DEFAULT_CONFIG.fortime, STRINGS.ko)).toBe(
      '· 제한 없음',
    );
  });

  it('For Time 에 제한이 있으면 그 값을 낸다', () => {
    expect(
      describeConfig({ mode: 'fortime', capMs: 720_000 }, STRINGS.ko),
    ).toBe('· 12:00');
  });
});
