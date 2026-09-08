import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { SettingRow, Toggle } from '@/components/rows';
import { ScreenFrame } from '@/components/ScreenFrame';
import { useT } from '@/i18n/useT';
import { useSettings } from '@/store/settings';
import { type } from '@/theme/fonts';
import { color, space } from '@/theme/tokens';

const ROW_HEIGHT = 86;

export default function SoundScreen() {
  const t = useT();
  const { cues, vibration, setCue, setVibration } = useSettings();

  return (
    <ScreenFrame>
      <AppHeader onBack={() => router.back()} />

      <Text style={[type.mode(56), styles.heading]}>SOUND</Text>
      <Text style={[type.ko(20, 600), styles.sub]}>{t.soundHaptics}</Text>

      <View>
        <SettingRow
          label={t.countdownAlert}
          height={ROW_HEIGHT}
          right={
            <Toggle
              on={cues.countdown}
              onChange={(on) => setCue('countdown', on)}
              label={t.countdownAlert}
            />
          }
        />
        <SettingRow
          label={t.workStartAlert}
          height={ROW_HEIGHT}
          right={
            <Toggle
              on={cues.workStart}
              onChange={(on) => setCue('workStart', on)}
              label={t.workStartAlert}
            />
          }
        />
        {/* 휴식 신호는 휴식 색을 쓴다 (디자인 15번) */}
        <SettingRow
          label={t.restStartAlert}
          height={ROW_HEIGHT}
          right={
            <Toggle
              on={cues.restStart}
              onChange={(on) => setCue('restStart', on)}
              accent={color.rest}
              onAccent={color.onRest}
              label={t.restStartAlert}
            />
          }
        />
        {/* 13번 화면의 진동 스위치와 같은 값이다 */}
        <SettingRow
          label={t.vibration}
          height={ROW_HEIGHT}
          last
          right={
            <Toggle
              on={vibration}
              onChange={setVibration}
              label={t.vibration}
            />
          }
        />
      </View>
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
});
