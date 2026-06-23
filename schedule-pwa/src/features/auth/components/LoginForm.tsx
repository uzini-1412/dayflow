import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@shared/ui'
import { ROUTES } from '@shared/lib/routes'
import { useAuth } from '../useAuth'

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate(ROUTES.home)
    } catch {
      setError('아이디나 비밀번호가 잘못되었습니다.')
    } finally {
      setLoading(false)
    }
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
    </form>
  )
}
