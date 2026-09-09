import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { CTAButton } from '@/components/CTAButton';
import { Dialog } from '@/components/Dialog';
import { PauseButton } from '@/components/PauseButton';
import { RoundDots } from '@/components/RoundDots';
import { ScreenFrame } from '@/components/ScreenFrame';
import { TallyCard } from '@/components/TallyCard';
import { ModeBar, SportsLabel, TimerNumber } from '@/components/TimerDisplay';
import { MODE_IDS } from '@/core/config/defaults';
import { totalMsOf } from '@/core/config/totals';
import { CueName } from '@/core/timer/cues';
import { formatCountdown } from '@/core/timer/format';
import { present, TimerView } from '@/core/timer/present';
import { ModeConfig, ModeId, PREP_MS, TimerState } from '@/core/timer/types';
import { useIntervalTimer } from '@/hooks/useIntervalTimer';
import { useKeepAwake } from '@/hooks/useKeepAwake';
import { useT } from '@/i18n/useT';
import { playCue, tapFeedback } from '@/services/cues';
import { usePresets } from '@/store/presets';
import { useSettings } from '@/store/settings';
import { type } from '@/theme/fonts';
import { color, space } from '@/theme/tokens';
import { PausedOverlay } from '@/components/PausedOverlay';

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

  const [dialog, setDialog] = useState<DialogKind>(null);
  const [tally, setTally] = useState(0);

  // 완료 화면으로 넘긴 뒤에는 이 화면이 언마운트되므로 ref 로 잡아 둔다
  const tallyRef = useRef(0);
  tallyRef.current = tally;

  useEffect(() => {
    markUsed(mode);
  }, [mode, markUsed]);

  const onCue = useCallback(
    (cue: CueName) => {
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
      pause();
      return true;
    });
    return () => sub.remove();
  }, [dialog, paused, pause]);

  const endWorkout = () => {
    setDialog(null);
    router.replace('/');
  };

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
              onResume={resume}
              onReset={() => setDialog('reset')}
              onEnd={() => setDialog('end')}
            />
          )}

          {dialog === 'reset' && (
            <Dialog
              title="RESET TIMER?"
              body={t.resetBody}
              primaryLabel="RESET"
              primaryVariant="rest"
              onPrimary={() => {
                setDialog(null);
                setTally(0);
                reset();
              }}
              secondaryLabel="CANCEL"
              onSecondary={() => setDialog(null)}
            />
          )}

          {dialog === 'end' && (
            // 강조 버튼이 `계속하기` 다. 파괴적 동작은 2차 버튼 (디자인 09번)
            <Dialog
              title="END WORKOUT?"
              body={t.endBody}
              primaryLabel="KEEP GOING"
              onPrimary={() => setDialog(null)}
              secondaryLabel="END"
              onSecondary={endWorkout}
            />
          )}
        </>
      }
    >
      {view.layout === 'prep' ? (
        <>
          <AppHeader />
          <View style={styles.prepBody}>
            <TimerNumber text={view.timerText} accent="prep" size={210} />
            <ModeBar label={view.modeLabel} accent="prep" />
          </View>
          <Text style={[type.sports(22, 0.26), styles.prepFooter]}>
            {view.footerLabel}
          </Text>
        </>
      ) : (
        <>
          <AppHeader />
          <View style={styles.runningBody}>
            <SportsLabel text={view.sportsLabel} />
            <TimerNumber text={view.timerText} accent={view.accent} />

            <View style={styles.modeBarWrap}>
              <ModeBar label={view.modeLabel} accent={view.accent} />
            </View>

            <View style={styles.slot}>
              {view.slot === 'dots' && (
                <RoundDots
                  total={view.roundTotal}
                  current={view.roundCurrent}
                  accent={view.accent}
                />
              )}
              {view.slot === 'tally' && (
                <TallyCard
                  label={view.tallyKind === 'reps' ? 'REPS' : 'ROUNDS'}
                  count={tally}
                  onIncrement={() => {
                    setTally((n) => n + 1);
                    tapFeedback(settings.vibration);
                  }}
                  onDecrement={() => {
                    setTally((n) => Math.max(0, n - 1));
                    tapFeedback(settings.vibration);
                  }}
                />
              )}
              {view.slot === 'finish' && (
                // 채운 라임으로 두면 바로 위 모드바와 같은 덩어리로 보이고,
                // 표시일 뿐인 모드바가 버튼처럼 읽힌다. 디자인의 색 언어에서
                // 운동을 벗어나는 동작(RESET · CANCEL)은 외곽선이다.
                <CTAButton
                  label="FINISH"
                  onPress={finish}
                  variant="outline"
                  fontSize={34}
                />
              )}
            </View>
          </View>

          <View style={styles.pauseWrap}>
            <PauseButton
              onPause={pause}
              onTap={() => tapFeedback(settings.vibration)}
              hint={t.holdToPause}
            />
          </View>
        </>
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

const styles = StyleSheet.create({
  prepBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xl,
    alignSelf: 'stretch',
  },
  prepFooter: {
    textAlign: 'center',
    color: color.muted,
  },
  runningBody: {
    marginTop: space.xxxl,
  },
  modeBarWrap: {
    marginTop: 22,
  },
  slot: {
    marginTop: 44,
  },
  pauseWrap: {
    marginTop: 'auto',
  },
});
