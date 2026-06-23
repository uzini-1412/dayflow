import { cn } from '@shared/lib/cn'
import { formatDisplayTime } from '@shared/lib/datetime'
import { IMPORTANCE_META, type Schedule } from '../schedules.types'

interface Props {
  schedule: Schedule
  onToggle?: (s: Schedule) => void
  onClick?: (s: Schedule) => void
}

/** 리스트/상세에 쓰는 일정 한 줄 (체크박스 + 제목 + 시간) */
export function ScheduleItem({ schedule, onToggle, onClick }: Props) {
  const meta = IMPORTANCE_META[schedule.importance] ?? IMPORTANCE_META.mid
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      {onToggle && (
        <button
          type="button"
          aria-label="완료 토글"
          onClick={() => onToggle(schedule)}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs',
            schedule.completed
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-zinc-300 dark:border-zinc-600',
          )}
        >
          {schedule.completed && '✓'}
        </button>
      )}
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: schedule.color || meta.color }} />
      <button
        type="button"
        onClick={() => onClick?.(schedule)}
        className="flex min-w-0 flex-1 items-baseline gap-2 text-left"
      >
        <span
          className={cn(
            'truncate text-sm',
            schedule.completed
              ? 'text-zinc-400 line-through'
              : 'text-zinc-800 dark:text-zinc-100',
          )}
        >
          {schedule.title}
        </span>
        {!schedule.all_day && (
          <span className="shrink-0 text-xs text-zinc-400">
            {formatDisplayTime(schedule.start_at)}
          </span>
        )}
      </button>
    </div>
  )
}
