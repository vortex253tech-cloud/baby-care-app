# Plan Verification: Phase 1 — Foundation & Auth

**Verdict:** PASS
**Score:** 9/10
**Checked:** 2026-04-10

## Summary

All six plans form a coherent, well-ordered sequence that fully covers AUTH-01 through AUTH-06. The plans are concrete, production-quality, and use correct current APIs (Supabase JS v2, React Router v6 data router, react-hook-form + zod). The only notable gap is a minor ambiguity in the delete-account implementation (RPC vs Edge Function fallback) and a missing explicit `AuthContext` provider, but neither blocks execution.

## Plan Scores

| Plan | Title | Score | Issues |
|------|-------|-------|--------|
| 01 | Supabase Project Setup + Initial Schema + Env Vars | 9/10 | `docs/` directory referenced in Plan 06 not noted here; otherwise solid |
| 02 | Vite + React 18 + TS + Tailwind + PWA Manifest | 10/10 | none — complete and self-contained |
| 03 | React Router + Layout Shell + Mobile Nav | 9/10 | `useAuth` is both stubbed here and finalised in Plan 04 — two versions of the same file, easy to miss the update step |
| 04 | Email/Password Registration and Login Forms | 9/10 | Google button disabled placeholder left in LoginForm then replaced in Plan 05 — works but creates a transient broken state |
| 05 | Google OAuth + Email Verification + Password Reset | 9/10 | 5-second timeout for PASSWORD_RECOVERY event is fragile on slow connections (noted in plan but no fallback strategy provided) |
| 06 | Account Deletion (LGPD) + Session Persistence + Smoke Tests | 8/10 | `delete from auth.users` inside a security-definer RPC is often blocked on Supabase hosted; Edge Function fallback is provided but adds deployment complexity and the RPC option may silently fail |

## Requirement Coverage

| Req ID | Covered by Plan | Notes |
|--------|----------------|-------|
| AUTH-01 | Plan 04 | Email+password signup with zod validation and error mapping |
| AUTH-02 | Plans 01, 04, 05 | Email confirmation template in Plan 01; verification trigger/redirect in Plan 04 (signUp) and Plan 05 (email flow) |
| AUTH-03 | Plan 05 | `sendPasswordResetEmail` + `updatePassword` + ForgotPasswordForm + ResetPasswordForm |
| AUTH-04 | Plans 02, 06 | `persistSession: true` + `autoRefreshToken: true` set in supabase.ts (Plan 02); manual verification steps in Plan 06 |
| AUTH-05 | Plans 01, 05 | Google provider configured in Plan 01 Task 5; `signInWithGoogle` + `GoogleOAuthButton` in Plan 05 |
| AUTH-06 | Plans 01, 06 | `on delete cascade` on profiles in Plan 01; `delete_account` function + `DeleteAccountModal` + two-step confirmation in Plan 06 |

## Issues Found

### Critical (must fix before executing)
- None

### Warnings (nice to fix)
- [ ] **Plan 06 — RPC deletion may be silently blocked:** `delete from auth.users` inside a `security definer` function is frequently rejected by Supabase cloud because the function runs as the table owner but `auth.users` is owned by the `supabase_auth_admin` role. The plan provides an Edge Function fallback, but the code tries the RPC first and only falls back on error — this will work, but adds an extra round-trip and a confusing two-path code path. Recommend defaulting to the Edge Function approach and removing the RPC option, or testing the RPC on the target project tier before choosing.
- [ ] **Plan 03/04 — Duplicate `useAuth.ts`:** Plan 03 creates a stub version of `useAuth.ts` and Plan 04 replaces it with the full version. The two files have different return type signatures (`Pick<AuthContextValue, …>` vs `UseAuthReturn`). This is fine sequentially but if Plan 04 is skipped or partially applied the type mismatch will cause errors. A comment in Plan 03 saying "this file is replaced entirely in Plan 04" would help.
- [ ] **No `AuthContext` / `AuthProvider`:** `useAuth` is called directly in `ProtectedRoute`, `PublicRoute`, `AppShell`, and `ProfilePage`. This means each component that calls `useAuth` creates its own independent subscription to `onAuthStateChange`. This works but is slightly inefficient and will cause subtle issues if auth state changes are not perfectly synchronous across components. A React Context provider wrapping the app would be the standard pattern. For Phase 1 this is acceptable; worth noting before Phase 2 adds more auth-gated pages.
- [ ] **Plan 05 — `useOAuthCallback` not wired up:** The hook is created but the plan notes it is not connected to `App.tsx` in Phase 1. The URL hash with the OAuth tokens will remain visible after redirect. Low severity for Phase 1 but should be wired before Phase 2.
- [ ] **Placeholder icons not generated:** Plan 02 mentions ImageMagick to create placeholder PNGs but this may not be available on all dev machines. A tiny inline SVG or a base64-encoded 1px PNG should be provided as a guaranteed fallback.

## Verdict Rationale

All six AUTH requirements are fully covered across the six plans. Plans are concrete — they contain exact file paths, complete TypeScript/SQL code, and specific verification criteria at every task. APIs used are current and correct (Supabase JS v2 `signInWithOAuth`, `onAuthStateChange`, `updateUser`; React Router v6 data router with `createBrowserRouter`; zod v3 + react-hook-form v7). The wave dependency ordering (01+02 parallel → 03 → 04+05 parallel → 06) is correct and consistent. No critical issues were found. Score 9/10 reflects one Warning-level architectural decision (RPC vs Edge Function for deletion) and the absence of an AuthContext provider, neither of which prevents Phase 1 from executing successfully.
