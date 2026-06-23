import { useRef, useState } from 'react'
import { schedulesApi } from '../schedules.api'
import type { Schedule } from '../schedules.types'

/** 일정 첨부파일 (사진/PDF 등) — 편집 모달 내, 즉시 업로드 */
export function ScheduleAttachments({ schedule }: { schedule: Schedule }) {
  const [record, setRecord] = useState<Schedule>(schedule)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function onPick(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    try {
      setRecord(await schedulesApi.addAttachments(schedule.id, Array.from(files)))
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function onRemove(filename: string) {
    setBusy(true)
    try {
      setRecord(await schedulesApi.removeAttachment(schedule.id, filename))
    } finally {
      setBusy(false)
    }
  }

  const files = record.attachments ?? []

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">첨부파일</span>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="text-xs text-brand-600 disabled:opacity-50"
        >
          + 파일 추가
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => onPick(e.target.files)}
        />
      </div>

      {files.length === 0 ? (
        <p className="text-xs text-zinc-400">사진·PDF를 첨부할 수 있어요.</p>
      ) : (
        <ul className="space-y-1">
          {files.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <a
                href={schedulesApi.fileUrl(record, f)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 truncate text-brand-600 hover:underline"
              >
                📎 {f}
              </a>
              <button type="button" onClick={() => onRemove(f)} className="text-zinc-300 hover:text-red-500">
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
