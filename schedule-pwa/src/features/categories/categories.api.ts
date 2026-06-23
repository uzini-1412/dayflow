import { pb } from '@shared/lib/pb'
import { offlineList, offlineCreate, offlineDelete } from '@shared/lib/offline'
import type { Category } from './categories.types'

const COL = 'categories'
const byCreated = (a: Category, b: Category) => a.created.localeCompare(b.created)

export const categoriesApi = {
  async list(): Promise<Category[]> {
    return offlineList<Category>(COL, () => pb.collection(COL).getFullList<Category>({ sort: 'created' }), {
      sort: byCreated,
    })
  },

  async create(name: string, color: string): Promise<Category> {
    return offlineCreate<Category>(COL, { user: pb.authStore.record?.id, name, color })
  },

  async remove(id: string): Promise<void> {
    await offlineDelete(COL, id)
  },
}
