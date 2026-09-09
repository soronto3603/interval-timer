import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color, layout } from '../theme/tokens';
import { DotGrid } from './DotGrid';

type Props = {
  children: ReactNode;
  /** 타이머 계열 화면의 점 격자 배경 (디자인 03 · 04 · 06 ~ 09) */
  dotted?: boolean;
  /**
   * 전체 화면을 덮는 것들 — 일시정지 오버레이 · 다이얼로그 · 바텀시트.
   *
   * children 안에 두면 화면 패딩(좌우 22 · safe area) 안쪽에 갇혀서 스크림이
   * 가장자리를 덮지 못한다. 그래서 패딩 바깥 형제로 그린다.
   */
  overlay?: ReactNode;
  /**
   * 오버레이가 떠 있을 때 본문을 얼마나 흐리게 둘지.
   * 디자인 07 · 08 · 09번은 스크림(0.93) 아래 본문을 0.28 로 깔아서 거의
   * 지워버린다. 스크림만 덮으면 라임·오렌지 같은 밝은 면이 뚫고 올라온다.
   */
  contentOpacity?: number;
  style?: ViewStyle;
};

/**
 * 화면 바깥 틀. 디자인의 390×844 프레임에 해당한다.
 * radius 40 은 목업의 기기 모서리 표현이므로 실제 화면에는 적용하지 않는다.
 */
export function ScreenFrame({
  children,
  dotted = false,
  overlay,
  contentOpacity,
  style,
}: Props) {
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
            opacity: contentOpacity,
          },
          style,
        ]}
      >
        {children}
      </View>
      {overlay}
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
