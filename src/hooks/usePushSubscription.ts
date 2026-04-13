import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type PushState = 'unsupported' | 'denied' | 'granted' | 'idle'

export function usePushSubscription(userId: string | undefined) {
  const [state, setState] = useState<PushState>('idle')
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'denied') setState('denied')
    else if (Notification.permission === 'granted') setState('granted')
    else setState('idle')
  }, [])

  async function subscribe(): Promise<boolean> {
    if (!userId) return false
    if (!('serviceWorker' in navigator)) return false

    setSubscribing(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'idle')
        return false
      }
      setState('granted')

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY as string
        ),
      })

      const json = sub.toJSON() as {
        endpoint: string
        keys: { p256dh: string; auth: string }
      }

      await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        user_agent: navigator.userAgent,
      }, { onConflict: 'user_id,endpoint' })

      return true
    } catch {
      return false
    } finally {
      setSubscribing(false)
    }
  }

  async function unsubscribe(): Promise<void> {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await sub.unsubscribe()
      await supabase.from('push_subscriptions')
        .delete()
        .eq('endpoint', sub.endpoint)
    }
    setState('idle')
  }

  return { state, subscribing, subscribe, unsubscribe }
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr.buffer
}
