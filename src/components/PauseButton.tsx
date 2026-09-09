import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type } from '../theme/fonts';
import { color, touch } from '../theme/tokens';

/** 디자인 힌트가 "길게 눌러" 라고 말하는 만큼은 실제로 눌러야 한다 */
const HOLD_MS = 450;

type Props = {
  /** 세로 132 · 가로 84. 가로는 411dp 높이라 132 가 안 들어간다 */
  size?: number;
  onPause: () => void;
  /** 짧게 눌렀을 때 — 멈추지는 않고 눌렸다는 것만 알린다 */
  onTap?: () => void;
  /** 디자인 03/04번 하단의 `길게 눌러 일시정지` 힌트 */
  hint?: string;
  /** 가로에서는 자리가 좁아 힌트를 줄인다 */
  hintSize?: number;
};

/**
 * 원형 일시정지 버튼 (132).
 *
 * **탭이 아니라 롱프레스로 멈춘다.** 디자인이 이 버튼 밑에 `길게 눌러 일시정지`
 * 힌트를 둔 이유가 그것이다 — 운동 중에 팔이 스쳐서 타이머가 멈추면 안 된다.
 * 짧게 누르면 아무 일도 일어나지 않고, 햅틱으로만 눌렸음을 알린다.
 */
export function PauseButton({
  onPause,
  onTap,
  hint,
  hintSize = 15,
  size = touch.pause,
}: Props) {
  return (
    <View style={[styles.wrap, { gap: hintSize < 15 ? 6 : 14 }]}>
      <Pressable
        onLongPress={onPause}
        delayLongPress={HOLD_MS}
        onPress={onTap}
        accessibilityRole="button"
        accessibilityLabel="pause"
        accessibilityHint="hold to pause"
        style={({ pressed }) => [
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={[styles.bar, { height: size * 0.35 }]} />
        <View style={[styles.bar, { height: size * 0.35 }]} />
      </Pressable>
      {hint ? (
        <Text style={type.meta(hintSize, 0.22)} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  circle: {
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
    borderRadius: 3,
    backgroundColor: '#EFF2EC',
  },
});
