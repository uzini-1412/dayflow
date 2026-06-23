import { Button } from '@shared/ui'
import type { Friend } from '../social.types'

interface Props {
  incoming: Friend[]
  outgoing: Friend[]
  accepted: Friend[]
  onAccept: (id: string) => void
  onRemove: (id: string) => void
}

function Row({ friend, children }: { friend: Friend; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
        {friend.user?.nickname ?? '알 수 없음'}
      </span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  )
}

export function FriendList({ incoming, outgoing, accepted, onAccept, onRemove }: Props) {
  return (
    <div className="space-y-5">
      {incoming.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-400">받은 친구 요청</h2>
          {incoming.map((f) => (
            <Row key={f.friendshipId} friend={f}>
              <Button size="sm" onClick={() => onAccept(f.friendshipId)}>
                수락
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onRemove(f.friendshipId)}>
                거절
              </Button>
            </Row>
          ))}
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-xs font-semibold text-zinc-400">친구 ({accepted.length})</h2>
        {accepted.length === 0 ? (
          <p className="text-sm text-zinc-400">아직 친구가 없습니다.</p>
        ) : (
          accepted.map((f) => (
            <Row key={f.friendshipId} friend={f}>
              <Button size="sm" variant="ghost" onClick={() => onRemove(f.friendshipId)}>
                삭제
              </Button>
            </Row>
          ))
        )}
      </section>

      {outgoing.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-zinc-400">보낸 요청</h2>
          {outgoing.map((f) => (
            <Row key={f.friendshipId} friend={f}>
              <span className="text-xs text-zinc-400">대기 중</span>
              <Button size="sm" variant="ghost" onClick={() => onRemove(f.friendshipId)}>
                취소
              </Button>
            </Row>
          ))}
        </section>
      )}
    </div>
  )
}
