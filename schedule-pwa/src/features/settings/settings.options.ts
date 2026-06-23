import type { FontKey, ThemeMode } from './settings.types'

export const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
  { value: 'system', label: '시스템' },
]

export const FONT_OPTIONS: { value: FontKey; label: string; stack: string }[] = [
  { value: 'pretendard', label: '프리텐다드', stack: "'Pretendard', system-ui, sans-serif" },
  { value: 'gothic', label: '고딕', stack: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" },
  { value: 'serif', label: '명조', stack: "'Nanum Myeongjo', 'Batang', serif" },
]

export const REMINDER_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: '정시' },
  { value: 10, label: '10분 전' },
  { value: 30, label: '30분 전' },
  { value: 60, label: '1시간 전' },
  { value: 1440, label: '1일 전' },
]
