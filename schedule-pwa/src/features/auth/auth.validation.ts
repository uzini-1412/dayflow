import type { RegisterInput } from './auth.types'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// SRS: 비밀번호는 문자와 숫자를 조합
const PW_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export function validateRegister(input: RegisterInput): FieldErrors<RegisterInput> {
  const e: FieldErrors<RegisterInput> = {}
  if (!EMAIL_RE.test(input.email)) e.email = '올바른 이메일 형식이 아닙니다.'
  if (!PW_RE.test(input.password))
    e.password = '비밀번호는 문자와 숫자를 포함해 8자 이상이어야 합니다.'
  if (input.password !== input.passwordConfirm)
    e.passwordConfirm = '비밀번호가 일치하지 않습니다.'
  if (!input.name.trim()) e.name = '이름을 입력하세요.'
  if (input.nickname.trim().length < 2) e.nickname = '닉네임은 2자 이상이어야 합니다.'
  return e
}

export const hasErrors = (e: FieldErrors<unknown>): boolean => Object.keys(e).length > 0
