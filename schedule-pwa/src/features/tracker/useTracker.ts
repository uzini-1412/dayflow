import { useCallback, useEffect, useMemo, useState } from 'react'
import { trackerApi } from './tracker.api'
import { summarize, type TrackGroup, type TrackItem } from './tracker.types'

export function useTracker() {
  const [groups, setGroups] = useState<TrackGroup[]>([])
  const [items, setItems] = useState<TrackItem[]>([])

  const load = useCallback(async () => {
    const [g, i] = await Promise.all([trackerApi.listGroups(), trackerApi.listItems()])
    setGroups(g)
    setItems(i)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const itemsByGroup = useMemo(() => {
    const map = new Map<string, TrackItem[]>()
    for (const it of items) {
      const arr = map.get(it.group) ?? []
      arr.push(it)
      map.set(it.group, arr)
    }
    return map
  }, [items])

  const overall = useMemo(() => summarize(items), [items])

  const addGroup = useCallback(
    async (name: string) => {
      await trackerApi.createGroup(name, groups.length)
      await load()
    },
    [groups.length, load],
  )

  const removeGroup = useCallback(async (id: string) => {
    await trackerApi.removeGroup(id)
    await load()
  }, [load])

  const addItem = useCallback(
    async (input: { group: string; name: string; credits: number; point: number; letter: string }) => {
      await trackerApi.createItem(input)
      await load()
    },
    [load],
  )

  const removeItem = useCallback(async (id: string) => {
    await trackerApi.removeItem(id)
    await load()
  }, [load])

  return { groups, itemsByGroup, overall, addGroup, removeGroup, addItem, removeItem }
}
