import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, layout } from '../theme/tokens';
import { DotGrid } from './DotGrid';

type Props = {
  children: ReactNode;
  /** 타이머 계열 화면의 점 격자 배경 (디자인 03 · 04 · 06 ~ 09) */
  dotted?: boolean;
  style?: ViewStyle;
};

/**
 * 화면 바깥 틀. 디자인의 390×844 프레임에 해당한다.
 * radius 40 은 목업의 기기 모서리 표현이므로 실제 화면에는 적용하지 않는다.
 */
export function ScreenFrame({ children, dotted = false, style }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {dotted && <DotGrid />}
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + layout.screenTop,
            paddingBottom: Math.max(insets.bottom, layout.safeBottom),
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.screen,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.screenX,
  },
});
