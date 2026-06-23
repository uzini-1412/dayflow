import { create } from 'zustand'

export interface ToastItem {
  id: number
  title: string
  body?: string
  icon?: string
  link?: string
  duration?: number
}

interface ToastStore {
  items: ToastItem[]
  push: (t: Omit<ToastItem, 'id'>) => void
  dismiss: (id: number) => void
}

let counter = 0

export const useToastStore = create<ToastStore>((set) => ({
  items: [],
  push: (t) => {
    counter += 1
    set((s) => ({ items: [...s.items, { ...t, id: counter }] }))
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}))

/** 컴포넌트 밖(훅/유틸)에서 토스트 띄우는 명령형 헬퍼 */
export const toast = {
  push: (t: Omit<ToastItem, 'id'>) => useToastStore.getState().push(t),
}
