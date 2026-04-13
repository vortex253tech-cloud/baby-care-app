---
plan: "04-notifications-and-reminders/06"
status: complete
completed: 2026-04-12
---

# Summary: Plan 06 — Dashboard: próximos lembretes com hora prevista

## What was built
`useDashboardData` extended with a 4th parallel Supabase query for upcoming reminders, `NextReminders` updated to show HH:MM times with urgency coloring, and `DashboardPage` wired to real reminder data.

## Key files created/modified
- `src/hooks/useDashboardData.ts` — added 4th query: `reminders` WHERE baby_id + enabled=true + next_fire_at between now and now+24h, ordered ASC, limited 5; added `UpcomingReminder` interface (`{ id, label, fireAt: string, urgency: 'high' | 'normal' }`); urgency 'high' if fireAt ≤ now + 30 minutes; added `upcomingReminders` to `DashboardData`
- `src/components/dashboard/NextReminders.tsx` — added `fireAt: string` to `Reminder` interface; added `formatFireAt(iso)` → HH:MM in pt-BR; each item shows icon (🔴 high / 🔔 normal) + label + formatted time; high-urgency items use red-tinted background; empty state uses `Link` to `/notifications` instead of Button
- `src/pages/DashboardPage.tsx` — removed manual hunger-alert-based reminders construction; uses `dashData.upcomingReminders.length > 0 ? dashData.upcomingReminders : null`

## Decisions made
- Urgency threshold is 30 minutes (≤ 30min = high, > 30min = normal)
- `upcomingReminders` cap at 5 items (last 24h window) to keep dashboard compact
- Empty state links to `/notifications` for first-time setup CTA

## Self-Check: PASSED
- [x] Dashboard shows upcoming reminders with HH:MM time
- [x] High-urgency reminders (≤30min) have red background
- [x] upcomingReminders limited to 5 items in next 24h
- [x] tsc --noEmit exits 0
- [x] STATE.md updated to 27/67 plans
