import { useState } from 'react'
import { Button } from '@shared/ui'
import type { GpaScale } from '@features/settings'
import { GRADE_SCALES, letterToPoint, summarize, type TrackGroup, type TrackItem } from '../tracker.types'

interface Props {
  group: TrackGroup
  items: TrackItem[]
  scale: GpaScale
  onAddItem: (input: { group: string; name: string; credits: number; point: number; letter: string }) => void
  onRemoveItem: (id: string) => void
  onRemoveGroup: (id: string) => void
}

export function GroupCard({ group, items, scale, onAddItem, onRemoveItem, onRemoveGroup }: Props) {
  const summary = summarize(items)
  const options = GRADE_SCALES[scale]
  const [name, setName] = useState('')
  const [credits, setCredits] = useState('3')
  const [letter, setLetter] = useState(options[0].letter)

  function add() {
    if (!name.trim()) return
    onAddItem({ group: group.id, name: name.trim(), credits: Number(credits) || 0, letter, point: letterToPoint(letter, scale) })
    setName('')
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-100">{group.name}</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">취득 {summary.credits}학점</span>
          <span className="font-semibold text-brand-600">평점 {summary.gpa.toFixed(2)}</span>
          <button type="button" onClick={() => onRemoveGroup(group.id)} className="text-zinc-300 hover:text-red-500">✕</button>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((it) => (
          <div key={it.id} className="group flex items-center gap-2 py-1.5 text-sm">
            <span className="flex-1 truncate text-zinc-700 dark:text-zinc-200">{it.name}</span>
            <span className="text-zinc-400">{it.credits}학점</span>
            <span className="w-8 text-right font-medium text-zinc-700 dark:text-zinc-200">{it.letter}</span>
            <button type="button" onClick={() => onRemoveItem(it.id)} className="text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-red-500">✕</button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="과목/항목"
          className="flex-1 rounded-lg bg-zinc-50 px-2 py-1 text-sm outline-none dark:bg-zinc-800"
        />
        <input
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          type="number"
          className="w-12 rounded-lg bg-zinc-50 px-2 py-1 text-center text-sm outline-none dark:bg-zinc-800"
        />
        <select
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          className="rounded-lg bg-zinc-50 px-1 text-sm outline-none dark:bg-zinc-800"
        >
          {options.map((g) => (
            <option key={g.letter} value={g.letter}>{g.letter}</option>
          ))}
        </select>
        <Button size="sm" onClick={add}>추가</Button>
      </div>
    </section>
  )
}
