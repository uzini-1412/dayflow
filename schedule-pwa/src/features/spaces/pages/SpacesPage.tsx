import { useState } from 'react'
import { Button, Input } from '@shared/ui'
import { useDisclosure } from '@shared/hooks/useDisclosure'
import { useSpaces } from '../useSpaces'
import { SpaceDetailModal } from '../components/SpaceDetailModal'
import type { Space } from '../spaces.types'

export function SpacesPage() {
  const { spaces, create, remove } = useSpaces()
  const [name, setName] = useState('')
  const detail = useDisclosure()
  const [selected, setSelected] = useState<Space | null>(null)

  function add() {
    if (!name.trim()) return
    create(name.trim())
    setName('')
  }

  function open(space: Space) {
    setSelected(space)
    detail.open()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">스페이스</h1>
      <p className="text-sm text-zinc-500">팀·커플·가족과 일정을 함께 보는 공유 캘린더예요.</p>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="스페이스 만들기 (예: 우리 가족)"
          />
        </div>
        <Button onClick={add}>생성</Button>
      </div>

      {spaces.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">아직 스페이스가 없어요.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {spaces.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => open(s)}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-left dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="h-8 w-8 rounded-lg" style={{ background: s.color }} />
              <span className="font-medium text-zinc-800 dark:text-zinc-100">{s.name}</span>
            </button>
          ))}
        </div>
      )}

      {detail.isOpen && selected && (
        <SpaceDetailModal
          isOpen={detail.isOpen}
          onClose={detail.close}
          space={selected}
          onDeleted={() => remove(selected.id)}
        />
      )}
    </div>
  )
}
