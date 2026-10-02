import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { openAuthModal, type AuthModalMode } from '@features/auth'
import { ROUTES } from '@shared/lib/routes'

/** 예전 /login·/register 링크 호환: 홈으로 보내고 해당 모달을 연다 */
export function AuthRedirect({ mode }: { mode: AuthModalMode }) {
  useEffect(() => {
    openAuthModal(mode)
  }, [mode])
  return <Navigate to={ROUTES.home} replace />
}
