import { pb } from '@shared/lib/pb'
import type { DayDecoration, DecorationInput } from './decorations.types'

const COL = 'day_decorations'
const me = () => pb.authStore.record?.id ?? ''

export const decorationsApi = {
  /** 기간(yyyy-MM-dd ~) 의 꾸미기 전체 */
  async listRange(fromKey: string, toKey: string): Promise<DayDecoration[]> {
    return pb.collection(COL).getFullList<DayDecoration>({
      filter: `date >= "${fromKey}" && date <= "${toKey}"`,
    })
  },

  async getByDate(dateKey: string): Promise<DayDecoration | null> {
    try {
      return await pb.collection(COL).getFirstListItem<DayDecoration>(`date = "${dateKey}"`)
    } catch {
      return null
    }
  },

  /** 해당 날짜 꾸미기 생성/수정(upsert) */
  async upsert(dateKey: string, input: DecorationInput): Promise<DayDecoration> {
    const existing = await this.getByDate(dateKey)
    if (existing) {
      return pb.collection(COL).update<DayDecoration>(existing.id, input)
    }
    return pb.collection(COL).create<DayDecoration>({ user: me(), date: dateKey, ...input })
  },
}
