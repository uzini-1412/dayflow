import { pb } from '@shared/lib/pb'
import { PROJECT_COLORS, type Project } from './projects.types'

const me = () => pb.authStore.record?.id ?? ''

export const projectsApi = {
  async list(): Promise<Project[]> {
    return pb.collection('projects').getFullList<Project>({ filter: 'archived != true', sort: '-created' })
  },

  async create(name: string, index: number): Promise<Project> {
    return pb.collection('projects').create<Project>({
      user: me(),
      name,
      color: PROJECT_COLORS[index % PROJECT_COLORS.length],
      archived: false,
    })
  },

  async remove(id: string): Promise<void> {
    await pb.collection('projects').delete(id)
  },
}
