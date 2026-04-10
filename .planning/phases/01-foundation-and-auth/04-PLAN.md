---
id: "01-foundation-and-auth/04"
phase: 1
plan: 4
wave: 3
depends_on: ["01-foundation-and-auth/03"]
autonomous: true
files_modified:
  - "src/hooks/useAuth.ts"
  - "src/hooks/useAuthActions.ts"
  - "src/components/ui/Button.tsx"
  - "src/components/ui/Input.tsx"
  - "src/components/ui/FormError.tsx"
  - "src/components/auth/LoginForm.tsx"
  - "src/components/auth/RegisterForm.tsx"
  - "src/pages/auth/LoginPage.tsx"
  - "src/pages/auth/RegisterPage.tsx"
requirements: ["AUTH-01", "AUTH-02", "AUTH-04"]
must_haves:
  - "A new user can complete registration with email + password and sees a 'verify your email' message"
  - "An existing user can log in and is redirected to /dashboard"
  - "Wrong password shows inline error 'Email ou senha incorretos'"
  - "Unverified email shows inline error 'Confirme seu email antes de entrar'"
  - "Form fields show inline Zod validation errors on submit (empty field, invalid email format, password too short)"
  - "Submit buttons show a loading spinner while the Supabase request is in-flight"
---

# Plan 04: Email/Password Registration and Login Forms

## Objective
Implement fully functional registration and login forms with react-hook-form + zod validation, Supabase Auth integration, and complete error handling covering all failure states.

## Context
This plan depends on Plan 03 (routing + page stubs) and runs in parallel with Plan 05 (Google OAuth + email verification flow). The `useAuth` hook started in Plan 03 is completed here with `signIn` and `signUp` actions. The UI components created here (`Button`, `Input`, `FormError`) are the reusable primitives used by every form in the app going forward.

## Tasks

<tasks>
  <task id="1" type="implement">
    <description>Create reusable UI primitives: Button, Input, FormError</description>
    <details>
Create `src/components/ui/Button.tsx`:

```typescript
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

/**
 * Primary button component. Minimum touch target 44px (WCAG 2.5.5).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target'

    const variants = {
      primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700',
      ghost: 'text-brand-500 hover:bg-brand-50 active:bg-brand-100 dark:hover:bg-brand-900/20',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    }

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="w-4 h-4 mr-2 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Aguarde...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

Create `src/components/ui/Input.tsx`:

```typescript
import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

/**
 * Accessible input field with label, error state, and hint text.
 * Always renders a label for screen-reader accessibility.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`
            h-12 w-full rounded-xl border bg-white dark:bg-gray-800 px-4
            text-base text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0
            ${error
              ? 'border-red-400 focus:ring-red-400 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
          >
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
```

Create `src/components/ui/FormError.tsx`:

```typescript
interface FormErrorProps {
  message?: string | null
}

/**
 * Displays a top-level form error (e.g., "Email ou senha incorretos").
 * Use for errors returned by the server, not field-level validation errors.
 */
export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3"
    >
      <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
    </div>
  )
}
```
    </details>
    <verification>All three components render without TypeScript errors. The Button shows a spinner when `loading={true}`. The Input shows a red border and error text when `error` is set.</verification>
  </task>

  <task id="2" type="implement">
    <description>Create useAuthActions hook with signIn and signUp</description>
    <details>
Create `src/hooks/useAuthActions.ts`:

```typescript
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type AuthError = {
  message: string
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export type SignUpInput = {
  email: string
  password: string
  fullName?: string
}

export type SignUpResult =
  | { success: true; requiresEmailConfirmation: boolean }
  | { success: false; error: AuthError }

export async function signUpWithEmail(input: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName ?? '',
      },
      // After email confirmation, redirect back to the app
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  })

  if (error) {
    return { success: false, error: { message: mapSignUpError(error.message) } }
  }

  // Supabase returns a user but no session when email confirmation is required
  const requiresEmailConfirmation = !data.session && !!data.user

  return { success: true, requiresEmailConfirmation }
}

function mapSignUpError(message: string): string {
  if (message.includes('already registered') || message.includes('User already registered')) {
    return 'Este email já está cadastrado. Tente fazer login ou recupere sua senha.'
  }
  if (message.includes('Password should be')) {
    return 'A senha deve ter pelo menos 6 caracteres.'
  }
  if (message.includes('rate limit')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  }
  return 'Erro ao criar conta. Tente novamente.'
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export type SignInInput = {
  email: string
  password: string
}

export type SignInResult =
  | { success: true }
  | { success: false; error: AuthError }

export async function signInWithEmail(input: SignInInput): Promise<SignInResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })

  if (error) {
    return { success: false, error: { message: mapSignInError(error.message) } }
  }

  return { success: true }
}

