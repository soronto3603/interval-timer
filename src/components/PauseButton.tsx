import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type } from '../theme/fonts';
import { color, touch } from '../theme/tokens';

type Props = {
  onPress: () => void;
  /** 디자인 03/04번 하단의 `길게 눌러 일시정지` 힌트 */
  hint?: string;
};

/**
 * 원형 일시정지 버튼 (132). 운동 중 땀 흘리며 누르는 버튼이라
 * 디자인이 가장 큰 터치 타겟을 배정했다.
 */
export function PauseButton({ onPress, hint }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="pause"
        style={({ pressed }) => [styles.circle, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={styles.bar} />
        <View style={styles.bar} />
      </Pressable>
      {hint ? <Text style={type.meta(15, 0.22)}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 14,
  },
  circle: {
    width: touch.pause,
    height: touch.pause,
    borderRadius: touch.pause / 2,
    backgroundColor: '#171A17',
    borderWidth: 1.5,
    borderColor: '#2A2E2A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
  },
  bar: {
    width: 13,
    height: 46,
    borderRadius: 3,
    backgroundColor: '#EFF2EC',
  },
});
