import { StyleSheet, Text, View } from 'react-native';

import { type } from '../theme/fonts';
import { color, radius } from '../theme/tokens';
import { CTAButton } from './CTAButton';

type Props = {
  /** 디스플레이 워드라 양 언어 공통 (예: `RESET TIMER?`) */
  title: string;
  body: string;
  /** 강조 버튼 */
  primaryLabel: string;
  onPrimary: () => void;
  primaryVariant?: 'work' | 'rest';
  secondaryLabel: string;
  onSecondary: () => void;
  landscape?: boolean;
};

/**
 * 디자인 08 · 09번의 확인 다이얼로그.
 *
 * 주의: 09번(END WORKOUT?)에서 강조 버튼은 `KEEP GOING` 이다.
 * 파괴적 동작이 2차 버튼에 있으므로 호출부에서 뒤바꾸지 않도록 한다.
 */
export function Dialog({
  title,
  body,
  primaryLabel,
  onPrimary,
  primaryVariant = 'work',
  secondaryLabel,
  onSecondary,
  landscape = false,
}: Props) {
  return (
    <View style={styles.scrim}>
      <View style={[styles.card, landscape && styles.cardLandscape]}>
        <Text style={[type.mode(landscape ? 36 : 46), styles.title]}>
          {title}
        </Text>
        <Text style={[type.ko(16, 400), styles.body]}>{body}</Text>
        <View style={styles.divider} />
        {/* 가로에서는 세로로 쌓을 높이가 없다. 좌우로 편다. */}
        <View style={landscape ? styles.actionsRow : styles.actions}>
          <View style={landscape ? styles.half : undefined}>
            <CTAButton
              label={primaryLabel}
              onPress={onPrimary}
              variant={primaryVariant}
              height={landscape ? 64 : 72}
              fontSize={landscape ? 26 : 30}
              style={styles.radiusRow}
            />
          </View>
          <View style={landscape ? styles.half : undefined}>
            <CTAButton
              label={secondaryLabel}
              onPress={onSecondary}
              variant="outline"
              height={64}
              fontSize={26}
              style={styles.radiusRow}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: color.scrimDialog,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    width: '100%',
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: '#262A26',
    borderRadius: radius.dialog,
    paddingTop: 34,
    paddingHorizontal: 26,
    paddingBottom: 26,
  },
  cardLandscape: {
    maxWidth: 560,
    paddingTop: 26,
    paddingBottom: 20,
  },
  title: {
    lineHeight: 46 * 1.05,
  },
  body: {
    color: color.mutedStrong,
    marginTop: 12,
    lineHeight: 16 * 1.6,
  },
  divider: {
    height: 1,
    backgroundColor: '#262A26',
    marginTop: 26,
    marginBottom: 20,
  },
  actions: {
    gap: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  radiusRow: {
    borderRadius: radius.row,
  },
});
