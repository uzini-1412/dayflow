import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@shared/ui'
import { ROUTES } from '@shared/lib/routes'
import { useAuth } from '../useAuth'
import { authApi } from '../auth.api'
import { validateRegister, hasErrors, type FieldErrors } from '../auth.validation'
import type { RegisterInput } from '../auth.types'

const EMPTY: RegisterInput = {
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  nickname: '',
  birthdate: '',
}

export function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterInput>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors<RegisterInput>>({})
  const [loading, setLoading] = useState(false)

  const set = (k: keyof RegisterInput) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const v = validateRegister(form)
    if (await authApi.isNicknameTaken(form.nickname)) v.nickname = '이미 사용 중인 닉네임입니다.'
    setErrors(v)
    if (hasErrors(v)) return

    setLoading(true)
    try {
      await register(form)
      navigate(ROUTES.login)
    } catch {
      setErrors({ email: '회원가입에 실패했습니다. 입력값을 확인하세요.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="이메일" type="email" value={form.email} onChange={set('email')} error={errors.email} required />
      <Input label="비밀번호" type="password" value={form.password} onChange={set('password')} error={errors.password} required />
      <Input label="비밀번호 확인" type="password" value={form.passwordConfirm} onChange={set('passwordConfirm')} error={errors.passwordConfirm} required />
      <Input label="이름" value={form.name} onChange={set('name')} error={errors.name} required />
      <Input label="닉네임" value={form.nickname} onChange={set('nickname')} error={errors.nickname} required />
      <Input label="생년월일" type="date" value={form.birthdate} onChange={set('birthdate')} />
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? '가입 중…' : '회원가입'}
      </Button>
    </form>
  )
}
