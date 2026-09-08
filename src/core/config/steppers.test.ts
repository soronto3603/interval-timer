import { STEPPERS, canStep, step } from './steppers';

const work = STEPPERS.tabata.workMs;
const rounds = STEPPERS.tabata.rounds;

describe('step', () => {
  it('+ 방향으로 스텝만큼 올린다', () => {
    expect(step(work, 20_000, +1)).toBe(25_000);
    expect(step(rounds, 8, +1)).toBe(9);
  });

  it('− 방향으로 스텝만큼 내린다', () => {
    expect(step(work, 20_000, -1)).toBe(15_000);
  });

  it('최대에서 더 올려도 최대에 머문다', () => {
    expect(step(work, 600_000, +1)).toBe(600_000);
    expect(step(rounds, 99, +1)).toBe(99);
  });

  it('최소에서 더 내려도 최소에 머문다', () => {
    expect(step(work, 5_000, -1)).toBe(5_000);
    expect(step(rounds, 1, -1)).toBe(1);
  });

  it('스텝에 어긋난 값은 스텝 격자에 맞춰 올린다', () => {
    // 저장된 값이 규격 변경 전 값일 수 있다
    expect(step(work, 22_000, +1)).toBe(25_000);
  });

  it('스텝에 어긋난 값은 내릴 때도 격자에 맞춘다', () => {
    expect(step(work, 22_000, -1)).toBe(20_000);
  });

  it('범위를 벗어난 값이 들어와도 범위 안으로 끌어온다', () => {
    expect(step(rounds, 500, -1)).toBe(99);
    expect(step(rounds, 0, +1)).toBe(1);
  });
});

describe('canStep — −/+ 버튼 흐리게 처리용', () => {
  it('중간 값에서는 양방향 모두 가능하다', () => {
    expect(canStep(work, 20_000, +1)).toBe(true);
    expect(canStep(work, 20_000, -1)).toBe(true);
  });

  it('최대에서는 + 가 막힌다', () => {
    expect(canStep(work, 600_000, +1)).toBe(false);
    expect(canStep(work, 600_000, -1)).toBe(true);
  });

  it('최소에서는 − 가 막힌다', () => {
    expect(canStep(rounds, 1, -1)).toBe(false);
    expect(canStep(rounds, 1, +1)).toBe(true);
  });
});

describe('STEPPERS — 스펙 표와 일치해야 한다', () => {
  it('타바타', () => {
    expect(STEPPERS.tabata.workMs).toMatchObject({
      step: 5_000,
      min: 5_000,
      max: 600_000,
    });
    expect(STEPPERS.tabata.restMs).toMatchObject({
      step: 5_000,
      min: 5_000,
      max: 600_000,
    });
    expect(STEPPERS.tabata.rounds).toMatchObject({
      step: 1,
      min: 1,
      max: 99,
    });
  });

  it('AMRAP · EMOM · For Time', () => {
    expect(STEPPERS.amrap.totalMs).toMatchObject({
      step: 60_000,
      min: 60_000,
      max: 3_600_000,
    });
    expect(STEPPERS.emom.count).toMatchObject({ step: 1, min: 1, max: 60 });
    expect(STEPPERS.emom.intervalMs).toMatchObject({
      step: 15_000,
      min: 15_000,
      max: 300_000,
    });
    expect(STEPPERS.fortime.capMs).toMatchObject({
      step: 60_000,
      min: 60_000,
      max: 3_600_000,
    });
  });
});
