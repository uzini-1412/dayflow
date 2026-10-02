// 공용 데모 계정 생성 + 샘플 데이터 (재실행 시 데모 데이터를 초기화)
// 실행: node scripts/seed-demo.mjs [백엔드URL]
//   예) node scripts/seed-demo.mjs https://dayflow.34-168-96-154.sslip.io
// 계정 정보는 src/features/auth/auth.demo.ts 와 동일해야 한다.
import PocketBase from 'pocketbase'

const URL = process.argv[2] ?? process.env.VITE_PB_URL ?? 'http://127.0.0.1:8090'
const DEMO = { email: 'demo@dayflow.app', password: 'dayflow-demo-2026', nickname: '데모' }

const pb = new PocketBase(URL)
pb.autoCancellation(false)

// --- 로그인 (없으면 생성) ---
try {
  await pb.collection('users').authWithPassword(DEMO.email, DEMO.password)
} catch {
  await pb.collection('users').create({
    email: DEMO.email,
    password: DEMO.password,
    passwordConfirm: DEMO.password,
    name: DEMO.nickname,
    nickname: DEMO.nickname,
    emailVisibility: false,
  })
  await pb.collection('users').authWithPassword(DEMO.email, DEMO.password)
}
const uid = pb.authStore.record.id

// --- 기존 데모 데이터 비우기 ---
for (const col of ['schedules', 'memos', 'categories']) {
  const items = await pb.collection(col).getFullList({ fields: 'id' })
  for (const it of items) await pb.collection(col).delete(it.id)
}

// --- 날짜 유틸 (한국 시간 기준 오늘 + N일, HH:mm) ---
const KST = 9 * 60 * 60 * 1000
const kstToday = new Date(Date.now() + KST)
const at = (dayOffset, hh, mm = 0) =>
  new Date(
    Date.UTC(kstToday.getUTCFullYear(), kstToday.getUTCMonth(), kstToday.getUTCDate() + dayOffset, hh, mm) - KST,
  ).toISOString()

// --- 카테고리 ---
const cat = {}
for (const [name, color] of [['업무', '#6366f1'], ['공부', '#10b981'], ['개인', '#ec4899']]) {
  cat[name] = (await pb.collection('categories').create({ user: uid, name, color })).id
}

// --- 일정 ---
const schedule = (title, start, end, extra = {}) =>
  pb.collection('schedules').create({
    user: uid,
    title,
    start_at: start,
    end_at: end,
    all_day: false,
    importance: 'mid',
    visible: true,
    completed: false,
    cost: 0,
    ...extra,
  })

await schedule('자료구조 과제 제출', at(-1, 23, 0), at(-1, 23, 59), { category: cat['공부'], completed: true })
await schedule('팀 스탠드업 미팅', at(0, 9, 30), at(0, 10, 0), { category: cat['업무'], location: '회의실 B' })
await schedule('점심 약속 🍜', at(0, 12, 30), at(0, 13, 30), { category: cat['개인'], cost: 12000 })
await schedule('알고리즘 스터디', at(0, 19, 0), at(0, 21, 0), {
  category: cat['공부'],
  description: '이번 주: 다익스트라 / 플로이드-워셜',
})
await schedule('포트폴리오 README 정리', at(1, 10, 0), at(1, 12, 0), { category: cat['업무'] })
await schedule('헬스장', at(2, 7, 0), at(2, 8, 0), { category: cat['개인'] })
await schedule('졸업 프로젝트 발표', at(5, 14, 0), at(5, 16, 0), {
  category: cat['공부'],
  importance: 'high',
  description: '발표 자료 최종 점검 필수',
})

// --- 메모 ---
await pb.collection('memos').create({
  user: uid,
  title: '이번 주 목표',
  content: '- 알고리즘 문제 10개\n- 포트폴리오 배포 마무리\n- 운동 3회',
  color: '#fff7cd',
  pinned: true,
})
await pb.collection('memos').create({
  user: uid,
  title: '발표 준비 체크리스트',
  content: '슬라이드 / 데모 영상 / 예상 질문 정리',
  color: '#dbeafe',
  pinned: false,
})

console.log(`데모 계정 준비 완료: ${DEMO.email} (${URL})`)
