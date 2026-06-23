import { cn } from '@shared/lib/cn'
import { formatDisplayTime } from '@shared/lib/datetime'
import { IMPORTANCE_META, type Schedule } from '@features/schedules'
import {
  GRID_HEIGHT,
  HOUR_PX,
  blockStyle,
  hourLabels,
  type WeekDay,
} from '../timetable.utils'

interface Props {
  days: WeekDay[]
  byDay: Map<string, Schedule[]>
  onSelect: (s: Schedule) => void
}

export function WeekGrid({ days, byDay, onSelect }: Props) {
  const hours = hourLabels()

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="min-w-[560px]">
        {/* 요일 헤더 */}
        <div className="grid border-b border-zinc-100 dark:border-zinc-800" style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}>
          <div />
          {days.map((d) => (
            <div
              key={d.key}
              className={cn(
                'py-1.5 text-center text-xs font-medium',
                d.weekday === 0 ? 'text-red-500' : d.weekday === 6 ? 'text-blue-500' : 'text-zinc-500',
              )}
            >
              {d.label}
              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{d.date.getDate()}</div>
            </div>
          ))}
        </div>

        {/* 시간 그리드 */}
        <div className="grid" style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}>
          {/* 시간 눈금 */}
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {hours.map((h, i) => (
              <div
                key={h}
                className="absolute right-1 text-[10px] text-zinc-400"
                style={{ top: i * HOUR_PX - 5 }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* 요일별 컬럼 */}
          {days.map((d) => (
            <div
              key={d.key}
              className="relative border-l border-zinc-100 dark:border-zinc-800"
              style={{ height: GRID_HEIGHT }}
            >
              {hours.map((h, i) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t border-zinc-50 dark:border-zinc-800/50"
                  style={{ top: i * HOUR_PX }}
                />
              ))}
              {(byDay.get(d.key) ?? []).map((s) => {
                const pos = blockStyle(s)
                if (!pos) return null
                return (
                  <button
                    key={`${s.id}-${s.start_at}`}
                    type="button"
                    onClick={() => onSelect(s)}
                    style={{
                      top: pos.top,
                      height: pos.height,
                      background: s.color || IMPORTANCE_META[s.importance]?.color || '#6366f1',
                    }}
                    className="absolute inset-x-0.5 overflow-hidden rounded px-1 py-0.5 text-left text-[11px] leading-tight text-white"
                  >
                    <div className="truncate font-medium">{s.title}</div>
                    <div className="truncate text-white/80">{formatDisplayTime(s.start_at)}</div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
