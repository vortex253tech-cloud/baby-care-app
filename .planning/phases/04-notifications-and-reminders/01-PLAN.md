---
plan: "04-notifications-and-reminders/01"
phase: 4
sequence: 1
title: "Service Worker + Web Push API + push_subscriptions"
status: pending
requires: []
---

# Plan 01: Service Worker + Web Push API + push_subscriptions

## Objective
Configurar o service worker para push notifications: gerar VAPID keys, salvar a subscription do navegador na tabela `push_subscriptions`, criar a Edge Function `send-push` que envia uma notificação a um usuário, e expor o hook `usePushSubscription` que solicita permissão e registra a subscription.

## Requirements Addressed
- NOTF-04: Notificações via Web Push (mesmo com app fechado no Android)

## Tasks

<task id="1.1" type="schema">
  <title>Migration 0006_push_subscriptions.sql</title>
  <description>
Criar `supabase/migrations/0006_push_subscriptions.sql`:

```sql
-- Migration: 0006_push_subscriptions — Phase 4 Push Notifications

create table if not exists public.push_subscriptions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "Users manage their push subscriptions" on public.push_subscriptions
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```
  </description>
  <files>
    <file action="create">supabase/migrations/0006_push_subscriptions.sql</file>
  </files>
</task>

<task id="1.2" type="code">
  <title>VAPID keys + vite-plugin-pwa push config</title>
  <description>
1. Gerar VAPID keys (uma vez, armazenar no `.env`):
   ```
   VITE_VAPID_PUBLIC_KEY=<base64url public key>
   VAPID_PRIVATE_KEY=<base64url private key>    # only server-side
   VAPID_SUBJECT=mailto:admin@mamaeapp.com
   ```
   O `.env.example` deve listar as três variáveis (sem valores).

2. Atualizar `vite.config.ts` para habilitar o SW em dev e configurar push:
```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: false,
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [],
  },
  devOptions: {
    enabled: true,        // enable SW in dev so we can test push
    type: 'module',
  },
  injectRegister: 'auto',
})
```

3. Adicionar ao `public/sw.js` (custom SW que o vite-plugin-pwa importará via `importScripts`):
```javascript
// public/sw-push.js  (imported by the generated SW via workbox)
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
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.includes(self.location.origin))
      if (existing) return existing.focus()
      return clients.openWindow(event.notification.data?.url ?? '/')
    })
  )
})
```

4. Configurar o vite-plugin-pwa para injetar `sw-push.js` via `additionalManifestEntries` ou `importScripts` no workbox config.
  </description>
  <files>
    <file action="modify">vite.config.ts</file>
    <file action="create">public/sw-push.js</file>
    <file action="modify">.env.example</file>
  </files>
</task>

<task id="1.3" type="code">
  <title>Hook usePushSubscription</title>
  <description>
Criar `src/hooks/usePushSubscription.ts`:

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type PushState = 'unsupported' | 'denied' | 'granted' | 'idle'

export function usePushSubscription(userId: string | undefined) {
  const [state, setState] = useState<PushState>('idle')
  const [subscribing, setSubscribing] = useState(false)

  // On mount: check current permission state
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
          import.meta.env.VITE_VAPID_PUBLIC_KEY
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

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}
```
  </description>
  <files>
    <file action="create">src/hooks/usePushSubscription.ts</file>
  </files>
</task>

<task id="1.4" type="edge-function">
  <title>Edge Function send-push</title>
  <description>
Criar `supabase/functions/send-push/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT')!,
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!
  )

  const { user_id, title, body, url, tag } = await req.json()

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', user_id)

  if (!subs?.length) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const payload = JSON.stringify({ title, body, url: url ?? '/', tag })
  let sent = 0

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        )
        sent++
      } catch (err: unknown) {
        // 410 Gone = subscription expired, delete it
        if ((err as { statusCode?: number }).statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
        }
      }
    })
  )

  return new Response(JSON.stringify({ sent }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
```
  </description>
  <files>
    <file action="create">supabase/functions/send-push/index.ts</file>
  </files>
</task>

<task id="1.5" type="docs">
  <title>Atualizar SUPABASE-SETUP.md</title>
  <description>
Adicionar seção "Phase 4 — Push Notifications":
- Executar migration 0006_push_subscriptions.sql no SQL Editor
- Gerar VAPID keys com `npx web-push generate-vapid-keys` e adicionar ao `.env` e ao Supabase secrets (Dashboard → Settings → Edge Functions → Secrets): `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- Deploy da Edge Function: `supabase functions deploy send-push`
  </description>
  <files>
    <file action="modify">SUPABASE-SETUP.md</file>
  </files>
</task>

## Verification
- [ ] 0006_push_subscriptions.sql existe com tabela + RLS
- [ ] public/sw-push.js com handler `push` e `notificationclick`
- [ ] usePushSubscription retorna { state, subscribing, subscribe, unsubscribe }
- [ ] Edge Function send-push envia push via web-push e limpa subs expiradas
- [ ] tsc --noEmit exits 0
