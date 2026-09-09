import { useCallback } from 'react';

import { controlFeedback, tapFeedback } from '../services/cues';
import { useSettings } from '../store/settings';

/**
 * 화면 조작용 가벼운 탭. 소리는 내지 않는다.
 *
 * 컴포넌트가 스토어를 직접 읽는다 — 모드 선택 · 스테퍼 · 토글마다 콜백을
 * 위에서 내려주면 화면 코드가 피드백 배선으로 뒤덮인다.
 */
export function useTapHaptic(): () => void {
  const vibration = useSettings((s) => s.vibration);
  return useCallback(() => tapFeedback(vibration), [vibration]);
}

/** 일시정지 · 재개 · 확인 다이얼로그처럼 한 단계 무거운 조작 */
export function useControlHaptic(): () => void {
  const vibration = useSettings((s) => s.vibration);
  return useCallback(() => controlFeedback(vibration), [vibration]);
}
