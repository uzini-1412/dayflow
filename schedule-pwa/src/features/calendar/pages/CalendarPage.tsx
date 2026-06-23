import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useDisclosure } from '@shared/hooks/useDisclosure'
import { ConfirmDialog } from '@shared/ui'
import { useSettingsStore } from '@features/settings'
import type { Schedule } from '@features/schedules'
import {
  Fab,
  ScheduleFormModal,
  useScheduleEditor,
  useScheduleMutations,
} from '@features/schedules'
import { useDecorations } from '@features/decorations'
import { GoalStrip } from '@features/goals'
import { useCalendarMonth } from '../hooks/useCalendarMonth'
import { weekdayLabels, type CalendarDay } from '../calendar.utils'
import { CalendarHeader } from '../components/CalendarHeader'
import { CalendarGrid } from '../components/CalendarGrid'
import { DayDetailModal } from '../components/DayDetailModal'

export function CalendarPage() {
  const weekStart = useSettingsStore((s) => s.settings.weekStart)
  const cal = useCalendarMonth()
  const editor = useScheduleEditor()
  const { toggleComplete, remove } = useScheduleMutations()

  const dayModal = useDisclosure()
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null)
  const weekdays = useMemo(() => weekdayLabels(weekStart), [weekStart])

  const firstKey = cal.weeks[0]?.[0]?.key ?? ''
  const lastKey = cal.weeks.at(-1)?.at(-1)?.key ?? ''
  const { byDate: decoByDate, save: saveDeco } = useDecorations(firstKey, lastKey)

  const dayKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : ''
  const daySchedules = cal.byDay.get(dayKey) ?? []

  function onSelectDay(day: CalendarDay) {
    setSelectedDay(day.date)
    dayModal.open()
  }

  function onAddForDay() {
    dayModal.close()
    const start = new Date(selectedDay ?? new Date())
    start.setHours(9, 0, 0, 0)
    editor.openCreate(start.toISOString())
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <CalendarHeader month={cal.month} onPrev={cal.prev} onNext={cal.next} onToday={cal.today} />
      <GoalStrip month={cal.month} />
      <CalendarGrid
        weeks={cal.weeks}
        weekdays={weekdays}
        byDay={cal.byDay}
        decoByDate={decoByDate}
        onSelectDay={onSelectDay}
      />

      <Fab onClick={() => editor.openCreate()} />

      <DayDetailModal
        isOpen={dayModal.isOpen}
        onClose={dayModal.close}
        date={selectedDay}
        schedules={daySchedules}
        decoration={dayKey ? decoByDate.get(dayKey) : undefined}
        onDecorationChange={(input) => dayKey && saveDeco(dayKey, input)}
        onAdd={onAddForDay}
        onEdit={(s) => {
          dayModal.close()
          editor.openEdit(s)
        }}
        onToggle={(s) => toggleComplete(s.id, !s.completed)}
        onDelete={(s) => setDeleteTarget(s)}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="일정을 삭제할까요?"
        message={deleteTarget?.title}
        confirmText="삭제"
        danger
        onConfirm={() => deleteTarget && remove(deleteTarget.id)}
      />

      {editor.isOpen && (
        <ScheduleFormModal
          isOpen={editor.isOpen}
          onClose={editor.close}
          schedule={editor.selected}
          defaultStart={editor.defaultStart}
        />
      )}
    </div>
  )
}
