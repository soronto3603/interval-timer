import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const TAG = 'pulse-box-timer';

/**
 * 운동 중 화면 꺼짐 방지. 설정에서 끌 수 있다 (디자인 13번의 `화면 유지`).
 *
 * 실패해도 무시한다 — 화면이 꺼지면 복귀 보정이 받아주므로 치명적이지 않다.
 */
export function useKeepAwake(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    activateKeepAwakeAsync(TAG).catch(() => {});
    return () => {
      try {
        deactivateKeepAwake(TAG);
      } catch {
        // 이미 해제됨
      }
    };
  }, [enabled]);
}
