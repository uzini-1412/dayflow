import { useCallback } from 'react'
import { requestNotificationPermission } from '@shared/lib/notify'
import { pushApi } from './push.api'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

/** base64 VAPID 키 → Uint8Array (ArrayBuffer 백킹) */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized)
  const buffer = new ArrayBuffer(raw.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i)
  return view
}

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

/** Web Push 구독/해제 (서비스워커 pushManager + 서버 저장) */
export function usePush() {
  const subscribe = useCallback(async () => {
    if (!pushSupported()) throw new Error('이 브라우저는 푸시를 지원하지 않습니다.')

    const perm = await requestNotificationPermission()
    if (perm !== 'granted') throw new Error('알림 권한이 거부되었습니다.')

    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      if (!VAPID_PUBLIC_KEY) {
        throw new Error('서버 푸시 키(VITE_VAPID_PUBLIC_KEY)가 설정되지 않았습니다.')
      }
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }
    await pushApi.save(sub)
  }, [])

  const unsubscribe = useCallback(async () => {
    if (!pushSupported()) return
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await pushApi.removeByEndpoint(sub.endpoint)
      await sub.unsubscribe()
    }
  }, [])

  return { subscribe, unsubscribe }
}
