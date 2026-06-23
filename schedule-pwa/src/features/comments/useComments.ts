import { useCallback, useEffect, useState } from 'react'
import { commentsApi, type ScheduleComment } from './comments.api'

/** 일정 댓글 실시간 목록 + 작성/삭제 */
export function useComments(scheduleId: string) {
  const [comments, setComments] = useState<ScheduleComment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setComments(await commentsApi.listBySchedule(scheduleId))
    } finally {
      setIsLoading(false)
    }
  }, [scheduleId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const unsub = commentsApi.subscribe(() => load())
    return () => unsub()
  }, [load])

  const send = useCallback(
    async (text: string) => {
      const t = text.trim()
      if (!t) return
      await commentsApi.create(scheduleId, t)
      await load()
    },
    [scheduleId, load],
  )

  const remove = useCallback(
    async (id: string) => {
      await commentsApi.remove(id)
      await load()
    },
    [load],
  )

  return { comments, isLoading, send, remove }
}
