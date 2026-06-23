import { pb } from '@shared/lib/pb'
import { offlineList, offlineCreate, offlineUpdate, offlineDelete } from '@shared/lib/offline'
import type { Habit, HabitInput, HabitLog } from './habits.types'

const HABITS = 'habits'
const LOGS = 'habit_logs'
const me = () => pb.authStore.record?.id ?? ''

export const habitsApi = {
  async list(): Promise<Habit[]> {
    return offlineList<Habit>(
      HABITS,
      () => pb.collection(HABITS).getFullList<Habit>({ filter: 'active = true', sort: 'created' }),
      { filter: (h) => h.active, sort: (a, b) => a.created.localeCompare(b.created) },
    )
  },

  async create(input: HabitInput): Promise<Habit> {
    return offlineCreate<Habit>(HABITS, { ...input, user: me(), active: true })
  },

  async update(id: string, input: Partial<HabitInput>): Promise<Habit> {
    return offlineUpdate<Habit>(HABITS, id, input as Record<string, unknown>)
  },

  /** soft-archive */
  async archive(id: string): Promise<void> {
    await offlineUpdate<Habit>(HABITS, id, { active: false })
  },

  async listLogs(fromKey: string, toKey: string): Promise<HabitLog[]> {
    return offlineList<HabitLog>(
      LOGS,
      () =>
        pb.collection(LOGS).getFullList<HabitLog>({
          filter: `date >= "${fromKey}" && date <= "${toKey}"`,
        }),
      { filter: (l) => l.date >= fromKey && l.date <= toKey },
    )
  },

  async addLog(habitId: string, dateKey: string): Promise<HabitLog> {
    return offlineCreate<HabitLog>(LOGS, { user: me(), habit: habitId, date: dateKey })
  },

  async removeLog(logId: string): Promise<void> {
    await offlineDelete(LOGS, logId)
  },
}
