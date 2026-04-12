---
plan: "03-core-trackers/08"
status: complete
completed: 2026-04-12
---

# Summary: Plan 08 — Dashboard: Real data integration + hunger alert

## What was built
`useDashboardData` hook aggregating feedings/sleeps/diapers in parallel, updated `DailySummary` with proper hour formatting, updated `NextReminders` with urgency styling, and `DashboardPage` wired to real data.

## Key files created/modified
- `src/hooks/useDashboardData.ts` — `Promise.all` over three Supabase queries: last feeding (most recent ever), today's sleeps, today's diapers. Returns `{ lastFeed, sleepHoursToday, diapersToday, hungerAlertMinutes }`. `hungerAlertMinutes` is set when last feed was ≥ 180 min ago.
- `src/components/dashboard/DailySummary.tsx` — `formatFeedAgo()` handles `< 60 → "Xmin atrás"`, `>= 60 → "Xh Ymin atrás"`. Removed `side` from props (not surfaced in dashboard). Sleeps/diapers show "—" when 0.
- `src/components/dashboard/NextReminders.tsx` — `Reminder` interface changed `time` → `urgency: 'high' | 'normal'`. High-urgency items: red-tinted background + 🍼 icon. Empty state text updated to "Sem lembretes no momento".
- `src/pages/DashboardPage.tsx` — Uses `useDashboardData(activeBaby.id)`. Builds `reminders` array from `hungerAlertMinutes`. Passes real data to `DailySummary` and `NextReminders`.

## Decisions made
- Dashboard doesn't block on `dashData` loading — it renders with null props (showing "—") while data loads in background. This avoids a spinner flash for every dashboard visit.
- `sleepHoursToday` and `diapersToday` show "—" when 0 (not "0 hoje") — avoids showing "0 hoje" at 6am before any activity.

## Self-Check: PASSED
- [x] Dashboard shows "Xmin atrás" / "Xh atrás" after feeding
- [x] Dashboard shows correct sleep hours
- [x] Dashboard shows correct diaper count
- [x] Hunger alert (>= 3h) appears in NextReminders with high urgency styling
- [x] No data: cards show "—", NextReminders shows empty state
- [x] tsc --noEmit exits 0
