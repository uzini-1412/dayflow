import { Outlet } from 'react-router-dom'
import { useAuth } from '@features/auth'
import { useAlarmScheduler, useRealtimePush } from '@features/notifications'
import { useOfflineSync } from '@shared/lib/offline'
import { ToastContainer } from '@shared/ui'
import { BottomTabBar } from './BottomTabBar'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'

/**
 * 메인 셸 (비로그인 둘러보기 포함).
 * 로그인/로그아웃으로 사용자가 바뀌면 셸 전체를 다시 마운트해 각 화면의 데이터를 새 계정 기준으로 다시 불러온다.
 */
export function AppLayout() {
  const { user } = useAuth()
  return (
    <>
      <AppShell key={user?.id ?? 'guest'} />
      <ToastContainer />
    </>
  )
}

/** md+ 사이드바 / 모바일 하단탭 (반응형) + 상단 알림바 */
function AppShell() {
  // 앱이 열려있는 동안 오늘 일정 리마인더 예약 + 실시간 앱내 푸시(토스트)
  useAlarmScheduler()
  useRealtimePush()
  // 오프라인 동기화: 연결 상태 추적 + 복귀 시 대기열 자동 전송
  useOfflineSync()

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <TopBar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <BottomTabBar />
    </div>
  )
}
