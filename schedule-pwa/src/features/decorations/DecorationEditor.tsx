import { cn } from '@shared/lib/cn'
import { DECO_COLORS, DECO_EMOJIS, type DayDecoration, type DecorationInput } from './decorations.types'

interface Props {
  decoration: DayDecoration | undefined
  onChange: (input: DecorationInput) => void
}

/** 날짜 꾸미기 편집기 (이모지 / 별점 / 배경색) — DayDetailModal에 삽입 */
export function DecorationEditor({ decoration, onChange }: Props) {
  const emoji = decoration?.emoji ?? ''
  const stars = decoration?.star_rating ?? 0
  const bg = decoration?.bg_color ?? ''

  const patch = (input: DecorationInput) =>
    onChange({ emoji, star_rating: stars, bg_color: bg, ...input })

  return (
    <div className="space-y-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
      <div>
        <p className="mb-1 text-xs font-semibold text-zinc-400">이모지</p>
        <div className="flex flex-wrap gap-1">
          {DECO_EMOJIS.map((e) => (
            <button
              key={e || 'none'}
              type="button"
              onClick={() => patch({ emoji: e })}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg text-lg',
                emoji === e ? 'bg-brand-100 dark:bg-zinc-700' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700',
              )}
            >
              {e || '✕'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold text-zinc-400">별점</p>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => patch({ star_rating: stars === n ? 0 : n })}
              className="text-xl"
            >
              {n <= stars ? '⭐' : '☆'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold text-zinc-400">배경색</p>
        <div className="flex flex-wrap gap-1.5">
          {DECO_COLORS.map((c) => (
            <button
              key={c || 'none'}
              type="button"
              onClick={() => patch({ bg_color: c })}
              style={{ background: c || undefined }}
              className={cn(
                'h-7 w-7 rounded-full border',
                bg === c ? 'border-brand-500 ring-2 ring-brand-200' : 'border-zinc-300 dark:border-zinc-600',
                !c && 'flex items-center justify-center text-xs text-zinc-400',
              )}
            >
              {!c && '✕'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
