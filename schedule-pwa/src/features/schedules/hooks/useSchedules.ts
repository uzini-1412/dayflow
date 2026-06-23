import { useCallback, useEffect, useState } from 'react'
import { schedulesApi } from '../schedules.api'
import type { Schedule } from '../schedules.types'

interface UseSchedulesResult {
  schedules: Schedule[]
  isLoading: boolean
  error: string | null
  reload: () => void
}

/** 기간 내 일정 조회 + 실시간 갱신 */
export function useSchedules(fromISO: string, toISO: string): UseSchedulesResult {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setSchedules(await schedulesApi.listRange(fromISO, toISO))
    } catch (e) {
      setError(e instanceof Error ? e.message : '일정을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [fromISO, toISO])

  useEffect(() => {
    load()
  }, [load])

  // 실시간: 다른 기기/공유에서 변경 시 재조회
  useEffect(() => {
    const unsub = schedulesApi.subscribe(() => load())
    return () => unsub()
  }, [load])

  return { schedules, isLoading, error, reload: load }
}
