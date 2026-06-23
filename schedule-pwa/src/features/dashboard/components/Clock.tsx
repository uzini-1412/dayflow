import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

/** 실시간 시계 */
export function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div>
      <p className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
        {format(now, 'a h:mm:ss', { locale: ko })}
      </p>
      <p className="text-sm text-zinc-500">{format(now, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}</p>
    </div>
  )
}
