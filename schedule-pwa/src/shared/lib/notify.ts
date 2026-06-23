/** 브라우저 로컬 알림 유틸 (서비스워커 우선, 없으면 Notification API) */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

export async function showLocalNotification(
  title: string,
  options?: NotificationOptions,
): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  // 서비스워커가 있으면 그쪽으로 (PWA 일관성)
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg) {
      await reg.showNotification(title, { icon: '/pwa-192.png', ...options })
      return
    }
  }
  new Notification(title, options)
}
