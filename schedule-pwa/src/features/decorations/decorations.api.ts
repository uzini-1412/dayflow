import { pb } from '@shared/lib/pb'
import { isOnline, offlineList, offlineCreate, offlineUpdate, cacheUpsert, cacheGetAll } from '@shared/lib/offline'
import type { DayDecoration, DecorationInput } from './decorations.types'

const COL = 'day_decorations'
const me = () => pb.authStore.record?.id ?? ''

export const decorationsApi = {
  /** 기간(yyyy-MM-dd ~) 의 꾸미기 전체 */
  async listRange(fromKey: string, toKey: string): Promise<DayDecoration[]> {
    return offlineList<DayDecoration>(
      COL,
      () =>
        pb.collection(COL).getFullList<DayDecoration>({
          filter: `date >= "${fromKey}" && date <= "${toKey}"`,
        }),
      { filter: (d) => d.date >= fromKey && d.date <= toKey },
    )
  },

  async getByDate(dateKey: string): Promise<DayDecoration | null> {
    if (isOnline()) {
      try {
        const found = await pb.collection(COL).getFirstListItem<DayDecoration>(`date = "${dateKey}"`)
        await cacheUpsert(COL, found)
        return found
      } catch {
        if (isOnline()) return null // 404 등 — 온라인이면 진짜 없음
      }
    }
    // 오프라인: 캐시에서 날짜 매칭
    const all = await cacheGetAll<DayDecoration>(COL)
    return all.find((d) => d.date === dateKey) ?? null
  },

  /** 해당 날짜 꾸미기 생성/수정(upsert) */
  async upsert(dateKey: string, input: DecorationInput): Promise<DayDecoration> {
    const existing = await this.getByDate(dateKey)
    if (existing) {
      return offlineUpdate<DayDecoration>(COL, existing.id, input as Record<string, unknown>)
    }
    return offlineCreate<DayDecoration>(COL, { user: me(), date: dateKey, ...input })
  },
}
