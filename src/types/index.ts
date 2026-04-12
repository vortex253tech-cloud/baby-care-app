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

// Feeding row from the `feedings` table
export interface Feeding {
  id: string
  baby_id: string
  user_id: string
  type: 'breast' | 'bottle' | 'solid'
  side: 'left' | 'right' | 'both' | null
  duration_seconds: number | null
  volume_ml: number | null
  milk_type: 'breast_milk' | 'formula' | 'mixed' | null
  food_name: string | null
  amount_g: number | null
  notes: string | null
  started_at: string
  ended_at: string | null
  created_at: string
  updated_at: string
}

// Sleep row from the `sleeps` table
export interface Sleep {
  id: string
  baby_id: string
  user_id: string
  started_at: string
  ended_at: string | null   // null = currently sleeping
  notes: string | null
  created_at: string
  updated_at: string
}

// Diaper row from the `diapers` table
export interface Diaper {
  id: string
  baby_id: string
  user_id: string
  type: 'wet' | 'dirty' | 'both'
  notes: string | null
  changed_at: string
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
