import { useState } from 'react'
import { Modal, Button, Input } from '@shared/ui'
import { cn } from '@shared/lib/cn'
import type { ModalBaseProps } from '@shared/types/ui.types'
import { HABIT_COLORS, HABIT_EMOJIS, type HabitInput } from '../habits.types'

interface Props extends ModalBaseProps {
  onSave: (input: HabitInput) => void
}

export function HabitFormModal({ isOpen, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0])
  const [color, setColor] = useState(HABIT_COLORS[0])

  function save() {
    if (!name.trim()) return
    onSave({ name: name.trim(), emoji, color })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="새 습관"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={save}>추가</Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Input label="습관 이름" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 물 2L 마시기" autoFocus />
        <div>
          <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">아이콘</p>
          <div className="flex flex-wrap gap-1">
            {HABIT_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-lg', emoji === e ? 'bg-brand-100 dark:bg-zinc-700' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800')}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">색상</p>
          <div className="flex gap-1.5">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ background: c }}
                className={cn('h-7 w-7 rounded-full border-2', color === c ? 'border-zinc-800 dark:border-white' : 'border-transparent')}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
