import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Diaper } from '@/types'

export function useDiaperList(babyId: string) {
  const [diapers, setDiapers] = useState<Diaper[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDiapers = useCallback(async () => {
    if (!babyId) { setLoading(false); return }
    setLoading(true)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('diapers')
      .select('*')
      .eq('baby_id', babyId)
      .gte('changed_at', todayStart.toISOString())
      .order('changed_at', { ascending: false })
    setDiapers((data as Diaper[]) ?? [])
    setLoading(false)
  }, [babyId])

  useEffect(() => { fetchDiapers() }, [fetchDiapers])

  async function deleteDiaper(id: string) {
    await supabase.from('diapers').delete().eq('id', id)
    setDiapers(prev => prev.filter(d => d.id !== id))
  }

  return {
    diapers,
    loading,
    diapersToday: diapers.length,
    refetch: fetchDiapers,
    deleteDiaper,
  }
}
