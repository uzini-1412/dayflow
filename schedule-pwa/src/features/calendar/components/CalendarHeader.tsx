import { format } from 'date-fns'
import { Button } from '@shared/ui'

interface Props {
  month: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarHeader({ month, onPrev, onNext, onToday }: Props) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
        {format(month, 'yyyy년 M월')}
      </h1>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onPrev} aria-label="이전 달">
          ‹
        </Button>
        <Button variant="secondary" size="sm" onClick={onToday}>
          오늘
        </Button>
        <Button variant="ghost" size="sm" onClick={onNext} aria-label="다음 달">
          ›
        </Button>
      </div>
    </div>
  )
}
