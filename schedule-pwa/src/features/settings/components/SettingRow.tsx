import type { ReactNode } from 'react'

interface SettingRowProps {
  label: string
  description?: string
  control: ReactNode
}

/** 설정 한 줄: 라벨/설명 + 우측 컨트롤 (모든 설정 항목 공통) */
export function SettingRow({ label, description, control }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{label}</p>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

export function SettingSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="border-b border-zinc-100 py-3 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:border-zinc-800">
        {title}
      </h2>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">{children}</div>
    </section>
  )
}
