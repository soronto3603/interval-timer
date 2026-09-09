import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';


export type LanguagePref = 'system' | 'ko' | 'en';

export type SoundToggles = {
  countdown: boolean;
  workStart: boolean;
  restStart: boolean;
};

export type Settings = {
  language: LanguagePref;
  /** 디자인 13번과 15번에 중복 노출되는 같은 값이다 */
  vibration: boolean;
  keepAwake: boolean;
  /**
   * 디자인 15번의 토글 3개. 큐 종류보다 적다 —
   * 준비 진입 · 3·2·1 · 10초 경고는 모두 `countdown` 아래로 묶고,
   * 완료음은 토글이 없다 (services/cues.ts 의 soundAllowed).
   */
  cues: SoundToggles;
};

const DEFAULTS: Settings = {
  language: 'system',
  vibration: true,
  keepAwake: true,
  cues: { countdown: true, workStart: true, restStart: true },
};

type SettingsStore = Settings & {
  hydrated: boolean;
  setLanguage: (language: LanguagePref) => void;
  setVibration: (on: boolean) => void;
  setKeepAwake: (on: boolean) => void;
  setCue: (cue: keyof SoundToggles, on: boolean) => void;
};

const bool = (v: unknown, fallback: boolean) =>
  typeof v === 'boolean' ? v : fallback;

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      hydrated: false,
      setLanguage: (language) => set({ language }),
      setVibration: (vibration) => set({ vibration }),
      setKeepAwake: (keepAwake) => set({ keepAwake }),
      setCue: (cue, on) =>
        set((s) => ({ cues: { ...s.cues, [cue]: on } })),
    }),
    {
      name: 'pulse-box/settings',
      storage: createJSONStorage(() => AsyncStorage),
      // 읽기 실패나 스키마 변경으로 값이 망가져도 필드 단위로만 되돌린다
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Settings>;
        const cues = (p.cues ?? {}) as Partial<SoundToggles>;
        return {
          ...current,
          language:
            p.language === 'ko' || p.language === 'en' || p.language === 'system'
              ? p.language
              : DEFAULTS.language,
          vibration: bool(p.vibration, DEFAULTS.vibration),
          keepAwake: bool(p.keepAwake, DEFAULTS.keepAwake),
          cues: {
            countdown: bool(cues.countdown, DEFAULTS.cues.countdown),
            workStart: bool(cues.workStart, DEFAULTS.cues.workStart),
            restStart: bool(cues.restStart, DEFAULTS.cues.restStart),
          },
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[settings] 복원 실패, 기본값으로 시작합니다', error);
        }
        useSettings.setState({ hydrated: true });
      },
      partialize: ({ language, vibration, keepAwake, cues }) => ({
        language,
        vibration,
        keepAwake,
        cues,
      }),
    },
  ),
);

/** 디자인 13번의 `사운드 ON ›` — 큐 하나라도 켜져 있으면 ON 이다. */
export const anyCueOn = (cues: SoundToggles) =>
  cues.countdown || cues.workStart || cues.restStart;
