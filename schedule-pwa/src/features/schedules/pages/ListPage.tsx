import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { SegmentedControl } from '@shared/ui'
import { useScheduleOccurrences } from '../hooks/useScheduleOccurrences'
import { useScheduleEditor } from '../hooks/useScheduleEditor'
import { useScheduleMutations } from '../hooks/useScheduleMutations'
import { presetToRange, RANGE_PRESETS, type RangePreset } from '../schedules.filters'
import { ScheduleItem } from '../components/ScheduleItem'
import { ScheduleFormModal } from '../components/ScheduleFormModal'
import { Fab } from '../components/Fab'
import type { Schedule } from '../schedules.types'

export function ListPage() {
  const [preset, setPreset] = useState<RangePreset>('week')
  const [base] = useState(() => new Date())
  const range = useMemo(() => presetToRange(preset, base), [preset, base])

  const { schedules, isLoading } = useScheduleOccurrences(range.from, range.to)
  const { toggleComplete } = useScheduleMutations()
  const editor = useScheduleEditor()

  // 메모(visible=false) 제외 후 날짜별 그룹
  const groups = useMemo(() => groupByDate(schedules.filter((s) => s.visible !== false)), [schedules])

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">일정 리스트</h1>
        <SegmentedControl value={preset} options={RANGE_PRESETS} onChange={setPreset} />
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-zinc-400">불러오는 중…</p>
      ) : groups.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">일정이 없습니다.</p>
      ) : (
        <div className="space-y-5">
          {groups.map(([date, items]) => (
            <section key={date}>
              <h2 className="mb-1 text-xs font-semibold text-zinc-400">
                {format(parseISO(date), 'M월 d일 (E)', { locale: ko })}
              </h2>
              <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white px-3 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {items.map((s) => (
                  <ScheduleItem
                    key={s.id}
                    schedule={s}
                    onToggle={(it) => toggleComplete(it.id, !it.completed)}
                    onClick={editor.openEdit}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Fab onClick={() => editor.openCreate()} />

      {editor.isOpen && (
        <ScheduleFormModal
          isOpen={editor.isOpen}
          onClose={editor.close}
          schedule={editor.selected}
          defaultStart={editor.defaultStart}
        />
      )}
    </div>
  )
}

/** 날짜(yyyy-MM-dd)별 그룹 + 날짜 오름차순 */
function groupByDate(schedules: Schedule[]): [string, Schedule[]][] {
  const map = new Map<string, Schedule[]>()
  for (const s of schedules) {
    const key = format(parseISO(s.start_at), 'yyyy-MM-dd')
    const arr = map.get(key) ?? []
    arr.push(s)
    map.set(key, arr)
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
}
