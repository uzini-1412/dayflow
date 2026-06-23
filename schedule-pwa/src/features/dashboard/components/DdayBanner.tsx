import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { Schedule } from '@features/schedules'

interface Props {
  schedule: Schedule | null
  now: Date
}

/** 가장 가까운 중요 일정 D-Day 배너 */
export function DdayBanner({ schedule, now }: Props) {
  if (!schedule) return null
  const days = differenceInCalendarDays(parseISO(schedule.start_at), now)
  const label = days === 0 ? 'D-DAY' : `D-${days}`

  return (
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-white">
      <span className="text-2xl font-extrabold tabular-nums">{label}</span>
      <div className="min-w-0">
        <p className="truncate font-semibold">{schedule.title}</p>
        <p className="text-xs text-white/80">가장 가까운 중요 일정</p>
      </div>
    </div>
  )
}
