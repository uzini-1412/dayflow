import { Modal, Button } from '@shared/ui'
import { pb } from '@shared/lib/pb'
import { formatDisplayDate } from '@shared/lib/datetime'
import type { ModalBaseProps } from '@shared/types/ui.types'
import { useFriends } from '@features/social'
import { useSpaceDetail } from '../useSpaceDetail'
import type { Space } from '../spaces.types'

interface Props extends ModalBaseProps {
  space: Space
  onDeleted: () => void
}

export function SpaceDetailModal({ isOpen, onClose, space, onDeleted }: Props) {
  const myId = pb.authStore.record?.id
  const isOwner = space.owner === myId
  const { members, schedules, addMember, removeMember } = useSpaceDetail(space.id)
  const { accepted } = useFriends()

  const memberUserIds = new Set(members.map((m) => m.user))
  const invitable = accepted.filter((f) => !memberUserIds.has(f.user.id))
  const myMembership = members.find((m) => m.user === myId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={space.name}
      footer={
        isOwner ? (
          <Button variant="danger" size="sm" onClick={() => { onDeleted(); onClose() }}>
            스페이스 삭제
          </Button>
        ) : myMembership ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { removeMember(myMembership.id); onClose() }}
          >
            나가기
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <section>
          <p className="mb-1 text-xs font-semibold text-zinc-400">멤버 ({members.length})</p>
          <ul className="space-y-1">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1 text-zinc-700 dark:text-zinc-200">
                  {m.expand?.user?.nickname ?? '사용자'}
                  {m.role === 'owner' && <span className="ml-1 text-xs text-zinc-400">(소유자)</span>}
                </span>
                {isOwner && m.role !== 'owner' && (
                  <button type="button" onClick={() => removeMember(m.id)} className="text-zinc-300 hover:text-red-500">✕</button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {isOwner && invitable.length > 0 && (
          <section>
            <p className="mb-1 text-xs font-semibold text-zinc-400">친구 초대</p>
            <div className="flex flex-wrap gap-1.5">
              {invitable.map((f) => (
                <Button key={f.user.id} size="sm" variant="secondary" onClick={() => addMember(f.user.id)}>
                  + {f.user.nickname}
                </Button>
              ))}
            </div>
          </section>
        )}

        <section>
          <p className="mb-1 text-xs font-semibold text-zinc-400">스페이스 일정 ({schedules.length})</p>
          {schedules.length === 0 ? (
            <p className="text-xs text-zinc-400">일정 추가 시 "스페이스"를 이 스페이스로 지정하세요.</p>
          ) : (
            <ul className="space-y-1">
              {schedules.map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: space.color }} />
                  <span className="flex-1 truncate text-zinc-700 dark:text-zinc-200">{s.title}</span>
                  <span className="text-xs text-zinc-400">{formatDisplayDate(s.start_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  )
}
