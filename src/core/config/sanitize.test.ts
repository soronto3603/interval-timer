import { DEFAULT_CONFIG } from './defaults';
import { sanitizeConfig } from './sanitize';

describe('sanitizeConfig — 저장값 복원', () => {
  it('저장된 것이 없으면 기본값을 낸다', () => {
    expect(sanitizeConfig('tabata', undefined)).toEqual(DEFAULT_CONFIG.tabata);
    expect(sanitizeConfig('amrap', null)).toEqual(DEFAULT_CONFIG.amrap);
  });

  it('정상 값은 그대로 통과시킨다', () => {
    const saved = { mode: 'tabata', workMs: 30_000, restMs: 15_000, rounds: 6 };

    expect(sanitizeConfig('tabata', saved)).toEqual(saved);
  });

  it('숫자가 아니면 그 필드만 기본값으로 되돌린다', () => {
    const saved = { mode: 'tabata', workMs: 'twenty', restMs: 15_000, rounds: 6 };

    expect(sanitizeConfig('tabata', saved)).toEqual({
      mode: 'tabata',
      workMs: DEFAULT_CONFIG.tabata.workMs,
      restMs: 15_000,
      rounds: 6,
    });
  });

  it('범위를 벗어난 값은 범위 안으로 끌어온다', () => {
    const saved = { mode: 'tabata', workMs: 999_999, restMs: 1, rounds: 500 };

    expect(sanitizeConfig('tabata', saved)).toEqual({
      mode: 'tabata',
      workMs: 600_000,
      restMs: 5_000,
      rounds: 99,
    });
  });

  it('NaN 과 Infinity 도 막는다', () => {
    const saved = { mode: 'tabata', workMs: NaN, restMs: Infinity, rounds: 8 };
    const result = sanitizeConfig('tabata', saved);

    expect(result).toEqual({
      mode: 'tabata',
      workMs: DEFAULT_CONFIG.tabata.workMs,
      restMs: DEFAULT_CONFIG.tabata.restMs,
      rounds: 8,
    });
  });

  it('모드가 다른 값이 저장돼 있으면 요청한 모드의 기본값을 낸다', () => {
    const saved = { mode: 'amrap', totalMs: 720_000, countMethod: 'rounds' };

    expect(sanitizeConfig('tabata', saved)).toEqual(DEFAULT_CONFIG.tabata);
  });

  it('객체가 아닌 것이 저장돼 있어도 무너지지 않는다', () => {
    expect(sanitizeConfig('emom', 'garbage')).toEqual(DEFAULT_CONFIG.emom);
    expect(sanitizeConfig('emom', 42)).toEqual(DEFAULT_CONFIG.emom);
    expect(sanitizeConfig('emom', [])).toEqual(DEFAULT_CONFIG.emom);
  });

  it('모르는 키는 버린다', () => {
    const saved = {
      mode: 'emom',
      count: 5,
      intervalMs: 60_000,
      leftover: 'from an older build',
    };

    expect(sanitizeConfig('emom', saved)).toEqual({
      mode: 'emom',
      count: 5,
      intervalMs: 60_000,
    });
  });
});

describe('sanitizeConfig — amrap 의 카운트 방식', () => {
  it('rounds 와 reps 를 모두 받는다', () => {
    expect(
      sanitizeConfig('amrap', {
        mode: 'amrap',
        totalMs: 600_000,
        countMethod: 'reps',
      }),
    ).toEqual({ mode: 'amrap', totalMs: 600_000, countMethod: 'reps' });
  });

  it('모르는 값이면 기본값으로 되돌린다', () => {
    expect(
      sanitizeConfig('amrap', {
        mode: 'amrap',
        totalMs: 600_000,
        countMethod: 'calories',
      }),
    ).toEqual({
      mode: 'amrap',
      totalMs: 600_000,
      countMethod: DEFAULT_CONFIG.amrap.countMethod,
    });
  });
});

describe('sanitizeConfig — fortime 의 cap', () => {
  it('제한 없음(null)을 보존한다 — 기본값이기도 하다', () => {
    expect(
      sanitizeConfig('fortime', { mode: 'fortime', capMs: null }),
    ).toEqual({ mode: 'fortime', capMs: null });
  });

  it('cap 값이 있으면 범위 안으로 정리해서 유지한다', () => {
    expect(
      sanitizeConfig('fortime', { mode: 'fortime', capMs: 99_999_999 }),
    ).toEqual({ mode: 'fortime', capMs: 3_600_000 });
  });

  it('cap 이 숫자도 null 도 아니면 제한 없음으로 되돌린다', () => {
    expect(
      sanitizeConfig('fortime', { mode: 'fortime', capMs: 'none' }),
    ).toEqual({ mode: 'fortime', capMs: null });
  });
});

describe('DEFAULT_CONFIG — 디자인 화면의 초기값과 일치해야 한다', () => {
  it('타바타는 20초 / 10초 / 8라운드 (디자인 02번)', () => {
    expect(DEFAULT_CONFIG.tabata).toEqual({
      mode: 'tabata',
      workMs: 20_000,
      restMs: 10_000,
      rounds: 8,
    });
  });

  it('AMRAP 은 12:00 · ROUNDS (디자인 10번)', () => {
    expect(DEFAULT_CONFIG.amrap).toEqual({
      mode: 'amrap',
      totalMs: 720_000,
      countMethod: 'rounds',
    });
  });

  it('EMOM 은 10 × 01:00 (디자인 11번)', () => {
    expect(DEFAULT_CONFIG.emom).toEqual({
      mode: 'emom',
      count: 10,
      intervalMs: 60_000,
    });
  });

  it('For Time 은 제한 없음 (디자인 12번)', () => {
    expect(DEFAULT_CONFIG.fortime).toEqual({ mode: 'fortime', capMs: null });
  });
});
