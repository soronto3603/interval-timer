/**
 * 스테퍼 규격. 설계 스펙 §8 의 표를 그대로 옮긴 것.
 * 화면은 이 값만 보고 −/+ 를 그리므로 규격 변경이 한 곳에서 끝난다.
 */

export type StepperSpec = {
  step: number;
  min: number;
  max: number;
};

export const STEPPERS = {
  tabata: {
    workMs: { step: 5_000, min: 5_000, max: 600_000 },
    restMs: { step: 5_000, min: 5_000, max: 600_000 },
    rounds: { step: 1, min: 1, max: 99 },
  },
  amrap: {
    totalMs: { step: 60_000, min: 60_000, max: 3_600_000 },
  },
  emom: {
    count: { step: 1, min: 1, max: 60 },
    intervalMs: { step: 15_000, min: 15_000, max: 300_000 },
  },
  fortime: {
    capMs: { step: 60_000, min: 60_000, max: 3_600_000 },
  },
} as const satisfies Record<string, Record<string, StepperSpec>>;

const clamp = (spec: StepperSpec, value: number) =>
  Math.min(spec.max, Math.max(spec.min, value));

/**
 * 한 칸 올리거나 내린다.
 *
 * 스텝 격자에 어긋난 값(규격이 바뀌기 전에 저장된 값)이 들어오면 격자에 맞춰
 * 이동시킨다. 어긋난 값이 계속 어긋난 채로 굴러가지 않게 하려는 것이다.
 */
export function step(
  spec: StepperSpec,
  current: number,
  direction: 1 | -1,
): number {
  const base = clamp(spec, current);

  // 범위 밖 값이었다면 범위로 끌어오는 것까지가 이 누름의 효과다.
  // 거기서 한 칸 더 움직이면 사용자가 누르지 않은 이동이 섞인다.
  if (base !== current) return base;

  const offGrid = (base - spec.min) % spec.step !== 0;

  if (offGrid) {
    const snapped =
      direction === 1
        ? spec.min + Math.ceil((base - spec.min) / spec.step) * spec.step
        : spec.min + Math.floor((base - spec.min) / spec.step) * spec.step;
    return clamp(spec, snapped);
  }

  return clamp(spec, base + direction * spec.step);
}

/** −/+ 버튼을 흐리게 할지 판단한다. */
export function canStep(
  spec: StepperSpec,
  current: number,
  direction: 1 | -1,
): boolean {
  return step(spec, current, direction) !== clamp(spec, current);
}
