import { useCallback, useState } from 'react'

export interface Disclosure {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

/** 모달/드로어 등 열림상태 표준 훅 */
export function useDisclosure(initial = false): Disclosure {
  const [isOpen, setIsOpen] = useState(initial)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])
  return { isOpen, open, close, toggle }
}
