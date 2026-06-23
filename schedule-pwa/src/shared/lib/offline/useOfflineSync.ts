import { useEffect } from 'react'
import { toast } from '@shared/ui'
import { useNetStatus, netState } from './netStatus'
import { flushOutbox, refreshPending } from './syncEngine'

let bootstrapped = false

/**
 * 오프라인 동기화 부트스트랩 훅.
 * 앱 셸(AppLayout)에서 1회 호출 — online/offline 이벤트 구독, 초기 대기 개수 표시,
 * 연결 복귀 시 자동 플러시 + 전환 토스트.
 */
export function useOfflineSync(): void {
  useEffect(() => {
    if (bootstrapped) return // StrictMode 이중 마운트/중복 호출 가드
    bootstrapped = true

    const goOnline = () => {
      netState.setOnline(true)
      toast.push({ icon: '🔄', title: '연결됨 — 변경사항을 동기화합니다' })
      void flushOutbox()
    }
    const goOffline = () => {
      netState.setOnline(false)
      toast.push({ icon: '📴', title: '오프라인 모드 — 변경은 저장 후 자동 전송돼요' })
    }

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    // 초기 상태 반영 + 시작 시 남은 대기열 플러시
    netState.setOnline(navigator.onLine)
    void refreshPending()
    if (navigator.onLine) void flushOutbox()

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      bootstrapped = false
    }
  }, [])
}

export { useNetStatus }
