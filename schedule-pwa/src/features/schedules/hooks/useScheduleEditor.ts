import { useCallback, useState } from 'react'
import { useDisclosure } from '@shared/hooks/useDisclosure'
import type { Schedule } from '../schedules.types'

/** 일정 추가/수정 모달 상태 관리 (리스트·달력 공용) */
export function useScheduleEditor() {
  const modal = useDisclosure()
  const [selected, setSelected] = useState<Schedule | null>(null)
  const [defaultStart, setDefaultStart] = useState<string | undefined>(undefined)

  const openCreate = useCallback(
    (startISO?: string) => {
      setSelected(null)
      setDefaultStart(startISO)
      modal.open()
    },
    [modal],
  )

  const openEdit = useCallback(
    (schedule: Schedule) => {
      setSelected(schedule)
      setDefaultStart(undefined)
      modal.open()
    },
    [modal],
  )

  return {
    isOpen: modal.isOpen,
    close: modal.close,
    selected,
    defaultStart,
    openCreate,
    openEdit,
  }
}
