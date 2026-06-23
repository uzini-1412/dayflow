import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { pb } from '@shared/lib/pb'
import type { UserRecord } from '@shared/types/pb.types'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { authApi } from './auth.api'
import type { LoginInput, RegisterInput } from './auth.types'

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
