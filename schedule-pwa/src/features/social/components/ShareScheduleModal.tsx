import { Modal, Button } from '@shared/ui'
import type { ModalBaseProps } from '@shared/types/ui.types'
import { useFriends } from '../hooks/useFriends'
import { useScheduleShares } from '../hooks/useScheduleShares'

interface Props extends ModalBaseProps {
  scheduleId: string | undefined
}

/** 일정을 친구에게 공유/해제 */
export function ShareScheduleModal({ isOpen, onClose, scheduleId }: Props) {
  const { accepted } = useFriends()
  const { shares, share, unshare } = useScheduleShares(scheduleId)

  const shareOf = (friendId: string) => shares.find((s) => s.shared_with === friendId)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="일정 공유" size="sm">
      {accepted.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-400">
          공유하려면 먼저 친구를 추가하세요.
        </p>
      ) : (
        <ul className="space-y-2">
          {accepted.map((f) => {
            const existing = shareOf(f.user.id)
            return (
              <li
                key={f.user.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {f.user.nickname}
                  </p>
                  {existing && (
                    <p className="text-xs text-zinc-400">
                      {existing.permission === 'edit' ? '편집 가능' : '보기 전용'}
                    </p>
                  )}
                </div>
                {existing ? (
                  <Button size="sm" variant="ghost" onClick={() => unshare(existing.id)}>
                    공유 해제
                  </Button>
                ) : (
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="secondary" onClick={() => share(f.user.id, 'view')}>
                      보기
                    </Button>
                    <Button size="sm" onClick={() => share(f.user.id, 'edit')}>
                      편집
                    </Button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
