import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';

import { Dialog } from '@/components/Dialog';
import { PausedOverlay } from '@/components/PausedOverlay';
import { ScreenFrame } from '@/components/ScreenFrame';
import { PrepLayout, RunningLayout } from '@/components/TimerLayouts';
import { TimerSlot } from '@/components/TimerSlot';
import { MODE_IDS } from '@/core/config/defaults';
import { totalMsOf } from '@/core/config/totals';
import { Cue } from '@/core/timer/cues';
import { formatCountdown } from '@/core/timer/format';
import { present, TimerView } from '@/core/timer/present';
import { ModeConfig, ModeId, PREP_MS, TimerState } from '@/core/timer/types';
import { useIntervalTimer } from '@/hooks/useIntervalTimer';
import { useKeepAwake } from '@/hooks/useKeepAwake';
import { useAllowRotation, useOrientation } from '@/hooks/useOrientation';
import { useT } from '@/i18n/useT';
import { controlFeedback, playCue, tapFeedback } from '@/services/cues';
import { usePresets } from '@/store/presets';
import { useSettings } from '@/store/settings';

type DialogKind = 'reset' | 'end' | null;

export default function TimerScreen() {
  const params = useLocalSearchParams<{ mode: string }>();

  if (!MODE_IDS.includes(params.mode as ModeId)) {
    return <Redirect href="/" />;
  }
  return <Timer mode={params.mode as ModeId} />;
}

function Timer({ mode }: { mode: ModeId }) {
  const t = useT();
  const config = usePresets((s) => s.presets[mode]);
  const markUsed = usePresets((s) => s.markUsed);
  const recordComplete = usePresets((s) => s.recordComplete);

  const settings = useSettings();
  useKeepAwake(settings.keepAwake);

  // 폰을 눕혀 두고 멀리서 보는 화면이라 회전은 여기서만 열린다.
  // AndroidManifest 의 configChanges 에 orientation 이 있어 액티비티가 재생성되지
  // 않으므로, 회전해도 앵커가 살아 있고 타이머는 끊기지 않는다.
  useAllowRotation();
  const dims = useOrientation();

  const [dialog, setDialog] = useState<DialogKind>(null);
  const [tally, setTally] = useState(0);

  // 완료 화면으로 넘긴 뒤에는 이 화면이 언마운트되므로 ref 로 잡아 둔다
  const tallyRef = useRef(0);
  tallyRef.current = tally;

  useEffect(() => {
    markUsed(mode);
  }, [mode, markUsed]);

  const onCue = useCallback(
    (cue: Cue) => {
      playCue(cue, { sound: settings.cues, vibration: settings.vibration });
    },
    [settings.cues, settings.vibration],
  );

  const onComplete = useCallback(
    (state: TimerState) => {
      recordComplete({
        mode,
        config,
        finishedAt: Date.now(),
        roundsDone: state.segment.roundTotal,
        tally: config.mode === 'amrap' ? tallyRef.current : undefined,
        totalMs: recordedTotalMs(state, config),
      });
      router.replace(`/complete?mode=${mode}`);
    },
    [mode, config, recordComplete],
  );

  const { state, pause, resume, reset, finish } = useIntervalTimer({
    config,
    onCue,
    onComplete,
  });

  const view = present(state, config);
  const paused = state.phase === 'paused';

  // 일시정지 · 재개 · 확인 다이얼로그는 소리 없이 촉각만 준다.
  // 운동 중에 소음을 더하는 것보다 즉각적인 손끝 반응이 낫다.
  const control = useCallback(() => {
    controlFeedback(settings.vibration);
  }, [settings.vibration]);

  const pauseWithFeedback = useCallback(() => {
    control();
    pause();
  }, [control, pause]);

  // Android 백 버튼 (설계 스펙 §5)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (dialog) {
        setDialog(null);
        return true;
      }
      if (paused) {
        setDialog('end');
        return true;
      }
      pauseWithFeedback();
      return true;
    });
    return () => sub.remove();
  }, [dialog, paused, pauseWithFeedback]);

  const onTally = useCallback(
    (delta: 1 | -1) => {
      setTally((n) => Math.max(0, n + delta));
      tapFeedback(settings.vibration);
    },
    [settings.vibration],
  );

  return (
    <ScreenFrame
      dotted
      // 디자인 07 · 08 · 09번의 본문 opacity 0.28
      contentOpacity={paused || dialog ? 0.28 : undefined}
      overlay={
        <>
          {paused && !dialog && (
            <PausedOverlay
              summary={pausedSummary(view, state)}
              landscape={dims.landscape}
              onResume={() => {
                control();
                resume();
              }}
              onReset={() => {
                control();
                setDialog('reset');
              }}
              onEnd={() => {
                control();
                setDialog('end');
              }}
            />
          )}

          {dialog === 'reset' && (
            <Dialog
              title="RESET TIMER?"
              body={t.resetBody}
              landscape={dims.landscape}
              primaryLabel="RESET"
              primaryVariant="rest"
              onPrimary={() => {
                control();
                setDialog(null);
                setTally(0);
                reset();
              }}
              secondaryLabel="CANCEL"
              onSecondary={() => {
                control();
                setDialog(null);
              }}
            />
          )}

          {dialog === 'end' && (
            // 강조 버튼이 `계속하기` 다. 파괴적 동작은 2차 버튼 (디자인 09번)
            <Dialog
              title="END WORKOUT?"
              body={t.endBody}
              landscape={dims.landscape}
              primaryLabel="KEEP GOING"
              onPrimary={() => {
                control();
                setDialog(null);
              }}
              secondaryLabel="END"
              onSecondary={() => {
                control();
                setDialog(null);
                router.replace('/');
              }}
            />
          )}
        </>
      }
    >
      {view.layout === 'prep' ? (
        <PrepLayout view={view} dims={dims} />
      ) : (
        <RunningLayout
          view={view}
          dims={dims}
          hint={t.holdToPause}
          onPause={pauseWithFeedback}
          onTap={() => tapFeedback(settings.vibration)}
          slot={
            <TimerSlot
              view={view}
              accent={view.accent}
              tally={tally}
              onTally={onTally}
              onFinish={finish}
              landscape={dims.landscape}
            />
          }
        />
      )}
    </ScreenFrame>
  );
}

/**
 * 기록에 남길 총 시간. prep 은 운동이 아니므로 뺀다.
 *
 * 끝까지 돈 운동은 실제 경과가 아니라 **계획된** 길이를 쓴다. 틱이 100ms 간격이라
 * 완료 감지가 그만큼 늦고, 그 지연이 기록에 섞이면 8라운드 타바타가 04:00 이
 * 아니라 04:01 로 남는다. 중간에 FINISH 로 끝낸 운동만 실제 경과를 쓴다.
 */
function recordedTotalMs(state: TimerState, config: ModeConfig): number {
  if (state.phase === 'complete') {
    const planned = totalMsOf(config);
    if (planned !== null) return planned;
  }
  return Math.max(0, state.totalElapsedMs - PREP_MS);
}

/**
 * 일시정지 오버레이의 `ROUND 3 / 8 · 00:17` 줄.
 * 라운드가 없는 모드(AMRAP · For Time)는 모드명으로 대신한다.
 */
function pausedSummary(view: TimerView, state: TimerState): string {
  // 카운트업은 남은 시간이 없으므로 경과 시간을 보여준다
  const time = formatCountdown(state.remainingMs ?? state.elapsedInSegmentMs);
  const head = view.roundTotal > 0 ? view.sportsLabel : view.modeLabel;

  return `${head} · ${time}`;
}
