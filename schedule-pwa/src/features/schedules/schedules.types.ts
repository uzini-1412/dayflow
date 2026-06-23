import type { BaseRecord } from '@shared/types/pb.types'

export type Importance = 'low' | 'mid' | 'high'

export type RepeatFreq = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'interval'

export interface RepeatRule {
  freq: RepeatFreq
  interval?: number
  weekdays?: number[]
  monthDay?: number
  lastDayOfMonth?: boolean
  month?: number
  day?: number
  lunar?: boolean
  until?: string
}

export interface Schedule extends BaseRecord {
  user: string
  title: string
  description: string
  start_at: string
  end_at: string
  all_day: boolean
  importance: Importance
  category: string
  color: string
  repeat_rule: RepeatRule | null
  auto_delete: boolean
  visible: boolean
  completed: boolean
  location: string
  cost: number
  attachments: string[]
  project: string
  space: string
}

/** 생성/수정 입력 */
export interface ScheduleInput {
  title: string
  description?: string
  start_at: string
  end_at?: string
  all_day?: boolean
  importance?: Importance
  category?: string
  color?: string
  repeat_rule?: RepeatRule | null
  auto_delete?: boolean
  visible?: boolean
  location?: string
  cost?: number
  project?: string
  space?: string
}

export const IMPORTANCE_META: Record<Importance, { label: string; color: string }> = {
  low: { label: '낮음', color: '#94a3b8' },
  mid: { label: '보통', color: '#6366f1' },
  high: { label: '높음', color: '#ef4444' },
}
