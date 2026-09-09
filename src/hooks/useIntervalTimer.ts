import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  pause as pauseAnchor,
  reanchorIfRewound,
  resume as resumeAnchor,
  start as startAnchor,
} from '../core/timer/anchor';
import { compile } from '../core/timer/compile';
import { Cue, cuesFor } from '../core/timer/cues';
import { derive } from '../core/timer/derive';
import { Anchor, ModeConfig, TimerState } from '../core/timer/types';

/**
 * 100ms. 화면 표시는 1초 단위지만 큐가 경계에서 늦지 않으려면 이 정도가 필요하다.
 */
const TICK_MS = 100;

type Options = {
  config: ModeConfig;
  onCue: (cue: Cue) => void;
  onComplete: (state: TimerState) => void;
};

/**
 * 엔진과 RN 을 잇는 유일한 지점.
 *
 * 엔진이 상태를 저장하지 않으므로 이 훅이 들고 있는 것은 앵커 3개 값뿐이다.
 * 화면에 보이는 모든 숫자는 매 틱 파생된다.
 */
export function useIntervalTimer({ config, onCue, onComplete }: Options) {
  const segments = useMemo(() => compile(config), [config]);

  // 앵커와 첫 파생값이 같은 시각을 보게 한다
  const [anchor, setAnchor] = useState<Anchor>(() => startAnchor(Date.now()));
  const [state, setState] = useState<TimerState>(() =>
    derive(segments, anchor, anchor.startedAt),
  );

  const anchorRef = useRef(anchor);
  anchorRef.current = anchor;

  const prevStateRef = useRef<TimerState | null>(null);
  const lastTickRef = useRef(Date.now());
  const completedRef = useRef(false);

  // 콜백을 ref 로 잡아 둔다. 인터벌을 매 렌더마다 다시 만들면 틱이 흔들린다
  const onCueRef = useRef(onCue);
  onCueRef.current = onCue;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const tick = useCallback(() => {
    const now = Date.now();

    // 시계가 뒤로 뛰었으면 시작점을 옮겨 타이머가 되감기지 않게 한다
    const repaired = reanchorIfRewound(
      anchorRef.current,
      lastTickRef.current,
      now,
    );
    if (repaired !== anchorRef.current) {
      anchorRef.current = repaired;
      setAnchor(repaired);
    }

    const next = derive(segments, anchorRef.current, now);
    const gap = now - lastTickRef.current;
    lastTickRef.current = now;

    for (const cue of cuesFor(prevStateRef.current, next, gap)) {
      onCueRef.current(cue);
    }
    prevStateRef.current = next;
    setState(next);

    // 완료는 한 번만 알린다. derive 는 완료 상태에 계속 머문다
    if (next.phase === 'complete' && !completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current(next);
    }
  }, [segments]);

  useEffect(() => {
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, [tick]);

  // 백그라운드에서 인터벌은 멈추거나 느려진다. 돌아오는 즉시 다시 파생해
  // 다음 틱(최대 100ms)을 기다리지 않게 한다.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') tick();
    });
    return () => sub.remove();
  }, [tick]);

  const pause = useCallback(() => {
    setAnchor((a) => {
      const next = pauseAnchor(a, Date.now());
      anchorRef.current = next;
      return next;
    });
  }, []);

  const resume = useCallback(() => {
    setAnchor((a) => {
      const next = resumeAnchor(a, Date.now());
      anchorRef.current = next;
      return next;
    });
    // 재개 직후의 틱을 백그라운드 복귀로 오해하지 않게 기준점을 당긴다
    lastTickRef.current = Date.now();
  }, []);

  const reset = useCallback(() => {
    const next = startAnchor(Date.now());
    anchorRef.current = next;
    setAnchor(next);
    prevStateRef.current = null;
    lastTickRef.current = Date.now();
    completedRef.current = false;
    setState(derive(segments, next, Date.now()));
  }, [segments]);

  /** cap 없는 For Time 처럼 스스로 끝나지 않는 운동을 사용자가 끝낼 때 */
  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current(derive(segments, anchorRef.current, Date.now()));
  }, [segments]);

  return { state, segments, pause, resume, reset, finish };
}
