import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@shared/hooks/useDisclosure'
import { ROUTES } from '@shared/lib/routes'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationPanel } from './NotificationPanel'
import type { AppNotification } from '../notifications.types'

/** 헤더 알림 벨 — 미읽음 뱃지 + 패널 열기 */
export function NotificationBell() {
  const navigate = useNavigate()
  const panel = useDisclosure()
  const { items, unreadCount, markRead, markAllRead } = useNotifications()

  async function onSelect(n: AppNotification) {
    if (!n.read) await markRead(n.id)
    panel.close()
    navigate(n.link || ROUTES.calendar)
  }

  return (
    <>
      <button
        type="button"
        onClick={panel.open}
        aria-label="알림"
        className="relative rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        isOpen={panel.isOpen}
        onClose={panel.close}
        items={items}
        onSelect={onSelect}
        onMarkAllRead={markAllRead}
      />
    </>
  )
}
