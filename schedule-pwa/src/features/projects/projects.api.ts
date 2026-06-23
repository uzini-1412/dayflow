import { pb } from '@shared/lib/pb'
import { offlineList, offlineCreate, offlineDelete } from '@shared/lib/offline'
import { PROJECT_COLORS, type Project } from './projects.types'

const COL = 'projects'
const me = () => pb.authStore.record?.id ?? ''

export const projectsApi = {
  async list(): Promise<Project[]> {
    return offlineList<Project>(
      COL,
      () => pb.collection(COL).getFullList<Project>({ filter: 'archived != true', sort: '-created' }),
      { filter: (p) => !p.archived, sort: (a, b) => b.created.localeCompare(a.created) },
    )
  },

  async create(name: string, index: number): Promise<Project> {
    return offlineCreate<Project>(COL, {
      user: me(),
      name,
      color: PROJECT_COLORS[index % PROJECT_COLORS.length],
      archived: false,
    })
  },

  async remove(id: string): Promise<void> {
    await offlineDelete(COL, id)
  },
}
