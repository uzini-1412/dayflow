import { pb } from '@shared/lib/pb'
import { SPACE_COLORS, type Space, type SpaceMember } from './spaces.types'

const me = () => pb.authStore.record?.id ?? ''

export const spacesApi = {
  /** 내가 소유하거나 참여 중인 스페이스 (규칙이 접근 제어) */
  async listMine(): Promise<Space[]> {
    return pb.collection('spaces').getFullList<Space>({ sort: '-created' })
  },

  async create(name: string, index: number): Promise<Space> {
    const space = await pb.collection('spaces').create<Space>({
      owner: me(),
      name,
      color: SPACE_COLORS[index % SPACE_COLORS.length],
    })
    await pb.collection('space_members').create({ space: space.id, user: me(), role: 'owner' })
    return space
  },

  async remove(id: string): Promise<void> {
    await pb.collection('spaces').delete(id)
  },

  async members(spaceId: string): Promise<SpaceMember[]> {
    return pb.collection('space_members').getFullList<SpaceMember>({
      filter: `space = "${spaceId}"`,
      expand: 'user',
      sort: 'created',
    })
  },

  async addMember(spaceId: string, userId: string): Promise<void> {
    await pb.collection('space_members').create({ space: spaceId, user: userId, role: 'member' })
  },

  async removeMember(memberId: string): Promise<void> {
    await pb.collection('space_members').delete(memberId)
  },
}
