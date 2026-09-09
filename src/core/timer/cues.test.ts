import { start } from './anchor';
import { compile } from './compile';
import { Cue, cuesFor, WARN_AT_MS, WARN_MIN_SEGMENT_MS } from './cues';
import { derive } from './derive';
import { Segment } from './types';

const T0 = 1_700_000_000_000;
const ANCHOR = start(T0);

/** 경과 ms 시점의 상태. 손으로 상태를 짜맞추지 않고 실제 derive 를 쓴다. */
const at = (segments: Segment[], ms: number) =>
  derive(segments, ANCHOR, T0 + ms);

const kinds = (cues: Cue[]) => cues.map((c) => c.kind);

// prep 3s → work 20s → rest 10s → work 20s → rest 10s
const tabata2 = compile({
  mode: 'tabata',
  workMs: 20_000,
  restMs: 10_000,
  rounds: 2,
});

/** 정상 틱 간격 */
const TICK = 100;

describe('cuesFor — 준비 진입', () => {
  it('첫 틱에 readyEnter 를 낸다 — GET READY 진입 신호다', () => {
    expect(kinds(cuesFor(null, at(tabata2, 0), TICK))).toEqual(['readyEnter']);
  });

  it('첫 틱이 prep 이 아니면 아무것도 내지 않는다', () => {
    // 이어받기 같은 상황. 소리로 알릴 전환이 아니다
    expect(cuesFor(null, at(tabata2, 10_000), TICK)).toEqual([]);
  });
});

describe('cuesFor — 세그먼트 경계', () => {
  it('work 로 넘어가면 workStart 를 낸다', () => {
    expect(
      kinds(cuesFor(at(tabata2, 2_950), at(tabata2, 3_050), TICK)),
    ).toEqual(['workStart']);
  });

  it('rest 로 넘어가면 restStart 를 낸다', () => {
    expect(
      kinds(cuesFor(at(tabata2, 22_950), at(tabata2, 23_050), TICK)),
    ).toEqual(['restStart']);
  });

  it('emom 의 interval 진입은 workStart 다', () => {
    const emom = compile({ mode: 'emom', count: 3, intervalMs: 60_000 });

    expect(kinds(cuesFor(at(emom, 2_950), at(emom, 3_050), TICK))).toEqual([
      'workStart',
    ]);
  });

  it('amrap 시작도 workStart 다', () => {
    const amrap = compile({
      mode: 'amrap',
      totalMs: 720_000,
      countMethod: 'rounds',
    });

    expect(kinds(cuesFor(at(amrap, 2_950), at(amrap, 3_050), TICK))).toEqual([
      'workStart',
    ]);
  });

  it('같은 세그먼트 안에서는 경계 큐가 없다', () => {
    expect(cuesFor(at(tabata2, 10_000), at(tabata2, 10_100), TICK)).toEqual([]);
  });
});

describe('cuesFor — 완료', () => {
  it('완료로 넘어가면 complete 를 낸다', () => {
    expect(
      kinds(cuesFor(at(tabata2, 62_950), at(tabata2, 63_050), TICK)),
    ).toEqual(['complete']);
  });

  it('이미 완료 상태에 머물러 있으면 다시 내지 않는다', () => {
    const done = at(tabata2, 63_050);
    const later = at(tabata2, 70_000);

    expect(cuesFor(done, later, TICK)).toEqual([]);
  });
});

describe('cuesFor — 카운트다운 3·2·1', () => {
  it('단계를 함께 낸다 — 단계마다 피치가 다르다', () => {
    // work 는 3s~23s. 남은 3초 = 20_000
    expect(cuesFor(at(tabata2, 19_950), at(tabata2, 20_050), TICK)).toEqual([
      { kind: 'countdown', step: 3 },
    ]);
    expect(cuesFor(at(tabata2, 20_950), at(tabata2, 21_050), TICK)).toEqual([
      { kind: 'countdown', step: 2 },
    ]);
    expect(cuesFor(at(tabata2, 21_950), at(tabata2, 22_050), TICK)).toEqual([
      { kind: 'countdown', step: 1 },
    ]);
  });

  it('임계를 지나지 않은 틱에는 아무것도 없다', () => {
    expect(cuesFor(at(tabata2, 15_000), at(tabata2, 15_100), TICK)).toEqual([]);
  });

  it('prep 의 3·2·1 도 울린다', () => {
    // prep 은 0~3s. 남은 2초 = 1_000
    expect(cuesFor(at(tabata2, 950), at(tabata2, 1_050), TICK)).toEqual([
      { kind: 'countdown', step: 2 },
    ]);
  });

  it('한 틱에 임계 여러 개가 지나가도 가장 늦은 단계만 낸다', () => {
    // 1.2초 랙: 남은 3초와 2초를 동시에 통과
    expect(cuesFor(at(tabata2, 19_900), at(tabata2, 21_100), 1_200)).toEqual([
      { kind: 'countdown', step: 2 },
    ]);
  });

  it('무제한 카운트업에는 카운트다운이 없다', () => {
    const noCap = compile({ mode: 'fortime', capMs: null });

    expect(cuesFor(at(noCap, 10_000), at(noCap, 10_100), TICK)).toEqual([]);
  });
});

