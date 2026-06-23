import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
} from 'date-fns'
import type { WeekStart } from '@features/settings/settings.types'

export interface CalendarDay {
  date: Date
  key: string // yyyy-MM-dd
  inMonth: boolean
  isToday: boolean
  weekday: number // 0=일..6=토
}

const weekStartsOn = (w: WeekStart): 0 | 1 => (w === 'mon' ? 1 : 0)

/** 한 달 달력 그리드(앞뒤 채움 포함)를 주 단위 2차원 배열로 반환 */
export function buildMonthGrid(month: Date, weekStart: WeekStart): CalendarDay[][] {
  const opts = { weekStartsOn: weekStartsOn(weekStart) }
  const gridStart = startOfWeek(startOfMonth(month), opts)
  const gridEnd = endOfWeek(endOfMonth(month), opts)
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const weeks: CalendarDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(
      days.slice(i, i + 7).map((date) => ({
        date,
        key: format(date, 'yyyy-MM-dd'),
        inMonth: isSameMonth(date, month),
        isToday: isToday(date),
        weekday: date.getDay(),
      })),
    )
  }
  return weeks
}

/** 그리드 전체 [from, to] ISO 범위 (조회용) */
export function monthGridRange(month: Date, weekStart: WeekStart): { from: string; to: string } {
  const opts = { weekStartsOn: weekStartsOn(weekStart) }
  return {
    from: startOfWeek(startOfMonth(month), opts).toISOString(),
    to: endOfWeek(endOfMonth(month), opts).toISOString(),
  }
}

/** 요일 헤더 라벨 */
export function weekdayLabels(weekStart: WeekStart): string[] {
  const base = ['일', '월', '화', '수', '목', '금', '토']
  return weekStart === 'mon' ? [...base.slice(1), base[0]] : base
}
