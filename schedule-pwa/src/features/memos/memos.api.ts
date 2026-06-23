import { pb } from '@shared/lib/pb'
import type { Memo, MemoInput } from './memos.types'

const COL = 'memos'

export const memosApi = {
  async list(): Promise<Memo[]> {
    return pb.collection(COL).getFullList<Memo>({ sort: '-pinned,-updated' })
  },

  async create(input: MemoInput): Promise<Memo> {
    return pb.collection(COL).create<Memo>({ ...input, user: pb.authStore.record?.id })
  },

  async update(id: string, input: MemoInput): Promise<Memo> {
    return pb.collection(COL).update<Memo>(id, input)
  },

  async remove(id: string): Promise<void> {
    await pb.collection(COL).delete(id)
  },
}
