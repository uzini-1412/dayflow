import { useEffect, type ReactNode } from 'react'
import { AuthProvider } from '@features/auth'
import { applySettings, useSettingsStore } from '@features/settings'

/** 시스템 테마 변경을 실시간 반영 */
function ThemeWatcher({ children }: { children: ReactNode }) {
  const theme = useSettingsStore((s) => s.settings.theme)
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applySettings(useSettingsStore.getState().settings)
    onChange()
    if (theme === 'system') mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [theme])
  return children
}

/** 전역 Provider 합성 지점 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeWatcher>{children}</ThemeWatcher>
    </AuthProvider>
  )
}
