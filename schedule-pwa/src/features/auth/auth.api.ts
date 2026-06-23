import { pb } from '@shared/lib/pb'
import type { UserRecord } from '@shared/types/pb.types'
import type { LoginInput, RegisterInput } from './auth.types'

/** PocketBase 인증 호출 모음 (컴포넌트는 이 모듈만 사용) */
export const authApi = {
  async login({ email, password }: LoginInput): Promise<UserRecord> {
    const res = await pb.collection('users').authWithPassword(email, password)
    return res.record as unknown as UserRecord
  },

  async register(input: RegisterInput): Promise<void> {
    await pb.collection('users').create({
      email: input.email,
      password: input.password,
      passwordConfirm: input.passwordConfirm,
      name: input.name,
      nickname: input.nickname,
      birthdate: input.birthdate || undefined,
      emailVisibility: false,
    })
  },

  /** nickname 중복확인 (SRS: ID 중복확인) */
  async isNicknameTaken(nickname: string): Promise<boolean> {
    try {
      await pb.collection('users').getFirstListItem(`nickname="${nickname}"`)
      return true
    } catch {
      return false
    }
  },

  logout(): void {
    pb.authStore.clear()
  },

  current(): UserRecord | null {
    return (pb.authStore.record as unknown as UserRecord) ?? null
  },

  isValid(): boolean {
    return pb.authStore.isValid
  },
}
