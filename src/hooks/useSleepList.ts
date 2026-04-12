import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Sleep } from '@/types'

export function useSleepList(babyId: string) {
  const [sleeps, setSleeps] = useState<Sleep[]>([])
  const [loading, setLoading] = useState(true)
  const [sleepHoursToday, setSleepHoursToday] = useState(0)

  const fetchSleeps = useCallback(async () => {
    if (!babyId) { setLoading(false); return }
    setLoading(true)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('sleeps')
      .select('*')
      .eq('baby_id', babyId)
      .gte('started_at', todayStart.toISOString())
      .order('started_at', { ascending: false })
    const rows = (data as Sleep[]) ?? []
    setSleeps(rows)

    const totalSeconds = rows.reduce((acc, s) => {
      const start = new Date(s.started_at).getTime()
      const end = s.ended_at ? new Date(s.ended_at).getTime() : Date.now()
      return acc + Math.max(0, (end - start) / 1000)
    }, 0)
    setSleepHoursToday(totalSeconds / 3600)
    setLoading(false)
  }, [babyId])

  useEffect(() => { fetchSleeps() }, [fetchSleeps])

  return { sleeps, loading, sleepHoursToday, refetch: fetchSleeps }
}
