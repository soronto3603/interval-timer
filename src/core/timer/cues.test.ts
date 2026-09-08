import { start } from './anchor';
import { compile } from './compile';
import { cuesFor } from './cues';
import { derive } from './derive';
import { Segment } from './types';

const T0 = 1_700_000_000_000;
const ANCHOR = start(T0);

/** 경과 ms 시점의 상태. 손으로 상태를 짜맞추지 않고 실제 derive 를 쓴다. */
const at = (segments: Segment[], ms: number) =>
  derive(segments, ANCHOR, T0 + ms);

// prep 3s → work 20s → rest 10s → work 20s → rest 10s
const tabata2 = compile({
  mode: 'tabata',
  workMs: 20_000,
  restMs: 10_000,
  rounds: 2,
});

/** 정상 틱 간격 */
const TICK = 100;

describe('cuesFor — 세그먼트 경계', () => {
  it('work 로 넘어가면 workStart 를 낸다', () => {
    const cues = cuesFor(at(tabata2, 2_950), at(tabata2, 3_050), TICK);

    expect(cues).toEqual(['workStart']);
  });

  it('rest 로 넘어가면 restStart 를 낸다', () => {
    const cues = cuesFor(at(tabata2, 22_950), at(tabata2, 23_050), TICK);

    expect(cues).toEqual(['restStart']);
  });

  it('emom 의 interval 진입은 workStart 다', () => {
    const emom = compile({ mode: 'emom', count: 3, intervalMs: 60_000 });
    const cues = cuesFor(at(emom, 2_950), at(emom, 3_050), TICK);

    expect(cues).toEqual(['workStart']);
  });

  it('amrap 시작도 workStart 다', () => {
    const amrap = compile({
      mode: 'amrap',
      totalMs: 720_000,
      countMethod: 'rounds',
    });
    const cues = cuesFor(at(amrap, 2_950), at(amrap, 3_050), TICK);

    expect(cues).toEqual(['workStart']);
  });

  it('완료 진입에는 큐가 없다', () => {
    const cues = cuesFor(at(tabata2, 62_950), at(tabata2, 63_050), TICK);

    expect(cues).toEqual([]);
  });

  it('같은 세그먼트 안에서는 경계 큐가 없다', () => {
    const cues = cuesFor(at(tabata2, 10_000), at(tabata2, 10_100), TICK);

    expect(cues).toEqual([]);
  });
});

describe('cuesFor — 카운트다운 3·2·1', () => {
  it('남은 시간이 3초를 지나면 countdown 을 낸다', () => {
    // work 는 3s~23s. 남은 3초 = 20_000
    const cues = cuesFor(at(tabata2, 19_950), at(tabata2, 20_050), TICK);

    expect(cues).toEqual(['countdown']);
  });

  it('2초를 지나면 또 낸다', () => {
    const cues = cuesFor(at(tabata2, 20_950), at(tabata2, 21_050), TICK);

    expect(cues).toEqual(['countdown']);
  });

  it('1초를 지나면 또 낸다', () => {
    const cues = cuesFor(at(tabata2, 21_950), at(tabata2, 22_050), TICK);

    expect(cues).toEqual(['countdown']);
  });

  it('임계를 지나지 않은 틱에는 아무것도 없다', () => {
    const cues = cuesFor(at(tabata2, 15_000), at(tabata2, 15_100), TICK);

    expect(cues).toEqual([]);
  });

  it('prep 의 3·2·1 도 울린다 — READY 카운트다운이다', () => {
    // prep 은 0~3s. 남은 2초 = 1_000
    const cues = cuesFor(at(tabata2, 950), at(tabata2, 1_050), TICK);

    expect(cues).toEqual(['countdown']);
  });

  it('한 틱에 임계 여러 개가 지나가도 한 번만 낸다', () => {
    // 1.2초 랙: 남은 3초와 2초를 동시에 통과
    const cues = cuesFor(at(tabata2, 19_900), at(tabata2, 21_100), 1_200);

    expect(cues).toEqual(['countdown']);
  });

  it('무제한 카운트업에는 카운트다운이 없다', () => {
    const noCap = compile({ mode: 'fortime', capMs: null });
    const cues = cuesFor(at(noCap, 10_000), at(noCap, 10_100), TICK);

    expect(cues).toEqual([]);
  });

  it('cap 이 있는 카운트업에도 카운트다운을 넣지 않는다', () => {
    const withCap = compile({ mode: 'fortime', capMs: 60_000 });
    // cap 까지 3초 남는 지점 통과
    const cues = cuesFor(at(withCap, 59_950), at(withCap, 60_050), TICK);

    expect(cues).toEqual([]);
  });
});

describe('cuesFor — 백그라운드 억제', () => {
  it('틱 간격이 벌어졌으면 경계 큐를 내지 않는다', () => {
    const cues = cuesFor(at(tabata2, 2_000), at(tabata2, 302_000), 300_000);

    expect(cues).toEqual([]);
  });

  it('틱 간격이 벌어졌으면 카운트다운도 내지 않는다', () => {
    const cues = cuesFor(at(tabata2, 19_000), at(tabata2, 22_000), 3_000);

    expect(cues).toEqual([]);
  });

  it('1500ms 를 넘지 않는 랙은 정상 틱으로 본다', () => {
    const cues = cuesFor(at(tabata2, 2_000), at(tabata2, 3_400), 1_400);

    expect(cues).toEqual(['workStart']);
  });
});

describe('cuesFor — 최초 틱', () => {
  it('이전 상태가 없으면 아무것도 내지 않는다', () => {
    expect(cuesFor(null, at(tabata2, 0), TICK)).toEqual([]);
  });
});

describe('cuesFor — 일시정지', () => {
  it('일시정지 상태로 들어갈 때 큐를 내지 않는다', () => {
    const paused = derive(
      tabata2,
      { ...ANCHOR, pausedAt: T0 + 20_050 },
      T0 + 20_050,
    );
    // 남은 3초 임계를 지나지만 멈춘 것이므로 울리면 안 된다
    const cues = cuesFor(at(tabata2, 19_950), paused, TICK);

    expect(cues).toEqual([]);
  });
});
