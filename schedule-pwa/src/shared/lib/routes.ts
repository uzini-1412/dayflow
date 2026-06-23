/** 앱 라우트 경로 상수 (하드코딩 금지 — 여기서만 정의) */
export const ROUTES = {
  home: '/',
  calendar: '/calendar',
  list: '/list',
  social: '/social',
  spaces: '/spaces',
  memos: '/memos',
  timetable: '/timetable',
  tracker: '/tracker',
  habits: '/habits',
  projects: '/projects',
  more: '/more',
  settings: '/settings',
  login: '/login',
  register: '/register',
} as const

export type RouteKey = keyof typeof ROUTES
