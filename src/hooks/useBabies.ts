import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Baby } from '@/types'

const ACTIVE_BABY_KEY = 'mamaeapp_active_baby_id'

export function useBabies() {
  const { user } = useAuth()
  const [babies, setBabies] = useState<Baby[]>([])
  const [activeBabyId, setActiveBabyIdState] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_BABY_KEY)
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setBabies([])
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('babies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const list = data ?? []
        setBabies(list)
        // Auto-select first baby if stored id is gone
        if (list.length > 0) {
          const stored = localStorage.getItem(ACTIVE_BABY_KEY)
          const valid = stored && list.some((b) => b.id === stored)
          if (!valid) {
            localStorage.setItem(ACTIVE_BABY_KEY, list[0].id)
            setActiveBabyIdState(list[0].id)
          }
        }
        setLoading(false)
      })
  }, [user])

  const activeBaby = babies.find((b) => b.id === activeBabyId) ?? babies[0] ?? null

  const setActiveBaby = useCallback((id: string) => {
    localStorage.setItem(ACTIVE_BABY_KEY, id)
    setActiveBabyIdState(id)
  }, [])

  const refetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('babies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    setBabies(data ?? [])
  }, [user])

  return { babies, activeBaby, loading, setActiveBaby, refetch }
}
