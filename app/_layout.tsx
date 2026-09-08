import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { prepareCues, releaseCues } from '@/services/cues';
import { useSettings } from '@/store/settings';
import { usePresets } from '@/store/presets';
import { useAppFonts } from '@/theme/useAppFonts';
import { color } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const fontsReady = useAppFonts();
  const settingsReady = useSettings((s) => s.hydrated);
  const presetsReady = usePresets((s) => s.hydrated);
  const ready = fontsReady && settingsReady && presetsReady;

  useEffect(() => {
    prepareCues();
    return releaseCues;
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // 폰트와 저장값이 준비되기 전에 그리면 레이아웃이 한 번 튄다.
  // 스플래시가 떠 있는 동안이라 사용자는 빈 화면을 보지 않는다.
  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.screen },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="setup/[mode]" />
        {/* 운동 중에 스와이프로 빠져나가면 기록이 사라진다 */}
        <Stack.Screen name="timer" options={{ gestureEnabled: false }} />
        <Stack.Screen name="complete" options={{ gestureEnabled: false }} />
        <Stack.Screen name="settings" />
      </Stack>
    </SafeAreaProvider>
  );
}
