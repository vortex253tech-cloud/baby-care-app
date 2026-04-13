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
        // 410 Gone = subscription expired, remove it
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
