import { pause, reanchorIfRewound, resume, start } from './anchor';
import { compile } from './compile';
import { derive } from './derive';

const T0 = 1_700_000_000_000;

const tabata2 = compile({
  mode: 'tabata',
  workMs: 20_000,
  restMs: 10_000,
  rounds: 2,
});

describe('start', () => {
  it('현재 시각에 앵커를 잡고 누적을 비운다', () => {
    expect(start(T0)).toEqual({
      startedAt: T0,
      pausedTotalMs: 0,
      pausedAt: null,
    });
  });
});

describe('pause / resume', () => {
  it('일시정지는 그 시각을 기록한다', () => {
    const a = pause(start(T0), T0 + 10_000);

    expect(a.pausedAt).toBe(T0 + 10_000);
  });

  it('이미 일시정지 상태면 시각을 덮어쓰지 않는다', () => {
    const once = pause(start(T0), T0 + 10_000);
    const twice = pause(once, T0 + 30_000);

    expect(twice.pausedAt).toBe(T0 + 10_000);
  });

  it('재개는 멈춰 있던 시간을 누적에 더한다', () => {
    const paused = pause(start(T0), T0 + 10_000);
    const a = resume(paused, T0 + 10_000 + 45_000);

    expect(a.pausedAt).toBeNull();
    expect(a.pausedTotalMs).toBe(45_000);
  });

  it('실행 중에 재개를 호출하면 아무 일도 없다', () => {
    const a = start(T0);

    expect(resume(a, T0 + 5_000)).toEqual(a);
  });

  it('일시정지 → 재개를 두 번 하면 누적이 합산된다', () => {
    let a = start(T0);
    a = pause(a, T0 + 10_000);
    a = resume(a, T0 + 20_000);
    a = pause(a, T0 + 25_000);
    a = resume(a, T0 + 40_000);

    expect(a.pausedTotalMs).toBe(25_000);
  });

  it('일시정지 구간을 빼면 경과 시간이 이어진다', () => {
    let a = start(T0);
    a = pause(a, T0 + 10_000);
    a = resume(a, T0 + 310_000); // 5분 멈춤

    const s = derive(tabata2, a, T0 + 315_000);

    expect(s.totalElapsedMs).toBe(15_000);
  });
});

describe('reanchorIfRewound', () => {
  it('시계가 5초 넘게 뒤로 뛰면 경과 시간을 보존한다', () => {
    const a = start(T0);
    const lastNow = T0 + 30_000;
    const rewound = lastNow - 60_000;

    const next = reanchorIfRewound(a, lastNow, rewound);

    expect(derive(tabata2, next, rewound).totalElapsedMs).toBe(30_000);
  });

  it('작은 역주행은 무시한다 (derive 의 클램프가 흡수)', () => {
    const a = start(T0);
    const lastNow = T0 + 30_000;

    expect(reanchorIfRewound(a, lastNow, lastNow - 2_000)).toEqual(a);
  });

  it('시간이 앞으로 갔으면 손대지 않는다 — 백그라운드 복귀는 정상이다', () => {
    const a = start(T0);
    const lastNow = T0 + 30_000;

    expect(reanchorIfRewound(a, lastNow, lastNow + 300_000)).toEqual(a);
  });

  it('일시정지 누적이 있어도 경과 시간을 보존한다', () => {
    let a = start(T0);
    a = pause(a, T0 + 10_000);
    a = resume(a, T0 + 40_000); // 30초 멈춤, 경과 10초

    const lastNow = T0 + 50_000; // 경과 20초
    const next = reanchorIfRewound(a, lastNow, lastNow - 90_000);

    expect(derive(tabata2, next, lastNow - 90_000).totalElapsedMs).toBe(20_000);
  });
});
