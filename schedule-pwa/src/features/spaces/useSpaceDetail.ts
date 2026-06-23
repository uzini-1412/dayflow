import { useCallback, useEffect, useState } from 'react'
import { schedulesApi, type Schedule } from '@features/schedules'
import { spacesApi } from './spaces.api'
import type { SpaceMember } from './spaces.types'

/** 스페이스 상세: 멤버 + 일정 + 멤버 관리 */
export function useSpaceDetail(spaceId: string | undefined) {
  const [members, setMembers] = useState<SpaceMember[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])

  const load = useCallback(async () => {
    if (!spaceId) return
    const [m, s] = await Promise.all([spacesApi.members(spaceId), schedulesApi.listBySpace(spaceId)])
    setMembers(m)
    setSchedules(s)
  }, [spaceId])

  useEffect(() => {
    load()
  }, [load])

  const addMember = useCallback(
    async (userId: string) => {
      if (!spaceId) return
      await spacesApi.addMember(spaceId, userId)
      await load()
    },
    [spaceId, load],
  )

  const removeMember = useCallback(
    async (memberId: string) => {
      await spacesApi.removeMember(memberId)
      await load()
    },
    [load],
  )

  return { members, schedules, addMember, removeMember, reload: load }
}
