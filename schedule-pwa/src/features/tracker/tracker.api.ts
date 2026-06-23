import { pb } from '@shared/lib/pb'
import type { TrackGroup, TrackItem } from './tracker.types'

const me = () => pb.authStore.record?.id ?? ''

export const trackerApi = {
  async listGroups(): Promise<TrackGroup[]> {
    return pb.collection('track_groups').getFullList<TrackGroup>({ sort: 'order,created' })
  },

  async createGroup(name: string, order: number): Promise<TrackGroup> {
    return pb.collection('track_groups').create<TrackGroup>({ user: me(), name, order })
  },

  async removeGroup(id: string): Promise<void> {
    await pb.collection('track_groups').delete(id)
  },

  async listItems(): Promise<TrackItem[]> {
    return pb.collection('track_items').getFullList<TrackItem>({ sort: 'created' })
  },

  async createItem(input: Omit<TrackItem, keyof import('@shared/types/pb.types').BaseRecord | 'user'>): Promise<TrackItem> {
    return pb.collection('track_items').create<TrackItem>({ ...input, user: me() })
  },

  async removeItem(id: string): Promise<void> {
    await pb.collection('track_items').delete(id)
  },
}
