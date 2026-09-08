import { Pressable, StyleSheet, Text, View } from 'react-native';

import { STEPPERS, step } from '@/core/config/steppers';
import { formatCountdown } from '@/core/timer/format';
import { ForTimeConfig } from '@/core/timer/types';
import { useT } from '@/i18n/useT';
import { type } from '@/theme/fonts';
import { color, radius, space } from '@/theme/tokens';
import { Stepper } from '@/components/Stepper';

/** 디자인 10번의 ROUNDS / REPS 2택 */
export function ChoicePair<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View>
      <Text style={[type.ko(19, 700), styles.label]}>{label}</Text>
      <View style={styles.pair}>
        {options.map((option) => {
          const active = option.value === selected;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.choice,
                active ? styles.choiceActive : styles.choiceIdle,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text
                style={type.mode(26, 0.02)}
                // 선택된 쪽은 라임 위의 검정, 나머지는 흐린 회색
              >
                <Text
                  style={{ color: active ? color.onWork : color.faintAlt }}
                >
                  {option.label}
                </Text>
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * 디자인 12번의 시간 제한 영역.
 *
 * 제한이 없을 때는 `+ 시간 제한 추가` 점선 버튼만 보이고, 추가하면 스테퍼로
 * 바뀐다. 큰 `00:00` 은 아직 시작하지 않았다는 표시(placeholder 색)다.
 */
export function ForTimeCap({
  config,
  onChange,
}: {
  config: ForTimeConfig;
  onChange: (next: ForTimeConfig) => void;
}) {
  const t = useT();
  const spec = STEPPERS.fortime.capMs;

  return (
    <View style={styles.capWrap}>
      <View style={styles.capRow}>
        <View>
          <Text style={type.ko(19, 700)}>{t.timeLimit}</Text>
          <Text style={[type.meta(18, 0.2), styles.capMeta]}>COUNT UP</Text>
        </View>
        <Text style={[type.mode(34, 0), { color: color.muted }]}>
          {config.capMs === null ? t.noLimit : formatCountdown(config.capMs)}
        </Text>
      </View>

      {config.capMs === null ? (
        <Pressable
          onPress={() => onChange({ mode: 'fortime', capMs: spec.min })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.add, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[type.glyph(32), { color: color.work }]}>+</Text>
          <Text style={[type.ko(18, 700), { color: color.work }]}>
            {t.addTimeLimit}
          </Text>
        </Pressable>
      ) : (
        <>
          <Stepper
            label={t.timeLimit}
            display={formatCountdown(config.capMs)}
            value={config.capMs}
            spec={spec}
            onStep={(d) =>
              onChange({
                mode: 'fortime',
                capMs: step(spec, config.capMs ?? spec.min, d),
              })
            }
          />
          <Pressable
            onPress={() => onChange({ mode: 'fortime', capMs: null })}
            accessibilityRole="button"
            hitSlop={10}
            style={styles.remove}
          >
            <Text style={[type.meta(15, 0.2), { color: color.faintAlt }]}>
              {t.noLimit}
            </Text>
          </Pressable>
        </>
      )}

      <Text style={[type.timer(120), styles.placeholder]}>00:00</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 10,
  },
  pair: {
    flexDirection: 'row',
    gap: 10,
  },
  choice: {
    flex: 1,
    height: 72,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceActive: {
    backgroundColor: color.work,
  },
  choiceIdle: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
  },
  capWrap: {
    gap: 22,
  },
  capRow: {
    height: 96,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  capMeta: {
    marginTop: space.xs,
  },
  add: {
    height: 76,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: color.lineStrong,
    borderRadius: radius.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  remove: {
    alignItems: 'center',
  },
  placeholder: {
    color: color.placeholder,
    textAlign: 'center',
    marginTop: 10,
  },
});
