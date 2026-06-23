import { format, parseISO } from 'date-fns'

/** ISO 문자열 → datetime-local 입력값 (yyyy-MM-ddTHH:mm) */
export function toInputDateTime(iso: string): string {
  if (!iso) return ''
  return format(parseISO(iso), "yyyy-MM-dd'T'HH:mm")
}

/** datetime-local 입력값 → ISO(UTC) 문자열 */
export function fromInputDateTime(local: string): string {
  if (!local) return ''
  return new Date(local).toISOString()
}

/** ISO → 날짜 입력값(yyyy-MM-dd) */
export function toInputDate(iso: string): string {
  if (!iso) return ''
  return format(parseISO(iso), 'yyyy-MM-dd')
}

/** Date → ISO */
export function dateToISO(d: Date): string {
  return d.toISOString()
}

/** 표시용 포맷 */
export function formatDisplayTime(iso: string): string {
  return format(parseISO(iso), 'HH:mm')
}

export function formatDisplayDate(iso: string): string {
  return format(parseISO(iso), 'M월 d일')
}
