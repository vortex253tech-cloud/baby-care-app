---
id: "01-foundation-and-auth/03"
status: complete
completed_at: "2026-04-10"
---

# Plan 03 Summary: React Router + Layout Shell + Mobile Nav

## Status: COMPLETE

## What Was Built

### Core Routing Infrastructure
- **`src/router.tsx`** — `createBrowserRouter` config with full route tree:
  - `/` redirects to `/dashboard`
  - Public routes (`/login`, `/register`, `/forgot-password`) wrapped in `PublicRoute` + `AuthLayout` — redirect to `/dashboard` when already authenticated
  - `/reset-password` wrapped only in `AuthLayout` (intentionally outside `PublicRoute` — email link may arrive without session)
  - Protected routes (`/dashboard`, `/feed`, `/sleep`, `/diaper`, `/profile`) wrapped in `ProtectedRoute` + `AppShell`
  - `*` catch-all renders `NotFoundPage`
- **`src/App.tsx`** — updated to use `RouterProvider`

### Auth Guard Components
- **`src/components/layout/ProtectedRoute.tsx`** — renders full-screen spinner while loading, redirects to `/login` (preserving `location.state.from`) when unauthenticated, renders `<Outlet />` when authenticated
- **`src/components/layout/PublicRoute.tsx`** — redirects to `/dashboard` when already authenticated

### Layout Shell
- **`src/components/layout/AuthLayout.tsx`** — gradient background (pink-50 → white), centered MamãeApp logo/title header, max-w-sm content area; used for all unauthenticated pages
- **`src/components/layout/TopBar.tsx`** — sticky 56px header with optional back-button and title prop
- **`src/components/layout/BottomNav.tsx`** — fixed bottom bar, 5 items (Início/Alimentação/Sono/Fralda/Perfil), active item highlighted in `text-pink-500`, outline/filled SVG icon pairs, `safe-area-inset-bottom` for iOS notch
- **`src/components/layout/AppShell.tsx`** — composes `TopBar` + scrollable `<Outlet />` + `BottomNav`; `pb-20` prevents content from hiding behind nav

### Auth Hook & Types
- **`src/hooks/useAuth.ts`** — session observation stub: `getSession()` on mount + `onAuthStateChange` subscription; returns `{ user, session, loading }`
- **`src/types/index.ts`** — shared types: `User`, `Session` (re-exported from Supabase), `Profile`, `AuthContextValue`, `AppRoute`

### Page Stubs (10 files)
| File | Route | Notes |
|------|-------|-------|
| `src/pages/auth/LoginPage.tsx` | `/login` | Full form → Plan 04 |
| `src/pages/auth/RegisterPage.tsx` | `/register` | Full form → Plan 04 |
| `src/pages/auth/ForgotPasswordPage.tsx` | `/forgot-password` | Full form → Plan 05 |
| `src/pages/auth/ResetPasswordPage.tsx` | `/reset-password` | Full form → Plan 05 |
| `src/pages/DashboardPage.tsx` | `/dashboard` | Content → Phase 2 |
| `src/pages/FeedPage.tsx` | `/feed` | Content → Phase 3 |
| `src/pages/SleepPage.tsx` | `/sleep` | Content → Phase 3 |
| `src/pages/DiaperPage.tsx` | `/diaper` | Content → Phase 3 |
| `src/pages/ProfilePage.tsx` | `/profile` | Content → Phase 2 |
| `src/pages/NotFoundPage.tsx` | `*` | 404 with link back to `/dashboard` |

## Key Files

```
src/
├── App.tsx                          ← RouterProvider entry
├── router.tsx                       ← Full route tree
├── types/index.ts                   ← Shared TS types
├── hooks/useAuth.ts                 ← Auth session hook stub
├── components/layout/
│   ├── ProtectedRoute.tsx           ← Auth guard (requires session)
│   ├── PublicRoute.tsx              ← Inverse guard (blocks when authed)
│   ├── AuthLayout.tsx               ← Unauthenticated page wrapper
│   ├── TopBar.tsx                   ← Sticky top header
│   ├── BottomNav.tsx                ← Fixed 5-tab mobile nav
│   └── AppShell.tsx                 ← Authenticated page wrapper
└── pages/
    ├── auth/{Login,Register,ForgotPassword,ResetPassword}Page.tsx
    └── {Dashboard,Feed,Sleep,Diaper,Profile,NotFound}Page.tsx
```

## Decisions

1. **`reset-password` outside `PublicRoute`**: The user arrives via an email link and may not have a Supabase session in localStorage yet. Supabase handles the PKCE token in the URL hash on the client side, so the page must render before any redirect logic runs.

2. **`useAuth` as a hook (not Context)**: The plan spec uses a hook pattern. Plan 04 will decide whether to promote it to a Context provider — the interface (`user`, `session`, `loading`) is identical either way, so migration is zero-friction.

3. **SVG icons inline in `BottomNav`**: Avoids an external icon library dependency for Phase 1. Phase 9 will replace these with a proper icon set.

4. **`tsconfig.node.json` fix**: Added `"composite": true` and removed `"noEmit": true` (which is incompatible with `composite`). This was a pre-existing misconfiguration that blocked `tsc --noEmit` from running.

## Verification — Self-Check: PASSED

- [x] `npm run type-check` exits 0
- [x] `/` → redirects to `/dashboard` (via `<Navigate to="/dashboard" replace />`)
- [x] `/dashboard` without auth → `ProtectedRoute` redirects to `/login`
- [x] `/login`, `/register`, `/forgot-password` render inside `AuthLayout` (logo visible, no bottom nav)
- [x] `/reset-password` renders inside `AuthLayout` without `PublicRoute` guard
- [x] Protected app routes render inside `AppShell` (TopBar + BottomNav)
- [x] `BottomNav` has 5 items: Início, Alimentação, Sono, Fralda, Perfil
- [x] Active nav item highlighted in `text-pink-500`
- [x] `*` unknown routes render `NotFoundPage` with link back to `/dashboard`
- [x] All 4 commits created with `feat(phase-01/plan-03):` prefix
