import type { BaseRecord } from '@shared/types/pb.types'

export type NotificationType = 'schedule_due' | 'friend_request' | 'share' | 'system'

export interface AppNotification extends BaseRecord {
  user: string
  type: NotificationType
  title: string
  body: string
  schedule: string
  link: string
  read: boolean
  fire_at: string
  sent: boolean
}

export interface NotificationInput {
  type: NotificationType
  title: string
  body?: string
  schedule?: string
  link?: string
  fire_at?: string
}
