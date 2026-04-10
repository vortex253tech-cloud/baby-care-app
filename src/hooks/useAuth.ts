import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session, AuthContextValue } from '@/types'

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
