import { pb } from '@shared/lib/pb'
import type { ScheduleShare, SharePermission } from './social.types'

const COL = 'schedule_shares'
const me = () => pb.authStore.record?.id ?? ''

/** 일정 공유 호출 모음 */
export const shareApi = {
  async share(scheduleId: string, friendId: string, permission: SharePermission): Promise<void> {
    await pb.collection(COL).create({
      schedule: scheduleId,
      owner: me(),
      shared_with: friendId,
      permission,
    })
  },

  /** 특정 일정의 공유 대상 목록 */
  async listForSchedule(scheduleId: string): Promise<ScheduleShare[]> {
    return pb.collection(COL).getFullList<ScheduleShare>({
      filter: `schedule = "${scheduleId}"`,
      expand: 'shared_with',
    })
  },

  async unshare(shareId: string): Promise<void> {
    await pb.collection(COL).delete(shareId)
  },
}
