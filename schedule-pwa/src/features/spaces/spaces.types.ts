import type { BaseRecord, UserRecord } from '@shared/types/pb.types'

export interface Space extends BaseRecord {
  owner: string
  name: string
  color: string
}

export interface SpaceMember extends BaseRecord {
  space: string
  user: string
  role: 'owner' | 'member'
  expand?: { user?: UserRecord }
}

export const SPACE_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']
