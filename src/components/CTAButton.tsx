import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { type } from '../theme/fonts';
import { color, radius, touch } from '../theme/tokens';

type Variant = 'work' | 'rest' | 'outline';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  /** 디자인의 touch 토큰: CTA 88 · row 72 · 다이얼로그 2차 64 */
  /** 생략하면 디자인의 CTA 높이 88 */
  height?: number;
  fontSize?: number;
  style?: ViewStyle;
};

const FILL: Record<Variant, { bg?: string; border?: string; fg: string }> = {
  work: { bg: color.work, fg: color.onWork },
  rest: { bg: color.rest, fg: color.onRest },
  outline: { border: color.lineStrong, fg: color.control },
};

export function CTAButton({
  label,
  onPress,
  variant = 'work',
  height = touch.cta,
  fontSize = 44,
  style,
}: Props) {
  const fill = FILL[variant];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          backgroundColor: fill.bg,
          borderColor: fill.border,
          borderWidth: fill.border ? 1.5 : 0,
          // 큰 면적을 눌렀다는 신호. 배경색 자체를 어둡게 하면 라임이 탁해진다
          opacity: pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      <Text style={[type.mode(fontSize, 0.02), { color: fill.fg }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
