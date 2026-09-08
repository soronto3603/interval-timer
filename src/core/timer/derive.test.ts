import { compile } from './compile';
import { derive } from './derive';
import { Anchor, PREP_MS } from './types';

const T0 = 1_700_000_000_000;

const running = (overrides: Partial<Anchor> = {}): Anchor => ({
  startedAt: T0,
  pausedTotalMs: 0,
  pausedAt: null,
  ...overrides,
});

// prep 3s → work 20s → rest 10s → work 20s  (총 53s)
const tabata2 = compile({
  mode: 'tabata',
  workMs: 20_000,
  restMs: 10_000,
  rounds: 2,
});

describe('derive — 세그먼트 위치', () => {
  it('시작 직후에는 prep 이고 남은 시간이 꽉 차 있다', () => {
    const s = derive(tabata2, running(), T0);

    expect(s.phase).toBe('running');
    expect(s.segmentIndex).toBe(0);
    expect(s.segment.kind).toBe('prep');
    expect(s.remainingMs).toBe(PREP_MS);
    expect(s.elapsedInSegmentMs).toBe(0);
  });

  it('경계 1ms 전에는 아직 이전 세그먼트다', () => {
    const s = derive(tabata2, running(), T0 + 2_999);

    expect(s.segmentIndex).toBe(0);
    expect(s.segment.kind).toBe('prep');
    expect(s.remainingMs).toBe(1);
  });

  it('경계 정확히 그 ms 에 다음 세그먼트로 넘어간다', () => {
    const s = derive(tabata2, running(), T0 + 3_000);

    expect(s.segmentIndex).toBe(1);
    expect(s.segment.kind).toBe('work');
    expect(s.remainingMs).toBe(20_000);
    expect(s.elapsedInSegmentMs).toBe(0);
  });

  it('경계 1ms 후에는 다음 세그먼트가 1ms 진행돼 있다', () => {
    const s = derive(tabata2, running(), T0 + 3_001);

    expect(s.segmentIndex).toBe(1);
    expect(s.remainingMs).toBe(19_999);
    expect(s.elapsedInSegmentMs).toBe(1);
  });

  it('중간 세그먼트를 정확히 짚는다', () => {
    // prep 3 + work 20 = 23s 부터 rest
    const s = derive(tabata2, running(), T0 + 23_000 + 4_000);

    expect(s.segment.kind).toBe('rest');
    expect(s.segment.roundIndex).toBe(0);
    expect(s.remainingMs).toBe(6_000);
  });

  it('경과 시간을 시작 시점 기준 누적으로 낸다 (prep 포함)', () => {
    const s = derive(tabata2, running(), T0 + 12_345);

    expect(s.totalElapsedMs).toBe(12_345);
  });
});

describe('derive — 완료', () => {
  it('마지막 세그먼트가 끝나는 순간 complete 이 된다', () => {
    const s = derive(tabata2, running(), T0 + 53_000);

    expect(s.phase).toBe('complete');
    expect(s.segmentIndex).toBe(tabata2.length);
    expect(s.segment.kind).toBe('work');
    expect(s.remainingMs).toBe(0);
  });

  it('완료 후 한참 지나도 complete 에 머문다', () => {
    const s = derive(tabata2, running(), T0 + 53_000 + 600_000);

    expect(s.phase).toBe('complete');
    expect(s.segmentIndex).toBe(tabata2.length);
  });

  it('마지막 세그먼트 1ms 전에는 아직 complete 가 아니다', () => {
    const s = derive(tabata2, running(), T0 + 52_999);

    expect(s.phase).toBe('running');
    expect(s.remainingMs).toBe(1);
  });
});

