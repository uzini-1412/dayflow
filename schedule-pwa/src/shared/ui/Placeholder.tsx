interface PlaceholderProps {
  title: string
  note?: string
}

/** 아직 구현 전인 화면용 임시 표시 */
export function Placeholder({ title, note = '곧 구현됩니다.' }: PlaceholderProps) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{title}</h1>
      <p className="text-sm text-zinc-400">{note}</p>
    </div>
  )
}
