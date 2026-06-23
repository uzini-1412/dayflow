import { useCallback, useEffect, useState } from 'react'
import { shareApi } from '../share.api'
import type { ScheduleShare, SharePermission } from '../social.types'

/** 특정 일정의 공유 상태 관리 */
export function useScheduleShares(scheduleId: string | undefined) {
  const [shares, setShares] = useState<ScheduleShare[]>([])

  const load = useCallback(async () => {
    if (!scheduleId) return setShares([])
    setShares(await shareApi.listForSchedule(scheduleId))
  }, [scheduleId])

  useEffect(() => {
    load()
  }, [load])

  const share = useCallback(
    async (friendId: string, permission: SharePermission) => {
      if (!scheduleId) return
      await shareApi.share(scheduleId, friendId, permission)
      await load()
    },
    [scheduleId, load],
  )

  const unshare = useCallback(
    async (shareId: string) => {
      await shareApi.unshare(shareId)
      await load()
    },
    [load],
  )

  return { shares, share, unshare, reload: load }
}
