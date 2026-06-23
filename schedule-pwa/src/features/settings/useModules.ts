import { useSettingsStore } from './settings.store'
import type { ActiveModules, ModuleKey } from './settings.modules'

export function useModuleEnabled(key: ModuleKey): boolean {
  return useSettingsStore((s) => s.settings.activeModules[key])
}

export function useActiveModules(): ActiveModules {
  return useSettingsStore((s) => s.settings.activeModules)
}
