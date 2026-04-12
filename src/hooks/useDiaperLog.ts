import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Diaper } from '@/types'

export interface DiaperFormData {
  type: 'wet' | 'dirty' | 'both'
  notes?: string
  changed_at?: string  // ISO — defaults to now() on DB side
}

export function useDiaperLog(babyId: string, userId: string) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveDiaper(data: DiaperFormData): Promise<Diaper | null> {
    setSaving(true)
    setError(null)
    const { data: row, error: err } = await supabase
      .from('diapers')
      .insert({ ...data, baby_id: babyId, user_id: userId })
      .select()
      .single()
    setSaving(false)
    if (err) { setError(err.message); return null }
    return row as Diaper
  }

  return { saveDiaper, saving, error }
}
