import type { BaseRecord } from '@shared/types/pb.types'

export interface DayDecoration extends BaseRecord {
  user: string
  date: string // yyyy-MM-dd
  emoji: string
  star_rating: number
  bg_color: string
  note: string
}

export interface DecorationInput {
  emoji?: string
  star_rating?: number
  bg_color?: string
  note?: string
}

/** 배경색 팔레트 (기분 표현) */
export const DECO_COLORS = ['', '#fee2e2', '#ffedd5', '#fef9c3', '#dcfce7', '#dbeafe', '#f3e8ff']

/** 자주 쓰는 이모지 */
export const DECO_EMOJIS = ['', '😀', '😍', '😎', '😢', '😡', '🥳', '😴', '🤒', '💪', '❤️', '⭐']
