import { Modal } from '@shared/ui'
import { useAuthModal } from '../authModal.store'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

/** 전역 로그인/회원가입 모달 — 페이지 이동 없이 어디서든 열린다 (AuthProvider 에서 1회 렌더) */
export function AuthModal() {
  const { isOpen, mode, reason, setMode, close } = useAuthModal()
  const isLogin = mode === 'login'

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="sm"
      title={isLogin ? '로그인' : '회원가입'}
      description={reason ?? (isLogin ? '일정 관리에 오신 것을 환영합니다' : '이메일과 비밀번호만 있으면 바로 시작해요')}
    >
      {isLogin ? <LoginForm onSuccess={close} /> : <RegisterForm onSuccess={close} />}
      <p className="mt-4 text-center text-sm text-zinc-500">
        {isLogin ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
        <button
          type="button"
          onClick={() => setMode(isLogin ? 'register' : 'login')}
          className="font-medium text-brand-600 hover:underline"
        >
          {isLogin ? '회원가입' : '로그인'}
        </button>
      </p>
    </Modal>
  )
}
