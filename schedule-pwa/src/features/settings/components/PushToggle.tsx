import { useState } from 'react'
import { Toggle } from '@shared/ui'
import { usePush, pushSupported } from '@features/notifications'
import { useSettingsStore } from '../settings.store'

/** 푸시 토글 — 켜면 실제 구독, 끄면 해제 */
export function PushToggle() {
  const enabled = useSettingsStore((s) => s.settings.pushEnabled)
  const set = useSettingsStore((s) => s.set)
  const { subscribe, unsubscribe } = usePush()
  const [busy, setBusy] = useState(false)

  async function onChange(next: boolean) {
    setBusy(true)
    try {
      if (next) await subscribe()
      else await unsubscribe()
      set('pushEnabled', next)
    } catch (e) {
      alert(e instanceof Error ? e.message : '푸시 설정에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return <Toggle checked={enabled} onChange={onChange} disabled={busy || !pushSupported()} />
}
