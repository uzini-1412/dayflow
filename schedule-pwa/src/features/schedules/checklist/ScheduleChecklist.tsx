import { useCallback, useEffect, useState } from 'react'
import { cn } from '@shared/lib/cn'
import { checklistApi, type ChecklistItem } from './checklist.api'

/** 일정에 붙는 준비물 체크리스트 (편집 모달 내) */
export function ScheduleChecklist({ scheduleId }: { scheduleId: string }) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [text, setText] = useState('')

  const load = useCallback(async () => {
    setItems(await checklistApi.listBySchedule(scheduleId))
  }, [scheduleId])

  useEffect(() => {
    load()
  }, [load])

  async function add() {
    if (!text.trim()) return
    await checklistApi.create(scheduleId, text.trim(), items.length)
    setText('')
    await load()
  }

  async function toggle(it: ChecklistItem) {
    await checklistApi.toggle(it.id, !it.done)
    await load()
  }

  async function remove(id: string) {
    await checklistApi.remove(id)
    await load()
  }

  const doneCount = items.filter((i) => i.done).length

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">준비물 체크리스트</span>
        {items.length > 0 && (
          <span className="text-xs text-zinc-400">
            {doneCount}/{items.length}
          </span>
        )}
      </div>

      <div className="space-y-1">
        {items.map((it) => (
          <div key={it.id} className="group flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggle(it)}
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]',
                it.done ? 'border-brand-600 bg-brand-600 text-white' : 'border-zinc-300 dark:border-zinc-600',
              )}
            >
              {it.done && '✓'}
            </button>
            <span className={cn('flex-1 text-sm', it.done ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200')}>
              {it.text}
            </span>
            <button
              type="button"
              onClick={() => remove(it.id)}
              className="text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add()
          }
        }}
        placeholder="+ 항목 추가"
        className="mt-1 w-full rounded-lg bg-zinc-50 px-2 py-1 text-sm outline-none dark:bg-zinc-800"
      />
    </div>
  )
}
