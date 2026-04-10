---
id: "01-foundation-and-auth/05"
phase: 1
plan: 5
wave: 3
depends_on: ["01-foundation-and-auth/03"]
autonomous: true
files_modified:
  - "src/components/auth/LoginForm.tsx"
  - "src/components/auth/GoogleOAuthButton.tsx"
  - "src/components/auth/ForgotPasswordForm.tsx"
  - "src/components/auth/ResetPasswordForm.tsx"
  - "src/pages/auth/ForgotPasswordPage.tsx"
  - "src/pages/auth/ResetPasswordPage.tsx"
  - "src/hooks/useAuthActions.ts"
  - "src/hooks/useOAuthCallback.ts"
requirements: ["AUTH-02", "AUTH-03", "AUTH-05"]
must_haves:
  - "Clicking 'Entrar com Google' initiates the Google OAuth flow and redirects to /dashboard after success"
  - "Sending forgot-password email shows a confirmation message"
  - "Clicking the reset-password link from email lands on /reset-password and allows setting a new password"
  - "After resetting password, user is redirected to /login"
  - "New Google OAuth users have a profile row created automatically (via the trigger from Plan 01)"
---

# Plan 05: Google OAuth + Email Verification Flow + Password Reset

## Objective
Enable Google Sign-In via Supabase OAuth, implement the forgot-password request flow, and build the password reset form that handles the Supabase token from the reset email link.

## Context
This plan runs in parallel with Plan 04 (email/password forms) on Wave 3. Both depend on Plan 03 (routing). Plan 05 completes the Google OAuth button that was rendered disabled in Plan 04's LoginForm. The email templates configured in Plan 01 feed directly into the flows implemented here. After this plan, all AUTH-related requirements except AUTH-04 (session persistence, already handled) and AUTH-06 (account deletion, in Plan 06) are complete.

## Tasks

<tasks>
  <task id="1" type="implement">
    <description>Add Google OAuth sign-in function to useAuthActions</description>
    <details>
Add the following to `src/hooks/useAuthActions.ts` (append after the existing `signOut` export):

```typescript
// ─── Google OAuth ─────────────────────────────────────────────────────────────

export type GoogleSignInResult =
  | { success: true }
  | { success: false; error: AuthError }

/**
 * Initiates Google OAuth flow.
 * Supabase redirects the user to Google, then back to the app at the callback URL.
 * The callback URL is handled by Supabase automatically; the app does not need
 * a separate /auth/callback route because detectSessionInUrl is true in the client.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      queryParams: {
        // Request offline access for refresh token (recommended)
        access_type: 'offline',
        // Force account selection even if the user is already signed in to Google
        prompt: 'select_account',
      },
    },
  })

  if (error) {
    return {
      success: false,
      error: {
        message: 'Erro ao conectar com Google. Tente novamente.',
      },
    }
  }

  // No redirect here — Supabase handles the browser redirect to Google
  return { success: true }
}
```

Also add the forgot-password and reset-password functions to the same file:

