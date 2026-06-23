import type { BaseRecord } from '@shared/types/pb.types'
import type { GpaScale } from '@features/settings'

export interface TrackGroup extends BaseRecord {
  user: string
  name: string
  order: number
}

export interface TrackItem extends BaseRecord {
  user: string
  group: string
  name: string
  credits: number
  point: number
  letter: string
}

export interface GradeOption {
  letter: string
  point: number | null // null = GPA 제외(P)
}

/** 만점 스케일별 등급표 (P=Pass, GPA 제외) */
export const GRADE_SCALES: Record<GpaScale, GradeOption[]> = {
  '4.5': [
    { letter: 'A+', point: 4.5 },
    { letter: 'A', point: 4.0 },
    { letter: 'B+', point: 3.5 },
    { letter: 'B', point: 3.0 },
    { letter: 'C+', point: 2.5 },
    { letter: 'C', point: 2.0 },
    { letter: 'D+', point: 1.5 },
    { letter: 'D', point: 1.0 },
    { letter: 'F', point: 0 },
    { letter: 'P', point: null },
  ],
  '4.3': [
    { letter: 'A+', point: 4.3 },
    { letter: 'A', point: 4.0 },
    { letter: 'B+', point: 3.3 },
    { letter: 'B', point: 3.0 },
    { letter: 'C+', point: 2.3 },
    { letter: 'C', point: 2.0 },
    { letter: 'D+', point: 1.3 },
    { letter: 'D', point: 1.0 },
    { letter: 'F', point: 0 },
    { letter: 'P', point: null },
  ],
  '4.0': [
    { letter: 'A', point: 4.0 },
    { letter: 'A-', point: 3.7 },
    { letter: 'B+', point: 3.3 },
    { letter: 'B', point: 3.0 },
    { letter: 'B-', point: 2.7 },
    { letter: 'C+', point: 2.3 },
    { letter: 'C', point: 2.0 },
    { letter: 'D', point: 1.0 },
    { letter: 'F', point: 0 },
    { letter: 'P', point: null },
  ],
}

export function letterToPoint(letter: string, scale: GpaScale): number {
  return GRADE_SCALES[scale].find((g) => g.letter === letter)?.point ?? 0
}

export interface GroupSummary {
  credits: number
  gpa: number
}

/** 취득학점·평점 계산 (F=취득 제외, P/빈값=GPA 제외) */
export function summarize(items: TrackItem[]): GroupSummary {
  let credits = 0
  let weighted = 0
  let gpaCredits = 0
  for (const it of items) {
    const c = it.credits || 0
    if (it.letter !== 'F') credits += c
    if (it.letter !== 'P' && it.letter !== '') {
      weighted += (it.point || 0) * c
      gpaCredits += c
    }
  }
  return { credits, gpa: gpaCredits ? weighted / gpaCredits : 0 }
}
