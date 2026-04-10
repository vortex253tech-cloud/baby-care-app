---
id: "01-foundation-and-auth/03"
phase: 1
plan: 3
wave: 2
depends_on: ["01-foundation-and-auth/02"]
autonomous: true
files_modified:
  - "src/App.tsx"
  - "src/router.tsx"
  - "src/components/layout/AppShell.tsx"
  - "src/components/layout/BottomNav.tsx"
  - "src/components/layout/TopBar.tsx"
  - "src/components/layout/AuthLayout.tsx"
  - "src/pages/auth/LoginPage.tsx"
  - "src/pages/auth/RegisterPage.tsx"
  - "src/pages/auth/ForgotPasswordPage.tsx"
  - "src/pages/auth/ResetPasswordPage.tsx"
  - "src/pages/DashboardPage.tsx"
  - "src/pages/NotFoundPage.tsx"
  - "src/hooks/useAuth.ts"
  - "src/types/index.ts"
requirements: ["AUTH-01", "AUTH-02", "AUTH-03", "AUTH-04", "AUTH-05", "AUTH-06"]
must_haves:
  - "Navigating to `/login` shows the login page, `/register` shows the register page"
  - "Navigating to `/dashboard` while unauthenticated redirects to `/login`"
  - "After login (mocked), navigating to `/dashboard` shows the dashboard placeholder"
  - "Bottom navigation bar is visible on the dashboard page on mobile viewport"
  - "Unauthenticated routes (login, register) do NOT show the bottom nav"
---

# Plan 03: React Router + Layout Shell + Mobile Nav

## Objective
Configure all application routes with proper auth guards, create the mobile-first layout shell with a bottom navigation bar, and stub all auth-related pages so Plan 04 can fill in the form logic without touching routing.

## Context
This plan depends on Plan 02 (the Vite project with Supabase client). Plans 04 and 05 (Wave 3) both depend on this plan because they implement the actual auth forms inside the page stubs created here. The `useAuth` hook skeleton created here will be completed in Plan 04. The routing architecture established here (protected routes via a wrapper component) is the pattern used throughout all 10 phases.

## Tasks

<tasks>
  <task id="1" type="implement">
    <description>Define shared TypeScript types for auth and user</description>
    <details>
Replace `src/types/index.ts` with:

```typescript
import type { User, Session } from '@supabase/supabase-js'

// Re-export Supabase types used throughout the app
export type { User, Session }

// Profile row from the `profiles` table
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Auth context shape
export interface AuthContextValue {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

// Route meta
export type AppRoute =
  | '/login'
  | '/register'
  | '/forgot-password'
  | '/reset-password'
  | '/dashboard'
  | '/feed'
  | '/sleep'
  | '/diaper'
  | '/profile'
  | '/settings'
```
    </details>
    <verification>File exists with no TypeScript errors. Types are importable from `@/types`.</verification>
  </task>

  <task id="2" type="implement">
    <description>Create the useAuth hook stub (to be completed in Plan 04)</description>
    <details>
Create `src/hooks/useAuth.ts`:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session, Profile, AuthContextValue } from '@/types'

/**
 * Core auth hook. Manages Supabase session state and exposes
 * the current user, profile, and session.
 *
 * NOTE: The full implementation including signIn, signUp, signOut,
 * and Google OAuth will be added in Plan 04 and Plan 05.
 * This stub provides only the session observation logic needed
 * for the router's protected route guard.
 */
export function useAuth(): Pick<AuthContextValue, 'user' | 'session' | 'loading'> {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get the current session on mount (handles AUTH-04: persist session)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, session, loading }
}
```
    </details>
    <verification>The hook can be imported without TypeScript errors. The hook reads session from Supabase on mount.</verification>
  </task>

  <task id="3" type="implement">
    <description>Create the protected route component</description>
    <details>
Create `src/components/layout/ProtectedRoute.tsx`:

```typescript
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/**
 * Wraps routes that require authentication.
 * - If loading: shows a full-screen spinner
 * - If not authenticated: redirects to /login, preserving the intended URL
 * - If authenticated: renders the child route
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Preserve the URL the user was trying to access so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
```

Create `src/components/layout/PublicRoute.tsx`:

```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/**
 * Wraps routes that should NOT be accessible when authenticated.
 * - If authenticated: redirects to /dashboard
 * - If not authenticated: renders the child route
 */
export function PublicRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
```
    </details>
    <verification>Both components import and render without errors. The loading spinner uses the brand pink color.</verification>
  </task>

  <task id="4" type="implement">
    <description>Create the auth layout (used for login, register, forgot password pages)</description>
    <details>
Create `src/components/layout/AuthLayout.tsx`:

```typescript
import { Outlet } from 'react-router-dom'

/**
 * Layout for unauthenticated pages (login, register, forgot password).
 * Full-screen, centered, no navigation bar.
 * Mobile-first: content is vertically centered with comfortable padding.
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white dark:from-gray-900 dark:to-gray-950 flex flex-col">
      {/* Logo / App name header */}
      <header className="pt-12 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 mb-4">
          {/* Placeholder heart icon — replace with real SVG in Phase 9 */}
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MamãeApp</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cada momento do seu bebê, registrado com amor</p>
      </header>

      {/* Page content (login form, register form, etc.) */}
      <main className="flex-1 flex flex-col px-4 pb-safe">
        <div className="w-full max-w-sm mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
