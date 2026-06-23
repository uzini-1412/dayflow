import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@features/auth'
import { ROUTES } from '@shared/lib/routes'

/** 미인증 시 로그인으로 리다이렉트 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />
  return <Outlet />
}
