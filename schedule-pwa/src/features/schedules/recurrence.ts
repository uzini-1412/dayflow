import {
  addDays,
  addMonths,
  endOfMonth,
  parseISO,
  set,
  setDate,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import type { Schedule } from './schedules.types'

const MAX_OCCURRENCES = 800

/** 기준 날짜에 ref의 시:분:초를 입힘 */
function withTime(date: Date, ref: Date): Date {
  return set(date, {
    hours: ref.getHours(),
    minutes: ref.getMinutes(),
    seconds: 0,
    milliseconds: 0,
  })
}

/** 반복 일정을 [from,to] 범위의 실제 발생 날짜들로 전개 */
function* generate(schedule: Schedule, from: Date, to: Date): Generator<Date> {
  const rule = schedule.repeat_rule
  const start = parseISO(schedule.start_at)
  if (!rule || rule.freq === 'none') {
    if (start >= from && start <= to) yield start
    return
  }

  const until = rule.until ? parseISO(rule.until) : null
  const end = until && until < to ? until : to
  const interval = Math.max(1, rule.interval ?? 1)
  let count = 0

  if (rule.freq === 'daily' || rule.freq === 'interval') {
    let d = start
    if (d < from) {
      const days = Math.floor((startOfDay(from).getTime() - startOfDay(start).getTime()) / 86_400_000)
      d = addDays(start, Math.ceil(days / interval) * interval)
    }
    for (; d <= end && count < MAX_OCCURRENCES; d = addDays(d, interval), count++) {
      if (d >= start && d >= from) yield d
    }
  } else if (rule.freq === 'weekly') {
    const weekdays = rule.weekdays?.length ? rule.weekdays : [start.getDay()]
    let d = startOfDay(start > from ? start : from)
    for (; d <= end && count < MAX_OCCURRENCES; d = addDays(d, 1), count++) {
      if (d >= startOfDay(start) && weekdays.includes(d.getDay())) yield withTime(d, start)
    }
  } else if (rule.freq === 'monthly') {
    const dayNum = rule.monthDay ?? start.getDate()
    let m = startOfMonth(from > start ? from : start)
    for (; m <= end && count < MAX_OCCURRENCES; m = addMonths(m, 1), count++) {
      const base = rule.lastDayOfMonth ? endOfMonth(m) : setDate(m, dayNum)
      const occ = withTime(base, start)
      if (occ >= start && occ >= from && occ <= end) yield occ
    }
  } else if (rule.freq === 'yearly') {
    const month = rule.month ?? start.getMonth()
    const day = rule.day ?? start.getDate()
    const startYear = (from > start ? from : start).getFullYear()
    for (let y = startYear; y <= end.getFullYear() && count < MAX_OCCURRENCES; y++, count++) {
      const occ = withTime(new Date(y, month, day), start)
      if (occ >= start && occ >= from && occ <= end) yield occ
    }
  }
}

/**
 * 일정을 [from,to] 범위의 발생들로 전개해 "표시용 Schedule 클론" 배열로 반환.
 * 클론은 start_at/end_at 만 해당 발생 시각으로 바뀌고 id 는 원본 유지(수정/삭제는 원본에 적용).
 */
export function expandToRange(schedule: Schedule, fromISO: string, toISO: string): Schedule[] {
  const from = parseISO(fromISO)
  const to = parseISO(toISO)
  const start = parseISO(schedule.start_at)
  const durationMs = schedule.end_at ? parseISO(schedule.end_at).getTime() - start.getTime() : 0

  const out: Schedule[] = []
  for (const occStart of generate(schedule, from, to)) {
    out.push({
      ...schedule,
      start_at: occStart.toISOString(),
      end_at: durationMs
        ? new Date(occStart.getTime() + durationMs).toISOString()
        : schedule.end_at,
    })
  }
  return out
}
