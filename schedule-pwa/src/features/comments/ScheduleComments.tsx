import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { pb } from '@shared/lib/pb'
import { cn } from '@shared/lib/cn'
import { Button } from '@shared/ui'
import { useComments } from './useComments'

/** 일정 단위 실시간 댓글/대화 (편집 모달 내) */
export function ScheduleComments({ scheduleId }: { scheduleId: string }) {
  const { comments, send, remove } = useComments(scheduleId)
  const [text, setText] = useState('')
  const myId = pb.authStore.record?.id

  function submit() {
    if (!text.trim()) return
    send(text)
    setText('')
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        댓글 · 대화 {comments.length > 0 && `(${comments.length})`}
      </span>

      <div className="mb-2 max-h-48 space-y-2 overflow-y-auto rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800/50">
        {comments.length === 0 ? (
          <p className="py-3 text-center text-xs text-zinc-400">첫 댓글을 남겨보세요.</p>
        ) : (
          comments.map((c) => {
            const mine = c.user === myId
            return (
              <div key={c.id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  {!mine && <span className="font-medium">{c.expand?.user?.nickname ?? '사용자'}</span>}
                  <span>{format(parseISO(c.created), 'M.d HH:mm')}</span>
                  {mine && (
                    <button type="button" onClick={() => remove(c.id)} className="hover:text-red-500">
                      ✕
                    </button>
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-1.5 text-sm whitespace-pre-wrap',
                    mine
                      ? 'rounded-br-sm bg-brand-600 text-white'
                      : 'rounded-bl-sm bg-white text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100',
                  )}
                >
                  {c.text}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="flex gap-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="메시지 입력…"
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <Button size="sm" onClick={submit}>전송</Button>
      </div>
    </div>
  )
}
