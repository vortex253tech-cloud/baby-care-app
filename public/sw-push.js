// Service Worker — Push event handlers for MamãeApp
// This file is imported by the Workbox-generated SW via importScripts.

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title ?? 'MamãeApp'
  const options = {
    body: data.body ?? '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: { url: data.url ?? '/' },
    tag: data.tag ?? 'mamaeapp',
    renotify: true,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        const existing = list.find((c) => c.url.includes(self.location.origin))
        if (existing) return existing.focus()
        return clients.openWindow(event.notification.data?.url ?? '/')
      })
  )
})
