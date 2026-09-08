import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { ScreenFrame } from '@/components/ScreenFrame';
import { useT } from '@/i18n/useT';
import { LanguagePref, useSettings } from '@/store/settings';
import { type } from '@/theme/fonts';
import { color, radius, space } from '@/theme/tokens';

/**
 * 디자인 14번. `system` 은 목록에 노출하지 않는다 — 디자인이 2택으로 그렸고,
 * 어느 쪽이든 고르면 그때부터 명시적 선택이 된다.
 */
const OPTIONS: { value: Exclude<LanguagePref, 'system'>; label: string }[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
];

export default function LanguageScreen() {
  const t = useT();
  const language = useSettings((s) => s.language);
  const setLanguage = useSettings((s) => s.setLanguage);

  // system 일 때도 현재 적용된 언어에 체크가 있어야 한다
  const active = language === 'system' ? currentFrom(t.languageValue) : language;

  return (
    <ScreenFrame>
      <AppHeader onBack={() => router.back()} />

      <Text style={[type.mode(56), styles.heading]}>LANGUAGE</Text>
      <Text style={[type.ko(20, 600), styles.sub]}>{t.language}</Text>

      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const selected = option.value === active;
          return (
            <Pressable
              key={option.value}
              onPress={() => setLanguage(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.option,
                selected ? styles.optionActive : styles.optionIdle,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text
                style={[
                  type.ko(20, 700),
                  { color: selected ? color.ink : color.mutedStrong },
                ]}
              >
                {option.label}
              </Text>
              {selected ? (
                <View style={styles.check}>
                  <Text style={styles.checkGlyph}>✓</Text>
                </View>
              ) : (
                <View style={styles.checkEmpty} />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScreenFrame>
  );
}

const currentFrom = (languageValue: string) =>
  languageValue === '한국어' ? 'ko' : 'en';

const styles = StyleSheet.create({
  heading: {
    marginTop: 30,
    lineHeight: 56 * 0.95,
  },
  sub: {
    color: color.muted,
    marginTop: 6,
    marginBottom: space.xxl,
  },
  options: {
    gap: 12,
  },
  option: {
    height: 84,
    borderRadius: radius.control,
    backgroundColor: color.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  optionActive: {
    borderWidth: 1.5,
    borderColor: color.work,
  },
  optionIdle: {
    borderWidth: 1,
    borderColor: color.line,
  },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: color.work,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkGlyph: {
    fontSize: 17,
    fontWeight: '700',
    color: color.onWork,
  },
  checkEmpty: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: color.lineStrong,
  },
});
