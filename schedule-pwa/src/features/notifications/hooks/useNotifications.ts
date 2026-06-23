import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@features/auth'
import { notificationsApi } from '../notifications.api'
import type { AppNotification } from '../notifications.types'

/** 알림 목록 + 실시간 + 미읽음 수 + 읽음처리 */
export function useNotifications() {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([])
      setIsLoading(false)
      return
    }
    try {
      setItems(await notificationsApi.listRecent())
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!isAuthenticated) return
    const unsub = notificationsApi.subscribe(() => load())
    return () => unsub()
  }, [isAuthenticated, load])

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items])

  const markRead = useCallback((id: string) => notificationsApi.markRead(id), [])
  const markAllRead = useCallback(
    () => notificationsApi.markAllRead(items.filter((n) => !n.read).map((n) => n.id)),
    [items],
  )

  return { items, unreadCount, isLoading, markRead, markAllRead, reload: load }
}
