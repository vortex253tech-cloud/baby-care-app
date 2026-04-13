---
plan: "04-notifications-and-reminders/02"
phase: 4
sequence: 2
title: "Schema reminders + Edge Function check-reminders + pg_cron"
status: pending
requires: ["04-notifications-and-reminders/01"]
---

# Plan 02: Schema reminders + Edge Function check-reminders + pg_cron

## Objective
Criar a tabela `reminders` que armazena lembretes configurados pela usuária (feeding, medication, vaccine), a Edge Function `check-reminders` que avalia quais lembretes devem disparar agora respeitando janela de silêncio, e o agendamento via pg_cron a cada minuto.

## Requirements Addressed
- NOTF-01: Lembretes de alimentação recorrentes
- NOTF-02: Lembrete de vacina
- NOTF-03: Lembrete de medicamento
- NOTF-06: Horário de silêncio

## Tasks

<task id="2.1" type="schema">
  <title>Migration 0007_reminders.sql</title>
  <description>
Criar `supabase/migrations/0007_reminders.sql`:

```sql
-- Migration: 0007_reminders — Phase 4 Reminders

create table if not exists public.reminders (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  baby_id         uuid not null references public.babies(id) on delete cascade,
  type            text not null check (type in ('feeding','medication','vaccine')),
  label           text not null,               -- "Mamada", "Vitamina D", "Pentavalente"
  enabled         boolean not null default true,
  -- recurrence
  interval_hours  numeric,                     -- feeding: 3.0 / medication: 8.0
  -- anchor: when to start counting (null = from last feeding)
  next_fire_at    timestamptz,                 -- computed & updated by check-reminders
  -- silence window (stored as HH:MM text in user's local time)
  silence_start   text,                        -- e.g. "22:00"
  silence_end     text,                        -- e.g. "06:00"
  -- medication extras
  medication_dose text,
  -- vaccine extras (reference to HLTH calendar, Phase 6)
  vaccine_id      uuid,
  vaccine_date    date,
  -- metadata
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists reminders_user_next_idx
  on public.reminders(user_id, next_fire_at)
  where enabled = true;

alter table public.reminders enable row level security;

create trigger reminders_updated_at before update on public.reminders
  for each row execute function public.set_updated_at();

create policy "Users manage their reminders" on public.reminders
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```
  </description>
  <files>
    <file action="create">supabase/migrations/0007_reminders.sql</file>
  </files>
</task>

<task id="2.2" type="code">
  <title>TypeScript type Reminder</title>
  <description>
Adicionar a `src/types/index.ts`:

```typescript
export interface Reminder {
  id: string
  user_id: string
  baby_id: string
  type: 'feeding' | 'medication' | 'vaccine'
  label: string
  enabled: boolean
  interval_hours: number | null
  next_fire_at: string | null
  silence_start: string | null
  silence_end: string | null
  medication_dose: string | null
  vaccine_id: string | null
  vaccine_date: string | null
  created_at: string
  updated_at: string
}
```
  </description>
  <files>
    <file action="modify">src/types/index.ts</file>
  </files>
</task>

<task id="2.3" type="edge-function">
  <title>Edge Function check-reminders</title>
  <description>
Criar `supabase/functions/check-reminders/index.ts`:

```typescript
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
      const localHour = now.getUTCHours() // simplified — use user timezone for production
      const [sh] = r.silence_start.split(':').map(Number)
      const [eh] = r.silence_end.split(':').map(Number)
      const inSilence = sh > eh
        ? localHour >= sh || localHour < eh   // overnight: 22–06
        : localHour >= sh && localHour < eh    // same-day: 09–12
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

    // Advance next_fire_at by interval_hours (feeding / medication)
    if (r.interval_hours) {
      const next = new Date(now.getTime() + r.interval_hours * 60 * 60 * 1000)
      await supabase.from('reminders')
        .update({ next_fire_at: next.toISOString() })
        .eq('id', r.id)
    } else {
      // one-shot (vaccine): disable after firing
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
```
  </description>
  <files>
    <file action="create">supabase/functions/check-reminders/index.ts</file>
  </files>
</task>

<task id="2.4" type="schema">
  <title>pg_cron schedule via migration</title>
  <description>
Adicionar ao final de `supabase/migrations/0007_reminders.sql` (seção separada por comentário):

```sql
-- pg_cron: call check-reminders every minute
-- Run this block manually in the SQL Editor after enabling pg_cron extension
-- (Supabase Dashboard → Database → Extensions → pg_cron)

/*
select cron.schedule(
  'check-reminders',
  '* * * * *',
  $$
    select net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/check-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);
*/
```

Documentar no SUPABASE-SETUP.md que o bloco acima deve ser executado manualmente após habilitar a extensão pg_cron.
  </description>
  <files>
    <file action="modify">supabase/migrations/0007_reminders.sql</file>
  </files>
</task>

<task id="2.5" type="code">
  <title>Hook useReminders</title>
  <description>
Criar `src/hooks/useReminders.ts`:

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Reminder } from '@/types'

export function useReminders(babyId: string, userId: string) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchReminders() {
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('baby_id', babyId)
      .order('created_at', { ascending: true })
    setReminders(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchReminders() }, [babyId])

  async function createReminder(input: Omit<Reminder, 'id' | 'user_id' | 'baby_id' | 'created_at' | 'updated_at'>) {
    const { data } = await supabase
      .from('reminders')
      .insert({ ...input, user_id: userId, baby_id: babyId })
      .select()
      .single()
    if (data) setReminders((prev) => [...prev, data])
    return data
  }

  async function updateReminder(id: string, patch: Partial<Reminder>) {
    const { data } = await supabase
      .from('reminders')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (data) setReminders((prev) => prev.map((r) => r.id === id ? data : r))
    return data
  }

  async function deleteReminder(id: string) {
    await supabase.from('reminders').delete().eq('id', id)
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  async function toggleReminder(id: string, enabled: boolean) {
    return updateReminder(id, { enabled })
  }

  return { reminders, loading, createReminder, updateReminder, deleteReminder, toggleReminder, refetch: fetchReminders }
}
```
  </description>
  <files>
    <file action="create">src/hooks/useReminders.ts</file>
  </files>
</task>

<task id="2.6" type="docs">
  <title>Atualizar SUPABASE-SETUP.md</title>
  <description>
Adicionar seção "Phase 4 — Reminders Schema & Scheduler":
- Executar migration 0007_reminders.sql
- Habilitar extensão pg_cron no Dashboard
- Executar manualmente o bloco `cron.schedule` do final da migration
- Deploy da Edge Function: `supabase functions deploy check-reminders`
  </description>
  <files>
    <file action="modify">SUPABASE-SETUP.md</file>
  </files>
</task>

## Verification
- [ ] 0007_reminders.sql cria tabela reminders com RLS + índice
- [ ] Reminder type exportado de src/types/index.ts
- [ ] useReminders retorna CRUD completo + toggleReminder
- [ ] Edge Function check-reminders respeita janela de silêncio e avança next_fire_at
- [ ] tsc --noEmit exits 0
