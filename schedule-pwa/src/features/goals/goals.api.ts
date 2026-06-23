import { pb } from '@shared/lib/pb'
import type { Goal, GoalPeriod } from './goals.types'

const COL = 'goals'
const me = () => pb.authStore.record?.id ?? ''

export const goalsApi = {
  async listForKeys(keys: string[]): Promise<Goal[]> {
    const filter = keys.map((k) => `period_key = "${k}"`).join(' || ')
    return pb.collection(COL).getFullList<Goal>({ filter, sort: 'created' })
  },

  async create(title: string, period: GoalPeriod, periodKey: string): Promise<Goal> {
    return pb.collection(COL).create<Goal>({
      user: me(),
      title,
      period,
      period_key: periodKey,
      achieved: false,
    })
  },

  async toggleAchieved(id: string, achieved: boolean): Promise<void> {
    await pb.collection(COL).update(id, { achieved })
  },

  async remove(id: string): Promise<void> {
    await pb.collection(COL).delete(id)
  },
}
