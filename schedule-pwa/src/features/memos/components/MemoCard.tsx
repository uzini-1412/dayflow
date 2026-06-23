import type { Memo } from '../memos.types'

interface Props {
  memo: Memo
  onClick: (memo: Memo) => void
}

export function MemoCard({ memo, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick(memo)}
      style={{ backgroundColor: memo.color || '#fff7cd' }}
      className="flex min-h-24 flex-col gap-1 rounded-xl p-3 text-left text-zinc-800 shadow-sm"
    >
      <div className="flex items-start justify-between gap-1">
        <p className="line-clamp-1 flex-1 font-semibold">{memo.title || '(제목 없음)'}</p>
        {memo.pinned && <span className="text-xs">📌</span>}
      </div>
      <p className="line-clamp-4 text-sm whitespace-pre-wrap text-zinc-600">{memo.content}</p>
    </button>
  )
}
