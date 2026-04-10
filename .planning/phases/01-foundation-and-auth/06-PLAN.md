---
id: "01-foundation-and-auth/06"
phase: 1
plan: 6
wave: 4
depends_on: ["01-foundation-and-auth/04", "01-foundation-and-auth/05"]
autonomous: true
files_modified:
  - "supabase/migrations/0003_delete_account_function.sql"
  - "src/hooks/useAuthActions.ts"
  - "src/components/auth/DeleteAccountModal.tsx"
  - "src/pages/ProfilePage.tsx"
  - "src/hooks/useAuth.ts"
  - "src/components/ui/Modal.tsx"
  - "docs/smoke-test-auth.md"
requirements: ["AUTH-04", "AUTH-06"]
must_haves:
  - "After login, refreshing the browser keeps the user authenticated (session persisted in localStorage)"
  - "After closing and reopening the browser, user is still logged in"
  - "The 'Excluir conta' button in the Profile page is present and requires confirmation"
  - "After confirming account deletion, all user data is removed from Supabase and user is redirected to /login"
  - "The smoke test checklist in docs/smoke-test-auth.md is complete and all items pass"
---

# Plan 06: Account Deletion (LGPD) + Session Persistence + Auth Smoke Tests

## Objective
Implement the LGPD-compliant account deletion flow with full cascade deletion of all user data, verify session persistence works correctly (AUTH-04), and produce a complete smoke test checklist that validates the entire auth system before Phase 2 begins.

## Context
This is the final plan of Phase 1, Wave 4. It depends on both Plan 04 (email/password auth) and Plan 05 (Google OAuth + password reset) being complete. After this plan, all 6 AUTH requirements are satisfied and the project state can be updated to "Phase 1 complete". The `docs/smoke-test-auth.md` file produced here serves as the acceptance criteria record.

## Tasks

<tasks>
  <task id="1" type="implement">
    <description>Create Supabase migration for cascade deletion of all user data</description>
    <details>
Create `supabase/migrations/0003_delete_account_function.sql`:

```sql
-- ============================================================
-- DELETE ACCOUNT FUNCTION (LGPD AUTH-06)
-- Permanently deletes a user and ALL their data.
-- Uses security definer so it can call auth.admin functions.
-- Called from the client via supabase.rpc('delete_account').
-- ============================================================

create or replace function public.delete_account()
returns void as $$
declare
  calling_user_id uuid;
begin
  -- Get the ID of the currently authenticated user
  calling_user_id := auth.uid();

  if calling_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Step 1: Delete all user data in dependency order.
  -- Currently only `profiles` exists. Future phases add more tables;
  -- they should be added here with their own DELETE statements.
  -- The profiles table has ON DELETE CASCADE from auth.users, so this
  -- is handled automatically. But we keep explicit deletes for auditing.

  delete from public.profiles where id = calling_user_id;

  -- Step 2: Delete the auth user itself.
  -- This requires the admin API — accessible via security definer.
  -- The delete cascades to all auth.users-referencing tables automatically.
  delete from auth.users where id = calling_user_id;

end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users (they can only delete themselves
-- because auth.uid() is used inside the function)
grant execute on function public.delete_account() to authenticated;

-- Revoke from anon (unauthenticated requests cannot call this)
revoke execute on function public.delete_account() from anon;
```

Run this migration in Supabase SQL Editor.

**Important:** Supabase's standard setup may block direct deletion from `auth.users` in a non-service-role context. If the RPC call fails with "permission denied for table users", use the alternative approach below:

Alternative — use Supabase Admin API from an Edge Function:

Create `supabase/functions/delete-account/index.ts`:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Create a Supabase client with the user's JWT to get their ID
  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Create an admin client to delete the user
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Delete all user data first (profiles, etc.)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', user.id)

  if (profileError) {
    console.error('Error deleting profile:', profileError)
    // Continue even if profile delete fails — auth user deletion cascades
  }

  // Delete the auth user
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
```

Deploy with: `supabase functions deploy delete-account`

Add SUPABASE_SERVICE_ROLE_KEY to Edge Function secrets:
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
    </details>
    <verification>
- SQL function exists in Supabase (SQL Editor → Functions → `delete_account`) OR Edge Function is deployed
- Calling the function/endpoint as an authenticated user deletes the user and their profile row
    </verification>
  </task>

  <task id="2" type="implement">
    <description>Add deleteAccount function to useAuthActions</description>
    <details>
Add to `src/hooks/useAuthActions.ts`:

```typescript
// ─── Delete Account (LGPD AUTH-06) ───────────────────────────────────────────

export type DeleteAccountResult =
  | { success: true }
  | { success: false; error: AuthError }

