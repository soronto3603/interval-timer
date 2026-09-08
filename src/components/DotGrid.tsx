import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { color } from '../theme/tokens';

const CELL = 22;

/**
 * 타이머 화면의 점 격자 배경.
 *
 * 디자인은 `background-image: radial-gradient(#191C19 1px, transparent 1px)` +
 * `background-size: 22px 22px` 로 그렸지만 RN 에는 background-image 가 없다.
 * SVG 패턴 하나로 같은 격자를 만든다 — 타일 이미지를 쓰면 해상도별 에셋이 필요하다.
 */
export function DotGrid() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern
          id="dots"
          width={CELL}
          height={CELL}
          patternUnits="userSpaceOnUse"
        >
          <Circle cx={1} cy={1} r={1} fill={color.dotGrid} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dots)" />
    </Svg>
  );
}
