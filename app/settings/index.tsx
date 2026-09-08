import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { OnOffLabel, SettingRow, Toggle } from '@/components/rows';
import { ScreenFrame } from '@/components/ScreenFrame';
import { useT } from '@/i18n/useT';
import { anyCueOn, useSettings } from '@/store/settings';
import { type } from '@/theme/fonts';
import { color, space } from '@/theme/tokens';

export default function SettingsScreen() {
  const t = useT();
  const { vibration, keepAwake, cues, setVibration, setKeepAwake } =
    useSettings();

  return (
    <ScreenFrame>
      <AppHeader onClose={() => router.dismissTo('/')} />

      <Text style={[type.mode(56), styles.heading]}>SETTINGS</Text>
      <Text style={[type.ko(20, 600), styles.sub]}>{t.settings}</Text>

      <View>
        <SettingRow
          label={t.language}
          value={t.languageValue}
          chevron
          onPress={() => router.push('/settings/language')}
        />
        <SettingRow
          label={t.sound}
          chevron
          onPress={() => router.push('/settings/sound')}
          right={
            <OnOffLabel
              on={anyCueOn(cues)}
              text={anyCueOn(cues) ? 'ON' : 'OFF'}
            />
          }
        />
        {/* 15번 화면의 진동 스위치와 같은 값이다 */}
        <SettingRow
          label={t.vibration}
          right={
            <Toggle
              on={vibration}
              onChange={setVibration}
              label={t.vibration}
            />
          }
        />
        <SettingRow
          label={t.keepAwake}
          last
          right={
            <Toggle
              on={keepAwake}
              onChange={setKeepAwake}
              label={t.keepAwake}
            />
          }
        />
      </View>

      <Text style={[type.meta(15, 0.22), styles.version]}>PULSE BOX 1.0</Text>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: 30,
    lineHeight: 56 * 0.95,
  },
  sub: {
    color: color.muted,
    marginTop: 6,
    marginBottom: space.xxl,
  },
  version: {
    marginTop: 'auto',
    textAlign: 'center',
    color: color.ghost,
  },
});
