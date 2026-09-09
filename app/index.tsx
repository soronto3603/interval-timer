import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { ModeRow } from '@/components/rows';
import { ScreenFrame } from '@/components/ScreenFrame';
import { MODE_IDS, MODE_LABEL } from '@/core/config/defaults';
import { describeConfig } from '@/core/config/describe';
import { ModeId } from '@/core/timer/types';
import { useLockPortrait } from '@/hooks/useOrientation';
import { useT } from '@/i18n/useT';
import { usePresets } from '@/store/presets';
import { type } from '@/theme/fonts';
import { color, radius, space } from '@/theme/tokens';
import { PresetSheet } from '@/components/PresetSheet';

export default function HomeScreen() {
  const t = useT();

  // 타이머에서 가로로 돌아왔더라도 여기서는 세로로 되돌린다.
  // Setup · Settings 는 Home 을 거쳐야 갈 수 있어 자연히 세로가 된다.
  useLockPortrait();
  const [sheetOpen, setSheetOpen] = useState(false);

  const presets = usePresets((s) => s.presets);
  const lastUsedMode = usePresets((s) => s.lastUsedMode);

  const quickMode: ModeId = lastUsedMode ?? 'tabata';
  const recent = lastUsedMode ? presets[lastUsedMode] : null;

  return (
    <ScreenFrame
      overlay={
        sheetOpen ? <PresetSheet onClose={() => setSheetOpen(false)} /> : null
      }
    >
      <AppHeader onMenu={() => router.push('/settings')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={[type.ko(24, 700), styles.title]}>{t.selectWorkout}</Text>

        <Pressable
          onPress={() => router.push(`/timer?mode=${quickMode}`)}
          accessibilityRole="button"
          accessibilityLabel="Quick start"
          style={({ pressed }) => [styles.quick, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={[type.mode(40, 0.005), { color: color.onWork }]}>
            QUICK START
          </Text>
          <Text style={[type.glyph(30), { color: color.onWork }]}>›</Text>
        </Pressable>

        <View style={styles.modes}>
          {MODE_IDS.map((mode) => (
            <ModeRow
              key={mode}
              label={MODE_LABEL[mode]}
              onPress={() => router.push(`/setup/${mode}`)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.divider} />
        <View style={styles.footerHead}>
          <Text style={[type.ko(15, 600), { color: color.mutedStrong }]}>
            {t.recent}
          </Text>
          <Pressable
            onPress={() => setSheetOpen(true)}
            accessibilityRole="button"
            hitSlop={10}
            style={styles.viewAll}
          >
            <Text style={[type.ko(13, 400), { color: color.faint }]}>
              {t.viewAll}
            </Text>
            <Text style={type.glyph(16)}>›</Text>
          </Pressable>
        </View>

        {recent ? (
          <Pressable
            onPress={() => router.push(`/timer?mode=${lastUsedMode}`)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.recent,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.recentLeft}>
              <Text style={type.mode(21, 0)}>{MODE_LABEL[quickMode]}</Text>
              <Text
                style={[type.ko(13, 400), styles.recentMeta]}
                numberOfLines={1}
              >
                {describeConfig(recent, t)}
              </Text>
            </View>
            <Text style={type.glyph(22)}>›</Text>
          </Pressable>
        ) : (
          // 아직 한 번도 운동하지 않았다. 빈 카드를 그려 레이아웃을 유지한다
          <View style={[styles.recent, styles.recentEmpty]}>
            <Text style={[type.ko(13, 400), styles.recentMeta]}>
              {t.presets}
            </Text>
          </View>
        )}
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: space.lg,
  },
  title: {
    marginTop: space.xl,
    marginBottom: 18,
    letterSpacing: -0.24,
  },
  quick: {
    height: 96,
    backgroundColor: color.work,
    borderRadius: radius.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  modes: {
    gap: 12,
  },
  footer: {
    paddingTop: space.lg,
  },
  divider: {
    height: 1,
    backgroundColor: color.line,
    marginBottom: 16,
  },
  footerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recent: {
    height: 60,
    backgroundColor: '#131513',
    borderWidth: 1,
    borderColor: '#1E211E',
    borderRadius: radius.row,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  recentEmpty: {
    justifyContent: 'center',
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 9,
    flexShrink: 1,
  },
  recentMeta: {
    color: color.muted,
  },
});
