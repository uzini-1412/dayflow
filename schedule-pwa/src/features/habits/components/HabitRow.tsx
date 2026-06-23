import { format, parseISO } from 'date-fns'
import { cn } from '@shared/lib/cn'
import type { Habit } from '../habits.types'

interface Props {
  habit: Habit
  weekDays: string[]
  isDone: (habitId: string, dateKey: string) => boolean
  onToggle: (habitId: string, dateKey: string) => void
  streak: number
  onArchive: (id: string) => void
}

export function HabitRow({ habit, weekDays, isDone, onToggle, streak, onArchive }: Props) {
  const todayKey = weekDays[weekDays.length - 1]

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">{habit.emoji || '🔁'}</span>
        <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-100">{habit.name}</span>
        {streak > 0 && (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-500/20">
            🔥 {streak}일
          </span>
        )}
        <button type="button" onClick={() => onArchive(habit.id)} className="text-zinc-300 hover:text-red-500">
          ✕
        </button>
      </div>

      <div className="flex justify-between">
        {weekDays.map((dk) => {
          const done = isDone(habit.id, dk)
          const isToday = dk === todayKey
          return (
            <button
              key={dk}
              type="button"
              onClick={() => onToggle(habit.id, dk)}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-[10px] text-zinc-400">{format(parseISO(dk), 'eee')}</span>
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border text-xs',
                  done ? 'border-transparent text-white' : 'border-zinc-200 text-zinc-300 dark:border-zinc-700',
                  isToday && !done && 'border-brand-400',
                )}
                style={done ? { background: habit.color || '#6366f1' } : undefined}
              >
                {done ? '✓' : parseISO(dk).getDate()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
