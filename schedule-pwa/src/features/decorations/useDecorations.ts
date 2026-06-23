import { useCallback, useEffect, useMemo, useState } from 'react'
import { decorationsApi } from './decorations.api'
import type { DayDecoration, DecorationInput } from './decorations.types'

/** 기간 내 날짜 꾸미기 맵 + upsert (달력 셀 렌더 + 편집 공용) */
export function useDecorations(fromKey: string, toKey: string) {
  const [items, setItems] = useState<DayDecoration[]>([])

  const load = useCallback(async () => {
    setItems(await decorationsApi.listRange(fromKey, toKey))
  }, [fromKey, toKey])

  useEffect(() => {
    load()
  }, [load])

  const byDate = useMemo(() => {
    const map = new Map<string, DayDecoration>()
    for (const d of items) map.set(d.date, d)
    return map
  }, [items])

  const save = useCallback(
    async (dateKey: string, input: DecorationInput) => {
      await decorationsApi.upsert(dateKey, input)
      await load()
    },
    [load],
  )

  return { byDate, save, reload: load }
}
