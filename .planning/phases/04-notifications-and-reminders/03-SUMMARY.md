---
plan: "04-notifications-and-reminders/03"
status: complete
completed: 2026-04-12
---

# Summary: Plan 03 — UI de lembretes de alimentação + página NotificationsPage

## What was built
`NotificationsPage` shell with feeding reminders section, `PushPermissionBanner`, `FeedingReminderForm`, router route `/notifications`, and Alertas nav item in bottom nav.

## Key files created/modified
- `src/pages/NotificationsPage.tsx` — full page using `useBabies()` (not BabyContext), `useReminders`, four card sections (feeding, medication, silence, vaccines); handleFeedingSave creates/updates reminder with next_fire_at = now + interval
- `src/router.tsx` — added `{ path: '/notifications', element: <NotificationsPage /> }` inside AppShell routes
- `src/components/layout/BottomNav.tsx` — added custom `BellIcon` / `BellIconFilled` SVG inline components; added Alertas nav item at `/notifications` (6th item); active highlight with filled icon
- `src/components/notifications/PushPermissionBanner.tsx` — shows amber/green/red banner or indigo CTA button based on PushState; uses `usePushSubscription(userId)`
- `src/components/notifications/FeedingReminderForm.tsx` — fields: interval_hours (1–12, step 0.5); shows toggle when existing reminder present; computes next fire preview from now + interval; `onToggle` typed as `(enabled: boolean) => Promise<void>`

## Decisions made
- Used `useBabies()` directly in NotificationsPage (not a BabyContext) — consistent with FeedPage, SleepPage, DiaperPage pattern
- Custom SVG bell icons instead of heroicons to avoid import issues
- `onToggle` wraps `toggleReminder` call so the return type `Promise<Reminder | null>` resolves to `Promise<void>` for the form

## Self-Check: PASSED
- [x] Route /notifications accessible via bottom nav
- [x] PushPermissionBanner shows correct state (idle/granted/denied/unsupported)
- [x] FeedingReminderForm creates/edits reminder and shows next fire time preview
- [x] Toggle enables/disables reminder without reload
- [x] tsc --noEmit exits 0
