import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToastStore, type ToastItem } from './toast.store'

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(onClose, item.duration ?? 5000)
    return () => clearTimeout(t)
  }, [item.duration, onClose])

  return (
    <button
      type="button"
      onClick={() => {
        if (item.link) navigate(item.link)
        onClose()
      }}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
    >
      {item.icon && <span className="text-lg">{item.icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {item.title}
        </p>
        {item.body && <p className="truncate text-xs text-zinc-500">{item.body}</p>}
      </div>
    </button>
  )
}

/** 앱 내 실시간 토스트 컨테이너 (상단 중앙/우측) */
export function ToastContainer() {
  const items = useToastStore((s) => s.items)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] mx-auto flex w-full max-w-sm flex-col gap-2 px-3 md:right-4 md:left-auto md:mx-0">
      {items.map((item) => (
        <ToastCard key={item.id} item={item} onClose={() => dismiss(item.id)} />
      ))}
    </div>
  )
}
