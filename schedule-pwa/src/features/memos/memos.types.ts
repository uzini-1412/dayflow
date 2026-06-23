import type { BaseRecord } from '@shared/types/pb.types'

export interface Memo extends BaseRecord {
  user: string
  title: string
  content: string
  color: string
  pinned: boolean
}

export interface MemoInput {
  title?: string
  content?: string
  color?: string
  pinned?: boolean
}

export const MEMO_COLORS = ['#fff7cd', '#fee2e2', '#dcfce7', '#dbeafe', '#f3e8ff', '#f1f5f9']
