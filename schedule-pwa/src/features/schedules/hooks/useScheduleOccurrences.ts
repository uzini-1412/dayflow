import { useCallback, useEffect, useMemo, useState } from 'react'
import { schedulesApi } from '../schedules.api'
import { expandToRange } from '../recurrence'
import type { Schedule } from '../schedules.types'

/**
 * [from,to] 범위의 일정 "발생"을 반환 (반복 일정 전개 포함).
 * 반환 항목은 표시용 클론으로, 단일 일정은 그대로·반복은 펼쳐진다.
 */
export function useScheduleOccurrences(fromISO: string, toISO: string) {
  const [masters, setMasters] = useState<Schedule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      setMasters(await schedulesApi.listUpTo(toISO))
    } finally {
      setIsLoading(false)
    }
  }, [toISO])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const unsub = schedulesApi.subscribe(() => load())
    return () => unsub()
  }, [load])

  const occurrences = useMemo(() => {
    const out: Schedule[] = []
    for (const m of masters) out.push(...expandToRange(m, fromISO, toISO))
    return out.sort((a, b) => a.start_at.localeCompare(b.start_at))
  }, [masters, fromISO, toISO])

  return { schedules: occurrences, isLoading, reload: load }
}
