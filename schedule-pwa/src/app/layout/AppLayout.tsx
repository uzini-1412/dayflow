import { Outlet } from 'react-router-dom'
import { useAlarmScheduler, useRealtimePush } from '@features/notifications'
import { ToastContainer } from '@shared/ui'
import { BottomTabBar } from './BottomTabBar'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'

/** 인증 후 메인 셸: md+ 사이드바 / 모바일 하단탭 (반응형) + 상단 알림바 */
export function AppLayout() {
  // 앱이 열려있는 동안 오늘 일정 리마인더 예약 + 실시간 앱내 푸시(토스트)
  useAlarmScheduler()
  useRealtimePush()

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
      <ToastContainer />
    </div>
  )
}
