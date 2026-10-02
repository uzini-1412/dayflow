import { useState, type FormEvent } from 'react'
import { ClientResponseError } from 'pocketbase'
import { Button, Input } from '@shared/ui'
import { useAuth } from '../useAuth'
import { validateRegister, hasErrors, type FieldErrors } from '../auth.validation'
import type { RegisterInput } from '../auth.types'

interface RegisterFormProps {
  onSuccess: () => void
}

/** 간편 가입 — 이메일·비밀번호만 입력, 가입 즉시 자동 로그인 */
export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register, login } = useAuth()
  const [form, setForm] = useState<RegisterInput>({ email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors<RegisterInput>>({})
  const [loading, setLoading] = useState(false)

  const set = (k: keyof RegisterInput) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const v = validateRegister(form)
    setErrors(v)
    if (hasErrors(v)) return

    setLoading(true)
    try {
      await register(form)
      await login(form)
      onSuccess()
    } catch (err) {
      const taken = err instanceof ClientResponseError && err.response?.data?.email
      setErrors({ email: taken ? '이미 가입된 이메일입니다.' : '회원가입에 실패했습니다. 잠시 후 다시 시도하세요.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="이메일" type="email" value={form.email} onChange={set('email')} error={errors.email} required autoComplete="email" />
      <Input
        label="비밀번호"
        type="password"
        value={form.password}
        onChange={set('password')}
        error={errors.password}
        required
        autoComplete="new-password"
        placeholder="문자+숫자 8자 이상"
      />
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? '가입 중…' : '가입하고 시작하기'}
      </Button>
    </form>
  )
}
