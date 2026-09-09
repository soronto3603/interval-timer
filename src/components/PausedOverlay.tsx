import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { CTAButton } from '@/components/CTAButton';
import { type } from '@/theme/fonts';
import { color, layout } from '@/theme/tokens';

type Props = {
  /** `ROUND 3 / 8 · 00:17` */
  summary: string;
  landscape?: boolean;
  onResume: () => void;
  onReset: () => void;
  onEnd: () => void;
};

/**
 * 디자인 07번. 라우트가 아니라 타이머 화면 위에 얹는 오버레이다 —
 * 일시정지는 타이머의 상태이지 다른 화면이 아니다.
 */
export function PausedOverlay({
  summary,
  landscape = false,
  onResume,
  onReset,
  onEnd,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.scrim,
        {
          paddingTop: insets.top + (landscape ? 12 : layout.screenTop),
          paddingBottom: Math.max(insets.bottom, landscape ? 12 : 34),
          paddingLeft: layout.screenX + insets.left,
          paddingRight: layout.screenX + insets.right,
        },
      ]}
    >
      {landscape ? null : <AppHeader />}

      <View style={styles.center}>
        <Text style={type.mode(landscape ? 56 : 76, 0.02)}>PAUSED</Text>
        <Text style={[type.sports(22, 0.26), styles.summary]}>{summary}</Text>
      </View>

      {/* 가로에서는 411dp 안에 버튼 3개를 세로로 쌓을 수 없다.
          한 줄로 펴고 RESUME 에 가장 넓은 자리를 준다. */}
      <View style={landscape ? styles.actionsRow : styles.actions}>
        <View style={landscape ? styles.grow2 : undefined}>
          <CTAButton
            label="RESUME"
            onPress={onResume}
            height={landscape ? 72 : undefined}
            fontSize={landscape ? 34 : 44}
          />
        </View>
        <View style={landscape ? styles.grow1 : undefined}>
          <CTAButton
            label="RESET"
            onPress={onReset}
            variant="outline"
            height={72}
            fontSize={30}
          />
        </View>
        <Pressable
          onPress={onEnd}
          accessibilityRole="button"
          style={({ pressed }) => [
            landscape ? styles.endLandscape : styles.end,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={[type.sports(landscape ? 18 : 22, 0.2), styles.endLabel]}>
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  grow2: {
    flex: 2,
  },
  grow1: {
    flex: 1,
  },
  endLandscape: {
    height: 72,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
