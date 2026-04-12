---
plan: "03-core-trackers/05"
status: complete
completed: 2026-04-12
---

# Summary: Plan 05 — SleepPage: Sleep history + dashboard sleep hours

## What was built
`useSleepList` hook with `sleepHoursToday` calculation, `SleepList` component, and updated `SleepPage` with history section.

## Key files created/modified
- `src/hooks/useSleepList.ts` — Fetches sleeps today (started_at >= today 00:00). Calculates `sleepHoursToday` by summing `(ended_at ?? now) - started_at` for all rows (includes active sleep). Exposes `refetch()`.
- `src/components/sleep/SleepList.tsx` — Per-item: 😴 + duration string + time range. Active sleep shows "Ativo" indigo badge, no trash button. Ended sleeps have trash button.
- `src/pages/SleepPage.tsx` — Added `useSleepList`, "Hoje" section with `<SleepList>`. `handleStop` calls `refetch()`. `handleStart` calls `refetch()`. `handleDelete` calls `supabase.from('sleeps').delete()` + `refetch()`.

## Decisions made
- Active sleep omits the delete button — the timer card already provides the "stop" action; deleting an in-progress sleep would leave orphaned state.

## Self-Check: PASSED
- [x] Today's sleep history appears below timer
- [x] Active sleep: "Ativo" badge, no delete button
- [x] Deleting completed sleep removes from list without reload
- [x] sleepHoursToday includes active sleep duration
- [x] tsc --noEmit exits 0
