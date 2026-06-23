import { addDays, parseISO, startOfWeek } from 'date-fns'
import type { WeekStart } from '@features/settings/settings.types'
import type { Schedule } from '@features/schedules'

export const DAY_START_HOUR = 6
export const DAY_END_HOUR = 24
export const HOUR_PX = 44
export const TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60
export const GRID_HEIGHT = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_PX

const weekStartsOn = (w: WeekStart): 0 | 1 => (w === 'mon' ? 1 : 0)

export interface WeekDay {
  date: Date
  key: string
  label: string
  weekday: number
}

const DOW = ['일', '월', '화', '수', '목', '금', '토']

/** 주의 7일 */
export function weekDays(base: Date, weekStart: WeekStart): WeekDay[] {
  const start = startOfWeek(base, { weekStartsOn: weekStartsOn(weekStart) })
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i)
    return {
      date,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      label: DOW[date.getDay()],
      weekday: date.getDay(),
    }
  })
}

/** 시간 블록의 위치/높이(px) — 그리드 범위 밖은 클램프 */
export function blockStyle(schedule: Schedule): { top: number; height: number } | null {
  if (schedule.all_day) return null
  const start = parseISO(schedule.start_at)
  const startMin = start.getHours() * 60 + start.getMinutes()
  const durationMin = schedule.end_at
    ? Math.max(30, (parseISO(schedule.end_at).getTime() - start.getTime()) / 60000)
    : 60

  const offset = startMin - DAY_START_HOUR * 60
  const top = Math.max(0, Math.min(offset, TOTAL_MINUTES)) / 60 * HOUR_PX
  const rawHeight = (durationMin / 60) * HOUR_PX
  const height = Math.max(22, Math.min(rawHeight, GRID_HEIGHT - top))
  return { top, height }
}

/** 시간 눈금 라벨 */
export function hourLabels(): number[] {
  return Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i)
}
