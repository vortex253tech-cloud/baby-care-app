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

// Baby row from the `babies` table
export interface Baby {
  id: string
  user_id: string
  name: string
  birth_date: string  // ISO date string 'YYYY-MM-DD'
  sex: 'M' | 'F' | 'other'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Route meta
export type AppRoute =
  | '/login'
  | '/register'
  | '/forgot-password'
  | '/reset-password'
  | '/onboarding/baby'
  | '/dashboard'
  | '/feed'
  | '/sleep'
  | '/diaper'
  | '/profile'
  | '/settings'
