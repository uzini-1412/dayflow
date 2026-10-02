import { useState, type FormEvent } from 'react'
import { Button, Input } from '@shared/ui'
import { useAuth } from '../useAuth'
import { DEMO_ACCOUNT } from '../auth.demo'

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(input: { email: string; password: string }) {
    setError('')
    setLoading(true)
    try {
      await login(input)
      onSuccess()
    } catch {
      setError('아이디나 비밀번호가 잘못되었습니다.')
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void submit({ email, password })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? '로그인 중…' : '로그인'}
      </Button>
      <Button
        type="button"
        variant="secondary"
        fullWidth
        disabled={loading}
        onClick={() => void submit(DEMO_ACCOUNT)}
      >
        데모 계정으로 체험하기
      </Button>
    </form>
  )
}
