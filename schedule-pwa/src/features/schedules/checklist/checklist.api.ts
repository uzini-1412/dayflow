import { pb } from '@shared/lib/pb'
import { offlineList, offlineCreate, offlineUpdate, offlineDelete } from '@shared/lib/offline'
import type { BaseRecord } from '@shared/types/pb.types'

export interface ChecklistItem extends BaseRecord {
  user: string
  schedule: string
  text: string
  done: boolean
  order: number
}

const COL = 'checklist_items'
const me = () => pb.authStore.record?.id ?? ''

export const checklistApi = {
  async listBySchedule(scheduleId: string): Promise<ChecklistItem[]> {
    return offlineList<ChecklistItem>(
      COL,
      () =>
        pb.collection(COL).getFullList<ChecklistItem>({
          filter: `schedule = "${scheduleId}"`,
          sort: 'order,created',
        }),
      {
        filter: (c) => c.schedule === scheduleId,
        sort: (a, b) => a.order - b.order || a.created.localeCompare(b.created),
      },
    )
  },

  async create(scheduleId: string, text: string, order: number): Promise<ChecklistItem> {
    return offlineCreate<ChecklistItem>(COL, {
      user: me(),
      schedule: scheduleId,
      text,
      done: false,
      order,
    })
  },

  async toggle(id: string, done: boolean): Promise<void> {
    await offlineUpdate<ChecklistItem>(COL, id, { done })
  },

  async remove(id: string): Promise<void> {
    await offlineDelete(COL, id)
  },
}
