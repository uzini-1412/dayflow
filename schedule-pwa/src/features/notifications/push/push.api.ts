import { pb } from '@shared/lib/pb'

const COL = 'push_subscriptions'

/** Web Push 구독 정보를 서버에 저장/삭제 */
export const pushApi = {
  async save(sub: PushSubscription): Promise<void> {
    const json = sub.toJSON()
    await pb.collection(COL).create({
      user: pb.authStore.record?.id,
      endpoint: sub.endpoint,
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
      user_agent: navigator.userAgent.slice(0, 300),
    })
  },

  async removeByEndpoint(endpoint: string): Promise<void> {
    try {
      const rec = await pb.collection(COL).getFirstListItem(`endpoint="${endpoint}"`)
      await pb.collection(COL).delete(rec.id)
    } catch {
      // 없으면 무시
    }
  },
}
