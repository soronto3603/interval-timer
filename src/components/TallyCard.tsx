import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type } from '../theme/fonts';
import { color, radius } from '../theme/tokens';

type Props = {
  label: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

/**
 * AMRAP 의 라운드/렙 집계.
 *
 * 디자인에 AMRAP 실행 화면이 없어서 새로 만든 부품이다. 03/04번의 라운드 도트
 * 자리를 대신하고, 스테퍼(height 80 · radius 14 · surface)의 시각 언어를 재사용해
 * 낯선 요소가 되지 않게 했다.
 *
 * 카드 전체가 탭 타겟이다 — 운동 중에 작은 + 버튼을 조준할 수는 없다.
 * 잘못 눌렀을 때는 길게 눌러 되돌린다.
 */
export function TallyCard({ label, count, onIncrement, onDecrement }: Props) {
  return (
    <Pressable
      onPress={onIncrement}
      onLongPress={onDecrement}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${count}`}
      accessibilityHint="tap to add, hold to subtract"
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View style={styles.labels}>
        <Text style={type.meta(20, 0.22)}>{label}</Text>
        <Text style={[type.meta(13, 0.16), styles.hint]}>TAP TO ADD</Text>
      </View>
      <Text style={type.mode(46)} allowFontScaling={false}>
        {count}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 96,
    borderRadius: radius.control,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  labels: {
    gap: 4,
  },
  hint: {
    color: color.ghost,
  },
});