function mapSignInError(message: string): string {
  if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
    return 'Email ou senha incorretos. Verifique e tente novamente.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Confirme seu email antes de entrar. Verifique sua caixa de entrada.'
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Muitas tentativas de login. Aguarde alguns minutos.'
  }
  if (message.includes('User not found')) {
    return 'Email ou senha incorretos. Verifique e tente novamente.'
  }
  return 'Erro ao entrar. Tente novamente.'
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

// ─── Hook for loading state ───────────────────────────────────────────────────

export function useAuthLoading() {
  const [loading, setLoading] = useState(false)

  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    setLoading(true)
    try {
      return await fn()
    } finally {
      setLoading(false)
    }
  }

  return { loading, withLoading }
}
```
    </details>
    <verification>The functions can be imported. Error messages are in Portuguese. All Supabase error codes are mapped to user-friendly messages.</verification>
  </task>

  <task id="3" type="implement">
    <description>Create the RegisterForm component</description>
    <details>
Create `src/components/auth/RegisterForm.tsx`:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { signUpWithEmail, useAuthLoading } from '@/hooks/useAuthActions'

const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Digite um email válido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(72, 'Senha muito longa'),
  confirmPassword: z.string().min(1, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Registration form with react-hook-form + zod validation.
 * Handles AUTH-01 (create account with email/password).
 * After registration, AUTH-02 (email verification) is triggered automatically by Supabase.
 */
export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { loading, withLoading } = useAuthLoading()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // Validate on blur, not on every keystroke
  })

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null)
    const result = await withLoading(() =>
      signUpWithEmail({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      })
    )

    if (!result.success) {
      setServerError(result.error.message)
      return
    }

    if (result.requiresEmailConfirmation) {
      setSuccess(true)
    }
    // If no email confirmation required (disabled in Supabase settings),
    // the onAuthStateChange in useAuth will update the session automatically.
  })

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Verifique seu email!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enviamos um link de confirmação para o seu email. Clique no link para ativar sua conta.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          Não recebeu? Verifique a pasta de spam.
        </p>
        <Link
          to="/login"
          className="block mt-6 text-sm text-brand-500 font-medium hover:underline"
        >
          Já confirmei meu email — Entrar
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 py-4">
      <FormError message={serverError} />

      <Input
        label="Seu nome"
        type="text"
        placeholder="Maria Silva"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <Input
        label="Email"
        type="email"
        placeholder="voce@exemplo.com"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Senha"
        type="password"
        placeholder="Mínimo 6 caracteres"
        autoComplete="new-password"
        hint="Use pelo menos 6 caracteres"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirmar senha"
        type="password"
        placeholder="Repita a senha"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        fullWidth
        loading={loading}
        size="lg"
        className="mt-2"
      >
        Criar conta
      </Button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Já tem conta?{' '}
        <Link to="/login" className="text-brand-500 font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  )
}
```
    </details>
    <verification>
- Submitting with empty fields shows inline validation errors
- Submitting with mismatched passwords shows "As senhas não conferem"
- Submitting with invalid email shows "Digite um email válido"
- Submitting with a valid new email sends a Supabase verification email and shows the success screen
- Submitting with an already-used email shows "Este email já está cadastrado"
    </verification>
  </task>

  <task id="4" type="implement">
    <description>Create the LoginForm component</description>
    <details>
Create `src/components/auth/LoginForm.tsx`:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { signInWithEmail, useAuthLoading } from '@/hooks/useAuthActions'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Digite um email válido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * Login form. Handles AUTH-01 (sign in with email/password).
 * On success, redirects to the originally-requested URL (or /dashboard).
 * Session is automatically persisted by Supabase (AUTH-04).
 */
