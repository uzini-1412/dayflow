import { useCallback, useState } from 'react'
import { toast } from '@shared/ui'
import { schedulesApi } from '../schedules.api'
import type { ScheduleInput } from '../schedules.types'

/** 일정 생성/수정/삭제/완료토글 (제출 상태 + 성공 토스트) */
export function useScheduleMutations() {
  const [isSaving, setIsSaving] = useState(false)

  const create = useCallback(async (input: ScheduleInput) => {
    setIsSaving(true)
    try {
      const res = await schedulesApi.create(input)
      toast.push({ icon: '✅', title: '일정이 저장되었어요' })
      return res
    } finally {
      setIsSaving(false)
    }
  }, [])

  const update = useCallback(async (id: string, input: Partial<ScheduleInput>) => {
    setIsSaving(true)
    try {
      const res = await schedulesApi.update(id, input)
      toast.push({ icon: '✏️', title: '일정이 수정되었어요' })
      return res
    } finally {
      setIsSaving(false)
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    await schedulesApi.remove(id)
    toast.push({ icon: '🗑', title: '일정이 삭제되었어요' })
  }, [])

  const toggleComplete = useCallback(
    (id: string, completed: boolean) => schedulesApi.toggleComplete(id, completed),
    [],
  )

  return { create, update, remove, toggleComplete, isSaving }
}
