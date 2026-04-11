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

// Onboarding pages
import { BabyOnboardingPage } from '@/pages/onboarding/BabyOnboardingPage'

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
      // Onboarding: auth required, no bottom nav
      {
        element: <AuthLayout />,
        children: [
          { path: '/onboarding/baby', element: <BabyOnboardingPage /> },
        ],
      },
      // Main app: auth required + has baby
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