```typescript
// ─── Forgot Password ──────────────────────────────────────────────────────────

export type ForgotPasswordResult =
  | { success: true }
  | { success: false; error: AuthError }

/**
 * Sends a password reset email via Supabase.
 * AUTH-03: Usuária pode redefinir senha via link por email.
 */
export async function sendPasswordResetEmail(email: string): Promise<ForgotPasswordResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    if (error.message.includes('rate limit')) {
      return {
        success: false,
        error: { message: 'Email de recuperação já enviado. Aguarde alguns minutos.' },
      }
    }
    return {
      success: false,
      error: { message: 'Erro ao enviar email. Verifique o endereço e tente novamente.' },
    }
  }

  return { success: true }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export type ResetPasswordResult =
  | { success: true }
  | { success: false; error: AuthError }

/**
 * Updates the password for the currently authenticated user.
 * Called after the user clicks the reset link from email and lands on /reset-password.
 * At that point, Supabase has already set a temporary session from the URL hash.
 */
export async function updatePassword(newPassword: string): Promise<ResetPasswordResult> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    if (error.message.includes('Password should be')) {
      return {
        success: false,
        error: { message: 'A senha deve ter pelo menos 6 caracteres.' },
      }
    }
    if (error.message.includes('same password')) {
      return {
        success: false,
        error: { message: 'A nova senha não pode ser igual à senha atual.' },
      }
    }
    if (error.message.includes('expired') || error.message.includes('invalid')) {
      return {
        success: false,
        error: { message: 'Link de redefinição expirado. Solicite um novo email.' },
      }
    }
    return {
      success: false,
      error: { message: 'Erro ao redefinir a senha. Tente novamente.' },
    }
  }

  return { success: true }
}
```
    </details>
    <verification>All three new functions (`signInWithGoogle`, `sendPasswordResetEmail`, `updatePassword`) are exported from `useAuthActions.ts` with no TypeScript errors.</verification>
  </task>

  <task id="2" type="implement">
    <description>Create the GoogleOAuthButton component and wire it into LoginForm</description>
    <details>
Create `src/components/auth/GoogleOAuthButton.tsx`:

```typescript
import { useState } from 'react'
import { signInWithGoogle } from '@/hooks/useAuthActions'

/**
 * Google OAuth sign-in button.
 * AUTH-05: Usuária pode fazer login com Google (OAuth).
 *
 * On click: calls Supabase OAuth which redirects the browser to Google.
 * On return: Supabase handles the token exchange via detectSessionInUrl.
 * The onAuthStateChange listener in useAuth then updates the app state.
 */
export function GoogleOAuthButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setError(null)
    setLoading(true)
    const result = await signInWithGoogle()
    if (!result.success) {
      setError(result.error.message)
      setLoading(false)
    }
    // If success: browser is already redirecting to Google — no state update needed
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p role="alert" className="text-xs text-red-500 text-center">{error}</p>
      )}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="Entrar com Google"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecionando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </>
        )}
      </button>
    </div>
  )
}
```

Now update `src/components/auth/LoginForm.tsx` to replace the disabled Google button section with the real component. Find the block that renders the disabled Google button and replace it:

```typescript
// Replace the disabled <button> and the divider above it with:

{/* Divider */}
<div className="relative">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
  </div>
  <div className="relative flex justify-center">
    <span className="bg-white dark:bg-gray-950 px-3 text-xs text-gray-400">ou continue com</span>
  </div>
</div>

{/* Real Google OAuth button */}
<GoogleOAuthButton />
```

Add the import at the top of LoginForm.tsx:
```typescript
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton'
```
    </details>
    <verification>
- "Entrar com Google" button is now clickable (not disabled)
- Clicking it shows a loading state then redirects to Google's OAuth consent screen
- After authorizing on Google, browser returns to `/dashboard`
- New Google user has a profile row in the `profiles` table (created by the trigger)
    </verification>
  </task>

  <task id="3" type="implement">
    <description>Create the ForgotPasswordForm component</description>
    <details>
Create `src/components/auth/ForgotPasswordForm.tsx`:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { sendPasswordResetEmail, useAuthLoading } from '@/hooks/useAuthActions'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Digite um email válido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/**
 * Forgot password form. AUTH-03: sends reset email.
 * Note: For security, we show the success message regardless of whether
 * the email exists in the system. This prevents user enumeration.
 */
