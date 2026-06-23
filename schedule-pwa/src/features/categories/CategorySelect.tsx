import { useState } from 'react'
import { cn } from '@shared/lib/cn'
import { useCategories } from './useCategories'

interface Props {
  value: string // category id ('' = 없음)
  onChange: (categoryId: string, color?: string) => void
}

/** 카테고리 선택 + 인라인 생성 칩 */
export function CategorySelect({ value, onChange }: Props) {
  const { categories, create } = useCategories()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  async function submitNew() {
    const trimmed = name.trim()
    if (!trimmed) return setCreating(false)
    const cat = await create(trimmed)
    onChange(cat.id, cat.color)
    setName('')
    setCreating(false)
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        카테고리
      </span>
      <div className="flex flex-wrap gap-1.5">
        <Chip selected={value === ''} onClick={() => onChange('')}>
          없음
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.id}
            selected={value === c.id}
            color={c.color}
            onClick={() => onChange(c.id, c.color)}
          >
            {c.name}
          </Chip>
        ))}
        {creating ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={submitNew}
            onKeyDown={(e) => e.key === 'Enter' && submitNew()}
            placeholder="이름"
            className="h-7 w-24 rounded-full border border-zinc-300 px-2 text-sm outline-none dark:border-zinc-600 dark:bg-zinc-900"
          />
        ) : (
          <Chip onClick={() => setCreating(true)}>+ 새 카테고리</Chip>
        )}
      </div>
    </div>
  )
}

function Chip({
  children,
  selected,
  color,
  onClick,
}: {
  children: React.ReactNode
  selected?: boolean
  color?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-7 items-center gap-1 rounded-full border px-2.5 text-sm',
        selected
          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-zinc-800 dark:text-brand-400'
          : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300',
      )}
    >
      {color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  )
}
