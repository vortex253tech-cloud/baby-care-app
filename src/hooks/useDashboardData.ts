import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Feeding, Sleep } from '@/types'

export interface DashboardData {
  lastFeed: { minutesAgo: number } | null
  sleepHoursToday: number
  diapersToday: number
  hungerAlertMinutes: number | null  // null = no alert; number = minutes since last feed (>= 180)
}

export function useDashboardData(babyId: string) {
  const [data, setData] = useState<DashboardData>({
    lastFeed: null,
    sleepHoursToday: 0,
    diapersToday: 0,
    hungerAlertMinutes: null,
  })
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!babyId) { setLoading(false); return }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayIso = todayStart.toISOString()

    const [feedRes, sleepRes, diaperRes] = await Promise.all([
      supabase
        .from('feedings')
        .select('started_at')
        .eq('baby_id', babyId)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from('sleeps')
        .select('started_at, ended_at')
        .eq('baby_id', babyId)
        .gte('started_at', todayIso),

      supabase
        .from('diapers')
        .select('id')
        .eq('baby_id', babyId)
        .gte('changed_at', todayIso),
    ])

    // Last feed
    const lastFeedRow = feedRes.data as Pick<Feeding, 'started_at'> | null
    let lastFeed: DashboardData['lastFeed'] = null
    let hungerAlertMinutes: number | null = null

    if (lastFeedRow) {
      const minutesAgo = Math.floor(
        (Date.now() - new Date(lastFeedRow.started_at).getTime()) / 60000
      )
      lastFeed = { minutesAgo }
      if (minutesAgo >= 180) hungerAlertMinutes = minutesAgo
    }

    // Sleep hours today
    const sleepRows = (sleepRes.data as Pick<Sleep, 'started_at' | 'ended_at'>[]) ?? []
    const totalSleepSeconds = sleepRows.reduce((acc, s) => {
      const end = s.ended_at ? new Date(s.ended_at).getTime() : Date.now()
      return acc + Math.max(0, (end - new Date(s.started_at).getTime()) / 1000)
    }, 0)
    const sleepHoursToday = totalSleepSeconds / 3600

    // Diapers today
    const diapersToday = (diaperRes.data ?? []).length

    setData({ lastFeed, sleepHoursToday, diapersToday, hungerAlertMinutes })
    setLoading(false)
  }, [babyId])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { data, loading, refetch: fetchAll }
}
