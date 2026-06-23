import { pb } from '@shared/lib/pb'
import type { Category } from './categories.types'

const COL = 'categories'

export const categoriesApi = {
  async list(): Promise<Category[]> {
    return pb.collection(COL).getFullList<Category>({ sort: 'created' })
  },

  async create(name: string, color: string): Promise<Category> {
    return pb.collection(COL).create<Category>({
      user: pb.authStore.record?.id,
      name,
      color,
    })
  },

  async remove(id: string): Promise<void> {
    await pb.collection(COL).delete(id)
  },
}
