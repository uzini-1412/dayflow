import { useEffect } from 'react'
import { pb } from '@shared/lib/pb'
import { ROUTES } from '@shared/lib/routes'
import { toast } from '@shared/ui'
import { useAuth } from '@features/auth'

interface RealtimeEvent {
  action: string
  record: Record<string, unknown>
}

/**
 * 앱이 열려있는 동안 PocketBase 실시간(SSE) 채널로 들어오는 이벤트를
 * 토스트(앱 내 푸시)로 표시한다. 외부 푸시 서비스 불필요.
 */
export function useRealtimePush() {
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !user) return
    const uid = user.id

    const subs = [
      pb.collection('notifications').subscribe('*', (e: RealtimeEvent) => {
        // schedule_due(리마인더)는 앱 열림 시 useAlarmScheduler 가 인앱 토스트로 처리 → 중복 방지
        if (e.action === 'create' && e.record.user === uid && e.record.type !== 'schedule_due') {
          toast.push({
            icon: 'ℹ️',
            title: String(e.record.title ?? '알림'),
            body: e.record.body ? String(e.record.body) : undefined,
            link: e.record.link ? String(e.record.link) : ROUTES.calendar,
          })
        }
      }),
      pb.collection('friendships').subscribe('*', (e: RealtimeEvent) => {
        if (e.action === 'create' && e.record.addressee === uid) {
          toast.push({ icon: '👤', title: '새 친구 요청이 도착했어요', link: ROUTES.social })
        }
        if (e.action === 'update' && e.record.requester === uid && e.record.status === 'accepted') {
          toast.push({ icon: '🎉', title: '친구 요청이 수락되었어요', link: ROUTES.social })
        }
      }),
      pb.collection('schedule_shares').subscribe('*', (e: RealtimeEvent) => {
        if (e.action === 'create' && e.record.shared_with === uid) {
          toast.push({ icon: '📤', title: '새 일정이 공유되었어요', link: ROUTES.calendar })
        }
      }),
    ]

    return () => {
      subs.forEach((p) => void p.then((unsub) => unsub()))
    }
  }, [isAuthenticated, user])
}
