import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type } from '../theme/fonts';
import { color, radius, touch } from '../theme/tokens';

/** 디자인 13 · 15번의 구분선 있는 설정 행 (height 78 / 86) */
export function SettingRow({
  label,
  value,
  chevron = false,
  onPress,
  last = false,
  height = 78,
  right,
}: {
  label: string;
  value?: string;
  chevron?: boolean;
  onPress?: () => void;
  /** 마지막 행에는 아래 구분선도 그린다 */
  last?: boolean;
  height?: number;
  right?: ReactNode;
}) {
  const body = (
    <View
      style={[
        styles.settingRow,
        { height },
        last && styles.settingRowLast,
      ]}
    >
      <Text style={[type.ko(18, 600), styles.flexShrink]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {right}
        {value !== undefined && (
          <Text style={[type.ko(17, 400), styles.value]} numberOfLines={1}>
            {value}
          </Text>
        )}
        {chevron && <Text style={type.glyph(22)}>›</Text>}
      </View>
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      {body}
    </Pressable>
  );
}

/** ON / OFF 텍스트 표시 (디자인 13번) */
export function OnOffLabel({ on, text }: { on: boolean; text: string }) {
  return (
    <Text
      style={[
        type.meta(20, 0.16),
        { color: on ? color.work : color.faint },
      ]}
    >
      {text}
    </Text>
  );
}

/** 디자인 15번의 스위치 (60×34) */
export function Toggle({
  on,
  onChange,
  accent = color.work,
  onAccent = color.onWork,
  label,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  accent?: string;
  onAccent?: string;
  label?: string;
}) {
  return (
    <Pressable
      onPress={() => onChange(!on)}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      hitSlop={10}
      style={[
        styles.track,
        on
          ? { backgroundColor: accent, justifyContent: 'flex-end' }
          : {
              backgroundColor: color.placeholder,
              borderWidth: 1,
              borderColor: color.lineStrong,
              justifyContent: 'flex-start',
            },
      ]}
    >
      <View
        style={[
          styles.knob,
          { backgroundColor: on ? onAccent : color.ghost },
        ]}
      />
    </Pressable>
  );
}

/** 디자인 01번의 모드 선택 행 (height 72) */
export function ModeRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.modeRow, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={type.mode(30)}>{label}</Text>
      <Text style={type.glyph(26)}>›</Text>
    </Pressable>
  );
}

/** 디자인 05번의 요약 행 */
export function SummaryRow({
  label,
  value,
  accent = false,
  last = false,
  compact = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  last?: boolean;
  /** 가로에서는 4행이 스크롤 없이 들어가야 한다 */
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.summaryRow,
        compact && styles.summaryRowCompact,
        last && styles.settingRowLast,
      ]}
    >
      <Text style={[type.ko(18, 600), { color: color.mutedStrong }]}>
        {label}
      </Text>
      <Text style={type.mode(32, 0)}>
        <Text style={accent ? { color: color.work } : undefined}>{value}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: color.line,
    paddingHorizontal: 4,
  },
  settingRowLast: {
    borderBottomWidth: 1,
    borderBottomColor: color.line,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  flexShrink: {
    flexShrink: 1,
  },
  value: {
    color: color.mutedStrong,
  },
  track: {
    width: 60,
    height: 34,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  knob: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  modeRow: {
    height: touch.row,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.row,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  summaryRowCompact: {
    paddingVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 22,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: color.line,
  },
});
