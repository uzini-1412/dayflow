import { cn } from '@shared/lib/cn'
import { IMPORTANCE_META, type Schedule } from '@features/schedules'
import type { DayDecoration } from '@features/decorations'
import type { CalendarDay } from '../calendar.utils'

interface Props {
  day: CalendarDay
  schedules: Schedule[]
  decoration?: DayDecoration
  onClick: (day: CalendarDay) => void
}

const MAX_VISIBLE = 3

export function DayCell({ day, schedules, decoration, onClick }: Props) {
  const weekendColor =
    day.weekday === 0 ? 'text-red-500' : day.weekday === 6 ? 'text-blue-500' : ''

  return (
    <button
      type="button"
      onClick={() => onClick(day)}
      style={decoration?.bg_color ? { backgroundColor: decoration.bg_color } : undefined}
      className={cn(
        'flex min-h-16 flex-col items-stretch gap-0.5 border-t border-l border-zinc-100 p-1 text-left md:min-h-24 dark:border-zinc-800',
        !day.inMonth && !decoration?.bg_color && 'bg-zinc-50/60 dark:bg-zinc-900/40',
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full text-xs',
            day.isToday && 'bg-brand-600 font-bold text-white',
            !day.isToday && (day.inMonth ? weekendColor || 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-300 dark:text-zinc-600'),
          )}
        >
          {day.date.getDate()}
        </span>
        {decoration?.emoji && <span className="text-sm">{decoration.emoji}</span>}
      </div>
      {!!decoration?.star_rating && (
        <span className="text-[10px] leading-none text-amber-500">
          {'⭐'.repeat(decoration.star_rating)}
        </span>
      )}

      <div className="hidden flex-col gap-0.5 md:flex">
        {schedules.slice(0, MAX_VISIBLE).map((s) => (
          <span
            key={s.id}
            className="truncate rounded px-1 text-[11px] text-white"
            style={{ background: s.color || IMPORTANCE_META[s.importance]?.color || '#6366f1' }}
          >
            {s.title}
          </span>
        ))}
        {schedules.length > MAX_VISIBLE && (
          <span className="px-1 text-[11px] text-zinc-400">+{schedules.length - MAX_VISIBLE}</span>
        )}
      </div>

      {/* 모바일: 점으로만 표시 */}
      <div className="flex justify-center gap-0.5 md:hidden">
        {schedules.slice(0, MAX_VISIBLE).map((s) => (
          <span
            key={s.id}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: s.color || IMPORTANCE_META[s.importance]?.color || '#6366f1' }}
          />
        ))}
      </div>
    </button>
  )
}
