import { pb } from '@shared/lib/pb'
import { offlineList, offlineCreate, offlineUpdate, offlineDelete } from '@shared/lib/offline'
import type { Memo, MemoInput } from './memos.types'

const COL = 'memos'

/** 핀 고정 우선, 그다음 최근 수정순 (서버 sort '-pinned,-updated' 와 동등) */
function byPinnedUpdated(a: Memo, b: Memo): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
  return b.updated.localeCompare(a.updated)
}

export const memosApi = {
  async list(): Promise<Memo[]> {
    return offlineList<Memo>(COL, () => pb.collection(COL).getFullList<Memo>({ sort: '-pinned,-updated' }), {
      sort: byPinnedUpdated,
    })
  },

  async create(input: MemoInput): Promise<Memo> {
    return offlineCreate<Memo>(COL, { ...input, user: pb.authStore.record?.id })
  },

  async update(id: string, input: MemoInput): Promise<Memo> {
    return offlineUpdate<Memo>(COL, id, input as Record<string, unknown>)
  },

  async remove(id: string): Promise<void> {
    await offlineDelete(COL, id)
  },
}
