-- Migration: 0007_reminders — Phase 4 Reminders

create table if not exists public.reminders (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  baby_id         uuid not null references public.babies(id) on delete cascade,
  type            text not null check (type in ('feeding','medication','vaccine')),
  label           text not null,               -- "Hora de mamar", "Vitamina D", "Pentavalente"
  enabled         boolean not null default true,
  -- recurrence
  interval_hours  numeric,                     -- feeding: 3.0 / medication: 8.0
  -- next scheduled fire time (computed & updated by check-reminders)
  next_fire_at    timestamptz,
  -- silence window (stored as HH:MM text)
  silence_start   text,                        -- e.g. "22:00"
  silence_end     text,                        -- e.g. "06:00"
  -- medication extras
  medication_dose text,
  -- vaccine extras (forward-compat with Phase 6 HLTH calendar)
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

-- pg_cron: call check-reminders every minute
-- Run this block manually in the SQL Editor AFTER enabling the pg_cron extension
-- (Supabase Dashboard → Database → Extensions → search "pg_cron" → Enable)

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
