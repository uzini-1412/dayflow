import { pb } from '@shared/lib/pb'
import { offlineList, offlineCreate, offlineUpdate, offlineDelete } from '@shared/lib/offline'
import type { Goal, GoalPeriod } from './goals.types'

const COL = 'goals'
const me = () => pb.authStore.record?.id ?? ''

export const goalsApi = {
  async listForKeys(keys: string[]): Promise<Goal[]> {
    const filter = keys.map((k) => `period_key = "${k}"`).join(' || ')
    return offlineList<Goal>(
      COL,
      () => pb.collection(COL).getFullList<Goal>({ filter, sort: 'created' }),
      { filter: (g) => keys.includes(g.period_key), sort: (a, b) => a.created.localeCompare(b.created) },
    )
  },

  async create(title: string, period: GoalPeriod, periodKey: string): Promise<Goal> {
    return offlineCreate<Goal>(COL, {
      user: me(),
      title,
      period,
      period_key: periodKey,
      achieved: false,
    })
  },

  async toggleAchieved(id: string, achieved: boolean): Promise<void> {
    await offlineUpdate<Goal>(COL, id, { achieved })
  },

  async remove(id: string): Promise<void> {
    await offlineDelete(COL, id)
  },
}
