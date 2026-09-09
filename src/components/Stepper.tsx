import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { canStep, StepperSpec } from '../core/config/steppers';
import { useTapHaptic } from '../hooks/useTapHaptic';
import { font, type } from '../theme/fonts';
import { color, radius, space, touch } from '../theme/tokens';

/** 길게 누르기 시작으로 판정하는 시간 */
const HOLD_DELAY_MS = 420;
/** 반복 간격: 시작 → 최소. 오래 누를수록 빨라진다 */
const REPEAT_START_MS = 130;
const REPEAT_MIN_MS = 45;
const REPEAT_ACCEL = 0.86;

type Props = {
  label: string;
  /** 이미 포맷된 표시값 ("00:20" · "8") */
  display: string;
  value: number;
  spec: StepperSpec;
  onStep: (direction: 1 | -1) => void;
};

/**
 * −/값/+ 스테퍼. 디자인 02 · 10 · 11번의 height 80 행.
 *
 * 길게 누르면 가속 반복한다. 라운드를 8에서 40으로 올리려면 32번을 눌러야 하는
 * 인터랙션은 쓸 수 없다.
 */
export function Stepper({ label, display, value, spec, onStep }: Props) {
  return (
    <View>
      <Text style={[type.ko(19, 700), styles.label]}>{label}</Text>
      <View style={styles.row}>
        <StepButton
          glyph="−"
          enabled={canStep(spec, value, -1)}
          onStep={() => onStep(-1)}
        />
        <View style={styles.valueBox}>
          <Text style={type.mode(46)} numberOfLines={1}>
            {display}
          </Text>
        </View>
        <StepButton
          glyph="+"
          enabled={canStep(spec, value, +1)}
          onStep={() => onStep(+1)}
        />
      </View>
    </View>
  );
}

function StepButton({
  glyph,
  enabled,
  onStep,
}: {
  glyph: string;
  enabled: boolean;
  onStep: () => void;
}) {
  const tap = useTapHaptic();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delay = useRef(REPEAT_START_MS);

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    delay.current = REPEAT_START_MS;
  }, []);

  // 언마운트나 화면 이동 중에 반복이 살아남지 않게 한다
  useEffect(() => stop, [stop]);

  const repeat = useCallback(() => {
    tap();
    onStep();
    delay.current = Math.max(REPEAT_MIN_MS, delay.current * REPEAT_ACCEL);
    timer.current = setTimeout(repeat, delay.current);
  }, [onStep, tap]);

  const onPressIn = useCallback(() => {
    if (!enabled) return;
    tap();
    onStep();
    timer.current = setTimeout(repeat, HOLD_DELAY_MS);
  }, [enabled, onStep, repeat, tap]);

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={stop}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={glyph === '+' ? 'increase' : 'decrease'}
      style={({ pressed }) => [
        styles.stepButton,
        { opacity: !enabled ? 0.3 : pressed ? 0.65 : 1 },
      ]}
    >
      <Text style={styles.glyph}>{glyph}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: touch.stepper,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.control,
    overflow: 'hidden',
  },
  stepButton: {
    width: 78,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surfaceRaised,
  },
  glyph: {
    fontFamily: font.barlow600,
    fontSize: 38,
    lineHeight: 38,
    color: color.control,
  },
  valueBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
});