/**
 * Permanently deletes the authenticated user's account and all their data.
 * AUTH-06: LGPD compliance — user has the right to erasure.
 *
 * Two implementation options (use whichever works in your Supabase setup):
 * Option A: RPC function (if security definer approach works)
 * Option B: Edge Function (if auth.users direct delete is blocked)
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  try {
    // Option A: Try RPC function first
    const { error: rpcError } = await supabase.rpc('delete_account')

    if (rpcError) {
      // Option B: Fall back to Edge Function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return { success: false, error: { message: 'Sessão expirada. Faça login novamente.' } }
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        console.error('Delete account error:', body)
        return {
          success: false,
          error: { message: 'Erro ao excluir conta. Tente novamente ou contate o suporte.' },
        }
      }
    }

    // Sign out locally after deletion
    await supabase.auth.signOut()
    return { success: true }

  } catch (err) {
    console.error('Unexpected delete account error:', err)
    return {
      success: false,
      error: { message: 'Erro inesperado ao excluir conta. Tente novamente.' },
    }
  }
}
```
    </details>
    <verification>Function is exported from `useAuthActions.ts` with no TypeScript errors.</verification>
  </task>

  <task id="3" type="implement">
    <description>Create the reusable Modal component</description>
    <details>
Create `src/components/ui/Modal.tsx`:

```typescript
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Accessible modal dialog.
 * - Traps focus within the modal when open
 * - Closes on Escape key or backdrop click
 * - Prevents body scroll when open
 */
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    // Focus the dialog
    dialogRef.current?.focus()

    // Close on Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, centered on larger screens */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl focus:outline-none"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <h2
          id="modal-title"
          className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}
```
    </details>
    <verification>Modal opens and closes correctly. Pressing Escape closes it. Clicking the backdrop closes it. Body scroll is prevented while modal is open.</verification>
  </task>

  <task id="4" type="implement">
    <description>Create the DeleteAccountModal component</description>
    <details>
Create `src/components/auth/DeleteAccountModal.tsx`:

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { deleteAccount, useAuthLoading } from '@/hooks/useAuthActions'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Confirmation modal for account deletion.
 * AUTH-06: LGPD — right to erasure.
 *
 * Uses a two-step confirmation:
 * 1. First screen: warns the user what will be deleted
 * 2. Second screen: asks user to type "EXCLUIR" to confirm (prevents accidental deletion)
 */
export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [step, setStep] = useState<'warn' | 'confirm'>('warn')
  const [confirmText, setConfirmText] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const { loading, withLoading } = useAuthLoading()
  const navigate = useNavigate()

  const confirmWord = 'EXCLUIR'
  const isConfirmValid = confirmText === confirmWord

  async function handleDelete() {
    if (!isConfirmValid) return
    setServerError(null)

    const result = await withLoading(deleteAccount)

    if (!result.success) {
      setServerError(result.error.message)
      return
    }

    // Account deleted — redirect to login
    navigate('/login', { replace: true })
  }

  function handleClose() {
    setStep('warn')
    setConfirmText('')
    setServerError(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Excluir conta">
      {step === 'warn' ? (
        <div className="flex flex-col gap-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
              Esta ação é permanente e irreversível.
            </p>
            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
              <li>• Todos os seus registros serão excluídos</li>
              <li>• Perfis de bebês serão excluídos</li>
              <li>• Seu acesso ao app será encerrado</li>
              <li>• Não é possível recuperar os dados</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tem certeza que deseja excluir sua conta e todos os seus dados?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => setStep('confirm')}
            >
              Continuar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Para confirmar a exclusão, digite <strong className="text-red-500">{confirmWord}</strong> abaixo:
          </p>

          <FormError message={serverError} />

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={confirmWord}
            className="h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label={`Digite ${confirmWord} para confirmar`}
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              fullWidth
              disabled={!isConfirmValid}
              loading={loading}
              onClick={handleDelete}
            >
              Excluir conta
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
```
    </details>
    <verification>
- Modal first screen shows the warning list and a "Continuar" button
- "Continuar" goes to step 2 where user must type "EXCLUIR"
- "Excluir conta" button is disabled until text matches exactly
- Confirming with correct text calls deleteAccount and redirects to /login
    </verification>
  </task>

  <task id="5" type="implement">
    <description>Add account deletion UI to the Profile page</description>
    <details>
Replace `src/pages/ProfilePage.tsx`:

