import { useCallback, useEffect, useMemo, useState } from 'react'
import { schedulesApi, type Schedule } from '@features/schedules'
import { projectsApi } from './projects.api'
import type { Project } from './projects.types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([projectsApi.list(), schedulesApi.listWithProjects()])
    setProjects(p)
    setSchedules(s)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const byProject = useMemo(() => {
    const m = new Map<string, Schedule[]>()
    for (const s of schedules) {
      const arr = m.get(s.project) ?? []
      arr.push(s)
      m.set(s.project, arr)
    }
    return m
  }, [schedules])

  const create = useCallback(async (name: string) => {
    await projectsApi.create(name, projects.length)
    await load()
  }, [projects.length, load])

  const remove = useCallback(async (id: string) => {
    await projectsApi.remove(id)
    await load()
  }, [load])

  return { projects, byProject, create, remove, reload: load }
}
