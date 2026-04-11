---
plan: "02-baby-profile-and-dashboard/04"
status: complete
completed: 2026-04-11
---

# Summary: Plan 04 — Dashboard shell + age calculation + dark mode

## What was built
Real DashboardPage with baby header, age calculation hook, dark mode hook, and anti-flash dark mode initialization.

## Key files created/modified
- `src/hooks/useBabyAge.ts` — `calculateBabyAge(birthDateStr)` returns `{ totalDays, months, days, label }` with correct PT-BR label ("3 meses e 5 dias", "1 dia", etc.). Handles exact month boundaries and babies born today. `useBabyAge()` is a thin wrapper returning null if no date.
- `src/hooks/useTheme.ts` — `useTheme()` manages `light|dark|system` preference in localStorage key `mamaeapp_theme`. Applies via `classList.toggle('dark', ...)`. Listens to `matchMedia` for system preference changes.
- `src/main.tsx` — Dark mode init added BEFORE `createRoot(...)`: reads `mamaeapp_theme` from localStorage, adds `dark` class immediately to prevent flash of white on page load.
- `src/components/dashboard/BabyHeader.tsx` — Card component showing `BabyAvatar` (lg) + baby name + age label. Pink soft background: `bg-pink-50 dark:bg-pink-950/20 rounded-2xl p-4`.
- `src/components/ui/FullScreenSpinner.tsx` — Reusable centered spinner (created as needed by DashboardPage).
- `src/pages/DashboardPage.tsx` — Real layout with `useBabies()`, `BabyHeader`, and placeholder divs for Plans 05–06.

## Decisions made
- Dark mode init in `main.tsx` (not in a component) prevents the FOUC (flash of unstyled content) — critical for a nighttime-use app
- `calculateBabyAge` is a pure function (not a hook) so it can be unit-tested without React
- `useBabyAge` wrapper is intentionally thin — avoids unnecessary state for a value computed synchronously from a prop

## Self-Check: PASSED
- [x] calculateBabyAge returns correct months/days/label
- [x] DashboardPage shows BabyHeader with name and age
- [x] Dark mode activates on page load when system is dark
- [x] No flash of white when dark mode is active
- [x] tsc --noEmit exits 0
