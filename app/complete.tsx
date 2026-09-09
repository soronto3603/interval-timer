import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { CTAButton } from '@/components/CTAButton';
import { SummaryRow } from '@/components/rows';
import { ScreenFrame } from '@/components/ScreenFrame';
import { MODE_LABEL } from '@/core/config/defaults';
import { formatCountdown, formatCountup } from '@/core/timer/format';
import { useT } from '@/i18n/useT';
import { useAllowRotation, useOrientation } from '@/hooks/useOrientation';
import { usePresets, WorkoutSummary } from '@/store/presets';
import { type } from '@/theme/fonts';
import { color, space } from '@/theme/tokens';

export default function CompleteScreen() {
  const t = useT();
  const summary = usePresets((s) => s.lastCompleted);

  // 운동을 가로로 끝냈으면 결과도 가로로 나와야 한다
  useAllowRotation();
  const { landscape } = useOrientation();

  // 이 화면에서 뒤로 가면 타이머가 아니라 Home 이다 (설계 스펙 §5)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/');
      return true;
    });
    return () => sub.remove();
  }, []);

  // 기록이 없으면 보여줄 것이 없다 (앱을 껐다 켜고 이 경로로 들어온 경우)
  if (!summary) return <Redirect href="/" />;

  return (
    <ScreenFrame>
      <AppHeader />

      {landscape ? (
        // 좌측에 제목, 우측에 요약. 세로로 쌓으면 411dp 에 안 들어간다.
        <View style={styles.twoCol}>
          <View style={styles.colLeft}>
            <Text style={[type.mode(52), styles.headingLeft]}>COMPLETE</Text>
            <Text style={[type.ko(20, 700), styles.subtitleLeft]}>
              {t.todaysWorkout(MODE_LABEL[summary.mode])}
            </Text>
          </View>
          <ScrollView
            style={styles.colRight}
            showsVerticalScrollIndicator={false}
          >
            {rowsFor(summary, t, true).map((row) => row)}
          </ScrollView>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <Text style={[type.mode(66), styles.heading]}>COMPLETE</Text>
          <View style={styles.divider} />
          <Text style={[type.ko(24, 700), styles.subtitle]}>
            {t.todaysWorkout(MODE_LABEL[summary.mode])}
          </Text>

          <View>{rowsFor(summary, t).map((row) => row)}</View>
        </ScrollView>
      )}

      <CTAButton
        label="DONE"
        onPress={() => router.replace('/')}
        height={landscape ? 64 : undefined}
        fontSize={landscape ? 34 : 44}
        style={styles.cta}
      />
    </ScreenFrame>
  );
}

/** 모드마다 의미 있는 지표가 다르다. 디자인 05번은 타바타 기준이다. */
function rowsFor(
  summary: WorkoutSummary,
  t: ReturnType<typeof useT>,
  compact = false,
) {
  const { config } = summary;
  const total = (
    <SummaryRow
      key="total"
      label={t.totalTime}
      // 경과 시간이므로 내림이다. 올림으로 찍으면 30.05초가 00:31 이 된다
      value={formatCountup(summary.totalMs)}
      accent
      last
      compact={compact}
    />
  );

  switch (config.mode) {
    case 'tabata':
      return [
        <SummaryRow
          key="rounds"
          label={t.rounds}
          value={`${config.rounds} / ${config.rounds}`}
          compact={compact}
        />,
        <SummaryRow
          key="work"
          label={t.work}
          value={formatCountdown(config.workMs)}
          compact={compact}
        />,
        <SummaryRow
          key="rest"
          label={t.rest}
          value={formatCountdown(config.restMs)}
          compact={compact}
        />,
        total,
      ];

    case 'emom':
      return [
        <SummaryRow
          key="rounds"
          label={t.rounds}
          value={`${config.count} / ${config.count}`}
          compact={compact}
        />,
        <SummaryRow
          key="interval"
          label={t.interval}
          value={formatCountdown(config.intervalMs)}
          compact={compact}
        />,
        total,
      ];

    case 'amrap':
      return [
        <SummaryRow
          key="tally"
          label={config.countMethod === 'reps' ? t.reps : t.rounds}
          value={String(summary.tally ?? 0)}
          compact={compact}
        />,
        <SummaryRow
          key="time"
          label={t.time}
          value={formatCountdown(config.totalMs)}
          compact={compact}
        />,
        total,
      ];

    case 'fortime':
      return [
        <SummaryRow
          key="cap"
          label={t.timeLimit}
          value={
            config.capMs === null ? t.noLimit : formatCountdown(config.capMs)
          }
          compact={compact}
        />,
        total,
      ];
  }
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: space.lg,
  },
  heading: {
    marginTop: space.xxxl,
    textAlign: 'center',
    lineHeight: 66,
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2E2A',
    marginTop: 30,
    marginBottom: space.xl,
    marginHorizontal: space.xs,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
  },
  cta: {
    marginTop: 28,
  },
  twoCol: {
    flex: 1,
    flexDirection: 'row',
    gap: space.xxl,
    alignItems: 'center',
  },
  colLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  colRight: {
    flex: 1,
  },
  headingLeft: {
    lineHeight: 52,
  },
  subtitleLeft: {
    marginTop: space.md,
  },
});
