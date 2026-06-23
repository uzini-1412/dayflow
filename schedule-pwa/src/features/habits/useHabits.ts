import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDays, format, subDays } from 'date-fns'
import { habitsApi } from './habits.api'
import type { Habit, HabitInput, HabitLog } from './habits.types'

const key = (habitId: string, dateKey: string) => `${habitId}:${dateKey}`

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [today] = useState(() => new Date())

  const load = useCallback(async () => {
    const fromKey = format(subDays(today, 60), 'yyyy-MM-dd')
    const toKey = format(today, 'yyyy-MM-dd')
    const [h, l] = await Promise.all([habitsApi.list(), habitsApi.listLogs(fromKey, toKey)])
    setHabits(h)
    setLogs(l)
  }, [today])

  useEffect(() => {
    load()
  }, [load])

  const logMap = useMemo(() => {
    const m = new Map<string, string>() // key -> logId
    for (const lg of logs) m.set(key(lg.habit, lg.date), lg.id)
    return m
  }, [logs])

  const isDone = useCallback((habitId: string, dateKey: string) => logMap.has(key(habitId, dateKey)), [logMap])

  const toggle = useCallback(
    async (habitId: string, dateKey: string) => {
      const existing = logMap.get(key(habitId, dateKey))
      if (existing) await habitsApi.removeLog(existing)
      else await habitsApi.addLog(habitId, dateKey)
      await load()
    },
    [logMap, load],
  )

  /** 오늘부터 거슬러 올라가는 연속 수행일 */
  const streak = useCallback(
    (habitId: string) => {
      let count = 0
      let d = today
      while (logMap.has(key(habitId, format(d, 'yyyy-MM-dd')))) {
        count += 1
        d = subDays(d, 1)
      }
      return count
    },
    [logMap, today],
  )

  /** 최근 7일(과거→오늘) 날짜키 */
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => format(addDays(subDays(today, 6), i), 'yyyy-MM-dd')),
    [today],
  )

  const addHabit = useCallback(async (input: HabitInput) => {
    await habitsApi.create(input)
    await load()
  }, [load])

  const archiveHabit = useCallback(async (id: string) => {
    await habitsApi.archive(id)
    await load()
  }, [load])

  return { habits, weekDays, isDone, toggle, streak, addHabit, archiveHabit }
}
