import { useMemo, useState } from 'react'
import { addMonths, format, parseISO } from 'date-fns'
import { useSettingsStore } from '@features/settings'
import { useScheduleOccurrences } from '@features/schedules'
import type { Schedule } from '@features/schedules'
import { buildMonthGrid, monthGridRange } from '../calendar.utils'

/** 달력 한 달: 그리드 + 네비게이션 + 일자별 일정 묶음 */
export function useCalendarMonth() {
  const weekStart = useSettingsStore((s) => s.settings.weekStart)
  const [month, setMonth] = useState(() => new Date())

  const weeks = useMemo(() => buildMonthGrid(month, weekStart), [month, weekStart])
  const range = useMemo(() => monthGridRange(month, weekStart), [month, weekStart])

  const { schedules, isLoading } = useScheduleOccurrences(range.from, range.to)

  const byDay = useMemo(() => {
    const map = new Map<string, Schedule[]>()
    for (const s of schedules) {
      const key = format(parseISO(s.start_at), 'yyyy-MM-dd')
      const arr = map.get(key) ?? []
      arr.push(s)
      map.set(key, arr)
    }
    return map
  }, [schedules])

  return {
    month,
    weeks,
    byDay,
    isLoading,
    next: () => setMonth((m) => addMonths(m, 1)),
    prev: () => setMonth((m) => addMonths(m, -1)),
    today: () => setMonth(new Date()),
  }
}
