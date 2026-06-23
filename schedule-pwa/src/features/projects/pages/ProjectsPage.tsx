import { useState } from 'react'
import { Button, Input } from '@shared/ui'
import { formatDisplayDate } from '@shared/lib/datetime'
import { cn } from '@shared/lib/cn'
import { useProjects } from '../useProjects'
import type { Project } from '../projects.types'
import type { Schedule } from '@features/schedules'

export function ProjectsPage() {
  const { projects, byProject, create, remove } = useProjects()
  const [name, setName] = useState('')

  function add() {
    if (!name.trim()) return
    create(name.trim())
    setName('')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">프로젝트</h1>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="프로젝트 추가 (예: 공무원 시험 준비)"
          />
        </div>
        <Button onClick={add}>추가</Button>
      </div>

      {projects.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">
          여러 일정을 묶을 프로젝트를 만들어보세요.
        </p>
      ) : (
        projects.map((p) => (
          <ProjectCard key={p.id} project={p} schedules={byProject.get(p.id) ?? []} onRemove={remove} />
        ))
      )}
    </div>
  )
}

function ProjectCard({ project, schedules, onRemove }: { project: Project; schedules: Schedule[]; onRemove: (id: string) => void }) {
  const done = schedules.filter((s) => s.completed).length
  const pct = schedules.length ? Math.round((done / schedules.length) * 100) : 0

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ background: project.color }} />
        <h2 className="flex-1 font-semibold text-zinc-800 dark:text-zinc-100">{project.name}</h2>
        <span className="text-sm text-zinc-500">{done}/{schedules.length}</span>
        <button type="button" onClick={() => onRemove(project.id)} className="text-zinc-300 hover:text-red-500">✕</button>
      </div>

      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: project.color }} />
      </div>

      <ul className="space-y-1">
        {schedules.map((s) => (
          <li key={s.id} className="flex items-center gap-2 text-sm">
            <span className={cn('h-1.5 w-1.5 rounded-full', s.completed ? 'bg-emerald-500' : 'bg-zinc-300')} />
            <span className={cn('flex-1 truncate', s.completed ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200')}>
              {s.title}
            </span>
            <span className="text-xs text-zinc-400">{formatDisplayDate(s.start_at)}</span>
          </li>
        ))}
        {schedules.length === 0 && <li className="text-xs text-zinc-400">아직 묶인 일정이 없어요.</li>}
      </ul>
    </section>
  )
}
