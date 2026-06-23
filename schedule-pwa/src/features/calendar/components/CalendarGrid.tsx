import { cn } from '@shared/lib/cn'
import type { Schedule } from '@features/schedules'
import type { DayDecoration } from '@features/decorations'
import type { CalendarDay } from '../calendar.utils'
import { DayCell } from './DayCell'

interface Props {
  weeks: CalendarDay[][]
  weekdays: string[]
  byDay: Map<string, Schedule[]>
  decoByDate: Map<string, DayDecoration>
  onSelectDay: (day: CalendarDay) => void
}

export function CalendarGrid({ weeks, weekdays, byDay, decoByDate, onSelectDay }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border-r border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-7">
        {weekdays.map((w, i) => (
          <div
            key={w}
            className={cn(
              'border-t border-l border-zinc-100 py-1.5 text-center text-xs font-medium dark:border-zinc-800',
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-zinc-400',
            )}
          >
            {w}
          </div>
        ))}
      </div>
      {weeks.map((week, i) => (
        <div key={i} className="grid grid-cols-7">
          {week.map((day) => (
            <DayCell
              key={day.key}
              day={day}
              schedules={byDay.get(day.key) ?? []}
              decoration={decoByDate.get(day.key)}
              onClick={onSelectDay}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
