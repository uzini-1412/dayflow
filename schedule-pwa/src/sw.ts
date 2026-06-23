/// <reference lib="webworker" />
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>
}

// 빌드시 주입되는 프리캐시 매니페스트
precacheAndRoute(self.__WB_MANIFEST)

// SPA 오프라인 진입: 모든 네비게이션 요청을 프리캐시된 index.html 로 폴백
// (딥링크/새로고침도 오프라인에서 앱 셸이 뜨도록) — API/파일 경로는 제외
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    denylist: [/^\/api\//, /^\/_/],
  }),
)

// 새 SW 즉시 활성화
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

interface PushPayload {
  title?: string
  body?: string
  link?: string
}

// 서버 푸시 수신 → 알림 표시 (앱이 포커스 중이면 인앱 토스트가 처리하므로 스킵)
self.addEventListener('push', (event: PushEvent) => {
  let data: PushPayload = {}
  try {
    data = event.data?.json() ?? {}
  } catch {
    data = { title: event.data?.text() }
  }
  const title = data.title ?? '일정 알림'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const focused = clients.some((c) => 'focused' in c && (c as WindowClient).focused)
      if (focused) return
      return self.registration.showNotification(title, {
        body: data.body ?? '',
        icon: '/pwa-192.png',
        badge: '/pwa-192.png',
        data: { link: data.link ?? '/' },
      })
    }),
  )
})

// 알림 클릭 → 해당 일정으로 이동(딥링크)
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const link = (event.notification.data?.link as string) ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          void client.navigate(link)
          return client.focus()
        }
      }
      return self.clients.openWindow(link)
    }),
  )
})
