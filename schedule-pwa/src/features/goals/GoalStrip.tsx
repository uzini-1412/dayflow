import { useState } from 'react'
import { cn } from '@shared/lib/cn'
import { useGoals } from './useGoals'
import type { Goal, GoalPeriod } from './goals.types'

/** 달력 상단 목표 스트립 (이번 달 / 올해) */
export function GoalStrip({ month }: { month: Date }) {
  const { monthGoals, yearGoals, add, toggle, remove } = useGoals(month)

  return (
    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <GoalColumn title="이번 달 목표" period="month" goals={monthGoals} onAdd={add} onToggle={toggle} onRemove={remove} />
      <GoalColumn title="올해 목표" period="year" goals={yearGoals} onAdd={add} onToggle={toggle} onRemove={remove} />
    </div>
  )
}

interface ColProps {
  title: string
  period: GoalPeriod
  goals: Goal[]
  onAdd: (title: string, period: GoalPeriod) => void
  onToggle: (g: Goal) => void
  onRemove: (id: string) => void
}

function GoalColumn({ title, period, goals, onAdd, onToggle, onRemove }: ColProps) {
  const [text, setText] = useState('')

  function submit() {
    if (!text.trim()) return
    onAdd(text.trim(), period)
    setText('')
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-2 text-xs font-semibold text-zinc-400">{title}</p>
      <ul className="mb-2 space-y-1">
        {goals.map((g) => (
          <li key={g.id} className="group flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggle(g)}
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]',
                g.achieved ? 'border-brand-600 bg-brand-600 text-white' : 'border-zinc-300 dark:border-zinc-600',
              )}
            >
              {g.achieved && '✓'}
            </button>
            <span
              className={cn(
                'flex-1 truncate text-sm',
                g.achieved ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200',
              )}
            >
              {g.title}
            </span>
            <button
              type="button"
              onClick={() => onRemove(g.id)}
              className="shrink-0 text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-red-500"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="+ 목표 추가"
        className="w-full rounded-lg bg-zinc-50 px-2 py-1 text-sm outline-none dark:bg-zinc-800"
      />
    </div>
  )
}
