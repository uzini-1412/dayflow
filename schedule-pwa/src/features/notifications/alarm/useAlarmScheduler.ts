import { useEffect, useRef, useState } from 'react'
import { endOfDay, startOfDay } from 'date-fns'
import { ROUTES } from '@shared/lib/routes'
import { toast } from '@shared/ui'
import { useSettingsStore } from '@features/settings'
import { useScheduleOccurrences } from '@features/schedules'

const MAX_DELAY = 2 ** 31 - 1

/**
 * 앱이 열려있는 동안 오늘 일정의 리마인더(N분 전)를 setTimeout 으로 예약 → 인앱 토스트.
 * (DB 알림 생성/OS 알림은 푸시 워커가 담당 — 중복 방지를 위해 여기선 토스트만)
 */
export function useAlarmScheduler() {
  const alarmEnabled = useSettingsStore((s) => s.settings.alarmEnabled)
  const reminderOffsets = useSettingsStore((s) => s.settings.reminderOffsets)

  const [today] = useState(() => ({
    from: startOfDay(new Date()).toISOString(),
    to: endOfDay(new Date()).toISOString(),
  }))
  const { schedules } = useScheduleOccurrences(today.from, today.to)

  const firedRef = useRef<Set<string>>(new Set())
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
    if (!alarmEnabled) return

    const now = Date.now()
    for (const s of schedules) {
      if (s.completed) continue
      const start = new Date(s.start_at).getTime()
      for (const off of reminderOffsets) {
        const fireAt = start - off * 60_000
        const key = `${s.id}:${s.start_at}:${off}`
        const delay = fireAt - now
        if (delay <= 0 || delay > MAX_DELAY || firedRef.current.has(key)) continue

        const timer = window.setTimeout(() => {
          firedRef.current.add(key)
          const label = off === 0 ? '지금' : `${off}분 후`
          toast.push({
            icon: '⏰',
            title: s.title,
            body: `${label} 시작하는 일정입니다.`,
            link: ROUTES.calendar,
          })
        }, delay)
        timersRef.current.push(timer)
      }
    }

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t))
    }
  }, [schedules, alarmEnabled, reminderOffsets])
}
