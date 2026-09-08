import { ModeConfig, PREP_MS, Segment, SegmentKind } from './types';

function seg(
  kind: SegmentKind,
  durationMs: number | null,
  roundIndex: number,
  roundTotal: number,
  countUp = false,
): Segment {
  return { kind, durationMs, countUp, roundIndex, roundTotal };
}

function prep(roundTotal: number): Segment {
  return seg('prep', PREP_MS, -1, roundTotal);
}

/**
 * 모드 설정을 세그먼트 리스트로 펼친다.
 *
 * 이 함수가 모드별 차이를 전부 흡수하므로, derive 이하 모든 로직은 모드를 모른다.
 */
export function compile(config: ModeConfig): Segment[] {
  switch (config.mode) {
    case 'tabata': {
      const segments: Segment[] = [prep(config.rounds)];
      for (let r = 0; r < config.rounds; r++) {
        segments.push(seg('work', config.workMs, r, config.rounds));
        // 마지막 라운드의 rest 는 생략한다: 운동은 work 로 끝나야 한다
        if (r < config.rounds - 1) {
          segments.push(seg('rest', config.restMs, r, config.rounds));
        }
      }
      return segments;
    }

    case 'emom': {
      const segments: Segment[] = [prep(config.count)];
      for (let r = 0; r < config.count; r++) {
        segments.push(seg('interval', config.intervalMs, r, config.count));
      }
      return segments;
    }

    case 'amrap':
      return [prep(0), seg('amrap', config.totalMs, 0, 0)];

    case 'fortime':
      return [prep(0), seg('fortime', config.capMs, 0, 0, true)];
  }
}
