import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_CONFIG, MODE_IDS } from '../core/config/defaults';
import { sanitizeConfig } from '../core/config/sanitize';
import { ModeConfig, ModeId } from '../core/timer/types';

/** Complete 화면과 Home 의 `최근 운동` 행이 함께 쓰는 요약. */
export type WorkoutSummary = {
  mode: ModeId;
  config: ModeConfig;
  finishedAt: number;
  /** 완료한 라운드 수. 라운드 개념이 없는 모드는 0 */
  roundsDone: number;
  /** AMRAP 의 탭 집계 */
  tally?: number;
  /** 실제 경과 시간 (prep 제외) */
  totalMs: number;
};

type PresetsStore = {
  presets: Record<ModeId, ModeConfig>;
  lastUsedMode: ModeId | null;
  lastCompleted: WorkoutSummary | null;
  hydrated: boolean;

  /** Setup 화면에서 값을 조정할 때마다 저장한다 — 다음에 그 값으로 열린다 */
  setPreset: (config: ModeConfig) => void;
  markUsed: (mode: ModeId) => void;
  recordComplete: (summary: WorkoutSummary) => void;
};

const DEFAULT_PRESETS = (): Record<ModeId, ModeConfig> => ({
  tabata: DEFAULT_CONFIG.tabata,
  amrap: DEFAULT_CONFIG.amrap,
  emom: DEFAULT_CONFIG.emom,
  fortime: DEFAULT_CONFIG.fortime,
});

export const usePresets = create<PresetsStore>()(
  persist(
    (set) => ({
      presets: DEFAULT_PRESETS(),
      lastUsedMode: null,
      lastCompleted: null,
      hydrated: false,

      setPreset: (config) =>
        set((s) => ({ presets: { ...s.presets, [config.mode]: config } })),
      markUsed: (mode) => set({ lastUsedMode: mode }),
      recordComplete: (summary) =>
        set({ lastCompleted: summary, lastUsedMode: summary.mode }),
    }),
    {
      name: 'pulse-box/presets',
      storage: createJSONStorage(() => AsyncStorage),
      // 저장된 설정을 그대로 믿지 않는다. 한 모드가 망가져도 나머지는 살린다.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as {
          presets?: Record<string, unknown>;
          lastUsedMode?: unknown;
          lastCompleted?: unknown;
        };
        const presets = DEFAULT_PRESETS();
        for (const mode of MODE_IDS) {
          presets[mode] = sanitizeConfig(mode, p.presets?.[mode]);
        }
        return {
          ...current,
          presets,
          lastUsedMode: MODE_IDS.includes(p.lastUsedMode as ModeId)
            ? (p.lastUsedMode as ModeId)
            : null,
          lastCompleted: isSummary(p.lastCompleted) ? p.lastCompleted : null,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[presets] 복원 실패, 기본값으로 시작합니다', error);
        }
        usePresets.setState({ hydrated: true });
      },
      partialize: ({ presets, lastUsedMode, lastCompleted }) => ({
        presets,
        lastUsedMode,
        lastCompleted,
      }),
    },
  ),
);

function isSummary(v: unknown): v is WorkoutSummary {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    MODE_IDS.includes(s.mode as ModeId) &&
    typeof s.finishedAt === 'number' &&
    Number.isFinite(s.finishedAt) &&
    typeof s.totalMs === 'number' &&
    Number.isFinite(s.totalMs)
  );
}

/**
 * QUICK START 가 쓸 설정. 이력이 없으면 타바타 기본값이다 (설계 스펙 §4).
 */
export const quickStartConfig = (s: PresetsStore): ModeConfig =>
  s.lastUsedMode ? s.presets[s.lastUsedMode] : s.presets.tabata;
