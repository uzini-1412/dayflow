import { DEFAULT_ACTIVE_MODULES, type ActiveModules, type AppMode } from './settings.modules'

export type ThemeMode = 'light' | 'dark' | 'system'
export type FontKey = 'pretendard' | 'gothic' | 'serif'
export type Locale = 'ko' | 'en'
export type WeekStart = 'sun' | 'mon'
export type DefaultView = 'calendar' | 'list'
export type GpaScale = '4.5' | '4.3' | '4.0'

export interface Settings {
  theme: ThemeMode
  font: FontKey
  locale: Locale
  weekStart: WeekStart
  defaultView: DefaultView
  alarmEnabled: boolean
  pushEnabled: boolean
  /** 일정 N분 전 알림 */
  reminderOffsets: number[]
  /** 앱 모드 + 활성 모듈 */
  mode: AppMode
  activeModules: ActiveModules
  /** 학습 플래너 GPA 만점 스케일 */
  gpaScale: GpaScale
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  font: 'pretendard',
  locale: 'ko',
  weekStart: 'sun',
  defaultView: 'calendar',
  alarmEnabled: true,
  pushEnabled: false,
  reminderOffsets: [10, 60],
  mode: 'custom',
  activeModules: DEFAULT_ACTIVE_MODULES,
  gpaScale: '4.5',
}
