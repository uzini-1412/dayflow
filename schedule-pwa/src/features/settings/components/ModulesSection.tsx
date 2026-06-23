import { Toggle, SegmentedControl } from '@shared/ui'
import { useSettingsStore } from '../settings.store'
import { MODULES, MODE_OPTIONS } from '../settings.modules'
import { SettingRow, SettingSection } from './SettingRow'

/** 앱 모드 + 개별 기능 모듈 on/off */
export function ModulesSection() {
  const mode = useSettingsStore((s) => s.settings.mode)
  const activeModules = useSettingsStore((s) => s.settings.activeModules)
  const applyMode = useSettingsStore((s) => s.applyMode)
  const setModule = useSettingsStore((s) => s.setModule)

  return (
    <SettingSection title="기능 모듈">
      <SettingRow
        label="앱 모드"
        description="사용 유형에 맞춰 기능을 한 번에 켜기"
        control={<SegmentedControl value={mode} options={MODE_OPTIONS} onChange={applyMode} />}
      />
      {MODULES.map((m) => (
        <SettingRow
          key={m.key}
          label={`${m.icon} ${m.label}`}
          description={m.description}
          control={
            <Toggle checked={activeModules[m.key]} onChange={(on) => setModule(m.key, on)} />
          }
        />
      ))}
    </SettingSection>
  )
}
