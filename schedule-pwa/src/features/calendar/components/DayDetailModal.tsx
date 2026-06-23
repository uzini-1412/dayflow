import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Modal, Button } from '@shared/ui'
import type { ModalBaseProps } from '@shared/types/ui.types'
import { ScheduleItem, type Schedule } from '@features/schedules'
import { DecorationEditor, type DayDecoration } from '@features/decorations'
import type { DecorationInput } from '@features/decorations/decorations.types'

interface Props extends ModalBaseProps {
  date: Date | null
  schedules: Schedule[]
  decoration?: DayDecoration
  onAdd: () => void
  onEdit: (s: Schedule) => void
  onToggle: (s: Schedule) => void
  onDelete: (s: Schedule) => void
  onDecorationChange: (input: DecorationInput) => void
}

export function DayDetailModal({
  isOpen,
  onClose,
  date,
  schedules,
  decoration,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
  onDecorationChange,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={date ? format(date, 'M월 d일 (E)', { locale: ko }) : ''}
      footer={
        <Button fullWidth onClick={onAdd}>
          + 이 날에 일정 추가
        </Button>
      }
    >
      {schedules.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">일정이 없습니다.</p>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {schedules.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <div className="flex-1">
                <ScheduleItem schedule={s} onToggle={onToggle} onClick={onEdit} />
              </div>
              <button
                type="button"
                onClick={() => onDelete(s)}
                aria-label="삭제"
                className="shrink-0 rounded p-1 text-zinc-300 hover:text-red-500"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold text-zinc-400">꾸미기</p>
        <DecorationEditor decoration={decoration} onChange={onDecorationChange} />
      </div>
    </Modal>
  )
}
