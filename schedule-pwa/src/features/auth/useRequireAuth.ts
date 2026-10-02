import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { openAuthModal } from './authModal.store'

const DEFAULT_REASON = '저장하려면 로그인이 필요해요.'

/**
 * 로그인 필요 동작 가드.
 * `requireAuth(fn)` 은 로그인 상태면 fn 을 실행하고, 아니면 로그인 모달을 띄운다.
 * 둘러보기(조회)는 자유, 추가·수정 등 쓰기 진입점에서만 감싼다.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth()

  return useCallback(
    <A extends unknown[]>(fn: (...args: A) => void, reason = DEFAULT_REASON) =>
      (...args: A) => {
        if (isAuthenticated) fn(...args)
        else openAuthModal('login', reason)
      },
    [isAuthenticated],
  )
}
