import { useEffect, useState } from 'react'
import { cn } from '@shared/lib/cn'
import { projectsApi } from './projects.api'
import type { Project } from './projects.types'

interface Props {
  value: string
  onChange: (projectId: string) => void
}

/** 일정 폼용 프로젝트 선택 + 인라인 생성 */
export function ProjectSelect({ value, onChange }: Props) {
  const [projects, setProjects] = useState<Project[]>([])
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  async function load() {
    setProjects(await projectsApi.list())
  }
  useEffect(() => {
    load()
  }, [])

  async function submitNew() {
    const t = name.trim()
    if (!t) return setCreating(false)
    const p = await projectsApi.create(t, projects.length)
    await load()
    onChange(p.id)
    setName('')
    setCreating(false)
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">프로젝트</span>
      <div className="flex flex-wrap gap-1.5">
        <Chip selected={value === ''} onClick={() => onChange('')}>없음</Chip>
        {projects.map((p) => (
          <Chip key={p.id} selected={value === p.id} color={p.color} onClick={() => onChange(p.id)}>
            {p.name}
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
          <Chip onClick={() => setCreating(true)}>+ 새 프로젝트</Chip>
        )}
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
