import { pb } from '@shared/lib/pb'

/** 계정 관리(비밀번호 변경 / 회원탈퇴) */
export const accountApi = {
  async changePassword(oldPassword: string, password: string, passwordConfirm: string): Promise<void> {
    const id = pb.authStore.record?.id
    if (!id) throw new Error('로그인이 필요합니다.')
    await pb.collection('users').update(id, { oldPassword, password, passwordConfirm })
  },

  async deleteAccount(): Promise<void> {
    const id = pb.authStore.record?.id
    if (!id) return
    await pb.collection('users').delete(id)
    pb.authStore.clear()
  },
}
