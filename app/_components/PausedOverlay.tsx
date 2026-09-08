import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { CTAButton } from '@/components/CTAButton';
import { type } from '@/theme/fonts';
import { color, layout } from '@/theme/tokens';

type Props = {
  /** `ROUND 3 / 8 · 00:17` */
  summary: string;
  onResume: () => void;
  onReset: () => void;
  onEnd: () => void;
};

/**
 * 디자인 07번. 라우트가 아니라 타이머 화면 위에 얹는 오버레이다 —
 * 일시정지는 타이머의 상태이지 다른 화면이 아니다.
 */
export function PausedOverlay({ summary, onResume, onReset, onEnd }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.scrim,
        {
          paddingTop: insets.top + layout.screenTop,
          paddingBottom: Math.max(insets.bottom, 34),
        },
      ]}
    >
      <AppHeader />

      <View style={styles.center}>
        <Text style={type.mode(76, 0.02)}>PAUSED</Text>
        <Text style={[type.sports(22, 0.26), styles.summary]}>{summary}</Text>
      </View>

      <View style={styles.actions}>
        <CTAButton label="RESUME" onPress={onResume} />
        <CTAButton
          label="RESET"
          onPress={onReset}
          variant="outline"
          height={72}
          fontSize={30}
        />
        <Pressable
          onPress={onEnd}
          accessibilityRole="button"
          style={({ pressed }) => [styles.end, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={[type.sports(22, 0.2), styles.endLabel]}>
            END WORKOUT
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: color.scrim,
    paddingHorizontal: layout.screenX,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  summary: {
    color: color.faint,
    textAlign: 'center',
  },
  actions: {
    gap: 14,
  },
  end: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endLabel: {
    color: color.faintAlt,
  },
});
