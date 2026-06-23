import { useEffect, useState } from 'react'
import { cn } from '@shared/lib/cn'
import { spacesApi } from './spaces.api'
import type { Space } from './spaces.types'

interface Props {
  value: string
  onChange: (spaceId: string) => void
}

/** 일정 폼용 스페이스 선택 (그룹 일정으로 지정) */
export function SpaceSelect({ value, onChange }: Props) {
  const [spaces, setSpaces] = useState<Space[]>([])

  useEffect(() => {
    spacesApi.listMine().then(setSpaces)
  }, [])

  if (spaces.length === 0) return null

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">스페이스 (그룹 일정)</span>
      <div className="flex flex-wrap gap-1.5">
        <Chip selected={value === ''} onClick={() => onChange('')}>개인</Chip>
        {spaces.map((s) => (
          <Chip key={s.id} selected={value === s.id} color={s.color} onClick={() => onChange(s.id)}>
            {s.name}
          </Chip>
        ))}
      </div>
    </div>
  )
}

function Chip({ children, selected, color, onClick }: { children: React.ReactNode; selected?: boolean; color?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-7 items-center gap-1 rounded-full border px-2.5 text-sm',
        selected ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-zinc-800 dark:text-brand-400' : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300',
      )}
    >
      {color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  )
}
