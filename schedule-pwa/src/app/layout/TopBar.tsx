import { useDisclosure } from '@shared/hooks/useDisclosure'
import { NotificationBell } from '@features/notifications'
import { ScheduleSearchModal } from '@features/schedules'

/** 상단바: 모바일 헤더 겸 검색·알림 위치 */
export function TopBar() {
  const search = useDisclosure()

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-zinc-200 bg-white/80 px-3 backdrop-blur md:justify-end dark:border-zinc-800 dark:bg-zinc-900/80">
      <span className="font-bold text-brand-600 md:hidden">📅 일정</span>
      <div className="flex items-center">
        <button
          type="button"
          onClick={search.open}
          aria-label="검색"
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          🔍
        </button>
        <NotificationBell />
      </div>
      <ScheduleSearchModal isOpen={search.isOpen} onClose={search.close} />
    </header>
  )
}
