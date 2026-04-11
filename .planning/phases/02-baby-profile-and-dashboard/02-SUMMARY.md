---
plan: "02-baby-profile-and-dashboard/02"
status: complete
completed: 2026-04-11
---

# Summary: Plan 02 — Baby onboarding screen + useBabies hook

## What was built
Post-registration baby profile wizard with a `useBabies` hook, and a baby-gate in `ProtectedRoute` that redirects new users to onboarding before reaching the dashboard.

## Key files created/modified
- `src/hooks/useBabies.ts` — Fetches all babies for the authenticated user. Persists `activeBabyId` to localStorage. Auto-selects first baby if stored ID is invalid. Exports `{ babies, activeBaby, loading, setActiveBaby, refetch }`.
- `src/pages/onboarding/BabyOnboardingPage.tsx` — Two-step flow:
  - Step 1: react-hook-form + zod form with name, birth_date (date input), sex (styled radio cards — not raw inputs)
  - Step 2: Photo upload (deferred to AvatarUploader from Plan 03), with "Pular por agora" → `/dashboard`
  - On insert success: transitions to step 2 with the new `babyId`
- `src/router.tsx` — Added `/onboarding/baby` route inside `ProtectedRoute` with `AuthLayout` (no AppShell/bottom nav), placed before the AppShell block
- `src/types/index.ts` — Added `'/onboarding/baby'` to `AppRoute` union
- `src/components/layout/ProtectedRoute.tsx` — Added `useBabies()` check: if `babies.length === 0` and not already on `/onboarding/baby`, redirect to onboarding. Guards against redirect loop with pathname check.

## Decisions made
- `ProtectedRoute` calls both `useAuth()` and `useBabies()` and waits for both to resolve — acceptable latency (single fast query) versus the complexity of a separate OnboardingGate component
- Sex radio buttons are styled card components (hidden raw input + custom visuals) for better mobile touch UX
- `refetch()` exposed on useBabies so downstream components can update after mutations

## Self-Check: PASSED
- [x] useBabies fetches from Supabase and persists activeBabyId in localStorage
- [x] BabyOnboardingPage form validates name/birth_date/sex
- [x] New user without babies redirected to /onboarding/baby
- [x] After insert, user reaches /dashboard
- [x] tsc --noEmit exits 0