describe('cuesFor — 10초 경고', () => {
  const emom = compile({ mode: 'emom', count: 3, intervalMs: 60_000 });

  it('남은 시간이 10초를 지나면 warn10 을 낸다', () => {
    // 인터벌 1: 3s~63s. 남은 10초 = 53_000
    expect(kinds(cuesFor(at(emom, 52_950), at(emom, 53_050), TICK))).toEqual([
      'warn10',
    ]);
  });

  it('구간이 짧으면 내지 않는다 — 시작 신호와 겹쳐 의미가 없다', () => {
    // 타바타 기본 휴식은 10초다. 경고가 rest_start 바로 뒤에 붙으면 안 된다
    const shortRest = compile({
      mode: 'tabata',
      workMs: 20_000,
      restMs: WARN_MIN_SEGMENT_MS,
      rounds: 2,
    });
    const cues: Cue[] = [];
    for (let ms = 23_000; ms < 33_000; ms += 100) {
      cues.push(...cuesFor(at(shortRest, ms - 100), at(shortRest, ms), TICK));
    }

    expect(kinds(cues)).not.toContain('warn10');
  });

  it('구간이 임계를 넘으면 낸다', () => {
    const longRest = compile({
      mode: 'tabata',
      workMs: 20_000,
      restMs: WARN_MIN_SEGMENT_MS + 5_000,
      rounds: 2,
    });
    const cues: Cue[] = [];
    for (let ms = 23_000; ms < 23_000 + WARN_MIN_SEGMENT_MS + 5_000; ms += 100) {
      cues.push(...cuesFor(at(longRest, ms - 100), at(longRest, ms), TICK));
    }

    expect(kinds(cues)).toContain('warn10');
  });

  it('경고 임계는 10초다', () => {
    expect(WARN_AT_MS).toBe(10_000);
  });

  it('카운트업 구간에는 경고가 없다', () => {
    const withCap = compile({ mode: 'fortime', capMs: 60_000 });

    expect(cuesFor(at(withCap, 52_950), at(withCap, 53_050), TICK)).toEqual([]);
  });
});

describe('cuesFor — 백그라운드 억제', () => {
  it('틱 간격이 벌어졌으면 경계 큐를 내지 않는다', () => {
    expect(
      cuesFor(at(tabata2, 2_000), at(tabata2, 302_000), 300_000),
    ).toEqual([]);
  });

  it('틱 간격이 벌어졌으면 카운트다운도 내지 않는다', () => {
    expect(cuesFor(at(tabata2, 19_000), at(tabata2, 22_000), 3_000)).toEqual(
      [],
    );
  });

  it('1500ms 를 넘지 않는 랙은 정상 틱으로 본다', () => {
    expect(
      kinds(cuesFor(at(tabata2, 2_000), at(tabata2, 3_400), 1_400)),
    ).toEqual(['workStart']);
  });

  it('완료도 억제한다 — 5분 만에 돌아와서 완료음이 울리면 뜬금없다', () => {
    expect(
      cuesFor(at(tabata2, 60_000), at(tabata2, 400_000), 340_000),
    ).toEqual([]);
  });
});

describe('cuesFor — 일시정지', () => {
  it('일시정지 상태로 들어갈 때 큐를 내지 않는다', () => {
    const paused = derive(
      tabata2,
      { ...ANCHOR, pausedAt: T0 + 20_050 },
      T0 + 20_050,
    );

    expect(cuesFor(at(tabata2, 19_950), paused, TICK)).toEqual([]);
  });
});
