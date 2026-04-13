---
plan: "04-notifications-and-reminders/05"
status: complete
completed: 2026-04-12
---

# Summary: Plan 05 — Horário de silêncio + lembretes de vacina

## What was built
`SilenceWindowForm`, SUS vaccination calendar seed data (`sus-calendar.ts`), `VaccineReminderList`, and Silêncio/Vacinas sections in `NotificationsPage`.

## Key files created/modified
- `src/components/notifications/SilenceWindowForm.tsx` — two `<input type="time">` fields (De / Até); validates HH:MM regex via zod; defaults to 22:00–06:00; calls `onSave(start, end)` on submit
- `src/data/sus-calendar.ts` — 24 SUS vaccine entries from birth (BCG, Hep B) to 4 years (DTP 2º reforço, VOP 2º reforço, Varicela 2ª dose); `getUpcomingVaccines(birthDate, windowDays=90)` returns vaccines due within the window with computed `due_date`
- `src/components/notifications/VaccineReminderList.tsx` — calls `getUpcomingVaccines(new Date(birthDate), 90)`; shows name, dose, days until/overdue, due date; toggle Ativar/Ativo per vaccine based on `existingReminders.find(r => r.vaccine_id === v.id)`
- `src/pages/NotificationsPage.tsx` — handleSilenceSave updates all existing reminders with new silence_start/end via Promise.all; handleVaccineEnable creates 2 reminders (7-days-before at computed date + on-the-day at 08:00); handleVaccineDisable calls deleteReminder

## Decisions made
- Silence window is global per baby (applies to all reminder types), stored per-reminder in DB; saved via bulk update of all reminders
- Vaccine reminder creates two rows (7-days-before + day-of at 08:00 local time) only if those dates are still in the future
- Tolerance window in `getUpcomingVaccines` uses `daysUntilDue >= -v.age_days_to` to show overdue vaccines still within tolerance

## Self-Check: PASSED
- [x] SilenceWindowForm updates silence_start/end on all reminders
- [x] VaccineReminderList shows vaccines for next 90 days with overdue status
- [x] Ativar creates 2 reminders (7 days before + on due date)
- [x] sus-calendar.ts exports SUS_VACCINES with 24 entries
- [x] tsc --noEmit exits 0