```typescript
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DeleteAccountModal } from '@/components/auth/DeleteAccountModal'
import { Button } from '@/components/ui/Button'

/**
 * Profile page — placeholder for Phase 2 content.
 * For Phase 1, shows: user email, sign out button, and delete account option.
 */
export function ProfilePage() {
  const { user, signOut } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <div className="p-4 flex flex-col gap-6 max-w-lg mx-auto">
      {/* User info */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sua conta</h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
          <p className="text-base font-medium text-gray-900 dark:text-white mt-0.5">
            {user?.email ?? '—'}
          </p>
        </div>
      </section>

      {/* Session / sign out */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Sessão
        </h3>
        <Button
          variant="secondary"
          fullWidth
          onClick={signOut}
          size="md"
        >
          Sair da conta
        </Button>
      </section>

      {/* LGPD — delete account */}
      <section className="mt-auto">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Zona de perigo
        </h3>
        <Button
          variant="danger"
          fullWidth
          onClick={() => setShowDeleteModal(true)}
          size="md"
        >
          Excluir minha conta e dados
        </Button>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
          Todos os seus dados serão permanentemente excluídos. Esta ação não pode ser desfeita.
        </p>
      </section>

      {/* Delete account modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
```
    </details>
    <verification>
- Profile page shows the user's email and a "Sair da conta" button
- "Excluir minha conta e dados" button is visible in a "Zona de perigo" section
- Clicking the delete button opens the confirmation modal
    </verification>
  </task>

  <task id="6" type="implement">
    <description>Verify session persistence (AUTH-04) works correctly</description>
    <details>
Session persistence is handled automatically by the Supabase client configuration set in Plan 02:

```typescript
// Already configured in src/lib/supabase.ts:
auth: {
  persistSession: true,    // Stores session in localStorage
  autoRefreshToken: true,  // Refreshes token before expiry
  detectSessionInUrl: true // Handles OAuth + email confirmation links
}
```

Manually verify AUTH-04 works:

1. Open the app at `http://localhost:5173`
2. Log in with email/password
3. Open DevTools → Application → Local Storage → `http://localhost:5173`
4. Confirm a key like `sb-<project-ref>-auth-token` is present with a JSON session
5. Hard-refresh the page (Ctrl+Shift+R) — user should remain on `/dashboard`
6. Close the browser tab entirely, then reopen `http://localhost:5173` — user should still be logged in
7. Wait for the session to near expiry (or simulate by shortening JWT exp in testing) — user should stay logged in due to `autoRefreshToken: true`

If any of these steps fail, check:
- `persistSession: true` is set in `createClient` options
- The Supabase project URL in `.env.local` is correct
- No browser extension is blocking localStorage

No code changes needed if the verification passes.
    </details>
    <verification>
- After login, a `sb-*-auth-token` key exists in localStorage
- Hard-refreshing the page while logged in keeps the user on `/dashboard`
- Closing and reopening the browser keeps the user logged in
    </verification>
  </task>

  <task id="7" type="implement">
    <description>Create the auth smoke test checklist document</description>
    <details>
Create `docs/smoke-test-auth.md`:

```markdown
# Auth Smoke Test Checklist — Phase 1

**Date:** [FILL IN]
**Tester:** [FILL IN]
**Environment:** Local dev (http://localhost:5173)
**Supabase Project:** [FILL IN]

## Prerequisites
- [ ] Supabase project is running and accessible
- [ ] `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Google OAuth is configured in Supabase dashboard
- [ ] Email provider is enabled with confirmation required

---

## AUTH-01: Create account with email and password

| Test | Expected | Pass/Fail |
|------|----------|-----------|
| Submit empty registration form | Inline errors on all fields | |
| Submit with invalid email (e.g., "abc") | "Digite um email válido" | |
| Submit with password < 6 chars | "Senha deve ter pelo menos 6 caracteres" | |
| Submit with mismatched passwords | "As senhas não conferem" | |
| Submit with already-registered email | "Este email já está cadastrado..." | |
| Submit with valid new email + password | "Verifique seu email!" success screen | |
| "Criar conta" button while loading | Shows spinner, disabled | |

---

## AUTH-02: Email verification

| Test | Expected | Pass/Fail |
|------|----------|-----------|
| After registering, check inbox | Verification email received (subject: "Confirme seu email — MamãeApp") | |
| Email body | Contains a confirmation link | |
| Click the confirmation link | Browser redirects to `/dashboard`, user is logged in | |
| Try logging in before confirming | "Confirme seu email antes de entrar" error | |

---

## AUTH-03: Password reset via email

| Test | Expected | Pass/Fail |
|------|----------|-----------|
| Submit forgot-password with empty field | "Email é obrigatório" | |
| Submit with non-registered email | Success message shown (no error — security) | |
| Submit with registered email | "Email enviado!" success screen | |
| Check inbox | Reset email received (subject: "Redefinição de senha — MamãeApp") | |
| Click reset link | Lands on `/reset-password`, shows password form | |
| Submit with password < 6 chars | "A senha deve ter pelo menos 6 caracteres" | |
| Submit with mismatched passwords | "As senhas não conferem" | |
| Submit with valid new password | "Senha redefinida!" then redirect to `/login` | |
| Open `/reset-password` with no hash | Shows "Link inválido ou expirado" after 5s | |
| Log in with the old password | "Email ou senha incorretos" | |
| Log in with the new password | Success, lands on `/dashboard` | |

