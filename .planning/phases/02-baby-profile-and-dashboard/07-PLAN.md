---
plan: "02-baby-profile-and-dashboard/07"
phase: 2
sequence: 7
title: "Baby switcher + profile edit page"
status: pending
requires: ["02-baby-profile-and-dashboard/03", "02-baby-profile-and-dashboard/04"]
---

# Plan 07: Baby switcher + profile edit page

## Objective
Implement the baby switcher in the TopBar header (visible only with 2+ babies), and replace the ProfilePage stub with a real profile edit screen that lets the user update the baby's name, birth date, sex and photo, and also shows user account options.

## Requirements Addressed
- BABY-03: Usuária pode editar os dados do bebê
- BABY-05: Usuária pode selecionar qual bebê está visualizando (switcher)

## Tasks

<task id="7.1" type="code">
  <title>Create BabySwitcher component</title>
  <description>
Create `src/components/baby/BabySwitcher.tsx`:

```typescript
interface BabySwitcherProps {
  babies: Baby[]
  activeBaby: Baby
  onSelect: (id: string) => void
}
```

Behavior:
- If `babies.length <= 1`: renders nothing (null)
- If `babies.length >= 2`: renders a dropdown button showing active baby name + ▼ chevron
- Clicking opens a simple dropdown list of all babies
- Selecting one calls `onSelect(id)` and closes dropdown
- Dropdown: absolute positioned, bg-white dark:bg-gray-800, rounded-xl, shadow-lg, z-50
- Close on outside click (useEffect + document listener)

Styling: small compact button in the TopBar (text-sm, max-w-32, truncate).
  </description>
  <files>
    <file action="create">src/components/baby/BabySwitcher.tsx</file>
  </files>
</task>

<task id="7.2" type="code">
  <title>Integrate BabySwitcher into TopBar</title>
  <description>
Update `src/components/layout/TopBar.tsx` to:
1. Call `useBabies()` to get babies + activeBaby + setActiveBaby
2. Show `<BabySwitcher>` in the center when babies.length >= 2
3. When only 1 baby: center shows app name "MamãeApp" as before

Current TopBar shows just the app name. New layout:
- Left: nothing (or back button for sub-pages)
- Center: BabySwitcher (if 2+ babies) OR app name
- Right: (future: settings icon)

Keep existing TopBar structure, just add the conditional switcher.
  </description>
  <files>
    <file action="modify">src/components/layout/TopBar.tsx</file>
  </files>
</task>

<task id="7.3" type="code">
  <title>Replace ProfilePage stub with real profile edit</title>
  <description>
Replace `src/pages/ProfilePage.tsx` with a full implementation:

**Sections:**

1. **Baby Profile** (card):
   - `<AvatarUploader>` for photo
   - Edit form: name, birth_date, sex
   - react-hook-form + zod (same schema as onboarding)
   - On submit: `supabase.from('babies').update({...}).eq('id', activeBaby.id)`
   - Success toast / inline success message

2. **Minha Conta** (card):
   - Display user email (read-only)
   - Display user name from profile (read-only for Phase 2)
   - "Sair" button → calls `signOut()` from `useAuth()`

3. **Zona de perigo** (card, red border):
   - "Excluir conta e dados" button
   - Confirmation modal: "Esta ação é irreversível. Todos os dados serão apagados permanentemente."
   - On confirm: calls `supabase.functions.invoke('delete-account')` then `signOut()`
   - Shows error if function call fails

Use `useBabies()` for activeBaby. Use `useAuth()` for user + signOut.

Import AvatarUploader from `@/components/baby/AvatarUploader`.
  </description>
  <files>
    <file action="modify">src/pages/ProfilePage.tsx</file>
  </files>
</task>

<task id="7.4" type="code">
  <title>Create ConfirmModal reusable component</title>
  <description>
Create `src/components/ui/ConfirmModal.tsx`:

```typescript
interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string  // default: "Confirmar"
  cancelLabel?: string   // default: "Cancelar"
  variant?: 'danger' | 'default'  // default: 'default'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}
```

- Renders a centered modal overlay (fixed, z-50, backdrop-blur)
- White card (dark: dark bg) with title + message + two buttons
- Danger variant: confirm button uses `variant="danger"` (red)
- Backdrop click = cancel
- Locks body scroll when open
  </description>
  <files>
    <file action="create">src/components/ui/ConfirmModal.tsx</file>
  </files>
</task>

## Verification
- [ ] BabySwitcher is hidden when user has only 1 baby
- [ ] ProfilePage shows baby name/date/sex form and submits to Supabase
- [ ] Photo upload works from ProfilePage via AvatarUploader
- [ ] "Sair" button signs out and redirects to /login
- [ ] Delete account flow shows ConfirmModal before calling Edge Function
- [ ] `tsc --noEmit` exits 0
