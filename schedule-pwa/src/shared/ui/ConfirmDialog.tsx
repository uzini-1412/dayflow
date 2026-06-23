import type { ReactNode } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import type { ModalBaseProps } from '@shared/types/ui.types'

interface ConfirmDialogProps extends ModalBaseProps {
  title: ReactNode
  message?: ReactNode
  confirmText?: string
  cancelText?: string
  danger?: boolean
  onConfirm: () => void
}

/** 삭제/확인 등 재사용 확인 다이얼로그 — 공통 Modal 위에 구축 */
export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  danger,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      {message && <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>}
    </Modal>
  )
}
