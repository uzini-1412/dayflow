import type { BaseRecord } from '@shared/types/pb.types'

export interface Project extends BaseRecord {
  user: string
  name: string
  color: string
  archived: boolean
}

export const PROJECT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6']