---

## AUTH-04: Session persistence

| Test | Expected | Pass/Fail |
|------|----------|-----------|
| Log in, open DevTools → LocalStorage | `sb-*-auth-token` key exists | |
| Hard-refresh the page | User stays on `/dashboard` | |
| Close browser tab, reopen app URL | User is still logged in | |
| Log out (Sair da conta), reopen URL | Redirected to `/login` | |

---

## AUTH-05: Google OAuth

| Test | Expected | Pass/Fail |
|------|----------|-----------|
| Click "Entrar com Google" | Redirected to Google consent screen | |
| Authorize with a Google account | Redirected back to `/dashboard` | |
| Check Supabase Auth dashboard → Users | New user visible with Google provider | |
| Check Supabase `profiles` table | Profile row created for the Google user | |
| Log out, click "Entrar com Google" again | Same user, lands on `/dashboard` | |

---

## AUTH-06: Account deletion (LGPD)

| Test | Expected | Pass/Fail |
|------|----------|-----------|
| Navigate to `/profile` | "Excluir minha conta e dados" button visible | |
| Click delete button | Warning modal opens with data list | |
| Click "Cancelar" | Modal closes, no data deleted | |
| Click "Continuar" | Step 2 shown — confirmation text input | |
| Type "EXCLUIR" | "Excluir conta" button becomes enabled | |
| Type wrong text | "Excluir conta" button remains disabled | |
| Confirm deletion | User is signed out and redirected to `/login` | |
| Check Supabase Auth dashboard → Users | User no longer exists | |
| Check Supabase `profiles` table | Profile row no longer exists | |
| Try logging in with deleted account | "Email ou senha incorretos" | |

---

## Route Guards

| Test | Expected | Pass/Fail |
|------|----------|-----------|
| Visit `/dashboard` while logged out | Redirected to `/login` | |
| Visit `/login` while logged in | Redirected to `/dashboard` | |
| Visit `/register` while logged in | Redirected to `/dashboard` | |
| Visit `/unknown-route` | 404 page shown | |
| Visit `/reset-password` (no hash) | Page loads, then shows "Link inválido..." | |

---

## Overall

- [ ] All AUTH-01 tests pass
- [ ] All AUTH-02 tests pass
- [ ] All AUTH-03 tests pass
- [ ] All AUTH-04 tests pass
- [ ] All AUTH-05 tests pass
- [ ] All AUTH-06 tests pass
- [ ] All route guard tests pass

**Phase 1 status:** [ ] COMPLETE — ready for Phase 2
```

Create the `docs/` directory if it doesn't exist.
    </details>
    <verification>File `docs/smoke-test-auth.md` exists with all test cases. The document is well-formatted markdown.</verification>
  </task>
</tasks>

## Verification Criteria
- [ ] `supabase/migrations/0003_delete_account_function.sql` exists with the delete function SQL
- [ ] `src/components/auth/DeleteAccountModal.tsx` implements two-step confirmation (warn → type "EXCLUIR")
- [ ] `src/pages/ProfilePage.tsx` shows user email, sign-out button, and delete account section
- [ ] Clicking "Excluir minha conta e dados" opens the confirmation modal
- [ ] After confirming deletion by typing "EXCLUIR" and clicking confirm, user is signed out and redirected to `/login`
- [ ] Checking Supabase dashboard after deletion confirms the user and their profile row are gone
- [ ] After login, hard-refreshing the browser keeps the user on `/dashboard` (AUTH-04 verified)
- [ ] Closing and reopening the browser still keeps the user authenticated (AUTH-04 verified)
- [ ] `docs/smoke-test-auth.md` exists with all test cases for AUTH-01 through AUTH-06
- [ ] All items in the smoke test checklist pass when manually tested
- [ ] `npm run type-check` passes with 0 errors

## Notes
- The delete account function uses `security definer` to be able to delete from `auth.users`. If this approach is blocked by Supabase's security model in your project tier, fall back to the Edge Function approach (also included in Task 1).
- The "type EXCLUIR to confirm" pattern follows the industry standard for destructive actions (GitHub, Vercel, etc.). The exact word is intentionally in uppercase to require deliberate typing.
- The `docs/smoke-test-auth.md` file is a living document. After each test run, the tester fills in the Pass/Fail column and date. This becomes the official acceptance record for Phase 1.
- Session persistence (AUTH-04) requires no special code — it's handled by `persistSession: true` in the Supabase client config. The verification task confirms it works correctly in practice.
- After Phase 1 is complete, update `.planning/STATE.md`: Phase 1 → 6/6 plans done, 100%.
