import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ClientResponseError } from 'pocketbase'
import { pb } from '@shared/lib/pb'
import type { UserRecord } from '@shared/types/pb.types'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { authApi } from './auth.api'
import { openAuthModal } from './authModal.store'
import { AuthModal } from './components/AuthModal'
import type { LoginInput, RegisterInput } from './auth.types'

/** 비로그인 상태에서도 허용하는 쓰기 요청: 로그인·가입·실시간 구독 */
const GUEST_WRITE_ALLOWED =
  /\/api\/(collections\/users\/(auth-with-password|auth-refresh|request-password-reset|records(\?|$))|realtime)/

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(() => authApi.current())
  const [isLoading, setIsLoading] = useState(true)

  // authStore 변화 구독 (탭 간/만료 동기화)
  useEffect(() => {
    const unsub = pb.authStore.onChange(() => {
      setUser(authApi.current())
    })
    setIsLoading(false)
    return () => unsub()
  }, [])

  // 둘러보기 모드 안전망: 비로그인 쓰기 요청은 서버로 보내지 않고 로그인 모달을 띄운다
  // (버튼 단의 useRequireAuth 가드를 거치지 않은 인라인 추가·토글 등을 일괄 처리)
  useEffect(() => {
    const prev = pb.beforeSend
    pb.beforeSend = (url, options) => {
      const method = (options.method ?? 'GET').toUpperCase()
      if (method !== 'GET' && !pb.authStore.isValid && !GUEST_WRITE_ALLOWED.test(url)) {
        openAuthModal('login', '저장하려면 로그인이 필요해요.')
        throw new ClientResponseError({ url, status: 401, response: { message: '로그인이 필요합니다.' } })
      }
      return prev ? prev(url, options) : { url, options }
    }
    return () => {
      pb.beforeSend = prev
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login: async (input: LoginInput) => {
        const u = await authApi.login(input)
        setUser(u)
        return u
      },
      register: (input: RegisterInput) => authApi.register(input),
      logout: () => {
        authApi.logout()
        setUser(null)
      },
    }),
    [user, isLoading],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  )
}
