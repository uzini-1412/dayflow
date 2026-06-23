import { pb } from '@shared/lib/pb'
import type { BaseRecord, UserRecord } from '@shared/types/pb.types'

export interface ScheduleComment extends BaseRecord {
  user: string
  schedule: string
  text: string
  expand?: { user?: UserRecord }
}

const COL = 'schedule_comments'
const me = () => pb.authStore.record?.id ?? ''

export const commentsApi = {
  async listBySchedule(scheduleId: string): Promise<ScheduleComment[]> {
    return pb.collection(COL).getFullList<ScheduleComment>({
      filter: `schedule = "${scheduleId}"`,
      sort: 'created',
      expand: 'user',
    })
  },

  async create(scheduleId: string, text: string): Promise<ScheduleComment> {
    return pb.collection(COL).create<ScheduleComment>({ user: me(), schedule: scheduleId, text })
  },

  async remove(id: string): Promise<void> {
    await pb.collection(COL).delete(id)
  },

  subscribe(cb: () => void): () => void {
    const p = pb.collection(COL).subscribe('*', cb)
    return () => void p.then((u) => u())
  },
}
