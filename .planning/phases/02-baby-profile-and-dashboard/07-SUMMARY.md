---
plan: "02-baby-profile-and-dashboard/07"
status: complete
completed: 2026-04-11
---

# Summary: Plan 07 — Baby switcher + profile edit page

## What was built
Baby switcher in the TopBar, full ProfilePage with baby edit form and account management, and a reusable ConfirmModal component.

## Key files created/modified
- `src/components/baby/BabySwitcher.tsx` — Returns null when ≤1 baby. With 2+ babies: dropdown button showing active baby name + chevron. Dropdown closes on outside click via document event listener.
- `src/components/ui/ConfirmModal.tsx` — Fixed overlay (`backdrop-blur`), centered card, `danger`/`default` variant (red vs. gray confirm button), body scroll lock, backdrop click = cancel.
- `src/components/layout/TopBar.tsx` — Shows `BabySwitcher` when `babies.length >= 2`, otherwise app name "MamãeApp".
- `src/pages/ProfilePage.tsx` — Three sections:
  - **Baby Profile**: `AvatarUploader` + react-hook-form/zod form (name, birth_date, sex). On submit: `supabase.from('babies').update(...)` + `refetch()`
  - **Minha Conta**: email display + "Sair" button (`signOut()`)
  - **Zona de perigo**: "Excluir conta" → `ConfirmModal` → `supabase.functions.invoke('delete-account')` → `signOut()`

## Decisions made
- `BabySwitcher` returns null for single-baby users — clean, no dead UI
- `ConfirmModal` uses backdrop-blur for a soft overlay that keeps the background visible (feels less aggressive than a solid black overlay — appropriate for a care app)
- `ProfilePage` calls `refetch()` from `useBabies()` after updating baby data to keep the dashboard in sync without a full page reload

## Self-Check: PASSED
- [x] BabySwitcher hidden for single-baby users
- [x] ProfilePage baby edit form submits to Supabase
- [x] Photo upload works via AvatarUploader
- [x] Sair button signs out and navigates to /login
- [x] Delete account shows ConfirmModal before calling Edge Function
- [x] tsc --noEmit exits 0
