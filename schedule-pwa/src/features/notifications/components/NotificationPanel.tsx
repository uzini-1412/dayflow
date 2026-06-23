import { formatDistanceToNow, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Modal, Button } from '@shared/ui'
import { cn } from '@shared/lib/cn'
import type { ModalBaseProps } from '@shared/types/ui.types'
import type { AppNotification, NotificationType } from '../notifications.types'

interface Props extends ModalBaseProps {
  items: AppNotification[]
  onSelect: (n: AppNotification) => void
  onMarkAllRead: () => void
}

const ICON: Record<NotificationType, string> = {
  schedule_due: '⏰',
  friend_request: '👤',
  share: '📤',
  system: 'ℹ️',
}

export function NotificationPanel({ isOpen, onClose, items, onSelect, onMarkAllRead }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="알림"
      footer={
        items.some((n) => !n.read) ? (
          <Button variant="secondary" size="sm" fullWidth onClick={onMarkAllRead}>
            모두 읽음으로 표시
          </Button>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">알림이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => onSelect(n)}
                className={cn(
                  'flex w-full items-start gap-3 py-3 text-left',
                  !n.read && 'bg-brand-50/50 dark:bg-zinc-800/40',
                )}
              >
                <span className="text-lg">{ICON[n.type]}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {n.title}
                  </p>
                  {n.body && <p className="truncate text-xs text-zinc-500">{n.body}</p>}
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    {formatDistanceToNow(parseISO(n.created), { addSuffix: true, locale: ko })}
                  </p>
                </div>
                {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
