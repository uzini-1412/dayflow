import { useState, type FormEvent } from 'react'
import { Modal, Button, Input, SegmentedControl, ConfirmDialog } from '@shared/ui'
import type { ModalBaseProps } from '@shared/types/ui.types'
import { useDisclosure } from '@shared/hooks/useDisclosure'
import { toInputDateTime, fromInputDateTime } from '@shared/lib/datetime'
import { CategorySelect } from '@features/categories'
import { useModuleEnabled } from '@features/settings'
import { ShareScheduleModal } from '@features/social'
import { ScheduleComments } from '@features/comments'
import { ProjectSelect } from '@features/projects'
import { SpaceSelect } from '@features/spaces'
import { useScheduleMutations } from '../hooks/useScheduleMutations'
import { RepeatPicker } from './RepeatPicker'
import { ScheduleChecklist } from '../checklist/ScheduleChecklist'
import { ScheduleAttachments } from './ScheduleAttachments'
import {
  IMPORTANCE_META,
  type Importance,
  type RepeatRule,
  type Schedule,
  type ScheduleInput,
} from '../schedules.types'

interface Props extends ModalBaseProps {
  /** 수정 대상(없으면 신규) */
  schedule?: Schedule | null
  /** 신규 시 기본 시작일 */
  defaultStart?: string
  onSaved?: () => void
}

const IMPORTANCE_OPTIONS = (Object.keys(IMPORTANCE_META) as Importance[]).map((k) => ({
  value: k,
  label: IMPORTANCE_META[k].label,
}))

export function ScheduleFormModal({ isOpen, onClose, schedule, defaultStart, onSaved }: Props) {
  const editing = !!schedule
  const { create, update, remove, isSaving } = useScheduleMutations()
  const shareModal = useDisclosure()
  const deleteConfirm = useDisclosure()

  const [title, setTitle] = useState(schedule?.title ?? '')
  const [start, setStart] = useState(
    toInputDateTime(schedule?.start_at ?? defaultStart ?? new Date().toISOString()),
  )
  const [end, setEnd] = useState(toInputDateTime(schedule?.end_at ?? ''))
  const [allDay, setAllDay] = useState(schedule?.all_day ?? false)
  const [importance, setImportance] = useState<Importance>(schedule?.importance ?? 'mid')
  const [location, setLocation] = useState(schedule?.location ?? '')
  const [description, setDescription] = useState(schedule?.description ?? '')
  const [repeatRule, setRepeatRule] = useState<RepeatRule | null>(schedule?.repeat_rule ?? null)
  const [category, setCategory] = useState(schedule?.category ?? '')
  const [color, setColor] = useState(schedule?.color ?? '')
  const [cost, setCost] = useState(schedule?.cost ? String(schedule.cost) : '')
  const [error, setError] = useState('')
  const [project, setProject] = useState(schedule?.project ?? '')
  const [space, setSpace] = useState(schedule?.space ?? '')
  const budgetOn = useModuleEnabled('budget')
  const friendsOn = useModuleEnabled('friends')
  const projectsOn = useModuleEnabled('projects')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('제목을 입력하세요.')
    setError('')

    const payload: ScheduleInput = {
      title: title.trim(),
      start_at: fromInputDateTime(start),
      end_at: end ? fromInputDateTime(end) : undefined,
      all_day: allDay,
      importance,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      repeat_rule: repeatRule,
      category: category || undefined,
      color: color || undefined,
      cost: budgetOn ? Number(cost) || 0 : undefined,
      project: projectsOn ? project || undefined : undefined,
      space: friendsOn ? space || undefined : undefined,
    }

    try {
      if (editing) await update(schedule!.id, payload)
      else await create(payload)
      onSaved?.()
      onClose()
    } catch {
      setError('저장에 실패했습니다.')
    }
  }

  async function onDelete() {
    if (!schedule) return
    await remove(schedule.id)
    onSaved?.()
    onClose()
  }

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? '일정 수정' : '일정 추가'}
      footer={
        <div className="flex items-center justify-between gap-2">
          {editing ? (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={shareModal.open}>
                👥 공유
              </Button>
              <Button variant="ghost" size="sm" onClick={deleteConfirm.open}>
                🗑 삭제
              </Button>
            </div>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" form="schedule-form" disabled={isSaving}>
              {isSaving ? '저장 중…' : '저장'}
            </Button>
          </div>
        </div>
      }
    >
      <form id="schedule-form" onSubmit={onSubmit} className="space-y-4">
        <Input
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 제목"
          autoFocus
        />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">종일</span>
          <SegmentedControl
            value={allDay ? 'on' : 'off'}
            options={[
              { value: 'off', label: '시간 지정' },
              { value: 'on', label: '종일' },
            ]}
            onChange={(v) => setAllDay(v === 'on')}
          />
        </div>

        <Input
          label="시작"
          type={allDay ? 'date' : 'datetime-local'}
          value={allDay ? start.slice(0, 10) : start}
          onChange={(e) => setStart(e.target.value)}
        />
        {!allDay && (
          <Input
            label="종료 (선택)"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        )}

        <div>
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            중요도
          </span>
          <SegmentedControl
            value={importance}
            options={IMPORTANCE_OPTIONS}
            onChange={setImportance}
          />
        </div>

        <Input
          label="장소 (선택)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="장소"
        />

        <div>
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            메모 (선택)
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="회의록, 여행 준비물, 메모…"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        {editing && <ScheduleChecklist scheduleId={schedule!.id} />}
        {editing && <ScheduleAttachments schedule={schedule!} />}
        {editing && friendsOn && <ScheduleComments scheduleId={schedule!.id} />}

        <CategorySelect
          value={category}
          onChange={(id, c) => {
            setCategory(id)
            if (c) setColor(c)
          }}
        />

        {budgetOn && (
          <Input
            label="비용 (선택)"
            type="number"
            inputMode="numeric"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="예: 15000"
          />
        )}

        {projectsOn && <ProjectSelect value={project} onChange={setProject} />}
        {friendsOn && <SpaceSelect value={space} onChange={setSpace} />}

        <RepeatPicker value={repeatRule} onChange={setRepeatRule} />

        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </Modal>

    {editing && shareModal.isOpen && (
      <ShareScheduleModal
        isOpen={shareModal.isOpen}
        onClose={shareModal.close}
        scheduleId={schedule?.id}
      />
    )}

    <ConfirmDialog
      isOpen={deleteConfirm.isOpen}
      onClose={deleteConfirm.close}
      title="일정을 삭제할까요?"
      message="이 작업은 되돌릴 수 없습니다."
      confirmText="삭제"
      danger
      onConfirm={onDelete}
    />
    </>
  )
}
