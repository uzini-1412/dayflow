import { useMemo, useState } from 'react'
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useScheduleOccurrences, type Schedule } from '@features/schedules'

function within(s: Schedule, from: Date, to: Date): boolean {
  const t = new Date(s.start_at).getTime()
  return t >= from.getTime() && t <= to.getTime()
}

/** 대시보드 집계: 오늘/이번주/이번달 + D-Day + 월 지출 */
export function useDashboard() {
  const [now] = useState(() => new Date())

  // 월초 ~ 60일 후까지 한 번에 조회 후 구간별로 파생
  const from = startOfMonth(now).toISOString()
  const to = addDays(now, 60).toISOString()
  const { schedules } = useScheduleOccurrences(from, to)

  return useMemo(() => {
    const today = schedules.filter((s) => within(s, startOfDay(now), endOfDay(now)))
    const week = schedules.filter((s) => within(s, startOfWeek(now), endOfWeek(now)))
    const month = schedules.filter((s) => within(s, startOfMonth(now), endOfMonth(now)))

    // D-Day: 다가오는 '높음' 중요도 중 가장 가까운 일정
    const upcomingImportant = schedules
      .filter((s) => s.importance === 'high' && new Date(s.start_at).getTime() >= now.getTime())
      .sort((a, b) => a.start_at.localeCompare(b.start_at))
    const dday = upcomingImportant[0] ?? null

    const monthSpend = month.reduce((sum, s) => sum + (s.cost || 0), 0)

    return {
      now,
      today,
      todoLeft: today.filter((s) => !s.completed).length,
      weekCount: week.length,
      weekDone: week.filter((s) => s.completed).length,
      dday,
      monthSpend,
    }
  }, [schedules, now])
}