export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const { loading, withLoading } = useAuthLoading()
  const navigate = useNavigate()
  const location = useLocation()

  // If the user was redirected from a protected route, go back there after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null)
    const result = await withLoading(() =>
      signInWithEmail({ email: data.email, password: data.password })
    )

    if (!result.success) {
      setServerError(result.error.message)
      return
    }

    // Session is set — navigate to the intended route
    navigate(from, { replace: true })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 py-4">
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

      <Input
        label="Senha"
        type="password"
        placeholder="Sua senha"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex justify-end -mt-2">
        <Link
          to="/forgot-password"
          className="text-sm text-brand-500 hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      <Button
        type="submit"
        fullWidth
        loading={loading}
        size="lg"
      >
        Entrar
      </Button>

      {/* Google OAuth button placeholder — implemented in Plan 05 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white dark:bg-gray-950 px-3 text-xs text-gray-400">ou continue com</span>
        </div>
      </div>

      {/* Google button — wired up in Plan 05 */}
      <button
        type="button"
        disabled
        className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 opacity-50 cursor-not-allowed"
        aria-label="Entrar com Google (em breve)"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Entrar com Google
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Não tem conta?{' '}
        <Link to="/register" className="text-brand-500 font-medium hover:underline">
          Criar conta grátis
        </Link>
      </p>
    </form>
  )
}
```
    </details>
    <verification>
- Submitting empty form shows validation errors for both fields
- Submitting with wrong credentials shows "Email ou senha incorretos"
- Submitting with unverified email shows "Confirme seu email antes de entrar"
- Successful login redirects to /dashboard
- "Entrar com Google" button is visible but disabled (enabled in Plan 05)
    </verification>
  </task>

  <task id="5" type="implement">
    <description>Wire forms into their page components</description>
    <details>
Replace `src/pages/auth/LoginPage.tsx`:

```typescript
import { LoginForm } from '@/components/auth/LoginForm'

export function LoginPage() {
  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
        Bem-vinda de volta
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Entre na sua conta para continuar
      </p>
      <LoginForm />
    </div>
  )
}
```

Replace `src/pages/auth/RegisterPage.tsx`:

```typescript
import { RegisterForm } from '@/components/auth/RegisterForm'

export function RegisterPage() {
  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
        Criar conta grátis
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Comece a acompanhar o desenvolvimento do seu bebê
      </p>
      <RegisterForm />
    </div>
  )
}
```
    </details>
    <verification>
- `/register` shows a form with full name, email, password, confirm password fields and a "Criar conta" button
- `/login` shows a form with email, password fields, a "Entrar" button, and a disabled Google button
    </verification>
  </task>

  <task id="6" type="implement">
    <description>Update useAuth hook to expose signOut</description>
    <details>
Update `src/hooks/useAuth.ts` to add the signOut action:

```typescript
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@/types'

export interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // AUTH-04: Load persisted session from localStorage on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // The onAuthStateChange listener will clear user/session state
  }, [])

  return { user, session, loading, signOut }
}
```
    </details>
    <verification>Calling `signOut()` from any component clears the session and the ProtectedRoute redirects to `/login`.</verification>
  </task>
</tasks>

## Verification Criteria
- [ ] `/register` page shows form with fullName, email, password, confirmPassword fields
- [ ] Submitting register form with empty fields shows Zod validation errors inline
- [ ] Submitting register form with invalid email format shows "Digite um email válido"
- [ ] Submitting register form with password < 6 chars shows "Senha deve ter pelo menos 6 caracteres"
- [ ] Submitting register form with mismatched passwords shows "As senhas não conferem"
- [ ] Submitting register form with valid new email triggers Supabase to send verification email and shows the "Verifique seu email" success screen
- [ ] Submitting register form with already-used email shows "Este email já está cadastrado"
- [ ] `/login` page shows form with email, password fields and "Esqueci minha senha" link
- [ ] Submitting login form with wrong password shows "Email ou senha incorretos"
- [ ] Submitting login form with unverified email shows "Confirme seu email antes de entrar"
- [ ] Submitting login form with correct credentials redirects to `/dashboard`
- [ ] After successful login, refreshing the page stays on `/dashboard` (AUTH-04 — session persisted)
- [ ] Submit buttons show loading spinner while request is in-flight
- [ ] `npm run type-check` passes with 0 errors

## Notes
- The Google OAuth button is rendered disabled in the LoginForm — it will be activated in Plan 05. Keeping it visible now means users can see the UI before the feature is complete.
- `mode: 'onBlur'` was chosen over `mode: 'onChange'` to avoid showing errors while the user is actively typing. Errors appear when they leave a field.
- The `from` redirect logic preserves the originally-requested URL so if a user bookmarks `/dashboard/profile` and comes back unauthenticated, they land on the right page after login.
- Supabase `signUp` returns a user with no session when email confirmation is enabled. The success screen must handle this case — do NOT assume login happens immediately after sign-up.
