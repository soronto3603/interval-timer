import { totalMsOf } from './totals';

describe('totalMsOf — prep 을 제외한 계획 운동 시간', () => {
  it('타바타는 라운드 × (운동 + 휴식) 이다 — 디자인 05번의 04:00', () => {
    expect(
      totalMsOf({ mode: 'tabata', workMs: 20_000, restMs: 10_000, rounds: 8 }),
    ).toBe(240_000);
  });

  it('EMOM 은 개수 × 인터벌 이다 — 디자인 11번의 10:00', () => {
    expect(totalMsOf({ mode: 'emom', count: 10, intervalMs: 60_000 })).toBe(
      600_000,
    );
  });

  it('EMOM 인터벌이 60초가 아니면 총 시간도 그만큼 달라진다', () => {
    expect(totalMsOf({ mode: 'emom', count: 10, intervalMs: 90_000 })).toBe(
      900_000,
    );
  });

  it('AMRAP 은 설정한 시간 그대로다', () => {
    expect(
      totalMsOf({ mode: 'amrap', totalMs: 720_000, countMethod: 'rounds' }),
    ).toBe(720_000);
  });

  it('For Time 은 cap 이 있으면 그 값이다', () => {
    expect(totalMsOf({ mode: 'fortime', capMs: 720_000 })).toBe(720_000);
  });

  it('For Time 은 cap 이 없으면 미리 알 수 없다', () => {
    expect(totalMsOf({ mode: 'fortime', capMs: null })).toBeNull();
  });
});
