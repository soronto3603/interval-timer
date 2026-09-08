import { Pressable, StyleSheet, Text, View } from 'react-native';

import { font, type } from '../theme/fonts';
import { color, space } from '../theme/tokens';

/**
 * PULSE BOX 로고. 디자인은 Anton 에 font-style: italic 을 걸었지만 Anton 에는
 * 이탤릭 자체가 없고 Android 는 커스텀 폰트의 합성 이탤릭을 신뢰할 수 없다.
 * 감싼 View 를 기울여 같은 인상을 만든다.
 */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <View style={styles.logoSkew}>
      <Text style={[type.mode(size, 0.04), styles.logoText]}>
        PULSE <Text style={{ color: color.work }}>BOX</Text>
      </Text>
    </View>
  );
}

function Hamburger() {
  return (
    <View style={styles.hamburger}>
      <View style={styles.bar} />
      <View style={styles.bar} />
      <View style={styles.bar} />
    </View>
  );
}

type Props = {
  /** 우측 햄버거 → 설정 */
  onMenu?: () => void;
  /** 우측 ✕ (디자인 13번) */
  onClose?: () => void;
  /** 좌측 ‹ (디자인 14 · 15번). 이때 로고는 가운데로 간다 */
  onBack?: () => void;
};

export function AppHeader({ onMenu, onClose, onBack }: Props) {
  if (onBack) {
    return (
      <View style={styles.row}>
        <Pressable onPress={onBack} hitSlop={16} style={styles.glyphHit}>
          <Text style={[type.glyph(30), { color: color.ink }]}>‹</Text>
        </Pressable>
        <Logo />
        {/* 로고를 광학적으로 가운데 두기 위한 균형추 */}
        <View style={styles.glyphHit} />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Logo />
      {onClose ? (
        <Pressable onPress={onClose} hitSlop={16}>
          <Text style={[type.glyph(30), { color: color.ink }]}>✕</Text>
        </Pressable>
      ) : onMenu ? (
        <Pressable onPress={onMenu} hitSlop={16}>
          <Hamburger />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSkew: {
    transform: [{ skewX: '-8deg' }],
  },
  logoText: {
    fontFamily: font.anton,
    color: color.ink,
  },
  hamburger: {
    width: 26,
    gap: 5,
  },
  bar: {
    height: 2.5,
    backgroundColor: color.ink,
  },
  glyphHit: {
    width: 16 + space.sm,
  },
});
