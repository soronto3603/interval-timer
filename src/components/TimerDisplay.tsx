import { StyleSheet, Text, View } from 'react-native';

import { type } from '../theme/fonts';
import { scaleFont } from '../theme/scale';
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
export function SportsLabel({ text }: { text: string }) {
  return (
    <Text style={[type.sports(26), styles.centered]} numberOfLines={1}>
      {text}
    </Text>
  );
}

/**
 * 큰 타이머 숫자. 디자인은 Anton 150 이지만 그 값은 390px 폭 기준이라
 * 좁은 기기에서는 넘친다 (scaleFont).
 */
export function TimerNumber({
  text,
  accent,
  size = 150,
}: {
  text: string;
  accent: Accent;
  size?: number;
}) {
  const { fill, glow, glowRadius } = ACCENT[accent];
  const fontSize = scaleFont(size);

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

/** WORK · REST · READY 모드바 (height 92) */
export function ModeBar({
  label,
  accent,
}: {
  label: string;
  accent: Accent;
}) {
  const { fill, on } = ACCENT[accent];

  return (
    <View style={[styles.modeBar, { backgroundColor: fill }]}>
      <Text
        style={[type.mode(scaleFont(56), 0.03), { color: on }]}
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
});
