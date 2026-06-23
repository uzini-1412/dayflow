import { pb } from '@shared/lib/pb'
import type { AppNotification, NotificationInput } from './notifications.types'

const COL = 'notifications'

export const notificationsApi = {
  async listRecent(limit = 30): Promise<AppNotification[]> {
    const res = await pb.collection(COL).getList<AppNotification>(1, limit, {
      sort: '-created',
    })
    return res.items
  },

  async create(input: NotificationInput): Promise<AppNotification> {
    return pb.collection(COL).create<AppNotification>({
      ...input,
      user: pb.authStore.record?.id,
      read: false,
    })
  },

  async markRead(id: string): Promise<void> {
    await pb.collection(COL).update(id, { read: true })
  },

  async markAllRead(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => pb.collection(COL).update(id, { read: true })))
  },

  async remove(id: string): Promise<void> {
    await pb.collection(COL).delete(id)
  },

  subscribe(cb: () => void): () => void {
    const p = pb.collection(COL).subscribe('*', cb)
    return () => void p.then((u) => u())
  },
}
