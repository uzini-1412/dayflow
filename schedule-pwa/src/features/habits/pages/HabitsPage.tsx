import { useDisclosure } from '@shared/hooks/useDisclosure'
import { Fab } from '@features/schedules'
import { useHabits } from '../useHabits'
import { HabitRow } from '../components/HabitRow'
import { HabitFormModal } from '../components/HabitFormModal'

export function HabitsPage() {
  const { habits, weekDays, isDone, toggle, streak, addHabit, archiveHabit } = useHabits()
  const modal = useDisclosure()

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">습관</h1>

      {habits.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">
          매일 반복할 습관을 + 로 추가해보세요.
        </p>
      ) : (
        <div className="space-y-3">
          {habits.map((h) => (
            <HabitRow
              key={h.id}
              habit={h}
              weekDays={weekDays}
              isDone={isDone}
              onToggle={toggle}
              streak={streak(h.id)}
              onArchive={archiveHabit}
            />
          ))}
        </div>
      )}

      <Fab onClick={modal.open} />
      {modal.isOpen && <HabitFormModal isOpen={modal.isOpen} onClose={modal.close} onSave={addHabit} />}
    </div>
  )
}
