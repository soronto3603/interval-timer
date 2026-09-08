import { compile } from './compile';
import { PREP_MS } from './types';

describe('compile — tabata', () => {
  it('prep 다음에 work/rest 를 라운드 수만큼 낸다', () => {
    const segments = compile({
      mode: 'tabata',
      workMs: 20_000,
      restMs: 10_000,
      rounds: 3,
    });

    expect(segments.map((s) => s.kind)).toEqual([
      'prep',
      'work',
      'rest',
      'work',
      'rest',
      'work',
    ]);
  });

  it('마지막 rest 를 생략한다', () => {
    const segments = compile({
      mode: 'tabata',
      workMs: 20_000,
      restMs: 10_000,
      rounds: 8,
    });

    expect(segments).toHaveLength(1 + 8 * 2 - 1);
    expect(segments[segments.length - 1].kind).toBe('work');
  });

  it('라운드가 1이면 rest 가 아예 없다', () => {
    const segments = compile({
      mode: 'tabata',
      workMs: 20_000,
      restMs: 10_000,
      rounds: 1,
    });

    expect(segments.map((s) => s.kind)).toEqual(['prep', 'work']);
  });

  it('work/rest 를 같은 라운드 번호로 묶고 총 라운드를 실는다', () => {
    const segments = compile({
      mode: 'tabata',
      workMs: 20_000,
      restMs: 10_000,
      rounds: 2,
    });

    expect(
      segments.map((s) => [s.kind, s.roundIndex, s.roundTotal]),
    ).toEqual([
      ['prep', -1, 2],
      ['work', 0, 2],
      ['rest', 0, 2],
      ['work', 1, 2],
    ]);
  });

  it('prep 은 PREP_MS, work/rest 는 설정값을 쓴다', () => {
    const segments = compile({
      mode: 'tabata',
      workMs: 20_000,
      restMs: 10_000,
      rounds: 2,
    });

    expect(segments.map((s) => s.durationMs)).toEqual([
      PREP_MS,
      20_000,
      10_000,
      20_000,
    ]);
  });

  it('전부 카운트다운이다', () => {
    const segments = compile({
      mode: 'tabata',
      workMs: 20_000,
      restMs: 10_000,
      rounds: 4,
    });

    expect(segments.every((s) => s.countUp === false)).toBe(true);
  });
});

describe('compile — emom', () => {
  it('prep 다음에 interval 을 개수만큼 낸다', () => {
    const segments = compile({ mode: 'emom', count: 10, intervalMs: 60_000 });

    expect(segments).toHaveLength(11);
    expect(segments[0].kind).toBe('prep');
    expect(segments.slice(1).every((s) => s.kind === 'interval')).toBe(true);
  });

  it('인터벌마다 라운드 번호를 올린다', () => {
    const segments = compile({ mode: 'emom', count: 3, intervalMs: 90_000 });

    expect(segments.map((s) => s.roundIndex)).toEqual([-1, 0, 1, 2]);
    expect(segments.every((s) => s.roundTotal === 3)).toBe(true);
  });

  it('60초가 아닌 인터벌도 그대로 쓴다', () => {
    const segments = compile({ mode: 'emom', count: 2, intervalMs: 90_000 });

    expect(segments.map((s) => s.durationMs)).toEqual([
      PREP_MS,
      90_000,
      90_000,
    ]);
  });
});

describe('compile — amrap', () => {
  it('prep 다음에 단일 amrap 세그먼트를 낸다', () => {
    const segments = compile({
      mode: 'amrap',
      totalMs: 720_000,
      countMethod: 'rounds',
    });

    expect(segments.map((s) => s.kind)).toEqual(['prep', 'amrap']);
    expect(segments[1].durationMs).toBe(720_000);
  });

  it('라운드 개념이 없으므로 roundTotal 이 0 이다', () => {
    const segments = compile({
      mode: 'amrap',
      totalMs: 720_000,
      countMethod: 'reps',
    });

    expect(segments[1].roundTotal).toBe(0);
  });

  it('카운트다운이다', () => {
    const segments = compile({
      mode: 'amrap',
      totalMs: 720_000,
      countMethod: 'rounds',
    });

    expect(segments[1].countUp).toBe(false);
  });
});

describe('compile — fortime', () => {
  it('cap 이 없으면 durationMs 가 null 인 카운트업 세그먼트를 낸다', () => {
    const segments = compile({ mode: 'fortime', capMs: null });

    expect(segments.map((s) => s.kind)).toEqual(['prep', 'fortime']);
    expect(segments[1].durationMs).toBeNull();
    expect(segments[1].countUp).toBe(true);
  });

  it('cap 이 있으면 그 길이를 쓰지만 여전히 카운트업이다', () => {
    const segments = compile({ mode: 'fortime', capMs: 720_000 });

    expect(segments[1].durationMs).toBe(720_000);
    expect(segments[1].countUp).toBe(true);
  });

  it('prep 은 cap 여부와 무관하게 카운트다운이다', () => {
    const segments = compile({ mode: 'fortime', capMs: null });

    expect(segments[0].countUp).toBe(false);
    expect(segments[0].durationMs).toBe(PREP_MS);
  });
});
