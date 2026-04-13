---
plan: "04-notifications-and-reminders/02"
status: complete
completed: 2026-04-12
---

# Summary: Plan 02 — Schema reminders + Edge Function check-reminders + pg_cron

## What was built
Migration 0007, `Reminder` TypeScript type, `useReminders` hook, and Edge Function `check-reminders` with silence-window logic and pg_cron scheduling block.

## Key files created/modified
- `supabase/migrations/0007_reminders.sql` — table with user_id, baby_id, type ('feeding'|'medication'|'vaccine'), label, enabled, interval_hours, next_fire_at, silence_start/end, medication_dose, vaccine_id, vaccine_date; index on (user_id, next_fire_at) WHERE enabled=true; RLS; updated_at trigger; commented pg_cron block
- `src/types/index.ts` — added `Reminder` interface; added `/notifications` to `AppRoute`
- `src/hooks/useReminders.ts` — fetches reminders by baby_id; exposes createReminder, updateReminder, deleteReminder, toggleReminder, refetch; local state updates on all mutations
- `supabase/functions/check-reminders/index.ts` — queries enabled reminders with next_fire_at ≤ now; checks overnight-aware silence window; calls send-push Edge Function per due reminder; advances next_fire_at by interval_hours for recurring reminders; sets enabled=false for one-shot (vaccine) reminders

## Decisions made
- Silence window comparison uses UTC hours with overnight-aware logic: `sh > eh ? localHour >= sh || localHour < eh : localHour >= sh && localHour < eh`
- pg_cron block is commented and must be executed manually in SQL Editor after enabling the extension in Supabase Dashboard
- One-shot reminders (vaccine, interval_hours null) are disabled after firing rather than deleted, preserving history

## Self-Check: PASSED
- [x] 0007_reminders.sql exists with RLS + index
- [x] Reminder type exported from src/types/index.ts
- [x] useReminders returns CRUD complete + toggleReminder
- [x] check-reminders Edge Function respects silence window and advances next_fire_at
- [x] tsc --noEmit exits 0
