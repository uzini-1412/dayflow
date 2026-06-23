import type { BaseRecord } from '@shared/types/pb.types'

export interface Habit extends BaseRecord {
  user: string
  name: string
  emoji: string
  color: string
  active: boolean
}

export interface HabitLog extends BaseRecord {
  user: string
  habit: string
  date: string // yyyy-MM-dd
}

export interface HabitInput {
  name: string
  emoji?: string
  color?: string
}

export const HABIT_EMOJIS = ['💧', '🏃', '📚', '🧘', '💪', '🥗', '😴', '✍️', '🎧', '🚭']
export const HABIT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']
