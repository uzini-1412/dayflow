import { useState } from 'react'
import { Button, Input, SegmentedControl } from '@shared/ui'
import { useSettingsStore } from '@features/settings'
import { useTracker } from '../useTracker'
import { GroupCard } from '../components/GroupCard'

const SCALE_OPTIONS = [
  { value: '4.5' as const, label: '4.5' },
  { value: '4.3' as const, label: '4.3' },
  { value: '4.0' as const, label: '4.0' },
]

export function TrackerPage() {
  const { groups, itemsByGroup, overall, addGroup, removeGroup, addItem, removeItem } = useTracker()
  const scale = useSettingsStore((s) => s.settings.gpaScale)
  const setSetting = useSettingsStore((s) => s.set)
  const [groupName, setGroupName] = useState('')

  function add() {
    if (!groupName.trim()) return
    addGroup(groupName.trim())
    setGroupName('')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <div className="flex items-end justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">학습 플래너</h1>
        <div className="text-right">
          <p className="text-xs text-zinc-400">전체 평점 / 취득</p>
          <p className="text-lg font-bold text-brand-600">
            {overall.gpa.toFixed(2)}
            <span className="text-sm text-zinc-500"> / {scale} · {overall.credits}학점</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <span className="text-sm text-zinc-600 dark:text-zinc-300">평점 만점</span>
        <SegmentedControl value={scale} options={SCALE_OPTIONS} onChange={(v) => setSetting('gpaScale', v)} />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="학기/분기 추가 (예: 3학년 2학기)"
          />
        </div>
        <Button onClick={add}>추가</Button>
      </div>

      {groups.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">학기/분기를 추가해 시작하세요.</p>
      ) : (
        groups.map((g) => (
          <GroupCard
            key={g.id}
            group={g}
            items={itemsByGroup.get(g.id) ?? []}
            scale={scale}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onRemoveGroup={removeGroup}
          />
        ))
      )}
    </div>
  )
}
