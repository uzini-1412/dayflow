import { useState } from 'react'
import { Modal, Button, Input, Toggle, ConfirmDialog } from '@shared/ui'
import { useDisclosure } from '@shared/hooks/useDisclosure'
import { cn } from '@shared/lib/cn'
import type { ModalBaseProps } from '@shared/types/ui.types'
import { MEMO_COLORS, type Memo, type MemoInput } from '../memos.types'

interface Props extends ModalBaseProps {
  memo: Memo | null
  onSave: (input: MemoInput) => void
  onDelete?: (id: string) => void
}

export function MemoEditModal({ isOpen, onClose, memo, onSave, onDelete }: Props) {
  const editing = !!memo
  const [title, setTitle] = useState(memo?.title ?? '')
  const [content, setContent] = useState(memo?.content ?? '')
  const [color, setColor] = useState(memo?.color ?? MEMO_COLORS[0])
  const [pinned, setPinned] = useState(memo?.pinned ?? false)
  const deleteConfirm = useDisclosure()

  function save() {
    onSave({ title: title.trim(), content, color, pinned })
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editing ? '메모 수정' : '새 메모'}
        footer={
          <div className="flex items-center justify-between">
            {editing && onDelete ? (
              <Button variant="ghost" size="sm" onClick={deleteConfirm.open}>
                🗑 삭제
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                취소
              </Button>
              <Button onClick={save}>저장</Button>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          <Input label="제목" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목" />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용"
            rows={6}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {MEMO_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ background: c }}
                  className={cn(
                    'h-7 w-7 rounded-full border',
                    color === c ? 'border-brand-500 ring-2 ring-brand-200' : 'border-zinc-300',
                  )}
                />
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              📌 고정
              <Toggle checked={pinned} onChange={setPinned} />
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={deleteConfirm.close}
        title="메모를 삭제할까요?"
        confirmText="삭제"
        danger
        onConfirm={() => {
          if (memo && onDelete) onDelete(memo.id)
          onClose()
        }}
      />
    </>
  )
}
