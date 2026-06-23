import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { goalsApi } from './goals.api'
import type { Goal, GoalPeriod } from './goals.types'

/** 해당 월/연 목표 관리 */
export function useGoals(month: Date) {
  const monthKey = format(month, 'yyyy-MM')
  const yearKey = format(month, 'yyyy')
  const [goals, setGoals] = useState<Goal[]>([])

  const load = useCallback(async () => {
    setGoals(await goalsApi.listForKeys([monthKey, yearKey]))
  }, [monthKey, yearKey])

  useEffect(() => {
    load()
  }, [load])

  const monthGoals = useMemo(() => goals.filter((g) => g.period === 'month'), [goals])
  const yearGoals = useMemo(() => goals.filter((g) => g.period === 'year'), [goals])

  const add = useCallback(
    async (title: string, period: GoalPeriod) => {
      await goalsApi.create(title, period, period === 'month' ? monthKey : yearKey)
      await load()
    },
    [monthKey, yearKey, load],
  )

  const toggle = useCallback(
    async (g: Goal) => {
      await goalsApi.toggleAchieved(g.id, !g.achieved)
      await load()
    },
    [load],
  )

  const remove = useCallback(
    async (id: string) => {
      await goalsApi.remove(id)
      await load()
    },
    [load],
  )

  return { monthGoals, yearGoals, add, toggle, remove }
}
