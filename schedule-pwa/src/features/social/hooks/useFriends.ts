import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@features/auth'
import { socialApi } from '../social.api'
import type { Friend } from '../social.types'

/** 친구 목록 + 대기요청 + 액션 (실시간) */
export function useFriends() {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      setItems(await socialApi.listFriendships())
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!isAuthenticated) return
    const unsub = socialApi.subscribe(() => load())
    return () => unsub()
  }, [isAuthenticated, load])

  const accepted = useMemo(() => items.filter((f) => f.status === 'accepted'), [items])
  const incoming = useMemo(
    () => items.filter((f) => f.status === 'pending' && f.incoming),
    [items],
  )
  const outgoing = useMemo(
    () => items.filter((f) => f.status === 'pending' && !f.incoming),
    [items],
  )

  return {
    accepted,
    incoming,
    outgoing,
    isLoading,
    accept: socialApi.accept,
    remove: socialApi.remove,
    sendRequest: socialApi.sendRequest,
    reload: load,
  }
}
