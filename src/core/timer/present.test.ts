import { start } from './anchor';
import { compile } from './compile';
import { derive } from './derive';
import { present } from './present';
import { ModeConfig } from './types';

const T0 = 1_700_000_000_000;

/** 경과 ms 시점의 화면 표시. 실제 compile → derive 를 통과시킨다. */
function view(config: ModeConfig, ms: number) {
  const segments = compile(config);
  return present(derive(segments, start(T0), T0 + ms), config);
}

const TABATA: ModeConfig = {
  mode: 'tabata',
  workMs: 20_000,
  restMs: 10_000,
  rounds: 8,
};

describe('present — prep (디자인 06번)', () => {
  it('전용 레이아웃과 파란 강조를 쓴다', () => {
    const v = view(TABATA, 0);

    expect(v.layout).toBe('prep');
    expect(v.accent).toBe('prep');
    expect(v.modeLabel).toBe('READY');
  });

  it('2자리 초로 센다', () => {
    expect(view(TABATA, 0).timerText).toBe('03');
    expect(view(TABATA, 2_100).timerText).toBe('01');
  });

  it('하단에 모드와 라운드 수를 알린다', () => {
    expect(view(TABATA, 0).footerLabel).toBe('TABATA · 8 ROUNDS');
  });

  it('라운드 개념이 없는 모드는 모드명만 알린다', () => {
    const v = view({ mode: 'fortime', capMs: null }, 0);

    expect(v.footerLabel).toBe('FOR TIME');
  });
});

describe('present — 타바타 (디자인 03 · 04번)', () => {
  it('운동 구간은 라임 WORK 이고 라운드 도트를 쓴다', () => {
    const v = view(TABATA, 3_000 + 3_000);

    expect(v.layout).toBe('running');
    expect(v.accent).toBe('work');
    expect(v.modeLabel).toBe('WORK');
    expect(v.slot).toBe('dots');
  });

  it('휴식 구간은 오렌지 REST 다', () => {
    const v = view(TABATA, 3_000 + 20_000 + 1_000);

    expect(v.accent).toBe('rest');
    expect(v.modeLabel).toBe('REST');
  });

  it('상단에 현재 라운드를 1-based 로 낸다', () => {
    // prep 3 + (20+10)*2 = 63s → 3라운드 운동 시작
    const v = view(TABATA, 63_000 + 1_000);

    expect(v.sportsLabel).toBe('ROUND 3 / 8');
    expect(v.roundCurrent).toBe(2);
    expect(v.roundTotal).toBe(8);
  });

  it('휴식 중에도 라운드 번호가 유지된다 — 같은 라운드다', () => {
    const v = view(TABATA, 3_000 + 20_000 + 1_000);

    expect(v.sportsLabel).toBe('ROUND 1 / 8');
  });

  it('남은 시간을 올림해서 낸다', () => {
    const v = view(TABATA, 3_000 + 2_500);

    expect(v.timerText).toBe('00:18');
  });
});

describe('present — EMOM', () => {
  const EMOM: ModeConfig = { mode: 'emom', count: 10, intervalMs: 60_000 };

  it('MIN 이 아니라 ROUND 로 센다 — 인터벌이 60초가 아닐 수 있다', () => {
    const v = view({ mode: 'emom', count: 10, intervalMs: 90_000 }, 3_000 + 100);

    expect(v.sportsLabel).toBe('ROUND 1 / 10');
  });

  it('인터벌은 운동 구간이므로 라임 WORK 이다', () => {
    const v = view(EMOM, 3_000 + 100);

    expect(v.accent).toBe('work');
    expect(v.modeLabel).toBe('WORK');
    expect(v.slot).toBe('dots');
  });

  it('인터벌마다 라운드가 올라간다', () => {
    const v = view(EMOM, 3_000 + 60_000 * 3 + 100);

    expect(v.sportsLabel).toBe('ROUND 4 / 10');
  });
});

describe('present — AMRAP (신규 화면)', () => {
  const AMRAP: ModeConfig = {
    mode: 'amrap',
    totalMs: 720_000,
    countMethod: 'rounds',
  };

  it('도트 대신 집계 카드를 쓴다', () => {
    const v = view(AMRAP, 3_000 + 100);

    expect(v.slot).toBe('tally');
    expect(v.roundTotal).toBe(0);
  });

  it('상단에 모드와 설정 시간을 함께 낸다', () => {
    const v = view(AMRAP, 3_000 + 100);

    expect(v.sportsLabel).toBe('AMRAP · 12:00');
  });

  it('총 시간을 카운트다운한다', () => {
    const v = view(AMRAP, 3_000 + 120_000);

    expect(v.timerText).toBe('10:00');
    expect(v.accent).toBe('work');
    expect(v.modeLabel).toBe('AMRAP');
  });

  it('카운트 방식을 집계 라벨로 넘긴다', () => {
    expect(view(AMRAP, 3_100).tallyKind).toBe('rounds');
    expect(
      view({ ...AMRAP, countMethod: 'reps' }, 3_100).tallyKind,
    ).toBe('reps');
  });
});

describe('present — FOR TIME (신규 화면)', () => {
  it('제한이 없으면 카운트업하고 COUNT UP 을 알린다', () => {
    const v = view({ mode: 'fortime', capMs: null }, 3_000 + 45_400);

    expect(v.sportsLabel).toBe('COUNT UP');
    expect(v.timerText).toBe('00:45');
    expect(v.modeLabel).toBe('FOR TIME');
  });

  it('스스로 끝나지 않으므로 FINISH 를 내준다', () => {
    const v = view({ mode: 'fortime', capMs: null }, 3_000 + 1_000);

    expect(v.slot).toBe('finish');
  });

  it('제한이 있으면 남은 시간도 함께 알린다', () => {
    const v = view({ mode: 'fortime', capMs: 720_000 }, 3_000 + 60_000);

    expect(v.sportsLabel).toBe('CAP 12:00 · LEFT 11:00');
  });

  it('제한이 있어도 큰 숫자는 경과 시간이다 — For Time 은 기록을 세는 운동이다', () => {
    const v = view({ mode: 'fortime', capMs: 720_000 }, 3_000 + 60_000);

    expect(v.timerText).toBe('01:00');
  });
});
