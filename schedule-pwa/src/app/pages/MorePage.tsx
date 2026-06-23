import { Link } from 'react-router-dom'
import { useVisibleNav } from '../layout/navItems'

/** 모바일 '더보기' — 주요 탭 외 메뉴 모음 */
export function MorePage() {
  const items = useVisibleNav().filter((i) => !i.primary)

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">더보기</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <span className="text-2xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
