import { NavLink } from 'react-router-dom'
import { cn } from '@shared/lib/cn'
import { ROUTES } from '@shared/lib/routes'
import { useVisibleNav } from './navItems'

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs',
    isActive ? 'text-brand-600' : 'text-zinc-500',
  )

/** 모바일 하단 탭바 (md 미만): 주요 탭 + 더보기 */
export function BottomTabBar() {
  const primary = useVisibleNav().filter((i) => i.primary)

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 flex border-t border-zinc-200 bg-white md:hidden dark:border-zinc-800 dark:bg-zinc-900">
      {primary.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === ROUTES.home} className={tabClass}>
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
      <NavLink to={ROUTES.more} className={tabClass}>
        <span className="text-lg">☰</span>
        더보기
      </NavLink>
    </nav>
  )
}
