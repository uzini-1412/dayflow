import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SETTINGS, type Settings } from './settings.types'
import { FONT_OPTIONS } from './settings.options'
import { MODE_PRESETS, type AppMode, type ModuleKey } from './settings.modules'

interface SettingsStore {
  settings: Settings
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  replace: (settings: Partial<Settings>) => void
  applyMode: (mode: AppMode) => void
  setModule: (key: ModuleKey, on: boolean) => void
}

/** 테마(다크클래스)·폰트(CSS변수)를 <html>에 즉시 반영 */
export function applySettings(settings: Settings) {
  const root = document.documentElement

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = settings.theme === 'dark' || (settings.theme === 'system' && prefersDark)
  root.classList.toggle('dark', dark)

  const font = FONT_OPTIONS.find((f) => f.value === settings.font) ?? FONT_OPTIONS[0]
  root.style.setProperty('--app-font', font.stack)
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      set: (key, value) => {
        const next = { ...get().settings, [key]: value }
        set({ settings: next })
        applySettings(next)
      },
      replace: (partial) => {
        const next = { ...get().settings, ...partial }
        set({ settings: next })
        applySettings(next)
      },
      applyMode: (mode) => {
        if (mode === 'custom') return set({ settings: { ...get().settings, mode } })
        set({
          settings: { ...get().settings, mode, activeModules: { ...MODE_PRESETS[mode] } },
        })
      },
      setModule: (key, on) => {
        const s = get().settings
        set({
          settings: {
            ...s,
            mode: 'custom',
            activeModules: { ...s.activeModules, [key]: on },
          },
        })
      },
    }),
    {
      name: 'app-settings',
      onRehydrateStorage: () => (state) => {
        if (state) applySettings(state.settings)
      },
    },
  ),
)
