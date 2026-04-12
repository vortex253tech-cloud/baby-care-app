import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Sleep } from '@/types'

export function useSleepTimer(babyId: string, userId: string) {
  const [activeSleep, setActiveSleep] = useState<Sleep | null>(null)
  const [loading, setLoading] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchActive = useCallback(async () => {
    if (!babyId) { setLoading(false); return }
    const { data } = await supabase
      .from('sleeps')
      .select('*')
      .eq('baby_id', babyId)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setActiveSleep(data as Sleep | null)
    setLoading(false)
  }, [babyId])

  useEffect(() => { fetchActive() }, [fetchActive])

  // Tick elapsed when active
  useEffect(() => {
    if (activeSleep) {
      const startMs = new Date(activeSleep.started_at).getTime()
      setElapsed(Math.floor((Date.now() - startMs) / 1000))
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startMs) / 1000))
      }, 1000)
    } else {
      setElapsed(0)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeSleep])

  async function startSleep() {
    setError(null)
    const { data, error: err } = await supabase
      .from('sleeps')
      .insert({ baby_id: babyId, user_id: userId, started_at: new Date().toISOString() })
      .select()
      .single()
    if (err) { setError(err.message); return }
    setActiveSleep(data as Sleep)
  }

  async function stopSleep(notes?: string): Promise<Sleep | undefined> {
    if (!activeSleep) return undefined
    setError(null)
    const { data, error: err } = await supabase
      .from('sleeps')
      .update({ ended_at: new Date().toISOString(), notes: notes ?? null })
      .eq('id', activeSleep.id)
      .select()
      .single()
    if (err) { setError(err.message); return undefined }
    setActiveSleep(null)
    return data as Sleep
  }

  return { activeSleep, loading, elapsed, startSleep, stopSleep, error }
}
