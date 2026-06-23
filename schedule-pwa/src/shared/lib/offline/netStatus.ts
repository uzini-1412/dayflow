import { create } from 'zustand'

/**
 * 네트워크/동기화 상태 스토어.
 * - online: 브라우저 연결 상태 (online/offline 이벤트로 갱신)
 * - syncing: 대기열 플러시 진행 중
 * - pending: 송신 대기 중인 변경 개수
 *
 * api 레이어는 React 밖이라 store 대신 isOnline() 을 직접 쓴다. 스토어는 UI 표시용.
 */
interface NetStatusStore {
  online: boolean
  syncing: boolean
  pending: number
  setOnline: (v: boolean) => void
  setSyncing: (v: boolean) => void
  setPending: (n: number) => void
}

export const useNetStatus = create<NetStatusStore>((set) => ({
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  syncing: false,
  pending: 0,
  setOnline: (online) => set({ online }),
  setSyncing: (syncing) => set({ syncing }),
  setPending: (pending) => set({ pending }),
}))

/** 훅 밖(api/sync engine)에서 쓰는 현재 연결 상태 */
export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}

/** sync engine 이 상태를 밀어넣는 비-React 헬퍼 */
export const netState = {
  setOnline: (v: boolean) => useNetStatus.getState().setOnline(v),
  setSyncing: (v: boolean) => useNetStatus.getState().setSyncing(v),
  setPending: (n: number) => useNetStatus.getState().setPending(n),
}
