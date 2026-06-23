import { useState, type FormEvent } from 'react'
import { Modal, Button, Input, toast } from '@shared/ui'
import type { ModalBaseProps } from '@shared/types/ui.types'
import { accountApi, useAuth } from '@features/auth'

export function ChangePasswordModal({ isOpen, onClose }: ModalBaseProps) {
  const { logout } = useAuth()
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPw))
      return setError('새 비밀번호는 문자와 숫자를 포함해 8자 이상이어야 합니다.')
    if (newPw !== confirmPw) return setError('비밀번호가 일치하지 않습니다.')
    setError('')
    setLoading(true)
    try {
      await accountApi.changePassword(oldPw, newPw, confirmPw)
      toast.push({ icon: '🔒', title: '비밀번호가 변경되었어요. 다시 로그인해 주세요.' })
      logout()
    } catch {
      setError('현재 비밀번호가 올바르지 않습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="비밀번호 변경"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" form="pw-form" disabled={loading}>
            변경
          </Button>
        </div>
      }
    >
      <form id="pw-form" onSubmit={onSubmit} className="space-y-3">
        <Input label="현재 비밀번호" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} required />
        <Input label="새 비밀번호" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
        <Input label="새 비밀번호 확인" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </Modal>
  )
}
