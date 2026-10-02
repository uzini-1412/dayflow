import { ClientResponseError } from 'pocketbase'
import { pb } from '@shared/lib/pb'
import type { UserRecord } from '@shared/types/pb.types'
import type { LoginInput, RegisterInput } from './auth.types'

/** PocketBase 인증 호출 모음 (컴포넌트는 이 모듈만 사용) */
export const authApi = {
  async login({ email, password }: LoginInput): Promise<UserRecord> {
    const res = await pb.collection('users').authWithPassword(email, password)
    return res.record as unknown as UserRecord
  },

  /**
   * 간편 가입. 닉네임(유니크)은 이메일 앞부분으로 만들고,
   * 겹치면 숫자 접미사를 붙여 재시도한다. 이름도 같은 값으로 시작(설정에서 변경 가능).
   */
  async register({ email, password }: RegisterInput): Promise<void> {
    const base = email.split('@')[0].replace(/[^\p{L}\p{N}_.-]/gu, '').slice(0, 24) || 'user'
    for (let attempt = 0; attempt < 5; attempt++) {
      const nickname = attempt === 0 ? base : `${base}${Math.floor(1000 + Math.random() * 9000)}`
      try {
        await pb.collection('users').create({
          email,
          password,
          passwordConfirm: password,
          name: nickname,
          nickname,
          emailVisibility: false,
        })
        return
      } catch (e) {
        if (!(e instanceof ClientResponseError) || !e.response?.data?.nickname) throw e
      }
    }
    throw new Error('닉네임 생성에 실패했습니다. 다시 시도해 주세요.')
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
