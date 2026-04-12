import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Feeding } from '@/types'

export function useFeedingList(babyId: string) {
  const [feedings, setFeedings] = useState<Feeding[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeedings = useCallback(async () => {
    if (!babyId) { setLoading(false); return }
    setLoading(true)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('feedings')
      .select('*')
      .eq('baby_id', babyId)
      .gte('started_at', todayStart.toISOString())
      .order('started_at', { ascending: false })
    setFeedings((data as Feeding[]) ?? [])
    setLoading(false)
  }, [babyId])

  useEffect(() => { fetchFeedings() }, [fetchFeedings])

  async function deleteFeeding(id: string) {
    await supabase.from('feedings').delete().eq('id', id)
    setFeedings(prev => prev.filter(f => f.id !== id))
  }

  return { feedings, loading, refetch: fetchFeedings, deleteFeeding }
}