export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [sentToEmail, setSentToEmail] = useState('')
  const { loading, withLoading } = useAuthLoading()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  })

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null)
    const result = await withLoading(() => sendPasswordResetEmail(data.email))

    if (!result.success) {
      setServerError(result.error.message)
      return
    }

    setSentToEmail(data.email)
    setSent(true)
  })

  if (sent) {
    return (
      <div className="py-8 text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Email enviado!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Se <strong>{sentToEmail}</strong> está cadastrado, você receberá um link para redefinir sua senha em instantes.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          O link expira em 1 hora. Verifique também a pasta de spam.
        </p>
        <Link
          to="/login"
          className="block mt-6 text-sm text-brand-500 font-medium hover:underline"
        >
          ← Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 py-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 -mt-2">
        Digite seu email e enviaremos um link para redefinir sua senha.
      </p>

      <FormError message={serverError} />

      <Input
        label="Email"
        type="email"
        placeholder="voce@exemplo.com"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button
        type="submit"
        fullWidth
        loading={loading}
        size="lg"
      >
        Enviar link de redefinição
      </Button>

      <Link
        to="/login"
        className="text-center text-sm text-brand-500 font-medium hover:underline"
      >
        ← Voltar para o login
      </Link>
    </form>
  )
}
```
    </details>
    <verification>
- Submitting with empty email shows "Email é obrigatório"
- Submitting with an invalid email shows "Digite um email válido"
- Submitting with a valid email (regardless of whether it's registered) shows the success screen
- A Supabase password reset email is actually sent when a registered email is used
    </verification>
  </task>

  <task id="4" type="implement">
    <description>Create the ResetPasswordForm component</description>
    <details>
Create `src/components/auth/ResetPasswordForm.tsx`:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { updatePassword, useAuthLoading } from '@/hooks/useAuthActions'

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(72, 'Senha muito longa'),
  confirmPassword: z.string().min(1, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/**
 * Password reset form. AUTH-03.
 *
 * This page is reached by clicking the reset link in the email.
 * Supabase embeds a token in the URL hash (e.g. #access_token=...&type=recovery).
 * The Supabase client (with detectSessionInUrl: true) automatically exchanges
 * this token for a session, emitting a PASSWORD_RECOVERY auth event.
 *
 * We wait for that event before showing the form.
 * If no recovery event arrives within 5s, we show an "invalid link" message.
 */
export function ResetPasswordForm() {
  const [tokenReady, setTokenReady] = useState(false)
  const [tokenError, setTokenError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const { loading, withLoading } = useAuthLoading()
  const navigate = useNavigate()

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTokenReady(true)
      }
    })

    // Fallback: if no event in 5s, the link is probably expired or invalid
    const timeout = setTimeout(() => {
      setTokenError(true)
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  })

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null)
    const result = await withLoading(() => updatePassword(data.password))

    if (!result.success) {
      setServerError(result.error.message)
      return
    }

    setSuccess(true)
    // Redirect to login after 2 seconds
    setTimeout(() => navigate('/login', { replace: true }), 2000)
  })

  // Loading state — waiting for Supabase to exchange the token
  if (!tokenReady && !tokenError) {
    return (
      <div className="py-12 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Verificando link...</p>
      </div>
    )
  }

  // Token invalid or expired
  if (tokenError && !tokenReady) {
    return (
      <div className="py-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Link inválido ou expirado</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Este link de redefinição já foi usado ou expirou. Links são válidos por 1 hora.
        </p>
        <Link
          to="/forgot-password"
          className="block mt-6 text-sm text-brand-500 font-medium hover:underline"
        >
          Solicitar novo link
        </Link>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Senha redefinida!</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sua senha foi atualizada com sucesso. Redirecionando para o login...
        </p>
      </div>
    )
  }

  // Reset password form
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 py-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Criar nova senha
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 -mt-2">
        Escolha uma senha forte para sua conta.
      </p>

      <FormError message={serverError} />

      <Input
        label="Nova senha"
        type="password"
        placeholder="Mínimo 6 caracteres"
        autoComplete="new-password"
        hint="Use pelo menos 6 caracteres"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirmar nova senha"
        type="password"
        placeholder="Repita a nova senha"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        fullWidth
        loading={loading}
        size="lg"
      >
        Redefinir senha
      </Button>
    </form>
  )
}
```
    </details>
    <verification>
