import { Toggle, SegmentedControl } from '@shared/ui'
import { useSettingsStore } from '../settings.store'
import { THEME_OPTIONS, FONT_OPTIONS } from '../settings.options'
import { SettingRow, SettingSection } from '../components/SettingRow'
// [비활성화] Web Push — 배포 환경(PocketHost)에서 발송 워커를 돌릴 수 없어 숨김. README "비활성화된 기능" 참고
// import { PushToggle } from '../components/PushToggle'
import { AccountSection } from '../components/AccountSection'
import { ModulesSection } from '../components/ModulesSection'

export function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings)
  const set = useSettingsStore((s) => s.set)

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">설정</h1>

      <SettingSection title="화면">
        <SettingRow
          label="테마"
          description="라이트 / 다크 / 시스템 설정 따르기"
          control={
            <SegmentedControl
              value={settings.theme}
              options={THEME_OPTIONS}
              onChange={(v) => set('theme', v)}
            />
          }
        />
        <SettingRow
          label="폰트"
          control={
            <SegmentedControl
              value={settings.font}
              options={FONT_OPTIONS.map((f) => ({ value: f.value, label: f.label }))}
              onChange={(v) => set('font', v)}
            />
          }
        />
      </SettingSection>

      <SettingSection title="달력">
        <SettingRow
          label="주 시작 요일"
          control={
            <SegmentedControl
              value={settings.weekStart}
              options={[
                { value: 'sun', label: '일' },
                { value: 'mon', label: '월' },
              ]}
              onChange={(v) => set('weekStart', v)}
            />
          }
        />
        <SettingRow
          label="기본 화면"
          control={
            <SegmentedControl
              value={settings.defaultView}
              options={[
                { value: 'calendar', label: '달력' },
                { value: 'list', label: '리스트' },
              ]}
              onChange={(v) => set('defaultView', v)}
            />
          }
        />
      </SettingSection>

      <SettingSection title="알림">
        <SettingRow
          label="앱 내 알람"
          description="일정 시간이 되면 앱에서 알림"
          control={
            <Toggle checked={settings.alarmEnabled} onChange={(v) => set('alarmEnabled', v)} />
          }
        />
        {/* [비활성화] Web Push — 발송 워커(scripts/push-worker.mjs) 미배포로 숨김. 재활성화 시 주석 해제
        <SettingRow
          label="푸시 알림"
          description="앱을 닫아도 기기로 푸시 (브라우저 권한 필요)"
          control={<PushToggle />}
        />
        */}
      </SettingSection>

      <ModulesSection />

      <AccountSection />
    </div>
  )
}
