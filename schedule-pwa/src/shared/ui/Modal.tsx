import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@shared/lib/cn'
import type { ModalProps } from '@shared/types/ui.types'

const SIZE: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'md:max-w-sm',
  md: 'md:max-w-lg',
  lg: 'md:max-w-2xl',
}

/**
 * 공통 모달 베이스 — 모든 모달은 이 컴포넌트를 감싸서 만든다.
 * 오버레이 · ESC 닫기 · 스크롤 락 · 포커스 · 반응형(모바일 바텀시트 / md+ 센터)을
 * 여기 한 곳에서만 처리한다. 개별 모달이 직접 구현하지 않는다.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
}: ModalProps) {
  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // 스크롤 락
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
      role="dialog"
      aria-modal="true"
    >
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* 패널: 모바일=바텀시트, md+=센터 다이얼로그 */}
      <div
        className={cn(
          'relative flex max-h-[90vh] w-full flex-col bg-white shadow-xl dark:bg-zinc-900',
          'rounded-t-2xl md:rounded-2xl',
          'animate-in slide-in-from-bottom md:zoom-in-95',
          SIZE[size],
        )}
      >
        {(title || description) && (
          <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="-mr-1 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              ✕
            </button>
          </header>
        )}

        <div className="safe-bottom flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="safe-bottom border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
