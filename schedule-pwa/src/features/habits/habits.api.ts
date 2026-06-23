import { pb } from '@shared/lib/pb'
import type { Habit, HabitInput, HabitLog } from './habits.types'

const me = () => pb.authStore.record?.id ?? ''

export const habitsApi = {
  async list(): Promise<Habit[]> {
    return pb.collection('habits').getFullList<Habit>({ filter: 'active = true', sort: 'created' })
  },

  async create(input: HabitInput): Promise<Habit> {
    return pb.collection('habits').create<Habit>({ ...input, user: me(), active: true })
  },

  async update(id: string, input: Partial<HabitInput>): Promise<Habit> {
    return pb.collection('habits').update<Habit>(id, input)
  },

  /** soft-archive */
  async archive(id: string): Promise<void> {
    await pb.collection('habits').update(id, { active: false })
  },

  async listLogs(fromKey: string, toKey: string): Promise<HabitLog[]> {
    return pb.collection('habit_logs').getFullList<HabitLog>({
      filter: `date >= "${fromKey}" && date <= "${toKey}"`,
    })
  },

  async addLog(habitId: string, dateKey: string): Promise<HabitLog> {
    return pb.collection('habit_logs').create<HabitLog>({ user: me(), habit: habitId, date: dateKey })
  },

  async removeLog(logId: string): Promise<void> {
    await pb.collection('habit_logs').delete(logId)
  },
}
