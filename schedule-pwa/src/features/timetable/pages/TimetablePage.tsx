import { format } from 'date-fns'
import { Button, Toggle } from '@shared/ui'
import {
  Fab,
  ScheduleFormModal,
  useScheduleEditor,
} from '@features/schedules'
import { useWeek } from '../useWeek'
import { WeekGrid } from '../components/WeekGrid'

export function TimetablePage() {
  const week = useWeek()
  const editor = useScheduleEditor()

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {format(week.days[0].date, 'M.d')} – {format(week.days[6].date, 'M.d')}
        </h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={week.prev} aria-label="이전 주">‹</Button>
          <Button variant="secondary" size="sm" onClick={week.today}>이번 주</Button>
          <Button variant="ghost" size="sm" onClick={week.next} aria-label="다음 주">›</Button>
        </div>
      </div>

      <label className="mb-3 flex items-center justify-end gap-2 text-sm text-zinc-500">
        반복(루틴)만 보기
        <Toggle checked={week.routineOnly} onChange={week.setRoutineOnly} />
      </label>

      <WeekGrid days={week.days} byDay={week.byDay} onSelect={editor.openEdit} />

      <Fab onClick={() => editor.openCreate()} />

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