- Opening `/reset-password` without a valid hash shows the loading spinner, then "Link inválido ou expirado" after 5 seconds
- Opening `/reset-password` with a valid Supabase reset hash shows the password form
- Submitting the form with mismatched passwords shows "As senhas não conferem"
- Submitting the form with a valid new password shows the success message and redirects to `/login`
    </verification>
  </task>

  <task id="5" type="implement">
    <description>Wire forms into ForgotPasswordPage and ResetPasswordPage</description>
    <details>
Replace `src/pages/auth/ForgotPasswordPage.tsx`:

```typescript
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export function ForgotPasswordPage() {
  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
        Esqueci minha senha
      </h2>
      <ForgotPasswordForm />
    </div>
  )
}
```

Replace `src/pages/auth/ResetPasswordPage.tsx`:

```typescript
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export function ResetPasswordPage() {
  return (
    <div className="py-4">
      <ResetPasswordForm />
    </div>
  )
}
```
    </details>
    <verification>Both pages render their respective forms. No TypeScript errors.</verification>
  </task>

  <task id="6" type="implement">
    <description>Create useOAuthCallback hook to handle post-OAuth edge cases</description>
    <details>
Create `src/hooks/useOAuthCallback.ts`:

```typescript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/**
 * Handles Supabase OAuth callback edge cases.
 *
 * When Supabase redirects back from Google with #access_token in the URL,
 * `detectSessionInUrl: true` in the client handles the token exchange automatically.
 * However, the URL hash remains visible. This hook cleans it up.
 *
 * Also handles the case where the user returns from Google but the tab was
 * re-opened (rare but possible on mobile), by re-checking the session.
 *
 * Use this hook in the root App component or a top-level layout.
 */
export function useOAuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Remove the hash fragment from the URL after OAuth callback
        // This prevents the access token from being visible in the browser history
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])
}
```

Note: This hook is intentionally minimal. The main session handling is done in `useAuth`. Add `useOAuthCallback()` to `src/App.tsx` inside the RouterProvider's context if hash cleanup is needed. For Phase 1, the Supabase redirect URL goes directly to `/dashboard` so the hash won't be visible there. This hook is a future safeguard.
    </details>
    <verification>Hook file exists with no TypeScript errors. Can be imported from `@/hooks/useOAuthCallback`.</verification>
  </task>
</tasks>

## Verification Criteria
- [ ] "Entrar com Google" button in the login page is functional (not disabled)
- [ ] Clicking "Entrar com Google" redirects to Google's consent screen
- [ ] After authorizing on Google, user is redirected to `/dashboard`
- [ ] New user authenticated via Google has a row in the `profiles` table
- [ ] `/forgot-password` form accepts an email and shows a success message after submission
- [ ] A real password reset email is sent to a registered Supabase email address
- [ ] Clicking the reset link from email lands on `/reset-password` and shows the password form
- [ ] Submitting the new password form successfully updates the password in Supabase
- [ ] After password reset, user is redirected to `/login`
- [ ] Opening `/reset-password` directly (no hash) shows "Link inválido ou expirado" after 5s
- [ ] Opening `/reset-password` with an expired token shows "Link inválido ou expirado"
- [ ] `npm run type-check` passes with 0 errors

## Notes
- The `PASSWORD_RECOVERY` event in Supabase is fired when the user arrives at the app from a reset email link. The Supabase client automatically exchanges the URL hash token for a session. This is why `detectSessionInUrl: true` was set in the Supabase client config (Plan 02).
- The 5-second timeout for the token check is a UX decision. On a slow connection the token exchange may take longer. If this proves problematic in testing, increase to 8–10 seconds or add a "retry" button.
- For security: `sendPasswordResetEmail` always returns `{ success: true }` to the caller even if the email doesn't exist. The actual Supabase response may indicate the email is not found, but we do not expose this to prevent user enumeration attacks.
- Google OAuth requires the Supabase project's redirect URL to be added to the Google Cloud Console's allowed redirect URIs (done in Plan 01, Task 5).
