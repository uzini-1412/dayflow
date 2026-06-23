import { createContext } from 'react'
import type { UserRecord } from '@shared/types/pb.types'
import type { AuthState, LoginInput, RegisterInput } from './auth.types'

export interface AuthContextValue extends AuthState {
  login: (input: LoginInput) => Promise<UserRecord>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
