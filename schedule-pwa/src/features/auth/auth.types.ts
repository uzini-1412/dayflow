import type { UserRecord } from '@shared/types/pb.types'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  passwordConfirm: string
  name: string
  nickname: string
  birthdate?: string
}

export interface AuthState {
  user: UserRecord | null
  isAuthenticated: boolean
  isLoading: boolean
}
