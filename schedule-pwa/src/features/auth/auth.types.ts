import type { UserRecord } from '@shared/types/pb.types'

export interface LoginInput {
  email: string
  password: string
}

/** 간편 가입: 이메일·비밀번호만 받고 이름/닉네임은 이메일에서 자동 생성 */
export interface RegisterInput {
  email: string
  password: string
}

export interface AuthState {
  user: UserRecord | null
  isAuthenticated: boolean
  isLoading: boolean
}
