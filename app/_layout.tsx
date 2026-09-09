import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { lockPortrait } from '@/hooks/useOrientation';
import { prepareCues, releaseCues } from '@/services/cues';
import { useSettings } from '@/store/settings';
import { usePresets } from '@/store/presets';
import { useAppFonts } from '@/theme/useAppFonts';
import { color } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

// expo-router 의 링킹(useLinking.native.js)이 초기 URL 을 Promise 로 풀면서
// 아직 마운트되지 않은 자기 트리에 setState 하는 경합이다. 컴포넌트 스택이
// ContextNavigator → ExpoRoot 로 라이브러리 내부이고 우리가 손댈 지점이 없다.
// DEV 전용 경고라 릴리스에는 없지만, 개발 중 LogBox 가 화면을 덮어 조작을 막는다.
// 이 한 줄만 좁게 막는다 — 다른 경고는 그대로 보이게 둔다.
LogBox.ignoreLogs([
  /Can't perform a React state update on a component that hasn't mounted yet/,
]);

export default function RootLayout() {
  const fontsReady = useAppFonts();
  const settingsReady = useSettings((s) => s.hydrated);
  const presetsReady = usePresets((s) => s.hydrated);
  const ready = fontsReady && settingsReady && presetsReady;

  useEffect(() => {
    // 앱 기본은 세로. 타이머 계열만 useAllowRotation 으로 열어 준다.
    lockPortrait();
    prepareCues();
    return releaseCues;
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // 준비될 때까지 null 을 반환하면 안 된다. expo-router 의 딥링크 URL 해석이
  // Promise 로 끝나면서 아직 마운트되지 않은 트리에 setState 를 하고,
  // "state update on a component that hasn't mounted yet" 로 터진다.
  // 그래서 화면은 계속 마운트해 두고 스플래시로 덮어만 둔다.
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
