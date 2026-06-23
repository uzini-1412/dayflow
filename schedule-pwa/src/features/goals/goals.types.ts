import type { BaseRecord } from '@shared/types/pb.types'

export type GoalPeriod = 'year' | 'month'

export interface Goal extends BaseRecord {
  user: string
  title: string
  period: GoalPeriod
  period_key: string // yyyy 또는 yyyy-MM
  achieved: boolean
}
