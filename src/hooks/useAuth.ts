/**
 * useAuth — thin re-export of the AuthContext consumer.
 *
 * Usage:
 *   const { user, loading, signOut } = useAuth()
 *
 * Must be used inside <AuthProvider> (wired in App.tsx).
 */
export { useAuthContext as useAuth } from '@/contexts/AuthContext'
