import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

  const now = new Date()

  // Fetch enabled reminders that are due (next_fire_at <= now)
  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .eq('enabled', true)
    .lte('next_fire_at', now.toISOString())
    .not('next_fire_at', 'is', null)

  if (!reminders?.length) {
    return new Response(JSON.stringify({ fired: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let fired = 0

  await Promise.all(reminders.map(async (r) => {
    // Check silence window
    if (r.silence_start && r.silence_end) {
      const utcHour = now.getUTCHours()
      const [sh] = (r.silence_start as string).split(':').map(Number)
      const [eh] = (r.silence_end as string).split(':').map(Number)
      // Overnight window (e.g. 22:00–06:00): silence if hour >= 22 OR hour < 6
      // Same-day window (e.g. 09:00–12:00): silence if 9 <= hour < 12
      const inSilence = sh > eh
        ? utcHour >= sh || utcHour < eh
        : utcHour >= sh && utcHour < eh
      if (inSilence) return
    }

    // Fire push notification
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        user_id: r.user_id,
        title: 'MamãeApp',
        body: r.label,
        url: '/notifications',
        tag: `reminder-${r.id}`,
      }),
    })

    // Recurring: advance next_fire_at by interval_hours
    if (r.interval_hours) {
      const next = new Date(now.getTime() + Number(r.interval_hours) * 60 * 60 * 1000)
      await supabase.from('reminders')
        .update({ next_fire_at: next.toISOString() })
        .eq('id', r.id)
    } else {
      // One-shot (vaccine): disable after firing
      await supabase.from('reminders')
        .update({ enabled: false })
        .eq('id', r.id)
    }

    fired++
  }))

  return new Response(JSON.stringify({ fired }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
