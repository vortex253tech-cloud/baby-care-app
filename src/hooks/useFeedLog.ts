import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Feeding } from '@/types'

export interface FeedFormData {
  type: 'breast' | 'bottle' | 'solid'
  side?: 'left' | 'right' | 'both'
  duration_seconds?: number
  volume_ml?: number
  milk_type?: 'breast_milk' | 'formula' | 'mixed'
  food_name?: string
  amount_g?: number
  notes?: string
  started_at: string   // ISO
  ended_at?: string    // ISO
}

export function useFeedLog(babyId: string, userId: string) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveFeeding(data: FeedFormData): Promise<Feeding | null> {
    setSaving(true)
    setError(null)
    const { data: row, error: err } = await supabase
      .from('feedings')
      .insert({ ...data, baby_id: babyId, user_id: userId })
      .select()
      .single()
    setSaving(false)
    if (err) { setError(err.message); return null }
    return row as Feeding
  }

  return { saveFeeding, saving, error }
}
