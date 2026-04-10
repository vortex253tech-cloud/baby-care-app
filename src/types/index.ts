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
