import { useState } from 'react'
import { Button, Input } from '@shared/ui'
import type { UserRecord } from '@shared/types/pb.types'
import { socialApi } from '../social.api'

interface Props {
  onRequest: (userId: string) => Promise<void>
}

/** 닉네임 검색 후 친구 요청 보내기 */
export function FriendSearch({ onRequest }: Props) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<UserRecord[]>([])
  const [searched, setSearched] = useState(false)
  const [sent, setSent] = useState<Set<string>>(new Set())

  async function search() {
    setResults(await socialApi.searchUsers(q))
    setSearched(true)
  }

  async function request(id: string) {
    await onRequest(id)
    setSent((s) => new Set(s).add(id))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="닉네임으로 친구 검색"
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
        </div>
        <Button onClick={search}>검색</Button>
      </div>

      {searched && results.length === 0 && (
        <p className="text-sm text-zinc-400">검색 결과가 없습니다.</p>
      )}
      {results.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
        >
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            {u.nickname}
          </span>
          <Button
            size="sm"
            variant={sent.has(u.id) ? 'secondary' : 'primary'}
            disabled={sent.has(u.id)}
            onClick={() => request(u.id)}
          >
            {sent.has(u.id) ? '요청됨' : '친구 요청'}
          </Button>
        </div>
      ))}
    </div>
  )
}
