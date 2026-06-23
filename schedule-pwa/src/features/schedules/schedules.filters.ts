import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  endOfYear,
} from 'date-fns'

export type RangePreset = 'today' | 'week' | 'month' | 'year'

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
  { value: 'year', label: '올해' },
]

/** 프리셋 → [from, to] ISO 범위 (기준일은 now) */
export function presetToRange(preset: RangePreset, base: Date): { from: string; to: string } {
  const from = startOfDay(base)
  let to: Date
  switch (preset) {
    case 'today':
      to = endOfDay(base)
      break
    case 'week':
      return {
        from: startOfWeek(base).toISOString(),
        to: endOfWeek(base).toISOString(),
      }
    case 'month':
      return { from: startOfMonth(base).toISOString(), to: endOfMonth(base).toISOString() }
    case 'year':
      to = endOfYear(base)
      break
  }
  return { from: from.toISOString(), to: to.toISOString() }
}
