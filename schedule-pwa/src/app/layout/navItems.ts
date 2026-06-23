import { ROUTES } from '@shared/lib/routes'
import { useActiveModules, type ModuleKey } from '@features/settings'

export interface NavItem {
  to: string
  label: string
  icon: string
  /** 모듈 종속 — 활성화된 경우에만 노출 */
  module?: ModuleKey
  /** 모바일 하단 탭바에 노출 */
  primary?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.home, label: '홈', icon: '🏠', primary: true },
  { to: ROUTES.calendar, label: '달력', icon: '📅', primary: true },
  { to: ROUTES.list, label: '리스트', icon: '✅', primary: true },
  { to: ROUTES.timetable, label: '루틴', icon: '🗓️', module: 'timetable' },
  { to: ROUTES.habits, label: '습관', icon: '🔁', module: 'habits' },
  { to: ROUTES.projects, label: '프로젝트', icon: '📁', module: 'projects' },
  { to: ROUTES.tracker, label: '학습 플래너', icon: '🎓', module: 'grades' },
  { to: ROUTES.social, label: '친구', icon: '👥', module: 'friends' },
  { to: ROUTES.spaces, label: '스페이스', icon: '🤝', module: 'friends' },
  { to: ROUTES.memos, label: '메모', icon: '📝', module: 'memo' },
  { to: ROUTES.settings, label: '설정', icon: '⚙️' },
]

/** 활성 모듈 기준으로 노출할 네비 항목 */
export function useVisibleNav(): NavItem[] {
  const mods = useActiveModules()
  return NAV_ITEMS.filter((i) => !i.module || mods[i.module])
}
