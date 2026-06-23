import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Modal, Input } from '@shared/ui'
import type { ModalBaseProps } from '@shared/types/ui.types'
import { schedulesApi } from '../schedules.api'
import { useScheduleEditor } from '../hooks/useScheduleEditor'
import { ScheduleFormModal } from './ScheduleFormModal'
import { IMPORTANCE_META, type Schedule } from '../schedules.types'

export function ScheduleSearchModal({ isOpen, onClose }: ModalBaseProps) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Schedule[]>([])
  const [searched, setSearched] = useState(false)
  const editor = useScheduleEditor()

  async function run() {
    setResults(await schedulesApi.search(q))
    setSearched(true)
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="일정 검색">
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run()}
          placeholder="제목으로 검색 후 Enter"
        />
        <div className="mt-3 space-y-1">
          {searched && results.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-400">검색 결과가 없습니다.</p>
          )}
          {results.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => editor.openEdit(s)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: s.color || IMPORTANCE_META[s.importance]?.color }}
              />
              <span className="flex-1 truncate text-sm text-zinc-800 dark:text-zinc-100">
                {s.title}
              </span>
              <span className="text-xs text-zinc-400">
                {format(parseISO(s.start_at), 'yyyy.M.d')}
              </span>
            </button>
          ))}
        </div>
      </Modal>

      {editor.isOpen && (
        <ScheduleFormModal
          isOpen={editor.isOpen}
          onClose={editor.close}
          schedule={editor.selected}
        />
      )}
    </>
  )
}
