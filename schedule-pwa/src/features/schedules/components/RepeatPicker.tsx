import { cn } from '@shared/lib/cn'
import { Input, SegmentedControl } from '@shared/ui'
import { toInputDate, fromInputDateTime } from '@shared/lib/datetime'
import type { RepeatFreq, RepeatRule } from '../schedules.types'

interface Props {
  value: RepeatRule | null
  onChange: (rule: RepeatRule | null) => void
}

const FREQ_OPTIONS: { value: RepeatFreq; label: string }[] = [
  { value: 'none', label: '안 함' },
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' },
]

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export function RepeatPicker({ value, onChange }: Props) {
  const freq = value?.freq ?? 'none'

  function setFreq(f: RepeatFreq) {
    if (f === 'none') return onChange(null)
    onChange({ ...value, freq: f })
  }

  function toggleWeekday(d: number) {
    const cur = value?.weekdays ?? []
    const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()
    onChange({ freq: 'weekly', ...value, weekdays: next })
  }

  return (
    <div className="space-y-3">
      <div>
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          반복
        </span>
        <SegmentedControl value={freq} options={FREQ_OPTIONS} onChange={setFreq} />
      </div>

      {freq === 'weekly' && (
        <div className="flex gap-1">
          {WEEKDAYS.map((w, i) => {
            const on = value?.weekdays?.includes(i)
            return (
              <button
                key={w}
                type="button"
                onClick={() => toggleWeekday(i)}
                className={cn(
                  'h-8 w-8 rounded-full text-sm',
                  on
                    ? 'bg-brand-600 text-white'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800',
                )}
              >
                {w}
              </button>
            )
          })}
        </div>
      )}

      {freq !== 'none' && (
        <Input
          label="반복 종료 (선택)"
          type="date"
          value={value?.until ? toInputDate(value.until) : ''}
          onChange={(e) =>
            onChange({
              freq,
              ...value,
              until: e.target.value ? fromInputDateTime(`${e.target.value}T23:59`) : undefined,
            })
          }
        />
      )}
    </div>
  )
}
