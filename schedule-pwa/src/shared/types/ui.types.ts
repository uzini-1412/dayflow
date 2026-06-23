import type { ReactNode } from 'react'

/** 모든 모달 컴포넌트가 공유하는 기본 props (공통 모달 규칙) */
export interface ModalBaseProps {
  isOpen: boolean
  onClose: () => void
}

export interface ModalProps extends ModalBaseProps {
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  /** 너비 프리셋 */
  size?: 'sm' | 'md' | 'lg'
  /** 오버레이 클릭으로 닫기 허용 (기본 true) */
  closeOnOverlay?: boolean
}
