import PocketBase from 'pocketbase'

/**
 * 단일 PocketBase 클라이언트 인스턴스.
 * 컴포넌트에서 직접 import 하지 말고, 각 feature 의 `*.api.ts` 를 통해서만 호출한다.
 */
const url = import.meta.env.VITE_PB_URL

if (!url) {
  // env 미설정 시 빠르게 알아챌 수 있도록
  console.warn('[pb] VITE_PB_URL 이 설정되지 않았습니다. .env 를 확인하세요.')
}

export const pb = new PocketBase(url ?? 'http://127.0.0.1:8090')

// 인증 자동 갱신은 authStore 가 처리. 토큰은 localStorage 에 보존됨.
export type Pb = typeof pb
