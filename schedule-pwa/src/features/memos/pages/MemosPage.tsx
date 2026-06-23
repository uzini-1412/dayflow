import { useState } from 'react'
import { useDisclosure } from '@shared/hooks/useDisclosure'
import { Fab } from '@features/schedules'
import { useMemos } from '../useMemos'
import { MemoCard } from '../components/MemoCard'
import { MemoEditModal } from '../components/MemoEditModal'
import type { Memo, MemoInput } from '../memos.types'

export function MemosPage() {
  const { memos, isLoading, create, update, remove } = useMemos()
  const modal = useDisclosure()
  const [selected, setSelected] = useState<Memo | null>(null)

  function openCreate() {
    setSelected(null)
    modal.open()
  }
  function openEdit(memo: Memo) {
    setSelected(memo)
    modal.open()
  }
  function onSave(input: MemoInput) {
    if (selected) update(selected.id, input)
    else create(input)
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">메모</h1>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-zinc-400">불러오는 중…</p>
      ) : memos.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">메모가 없습니다. + 로 추가하세요.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {memos.map((m) => (
            <MemoCard key={m.id} memo={m} onClick={openEdit} />
          ))}
        </div>
      )}

      <Fab onClick={openCreate} />

      {modal.isOpen && (
        <MemoEditModal
          isOpen={modal.isOpen}
          onClose={modal.close}
          memo={selected}
          onSave={onSave}
          onDelete={remove}
        />
      )}
    </div>
  )
}
