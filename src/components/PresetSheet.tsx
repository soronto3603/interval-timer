import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MODE_IDS, MODE_LABEL } from '@/core/config/defaults';
import { describeConfig } from '@/core/config/describe';
import { useT } from '@/i18n/useT';
import { usePresets } from '@/store/presets';
import { type } from '@/theme/fonts';
import { color, layout, radius, space, touch } from '@/theme/tokens';

/**
 * Home 의 `전체 보기` — 모드별 마지막 설정 4행.
 *
 * 운동 이력 화면을 만들지 않기로 했으므로 (설계 스펙 §4) 이 바텀시트가
 * `전체 보기` 링크의 목적지다. 탭하면 그 설정으로 바로 시작한다.
 */
export function PresetSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const presets = usePresets((s) => s.presets);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.scrim}>
      {/* 바깥을 눌러 닫는다 */}
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, layout.safeBottom) },
        ]}
      >
        <Text style={[type.ko(15, 600), styles.heading]}>{t.presets}</Text>
        <View style={styles.rows}>
          {MODE_IDS.map((mode) => (
            <Pressable
              key={mode}
              onPress={() => {
                onClose();
                router.push(`/timer?mode=${mode}`);
              }}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={styles.rowLeft}>
                <Text style={type.mode(24, 0)}>{MODE_LABEL[mode]}</Text>
                <Text
                  style={[type.ko(13, 400), styles.meta]}
                  numberOfLines={1}
                >
                  {describeConfig(presets[mode], t)}
                </Text>
              </View>
              <Text style={type.glyph(22)}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: color.scrimDialog,
  },
  sheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.dialog,
    borderTopRightRadius: radius.dialog,
    borderTopWidth: 1,
    borderColor: '#262A26',
    paddingHorizontal: layout.screenX,
    paddingTop: space.xl,
  },
  heading: {
    marginBottom: 14,
  },
  rows: {
    gap: 10,
  },
  row: {
    height: touch.row,
    backgroundColor: color.screen,
    borderWidth: 1,
    borderColor: color.line,
    borderRadius: radius.row,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 9,
    flexShrink: 1,
  },
  meta: {
    color: color.muted,
  },
});
