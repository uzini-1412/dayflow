// Web Push 발송 워커 + 일정 리마인더 스케줄러 (폴링 방식)
//  매 주기마다: (1) 다가온 일정의 리마인더 알림 생성  (2) 미발송 알림을 구독 기기로 Web Push 발송
// Node 에 EventSource 가 없어 realtime 대신 폴링을 사용한다.
// 실행: npm run push  (node --env-file=.env scripts/push-worker.mjs)
import webpush from 'web-push'
import PocketBase from 'pocketbase'

const PB_URL = process.env.VITE_PB_URL ?? 'http://127.0.0.1:8090'
const PUBLIC = process.env.VITE_VAPID_PUBLIC_KEY
const PRIVATE = process.env.VAPID_PRIVATE_KEY
const SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:admin@local.test'
const REMINDER_OFFSETS = (process.env.REMINDER_OFFSETS ?? '10,0').split(',').map(Number).filter((n) => !Number.isNaN(n))
const MAX_OFFSET = Math.max(0, ...REMINDER_OFFSETS)
const INTERVAL = 15000

if (!PUBLIC || !PRIVATE) {
  console.error('VAPID 키가 없습니다. .env 의 VITE_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY 를 확인하세요.')
  process.exit(1)
}
webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE)

const pb = new PocketBase(PB_URL)
pb.autoCancellation(false)

// ---------- 미발송 알림 → 푸시 발송 ----------
async function sendPending() {
  const pending = await pb.collection('notifications').getFullList({ filter: 'sent != true', sort: 'created' })
  for (const n of pending) {
    const subs = await pb.collection('push_subscriptions').getFullList({ filter: `user = "${n.user}"` })
    const payload = JSON.stringify({ title: n.title, body: n.body ?? '', link: n.link ?? '/' })
    for (const s of subs) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
        console.log(`  → push to ${s.endpoint.slice(0, 36)}…`)
      } catch (err) {
        const code = err?.statusCode
        if (code === 404 || code === 410) {
          await pb.collection('push_subscriptions').delete(s.id)
        } else {
          console.log(`  → 발송 실패 (${code ?? err?.message})`)
        }
      }
    }
    await pb.collection('notifications').update(n.id, { sent: true })
  }
}

// ---------- 리마인더 스케줄러 ----------
const startOfDayMs = (ms) => {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/** 일정이 특정 날짜(day)에 발생하면 occurrence 시작 Date, 아니면 null */
function occurrenceOn(s, day) {
  const start = new Date(s.start_at)
  const occ = new Date(day)
  occ.setHours(start.getHours(), start.getMinutes(), 0, 0)
  const startDay = new Date(start)
  startDay.setHours(0, 0, 0, 0)
  if (occ < startDay) return null

  const rule = s.repeat_rule
  if (rule?.until && occ > new Date(rule.until)) return null
  if (!rule || rule.freq === 'none') return sameDay(start, day) ? occ : null

  const interval = Math.max(1, rule.interval ?? 1)
  switch (rule.freq) {
    case 'daily':
    case 'interval': {
      const diff = Math.round((startOfDayMs(day.getTime()) - startDay.getTime()) / 86400000)
      return diff >= 0 && diff % interval === 0 ? occ : null
    }
    case 'weekly': {
      const wds = rule.weekdays?.length ? rule.weekdays : [start.getDay()]
      return wds.includes(day.getDay()) ? occ : null
    }
    case 'monthly':
      return day.getDate() === (rule.monthDay ?? start.getDate()) ? occ : null
    case 'yearly':
      return day.getMonth() === (rule.month ?? start.getMonth()) && day.getDate() === (rule.day ?? start.getDate()) ? occ : null
    default:
      return null
  }
}

const fired = new Set()
let lastTick = Date.now() - INTERVAL - 5000

async function reminderTick() {
  const now = Date.now()
  const windowEnd = now + MAX_OFFSET * 60000 + 60000
  const schedules = await pb.collection('schedules').getFullList({
    filter: `start_at <= "${new Date(windowEnd).toISOString()}" && completed != true`,
  })
  for (const s of schedules) {
    for (let dayMs = startOfDayMs(now); dayMs <= windowEnd; dayMs += 86400000) {
      const occ = occurrenceOn(s, new Date(dayMs))
      if (!occ) continue
      for (const off of REMINDER_OFFSETS) {
        const fireAt = occ.getTime() - off * 60000
        const key = `${s.id}:${fireAt}`
        if (fireAt > lastTick && fireAt <= now && !fired.has(key)) {
          fired.add(key)
          const label = off === 0 ? '지금' : `${off}분 후`
          await pb.collection('notifications').create({
            user: s.user, type: 'schedule_due', title: s.title,
            body: `${label} 시작하는 일정입니다.`, schedule: s.id,
            link: '/calendar', fire_at: new Date(fireAt).toISOString(), read: false, sent: false,
          })
          console.log(`[reminder] ${s.title} (${label})`)
        }
      }
    }
  }
  lastTick = now
}

async function tick() {
  try {
    await reminderTick()
    await sendPending()
  } catch (err) {
    console.error('[tick]', err?.response?.message ?? err?.message)
  }
}

async function main() {
  await pb.collection('_superusers').authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD)
  console.log(`[push-worker] 가동 (폴링 ${INTERVAL / 1000}s, 리마인더 오프셋=${REMINDER_OFFSETS.join(',')}분)`)
  await tick()
  setInterval(tick, INTERVAL)
}

main().catch((err) => {
  console.error('[push-worker] 오류:', err?.response?.message ?? err?.message)
  process.exit(1)
})
