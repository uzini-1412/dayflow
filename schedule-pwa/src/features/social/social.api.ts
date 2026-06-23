import { pb } from '@shared/lib/pb'
import type { UserRecord } from '@shared/types/pb.types'
import type { Friend, Friendship } from './social.types'

const COL = 'friendships'
const me = () => pb.authStore.record?.id ?? ''

function toFriend(f: Friendship): Friend {
  const incoming = f.addressee === me()
  const other = incoming ? f.expand?.requester : f.expand?.addressee
  return {
    friendshipId: f.id,
    user: other as UserRecord,
    status: f.status,
    incoming,
  }
}

export const socialApi = {
  /** 닉네임으로 사용자 검색 (본인 제외) */
  async searchUsers(nickname: string): Promise<UserRecord[]> {
    if (!nickname.trim()) return []
    const res = await pb.collection('users').getList<UserRecord>(1, 10, {
      filter: `nickname ~ "${nickname}" && id != "${me()}"`,
    })
    return res.items
  },

  async sendRequest(addresseeId: string): Promise<void> {
    await pb.collection(COL).create({
      requester: me(),
      addressee: addresseeId,
      status: 'pending',
    })
  },

  /** 내 친구 관계 전체 (수락+대기) */
  async listFriendships(): Promise<Friend[]> {
    const items = await pb.collection(COL).getFullList<Friendship>({
      filter: `requester = "${me()}" || addressee = "${me()}"`,
      expand: 'requester,addressee',
      sort: '-created',
    })
    return items.map(toFriend)
  },

  async accept(friendshipId: string): Promise<void> {
    await pb.collection(COL).update(friendshipId, { status: 'accepted' })
  },

  async remove(friendshipId: string): Promise<void> {
    await pb.collection(COL).delete(friendshipId)
  },

  subscribe(cb: () => void): () => void {
    const p = pb.collection(COL).subscribe('*', cb)
    return () => void p.then((u) => u())
  },
}
