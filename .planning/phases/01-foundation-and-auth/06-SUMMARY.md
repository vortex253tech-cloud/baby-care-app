---
plan: "01-foundation-and-auth/06"
status: complete
completed: 2026-04-11
---

# Summary: Plan 06 — AuthContext + App Wiring + Delete Account

## What was built
Full `AuthProvider` context wired into the app root, exposing all auth operations. `useAuth` hook updated to consume the context. Delete account Edge Function created.

## Key files created/modified
- `src/contexts/AuthContext.tsx` — Full `AuthProvider`:
  - State: `user`, `session`, `profile`, `loading`
  - `fetchProfile(userId)` — fetches from `profiles` table on auth state change
  - `onAuthStateChange` subscription with cleanup
  - Exposed operations:
    - `signIn(email, password)` → `{ error: string | null }` (human-readable messages)
    - `signUp(email, password, name)` → `{ error: string | null }`
    - `signOut()` → clears all state + Supabase session
    - `signInWithGoogle()` → OAuth redirect
  - `useAuthContext()` hook: throws if called outside `AuthProvider`
- `src/hooks/useAuth.ts` — Re-exports `useAuthContext` as `useAuth` (thin alias for clean imports)
- `src/App.tsx` — Wrapped `RouterProvider` with `<AuthProvider>`:
  ```tsx
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
  ```
- `supabase/functions/delete-account/index.ts` — Deno Edge Function:
  - Verifies caller's JWT via anon client → `getUser()`
  - Calls `auth.admin.deleteUser(user.id)` via service-role admin client
  - CASCADE on profiles table handles row cleanup automatically
  - CORS headers included
  - Handles OPTIONS pre-flight

## Decisions made
- `AuthContext.tsx` uses `ExtendedAuthContextValue` (extends `AuthContextValue` from types with the action methods) — keeps the base type clean while adding the operations
- `useAuth` is a one-line re-export alias — prevents circular imports and keeps call sites simple: `import { useAuth } from '@/hooks/useAuth'`
- `delete-account` Edge Function uses dual clients: anon client to verify identity, service-role to actually delete (service role key never touches the browser)
- Profile fetch is fire-and-forget (no blocking) — auth state resolves immediately, profile arrives shortly after

## Self-Check: PASSED
- [x] AuthProvider wraps RouterProvider in App.tsx
- [x] useAuth re-exports from context (no duplicate state)
- [x] signOut clears user, session, and profile
- [x] delete-account function verifies caller identity before deletion
- [x] TypeScript compiles with zero errors (`tsc --noEmit` EXIT:0)
