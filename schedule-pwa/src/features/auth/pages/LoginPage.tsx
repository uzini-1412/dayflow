import { Link } from 'react-router-dom'
import { ROUTES } from '@shared/lib/routes'
import { AuthCard } from '../components/AuthCard'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <AuthCard title="로그인" subtitle="일정 관리에 오신 것을 환영합니다">
      <LoginForm />
      <p className="mt-4 text-center text-sm text-zinc-500">
        계정이 없으신가요?{' '}
        <Link to={ROUTES.register} className="font-medium text-brand-600 hover:underline">
          회원가입
        </Link>
      </p>
    </AuthCard>
  )
}
