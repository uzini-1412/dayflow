import { useMemo, useState } from 'react'
import { addDays, endOfWeek, parseISO, startOfWeek } from 'date-fns'
import { useSettingsStore } from '@features/settings'
import { useScheduleOccurrences, type Schedule } from '@features/schedules'
import { weekDays } from './timetable.utils'

const wso = (w: 'sun' | 'mon'): 0 | 1 => (w === 'mon' ? 1 : 0)

/** 주간 뷰: 7일 + 일자별 일정 + 네비 + 반복만 보기 */
export function useWeek() {
  const weekStart = useSettingsStore((s) => s.settings.weekStart)
  const [base, setBase] = useState(() => new Date())
  const [routineOnly, setRoutineOnly] = useState(false)

  const days = useMemo(() => weekDays(base, weekStart), [base, weekStart])
  const range = useMemo(() => {
    const opts = { weekStartsOn: wso(weekStart) }
    return {
      from: startOfWeek(base, opts).toISOString(),
      to: endOfWeek(base, opts).toISOString(),
    }
  }, [base, weekStart])

  const { schedules } = useScheduleOccurrences(range.from, range.to)

  const byDay = useMemo(() => {
    const map = new Map<string, Schedule[]>()
    for (const s of schedules) {
      if (routineOnly && (!s.repeat_rule || s.repeat_rule.freq === 'none')) continue
      const d = parseISO(s.start_at)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      const arr = map.get(key) ?? []
      arr.push(s)
      map.set(key, arr)
    }
    return map
  }, [schedules, routineOnly])

  return {
    base,
    days,
    byDay,
    routineOnly,
    setRoutineOnly,
    next: () => setBase((b) => addDays(b, 7)),
    prev: () => setBase((b) => addDays(b, -7)),
    today: () => setBase(new Date()),
  }
}
