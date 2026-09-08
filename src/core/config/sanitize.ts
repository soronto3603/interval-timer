import { ModeConfig, ModeId } from '../timer/types';
import { DEFAULT_CONFIG } from './defaults';
import { STEPPERS, StepperSpec } from './steppers';

/**
 * 저장된 설정을 신뢰하지 않고 통과시킨다.
 *
 * 앱 버전이 올라가며 규격이 바뀌거나 저장소가 손상되면 화면이 이상한 값을
 * 들고 시작한다. 필드 단위로 되돌리므로, 한 필드가 망가져도 나머지 설정은 살린다.
 */
export function sanitizeConfig(mode: ModeId, raw: unknown): ModeConfig {
  const src = isRecord(raw) && raw.mode === mode ? raw : {};

  switch (mode) {
    case 'tabata': {
      const d = DEFAULT_CONFIG.tabata;
      return {
        mode: 'tabata',
        workMs: num(src.workMs, d.workMs, STEPPERS.tabata.workMs),
        restMs: num(src.restMs, d.restMs, STEPPERS.tabata.restMs),
        rounds: num(src.rounds, d.rounds, STEPPERS.tabata.rounds),
      };
    }

    case 'amrap': {
      const d = DEFAULT_CONFIG.amrap;
      return {
        mode: 'amrap',
        totalMs: num(src.totalMs, d.totalMs, STEPPERS.amrap.totalMs),
        countMethod:
          src.countMethod === 'rounds' || src.countMethod === 'reps'
            ? src.countMethod
            : d.countMethod,
      };
    }

    case 'emom': {
      const d = DEFAULT_CONFIG.emom;
      return {
        mode: 'emom',
        count: num(src.count, d.count, STEPPERS.emom.count),
        intervalMs: num(src.intervalMs, d.intervalMs, STEPPERS.emom.intervalMs),
      };
    }

    case 'fortime': {
      // null 은 "제한 없음" 이라는 유효한 값이므로 되살려야 한다
      if (src.capMs === null || src.capMs === undefined) {
        return { mode: 'fortime', capMs: null };
      }
      return {
        mode: 'fortime',
        capMs: isFiniteNumber(src.capMs)
          ? clamp(STEPPERS.fortime.capMs, src.capMs)
          : null,
      };
    }
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function clamp(spec: StepperSpec, value: number) {
  return Math.min(spec.max, Math.max(spec.min, value));
}

function num(value: unknown, fallback: number, spec: StepperSpec): number {
  return isFiniteNumber(value) ? clamp(spec, value) : fallback;
}
