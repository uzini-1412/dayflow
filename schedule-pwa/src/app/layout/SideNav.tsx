import { NavLink } from 'react-router-dom'
import { cn } from '@shared/lib/cn'
import { ROUTES } from '@shared/lib/routes'
import { useAuth } from '@features/auth'
import { Button } from '@shared/ui'
import { useVisibleNav } from './navItems'

/** 데스크탑/태블릿 사이드바 (md 이상): 활성 모듈 전체 노출 */
export function SideNav() {
  const { user, logout } = useAuth()
  const items = useVisibleNav()

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-zinc-200 bg-white p-4 md:flex dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6 px-2 text-lg font-bold text-brand-600">📅 일정</div>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.home}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-zinc-800 dark:text-brand-500'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
              )
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <p className="truncate px-2 text-sm text-zinc-500">{user?.nickname ?? user?.name}</p>
        <Button variant="ghost" size="sm" fullWidth className="mt-1 justify-start" onClick={logout}>
          로그아웃
        </Button>
      </div>
    </aside>
  )
}
