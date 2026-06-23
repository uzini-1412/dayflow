import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@shared/lib/routes'
import { useModuleEnabled, type ModuleKey } from '@features/settings'

/** 비활성 모듈 라우트는 홈으로 리다이렉트 */
export function ModuleRoute({ module }: { module: ModuleKey }) {
  const enabled = useModuleEnabled(module)
  if (!enabled) return <Navigate to={ROUTES.home} replace />
  return <Outlet />
}
