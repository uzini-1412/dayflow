import { useNetStatus } from '@shared/lib/offline'

/**
 * 상단바 동기화 상태 표시.
 * - 오프라인: 회색 "오프라인" 배지 (+ 대기 개수)
 * - 온라인 + 동기화 중: 스피너 + 대기 개수
 * - 온라인 + 대기 있음: "대기 N"
 * - 온라인 + 대기 0: 표시 없음
 */
export function SyncIndicator() {
  const online = useNetStatus((s) => s.online)
  const syncing = useNetStatus((s) => s.syncing)
  const pending = useNetStatus((s) => s.pending)

  if (online && pending === 0 && !syncing) return null

  if (!online) {
    return (
      <span
        className="flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
        title="오프라인 — 변경은 저장 후 연결 시 자동 전송됩니다"
      >
        📴 오프라인{pending > 0 && ` · ${pending}`}
      </span>
    )
  }

  return (
    <span
      className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600 dark:bg-brand-950 dark:text-brand-300"
      title={syncing ? '변경사항 동기화 중' : '전송 대기 중'}
    >
      {syncing ? (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-300 border-t-transparent" />
      ) : (
        '⏳'
      )}
      {syncing ? '동기화 중' : '대기'}
      {pending > 0 && ` ${pending}`}
    </span>
  )
}
