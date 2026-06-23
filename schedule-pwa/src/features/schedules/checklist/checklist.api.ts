import { pb } from '@shared/lib/pb'
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
    return pb.collection(COL).getFullList<ChecklistItem>({
      filter: `schedule = "${scheduleId}"`,
      sort: 'order,created',
    })
  },

  async create(scheduleId: string, text: string, order: number): Promise<ChecklistItem> {
    return pb.collection(COL).create<ChecklistItem>({
      user: me(),
      schedule: scheduleId,
      text,
      done: false,
      order,
    })
  },

  async toggle(id: string, done: boolean): Promise<void> {
    await pb.collection(COL).update(id, { done })
  },

  async remove(id: string): Promise<void> {
    await pb.collection(COL).delete(id)
  },
}