describe('derive — 일시정지', () => {
  it('일시정지 중에는 phase 가 paused 다', () => {
    const anchor = running({ pausedAt: T0 + 10_000 });
    const s = derive(tabata2, anchor, T0 + 10_000);

    expect(s.phase).toBe('paused');
  });

  it('일시정지 중에는 실제 시각이 흘러도 파생값이 고정된다', () => {
    const anchor = running({ pausedAt: T0 + 10_000 });

    const atPause = derive(tabata2, anchor, T0 + 10_000);
    const muchLater = derive(tabata2, anchor, T0 + 10_000 + 900_000);

    expect(muchLater.segmentIndex).toBe(atPause.segmentIndex);
    expect(muchLater.remainingMs).toBe(atPause.remainingMs);
    expect(muchLater.totalElapsedMs).toBe(atPause.totalElapsedMs);
  });

  it('재개하면 멈춰 있던 시간을 빼고 이어진다', () => {
    // 10초에 멈추고 5분 뒤 재개
    const anchor = running({ pausedTotalMs: 300_000 });
    const s = derive(tabata2, anchor, T0 + 10_000 + 300_000);

    expect(s.phase).toBe('running');
    expect(s.totalElapsedMs).toBe(10_000);
    expect(s.segment.kind).toBe('work');
    expect(s.remainingMs).toBe(13_000);
  });

  it('일시정지가 완료 상태를 가리지 않는다', () => {
    const anchor = running({ pausedAt: T0 + 53_000 });
    const s = derive(tabata2, anchor, T0 + 53_000);

    expect(s.phase).toBe('complete');
  });
});

describe('derive — 백그라운드 복귀', () => {
  it('5분을 건너뛰어도 올바른 세그먼트에 착지한다', () => {
    const emom = compile({ mode: 'emom', count: 20, intervalMs: 60_000 });

    // prep 3s + 인터벌 5개(300s) 통과 → 6번째 인터벌 시작
    const s = derive(emom, running(), T0 + 3_000 + 300_000);

    expect(s.segment.kind).toBe('interval');
    expect(s.segment.roundIndex).toBe(5);
    expect(s.remainingMs).toBe(60_000);
  });

  it('건너뛴 시간이 전체 길이를 넘으면 complete 이다', () => {
    const s = derive(tabata2, running(), T0 + 3_600_000);

    expect(s.phase).toBe('complete');
  });
});

describe('derive — 카운트업 (For Time)', () => {
  const noCap = compile({ mode: 'fortime', capMs: null });
  const withCap = compile({ mode: 'fortime', capMs: 60_000 });

  it('cap 이 없으면 남은 시간이 null 이고 경과만 쌓인다', () => {
    const s = derive(noCap, running(), T0 + 3_000 + 45_000);

    expect(s.segment.kind).toBe('fortime');
    expect(s.remainingMs).toBeNull();
    expect(s.elapsedInSegmentMs).toBe(45_000);
  });

  it('cap 이 없으면 아무리 오래 지나도 complete 이 되지 않는다', () => {
    const s = derive(noCap, running(), T0 + 86_400_000);

    expect(s.phase).toBe('running');
    expect(s.elapsedInSegmentMs).toBe(86_400_000 - 3_000);
  });

  it('cap 이 있으면 남은 시간도 함께 낸다 (LEFT 표시용)', () => {
    const s = derive(withCap, running(), T0 + 3_000 + 20_000);

    expect(s.elapsedInSegmentMs).toBe(20_000);
    expect(s.remainingMs).toBe(40_000);
  });

  it('cap 에 도달하면 complete 이다', () => {
    const s = derive(withCap, running(), T0 + 3_000 + 60_000);

    expect(s.phase).toBe('complete');
  });
});

describe('derive — 시계 역주행 방어', () => {
  it('현재 시각이 시작 시각보다 이전이면 0 으로 클램프한다', () => {
    const s = derive(tabata2, running(), T0 - 10_000);

    expect(s.totalElapsedMs).toBe(0);
    expect(s.segmentIndex).toBe(0);
    expect(s.remainingMs).toBe(PREP_MS);
  });

  it('일시정지 누적이 경과보다 커도 음수가 되지 않는다', () => {
    const anchor = running({ pausedTotalMs: 999_999 });
    const s = derive(tabata2, anchor, T0 + 1_000);

    expect(s.totalElapsedMs).toBe(0);
  });
});
