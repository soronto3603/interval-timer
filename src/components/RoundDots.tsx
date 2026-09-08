import { StyleSheet, View } from 'react-native';

import { color, MAX_DOTS, radius } from '../theme/tokens';
import { Accent, ACCENT } from './TimerDisplay';

type Props = {
  total: number;
  /** 0-based 현재 라운드 */
  current: number;
  accent: Accent;
};

/**
 * 라운드 진행 표시.
 *
 * 디자인은 18px 도트 8개를 그렸지만 타바타 라운드는 최대 99까지 갈 수 있어
 * 한 줄에 들어가지 않는다. 13개 이상이면 진행 바로 바꾼다 — 상단에 이미
 * `ROUND n / N` 이 있으므로 정보가 사라지지는 않는다.
 */
export function RoundDots({ total, current, accent }: Props) {
  if (total <= 0) return null;

  const fill = ACCENT[accent].fill;

  if (total > MAX_DOTS) {
    const ratio = Math.min(1, (current + 1) / total);
    return (
      <View style={styles.track} testID="round-progress">
        <View
          style={[
            styles.fill,
            { width: `${ratio * 100}%`, backgroundColor: fill },
          ]}
        />
      </View>
    );
  }

  return (
    <View style={styles.dots} testID="round-dots">
      {Array.from({ length: total }, (_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: done || active ? fill : color.dotIdle,
                // 현재 라운드에만 발광 링. 진행한 라운드와 구분된다
                ...(active
                  ? {
                      shadowColor: fill,
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4,
                    }
                  : null),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: color.dotIdle,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
