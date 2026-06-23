import { Link } from 'react-router-dom'
import { ROUTES } from '@shared/lib/routes'
import { AuthCard } from '../components/AuthCard'
import { RegisterForm } from '../components/RegisterForm'

export function RegisterPage() {
  return (
    <AuthCard title="회원가입" subtitle="계정을 만들어 시작하세요">
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-zinc-500">
        이미 계정이 있으신가요?{' '}
        <Link to={ROUTES.login} className="font-medium text-brand-600 hover:underline">
          로그인
        </Link>
      </p>
    </AuthCard>
  )
}
