import { create } from 'zustand'

export type AuthModalMode = 'login' | 'register'

interface AuthModalStore {
  isOpen: boolean
  mode: AuthModalMode
  /** 열린 사유 안내 문구 (예: "일정을 저장하려면 로그인하세요") */
  reason?: string
  open: (mode?: AuthModalMode, reason?: string) => void
  setMode: (mode: AuthModalMode) => void
  close: () => void
}

/** 로그인/회원가입 모달 전역 상태 — 어디서든 열 수 있도록 스토어로 둔다 */
export const useAuthModal = create<AuthModalStore>()((set) => ({
  isOpen: false,
  mode: 'login',
  reason: undefined,
  open: (mode = 'login', reason) => set({ isOpen: true, mode, reason }),
  setMode: (mode) => set({ mode }),
  close: () => set({ isOpen: false, reason: undefined }),
}))

/** 컴포넌트 밖(이벤트 핸들러·API 가드 등)에서 여는 용도 */
export const openAuthModal = (mode?: AuthModalMode, reason?: string) =>
  useAuthModal.getState().open(mode, reason)