```
    </details>
    <verification>The AuthLayout renders with a centered card area, the MamãeApp logo/title at top, and the brand pink background gradient.</verification>
  </task>

  <task id="5" type="implement">
    <description>Create the app shell with top bar and bottom navigation</description>
    <details>
Create `src/components/layout/TopBar.tsx`:

```typescript
import { useNavigate } from 'react-router-dom'

interface TopBarProps {
  title?: string
  showBack?: boolean
}

/**
 * Top navigation bar for authenticated pages.
 * Shows optional back button and page title.
 * Height: 56px (standard mobile top bar)
 */
export function TopBar({ title = 'MamãeApp', showBack = false }: TopBarProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="touch-target flex items-center justify-center -ml-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Voltar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <h1 className="text-base font-semibold text-gray-900 dark:text-white flex-1">
        {title}
      </h1>
    </header>
  )
}
```

Create `src/components/layout/BottomNav.tsx`:

```typescript
import { NavLink } from 'react-router-dom'

type NavItem = {
  to: string
  label: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
}

/**
 * Fixed bottom navigation bar — the primary navigation for the app.
 * Mobile-first. Positioned above the system gesture bar via safe-area-inset.
 * 5 items: Home, Alimentação, Sono, Fraldas, Perfil
 */
export function BottomNav() {
  const navItems: NavItem[] = [
    {
      to: '/dashboard',
      label: 'Início',
      icon: <HomeIcon />,
      activeIcon: <HomeIconFilled />,
    },
    {
      to: '/feed',
      label: 'Alimentação',
      icon: <FeedIcon />,
      activeIcon: <FeedIconFilled />,
    },
    {
      to: '/sleep',
      label: 'Sono',
      icon: <SleepIcon />,
      activeIcon: <SleepIconFilled />,
    },
    {
      to: '/diaper',
      label: 'Fralda',
      icon: <DiaperIcon />,
      activeIcon: <DiaperIconFilled />,
    },
    {
      to: '/profile',
      label: 'Perfil',
      icon: <ProfileIcon />,
      activeIcon: <ProfileIconFilled />,
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-16">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 transition-colors touch-target ${
                isActive
                  ? 'text-brand-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="w-6 h-6 flex items-center justify-center">
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

// ─── Icon placeholders (replace with proper SVG icons in Phase 9) ───────────

function HomeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}
function HomeIconFilled() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
    </svg>
  )
}
function FeedIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5M6 10.608v3.924c0 1.035.84 1.875 1.875 1.875h8.25c1.035 0 1.875-.84 1.875-1.875v-3.924M8.25 9h.008v.008H8.25V9zm7.5 0h.008v.008h-.008V9z" />
    </svg>
  )
}
function FeedIconFilled() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M15.75 8.25a.75.75 0 01.75.75c0 1.12-.492 2.126-1.27 2.812a.75.75 0 01-.992-1.124A2.243 2.243 0 0015 9a.75.75 0 01.75-.75z" />
      <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
      <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
    </svg>
  )
}
function SleepIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  )
}
function SleepIconFilled() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
    </svg>
  )
}
function DiaperIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  )
}
function DiaperIconFilled() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  )
}
function ProfileIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}
function ProfileIconFilled() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
    </svg>
  )
}
```

Create `src/components/layout/AppShell.tsx`:

```typescript
import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  title?: string
  showBack?: boolean
}

/**
 * Layout wrapper for all authenticated pages.
 * Provides: TopBar (sticky) + scrollable content area + BottomNav (fixed).
 * The content area has pb-20 to prevent content from hiding behind the bottom nav.
 */
