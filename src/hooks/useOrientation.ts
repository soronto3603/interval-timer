import { useFocusEffect } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';

export type Orientation = {
  width: number;
  height: number;
  landscape: boolean;
};

/**
 * 현재 화면 방향과 치수.
 *
 * `Dimensions.get()` 이 아니라 `useWindowDimensions()` 를 쓴다 — 전자는 회전에
 * 반응하지 않아서, 눕혔을 때 세로 기준 값이 그대로 남는다.
 */
export function useOrientation(): Orientation {
  const { width, height } = useWindowDimensions();
  return { width, height, landscape: width > height };
}

/**
 * 방향 정책은 **도착하는 화면이 선언한다.** 떠나는 화면이 되돌리는 방식이면
 * 가로로 운동을 끝냈을 때 타이머가 세로로 튕겼다가 완료 화면에서 다시 가로로
 * 돌아오는 깜빡임이 생긴다.
 *
 * - 타이머 · 완료: 회전 허용 (폰을 눕혀 두고 멀리서 본다)
 * - Home: 세로 고정. 다른 화면은 Home 을 거쳐야 갈 수 있어 자연히 세로다
 */
function useOrientationPolicy(lock: ScreenOrientation.OrientationLock | null) {
  useFocusEffect(
    useCallback(() => {
      if (lock === null) {
        ScreenOrientation.unlockAsync().catch(() => {});
      } else {
        ScreenOrientation.lockAsync(lock).catch(() => {});
      }
    }, [lock]),
  );
}

/** 타이머 · 완료 화면에서 쓴다. */
export function useAllowRotation() {
  useOrientationPolicy(null);
}

/** Home 에서 쓴다. 앱의 기본 방향으로 되돌린다. */
export function useLockPortrait() {
  useOrientationPolicy(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}

/** 앱 시작 시 기본값. 루트 레이아웃에서 한 번 호출한다. */
export function lockPortrait() {
  ScreenOrientation.lockAsync(
    ScreenOrientation.OrientationLock.PORTRAIT_UP,
  ).catch(() => {});
}
