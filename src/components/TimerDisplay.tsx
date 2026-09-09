import { StyleSheet, Text, View } from 'react-native';

import { type } from '../theme/fonts';
import { color, radius, touch } from '../theme/tokens';

/** 세그먼트 상태별 강조색. 디자인의 STATE 토큰. */
export type Accent = 'work' | 'rest' | 'prep';

export const ACCENT: Record<
  Accent,
  { fill: string; on: string; glow: string; glowRadius: number; ring: string }
> = {
  work: {
    fill: color.work,
    on: color.onWork,
    glow: color.workGlow,
    glowRadius: 60,
    ring: color.workRing,
  },
  rest: {
    fill: color.rest,
    on: color.onRest,
    glow: color.restGlow,
    glowRadius: 60,
    ring: color.restRing,
  },
  prep: {
    fill: color.prep,
    on: color.onPrep,
    glow: color.prepGlow,
    glowRadius: 70,
    ring: color.prepRing,
  },
};

/** 상단 스포츠 라벨 — `ROUND 3 / 8` · `AMRAP · 12:00` · `COUNT UP` */
export function SportsLabel({
  text,
  align = 'center',
}: {
  text: string;
  /** 가로에서는 로고와 좌우로 나뉘어 앉는다 */
  align?: 'center' | 'left';
}) {
  return (
    <Text
      style={[type.sports(align === 'left' ? 22 : 26), { textAlign: align }]}
      numberOfLines={1}
    >
      {text}
    </Text>
  );
}

/**
 * 큰 타이머 숫자. 크기는 timerFontSize 가 방향과 화면 치수를 보고 정한다 —
 * 세로에서는 폭이, 가로에서는 높이가 제약이라 한 축만 봐서는 안 된다.
 */
export function TimerNumber({
  text,
  accent,
  fontSize,
}: {
  text: string;
  accent: Accent;
  /** timerFontSize 가 계산한 값. 방향과 화면 치수에 따라 달라진다 */
  fontSize: number;
}) {
  const { fill, glow, glowRadius } = ACCENT[accent];

  return (
    <Text
      style={[
        type.timer(fontSize),
        styles.centered,
        {
          color: fill,
          // 원색이 아니라 디자인의 알파값(0.22 / 0.28)을 쓴다.
          // 꽉 찬 색으로 흘리면 숫자 윤곽이 발광에 먹힌다.
          textShadowColor: glow,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: glowRadius,
        },
      ]}
      numberOfLines={1}
      allowFontScaling={false}
    >
      {text}
    </Text>
  );
}

/**
 * WORK · REST · READY 모드바.
 *
 * 세로에서는 전폭 92 로 화면의 주인공 중 하나지만, 가로에서는 411dp 높이를
 * 숫자에 내줘야 해서 가운데 낮은 띠(44)로 줄어든다.
 */
export function ModeBar({
  label,
  accent,
  compact = false,
}: {
  label: string;
  accent: Accent;
  compact?: boolean;
}) {
  const { fill, on } = ACCENT[accent];

  return (
    <View
      style={[
        styles.modeBar,
        { backgroundColor: fill },
        compact && styles.modeBarCompact,
      ]}
    >
      <Text
        style={[type.mode(compact ? 30 : 56, 0.03), { color: on }]}
        numberOfLines={1}
        allowFontScaling={false}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
  modeBar: {
    height: touch.modeBar,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBarCompact: {
    height: 44,
    paddingHorizontal: 28,
    alignSelf: 'center',
  },
});
