---
plan: "03-core-trackers/07"
status: complete
completed: 2026-04-12
---

# Summary: Plan 07 — DiaperPage: Diaper history + dashboard count

## What was built
`useDiaperList` with `diapersToday` count, `DiaperList` component, and updated `DiaperPage` with history.

## Key files created/modified
- `src/hooks/useDiaperList.ts` — Fetches diapers today (changed_at >= today 00:00). `diapersToday = diapers.length`. `deleteDiaper(id)` filters locally after Supabase delete.
- `src/components/diaper/DiaperList.tsx` — Per-item: emoji by type + label + time + trash button.
- `src/pages/DiaperPage.tsx` — Added `useDiaperList`. "Hoje (N)" header with count. `handleSave` calls `refetch()`.

## Self-Check: PASSED
- [x] Today's diaper history with emoji, label, time
- [x] "Hoje (N)" counter correct
- [x] Delete: removes from list without reload
- [x] tsc --noEmit exits 0
