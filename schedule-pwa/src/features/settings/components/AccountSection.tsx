import { Button, ConfirmDialog } from '@shared/ui'
import { useDisclosure } from '@shared/hooks/useDisclosure'
import { accountApi, isDemoUser, openAuthModal, useAuth } from '@features/auth'
import { SettingRow, SettingSection } from './SettingRow'
import { ChangePasswordModal } from './ChangePasswordModal'

export function AccountSection() {
  const { user, logout } = useAuth()
  const pwModal = useDisclosure()
  const deleteConfirm = useDisclosure()

  async function onDeleteAccount() {
    await accountApi.deleteAccount()
    logout()
  }

  if (!user) {
    return (
      <SettingSection title="계정">
        <SettingRow
          label="둘러보는 중"
          description="로그인하면 일정과 설정이 계정에 저장돼요."
          control={
            <Button size="sm" onClick={() => openAuthModal('login')}>
              로그인
            </Button>
          }
        />
      </SettingSection>
    )
  }

  // 공용 데모 계정은 비밀번호 변경·탈퇴 불가 (서버 규칙으로도 차단)
  const demo = isDemoUser(user.email)

  return (
    <>
      <SettingSection title="계정">
        <SettingRow
          label={user.nickname ?? user.name ?? '내 계정'}
          description={demo ? '공용 데모 계정 — 데이터가 다른 방문자와 공유됩니다.' : user.email}
          control={
            <Button variant="secondary" size="sm" onClick={logout}>
              로그아웃
            </Button>
          }
        />
        {!demo && (
          <>
            <SettingRow
              label="비밀번호 변경"
              control={
                <Button variant="secondary" size="sm" onClick={pwModal.open}>
                  변경
                </Button>
              }
            />
            <SettingRow
              label="회원 탈퇴"
              description="모든 데이터가 삭제되며 복구할 수 없습니다."
              control={
                <Button variant="danger" size="sm" onClick={deleteConfirm.open}>
                  탈퇴
                </Button>
              }
            />
          </>
        )}
      </SettingSection>

      <ChangePasswordModal isOpen={pwModal.isOpen} onClose={pwModal.close} />
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={deleteConfirm.close}
        title="정말 탈퇴하시겠어요?"
        message="계정과 모든 일정·데이터가 영구 삭제됩니다."
        confirmText="탈퇴하기"
        danger
        onConfirm={onDeleteAccount}
      />
    </>
  )
}
