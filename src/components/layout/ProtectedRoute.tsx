import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useBabies } from '@/hooks/useBabies'

/**
 * Wraps routes that require authentication.
 * - If loading: shows a full-screen spinner
 * - If not authenticated: redirects to /login, preserving the intended URL
 * - If authenticated but no babies: redirects to /onboarding/baby
 * - If authenticated with babies: renders the child route
 */
export function ProtectedRoute() {
  const { user, loading: authLoading } = useAuth()
  const { babies, loading: babiesLoading } = useBabies()
  const location = useLocation()

  // Wait for both auth and babies to resolve
  if (authLoading || babiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Preserve the URL the user was trying to access so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect authenticated users with no babies to onboarding
  // Allow /onboarding/baby itself to pass through (avoid infinite redirect loop)
  if (babies.length === 0 && location.pathname !== '/onboarding/baby') {
    return <Navigate to="/onboarding/baby" replace />
  }

  return <Outlet />
}
