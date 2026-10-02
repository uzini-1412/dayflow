/**
 * 포트폴리오 방문자용 공용 데모 계정.
 * 서버 마이그레이션(1700000900_demo_guard)에서 이 계정의 비밀번호 변경·탈퇴를 막는다.
 */
export const DEMO_ACCOUNT = {
  email: 'demo@dayflow.app',
  password: 'dayflow-demo-2026',
} as const

export const isDemoUser = (email?: string | null) => email === DEMO_ACCOUNT.email