export function AppShell({ title, showBack }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <TopBar title={title} showBack={showBack} />
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
```
    </details>
    <verification>
- AppShell renders with TopBar at top and BottomNav fixed at bottom
- BottomNav shows 5 items: Início, Alimentação, Sono, Fralda, Perfil
- Active nav item is highlighted in brand-500 pink color
    </verification>
  </task>

  <task id="6" type="implement">
    <description>Create stub page components for all auth and main routes</description>
    <details>
Create `src/pages/auth/LoginPage.tsx`:
```typescript
// Full implementation in Plan 04
export function LoginPage() {
  return (
    <div className="py-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Entrar</h2>
      <p className="text-sm text-gray-500">Formulário de login — em breve (Plan 04)</p>
    </div>
  )
}
```

Create `src/pages/auth/RegisterPage.tsx`:
```typescript
// Full implementation in Plan 04
export function RegisterPage() {
  return (
    <div className="py-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Criar conta</h2>
      <p className="text-sm text-gray-500">Formulário de cadastro — em breve (Plan 04)</p>
    </div>
  )
}
```

Create `src/pages/auth/ForgotPasswordPage.tsx`:
```typescript
// Full implementation in Plan 05
export function ForgotPasswordPage() {
  return (
    <div className="py-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Esqueci minha senha</h2>
      <p className="text-sm text-gray-500">Formulário de recuperação — em breve (Plan 05)</p>
    </div>
  )
}
```

Create `src/pages/auth/ResetPasswordPage.tsx`:
```typescript
// Full implementation in Plan 05
export function ResetPasswordPage() {
  return (
    <div className="py-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Nova senha</h2>
      <p className="text-sm text-gray-500">Formulário de nova senha — em breve (Plan 05)</p>
    </div>
  )
}
```

Create `src/pages/DashboardPage.tsx`:
```typescript
// Full implementation in Phase 2
export function DashboardPage() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h2>
      <p className="text-sm text-gray-500 mt-2">Resumo do dia aparece aqui — Phase 2</p>
    </div>
  )
}
```

Create stub pages for the other nav items:

`src/pages/FeedPage.tsx`:
```typescript
export function FeedPage() {
  return <div className="p-4"><h2 className="text-xl font-semibold">Alimentação</h2><p className="text-sm text-gray-500 mt-2">Phase 3</p></div>
}
```

`src/pages/SleepPage.tsx`:
```typescript
export function SleepPage() {
  return <div className="p-4"><h2 className="text-xl font-semibold">Sono</h2><p className="text-sm text-gray-500 mt-2">Phase 3</p></div>
}
```

`src/pages/DiaperPage.tsx`:
```typescript
export function DiaperPage() {
  return <div className="p-4"><h2 className="text-xl font-semibold">Fraldas</h2><p className="text-sm text-gray-500 mt-2">Phase 3</p></div>
}
```

`src/pages/ProfilePage.tsx`:
```typescript
export function ProfilePage() {
  return <div className="p-4"><h2 className="text-xl font-semibold">Perfil</h2><p className="text-sm text-gray-500 mt-2">Phase 2</p></div>
}
```

`src/pages/NotFoundPage.tsx`:
```typescript
import { Link } from 'react-router-dom'
export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <p className="text-6xl mb-4">🍼</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Página não encontrada</h1>
      <p className="text-gray-500 mb-6">Essa página não existe ou foi movida.</p>
      <Link to="/dashboard" className="text-brand-500 font-medium underline">Voltar para o início</Link>
    </div>
  )
}
```
    </details>
    <verification>All page files exist and contain valid TypeScript. No import errors when building.</verification>
  </task>

  <task id="7" type="implement">
    <description>Configure React Router with all routes and auth guards</description>
    <details>
Create `src/router.tsx`:

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PublicRoute } from '@/components/layout/PublicRoute'

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'

// App pages
import { DashboardPage } from '@/pages/DashboardPage'
import { FeedPage } from '@/pages/FeedPage'
import { SleepPage } from '@/pages/SleepPage'
import { DiaperPage } from '@/pages/DiaperPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  // ── Root: redirect / to /dashboard ────────────────────────────────────────
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // ── Public routes (redirect to /dashboard if already logged in) ───────────
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },

  // ── Reset password: accessible even when logged in (link from email) ──────
  {
    element: <AuthLayout />,
    children: [
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // ── Protected routes (redirect to /login if not authenticated) ───────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/feed', element: <FeedPage /> },
          { path: '/sleep', element: <SleepPage /> },
          { path: '/diaper', element: <DiaperPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },

  // ── 404 ───────────────────────────────────────────────────────────────────
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
```

Update `src/App.tsx` to use the router:

```typescript
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

function App() {
  return <RouterProvider router={router} />
}

export default App
```
    </details>
    <verification>
- `http://localhost:5173/` redirects to `/dashboard`
- `/dashboard` redirects to `/login` (no auth yet)
- `/login` shows the login page stub inside AuthLayout
- `/register` shows the register page stub
- `/unknown-route` shows the 404 page
    </verification>
  </task>
</tasks>

## Verification Criteria
- [ ] `http://localhost:5173/` redirects to `/dashboard`, which redirects to `/login`
- [ ] `/login`, `/register`, `/forgot-password` all render within the AuthLayout (app logo visible, no bottom nav)
- [ ] Accessing `/dashboard` without auth redirects to `/login`
- [ ] After manually setting a Supabase session in localStorage, `/dashboard` loads the dashboard stub with BottomNav
- [ ] BottomNav has 5 items: Início, Alimentação, Sono, Fralda, Perfil
- [ ] Active route in BottomNav is highlighted in brand-500 (pink)
- [ ] `/unknown-route` shows the 404 page with a link back to `/dashboard`
- [ ] `npm run type-check` exits with 0 errors

## Notes
- The `reset-password` route is intentionally outside the `PublicRoute` guard because the user arrives via an email link and may or may not have a session. Supabase handles the token in the URL hash.
- The `AppShell` `title` prop will be set per-page in Phase 2 when real content is added to each page.
- Bottom nav items `/feed`, `/sleep`, `/diaper` are stubs that will be fleshed out in Phase 3. The routing structure is set up now so Phase 3 only needs to update the page content.
