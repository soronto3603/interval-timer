import { formatCountdown, formatCountup, formatPrepSeconds } from './format';

describe('formatCountdown — 남은 시간', () => {
  it('MM:SS 로 0 을 채워 낸다', () => {
    expect(formatCountdown(20_000)).toBe('00:20');
    expect(formatCountdown(600_000)).toBe('10:00');
  });

  it('올림으로 낸다 — 1 이 사라지기 전까지 1 로 보여야 한다', () => {
    expect(formatCountdown(19_001)).toBe('00:20');
    expect(formatCountdown(1)).toBe('00:01');
  });

  it('0 이면 00:00 이다', () => {
    expect(formatCountdown(0)).toBe('00:00');
  });

  it('60분을 넘어도 분을 계속 늘린다', () => {
    expect(formatCountdown(3_600_000)).toBe('60:00');
    expect(formatCountdown(3_723_000)).toBe('62:03');
  });

  it('음수는 00:00 으로 막는다', () => {
    expect(formatCountdown(-5_000)).toBe('00:00');
  });
});

describe('formatCountup — 경과 시간', () => {
  it('내림으로 낸다 — 아직 안 지난 초를 앞당겨 보이지 않는다', () => {
    expect(formatCountup(19_999)).toBe('00:19');
    expect(formatCountup(0)).toBe('00:00');
    expect(formatCountup(999)).toBe('00:00');
  });

  it('MM:SS 로 0 을 채워 낸다', () => {
    expect(formatCountup(65_000)).toBe('01:05');
  });

  it('음수는 00:00 으로 막는다', () => {
    expect(formatCountup(-1)).toBe('00:00');
  });
});

describe('formatPrepSeconds — READY 카운트다운', () => {
  it('2자리 초로 낸다 (디자인 06번의 "03")', () => {
    expect(formatPrepSeconds(3_000)).toBe('03');
    expect(formatPrepSeconds(2_400)).toBe('03');
    expect(formatPrepSeconds(1_000)).toBe('01');
  });

  it('0 이면 00 이다', () => {
    expect(formatPrepSeconds(0)).toBe('00');
  });
});
