import { pb } from '@shared/lib/pb'
import { offlineList, offlineCreate, offlineDelete } from '@shared/lib/offline'
import type { BaseRecord } from '@shared/types/pb.types'
import type { TrackGroup, TrackItem } from './tracker.types'

const GROUPS = 'track_groups'
const ITEMS = 'track_items'
const me = () => pb.authStore.record?.id ?? ''

export const trackerApi = {
  async listGroups(): Promise<TrackGroup[]> {
    return offlineList<TrackGroup>(
      GROUPS,
      () => pb.collection(GROUPS).getFullList<TrackGroup>({ sort: 'order,created' }),
      { sort: (a, b) => a.order - b.order || a.created.localeCompare(b.created) },
    )
  },

  async createGroup(name: string, order: number): Promise<TrackGroup> {
    return offlineCreate<TrackGroup>(GROUPS, { user: me(), name, order })
  },

  async removeGroup(id: string): Promise<void> {
    await offlineDelete(GROUPS, id)
  },

  async listItems(): Promise<TrackItem[]> {
    return offlineList<TrackItem>(ITEMS, () => pb.collection(ITEMS).getFullList<TrackItem>({ sort: 'created' }), {
      sort: (a, b) => a.created.localeCompare(b.created),
    })
  },

  async createItem(input: Omit<TrackItem, keyof BaseRecord | 'user'>): Promise<TrackItem> {
    return offlineCreate<TrackItem>(ITEMS, { ...input, user: me() })
  },

  async removeItem(id: string): Promise<void> {
    await offlineDelete(ITEMS, id)
  },
}
