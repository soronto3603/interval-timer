import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { CTAButton } from '@/components/CTAButton';
import { ScreenFrame } from '@/components/ScreenFrame';
import { Stepper } from '@/components/Stepper';
import { MODE_IDS, MODE_LABEL } from '@/core/config/defaults';
import { STEPPERS, step } from '@/core/config/steppers';
import { totalMsOf } from '@/core/config/totals';
import { formatCountdown } from '@/core/timer/format';
import { ModeConfig, ModeId } from '@/core/timer/types';
import { useT } from '@/i18n/useT';
import { usePresets } from '@/store/presets';
import { type } from '@/theme/fonts';
import { color, space } from '@/theme/tokens';
import { ChoicePair, ForTimeCap } from './_fields';

export default function SetupScreen() {
  const params = useLocalSearchParams<{ mode: string }>();
  const t = useT();
  const presets = usePresets((s) => s.presets);
  const setPreset = usePresets((s) => s.setPreset);

  // 잘못된 경로로 들어온 경우 (설계 스펙 §9)
  if (!MODE_IDS.includes(params.mode as ModeId)) {
    return <Redirect href="/" />;
  }
  const mode = params.mode as ModeId;
  const config = presets[mode];

  const patch = (next: ModeConfig) => setPreset(next);

  return (
    <ScreenFrame>
      <AppHeader onMenu={() => router.push('/settings')} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Text style={[type.mode(64), styles.heading]}>{MODE_LABEL[mode]}</Text>
        <Text style={[type.ko(20, 600), styles.sub]}>
          {mode === 'tabata' ? t.tabataSetup : t.setupWorkout}
        </Text>

        <View style={styles.fields}>
          {config.mode === 'tabata' && (
            <>
              <Stepper
                label={t.work}
                display={formatCountdown(config.workMs)}
                value={config.workMs}
                spec={STEPPERS.tabata.workMs}
                onStep={(d) =>
                  patch({
                    ...config,
                    workMs: step(STEPPERS.tabata.workMs, config.workMs, d),
                  })
                }
              />
              <Stepper
                label={t.rest}
                display={formatCountdown(config.restMs)}
                value={config.restMs}
                spec={STEPPERS.tabata.restMs}
                onStep={(d) =>
                  patch({
                    ...config,
                    restMs: step(STEPPERS.tabata.restMs, config.restMs, d),
                  })
                }
              />
              <Stepper
                label={t.rounds}
                display={String(config.rounds)}
                value={config.rounds}
                spec={STEPPERS.tabata.rounds}
                onStep={(d) =>
                  patch({
                    ...config,
                    rounds: step(STEPPERS.tabata.rounds, config.rounds, d),
                  })
                }
              />
            </>
          )}

          {config.mode === 'amrap' && (
            <>
              <Stepper
                label={t.time}
                display={formatCountdown(config.totalMs)}
                value={config.totalMs}
                spec={STEPPERS.amrap.totalMs}
                onStep={(d) =>
                  patch({
                    ...config,
                    totalMs: step(STEPPERS.amrap.totalMs, config.totalMs, d),
                  })
                }
              />
              <ChoicePair
                label={t.countMethod}
                options={[
                  { value: 'rounds', label: 'ROUNDS' },
                  { value: 'reps', label: 'REPS' },
                ]}
                selected={config.countMethod}
                onSelect={(countMethod) => patch({ ...config, countMethod })}
              />
            </>
          )}

          {config.mode === 'emom' && (
            <>
              <Stepper
                label={t.minutes}
                display={String(config.count)}
                value={config.count}
                spec={STEPPERS.emom.count}
                onStep={(d) =>
                  patch({
                    ...config,
                    count: step(STEPPERS.emom.count, config.count, d),
                  })
                }
              />
              <Stepper
                label={t.interval}
                display={formatCountdown(config.intervalMs)}
                value={config.intervalMs}
                spec={STEPPERS.emom.intervalMs}
                onStep={(d) =>
                  patch({
                    ...config,
                    intervalMs: step(
                      STEPPERS.emom.intervalMs,
                      config.intervalMs,
                      d,
                    ),
                  })
                }
              />
              <View style={styles.totalRow}>
                <Text style={type.meta(20, 0.22)}>TOTAL</Text>
                <Text style={[type.mode(34, 0), { color: color.work }]}>
                  {formatCountdown(totalMsOf(config) ?? 0)}
                </Text>
              </View>
            </>
          )}

          {config.mode === 'fortime' && (
            <ForTimeCap config={config} onChange={patch} />
          )}
        </View>
      </ScrollView>

      <CTAButton
        label="START"
        onPress={() => router.push(`/timer?mode=${mode}`)}
        style={styles.cta}
      />
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: space.lg,
  },
  heading: {
    marginTop: 30,
    lineHeight: 64 * 0.95,
  },
  sub: {
    color: color.muted,
    marginTop: 6,
    marginBottom: space.xxl,
  },
  fields: {
    gap: space.xl,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xs,
  },
  cta: {
    marginTop: 28,
  },
});
