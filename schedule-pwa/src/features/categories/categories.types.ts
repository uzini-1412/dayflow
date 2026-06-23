import type { BaseRecord } from '@shared/types/pb.types'

export interface Category extends BaseRecord {
  user: string
  name: string
  color: string
}

/** 새 카테고리 기본 색 팔레트 */
export const CATEGORY_PALETTE = [
  '#6366f1',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
]
