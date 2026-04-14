import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { SavedTip } from '@/types'

export function useSavedTips(babyId: string, userId: string) {
  const [savedTips, setSavedTips] = useState<SavedTip[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSaved = useCallback(async () => {
    if (!babyId || !userId) {
      setSavedTips([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('saved_tips')
      .select('*')
      .eq('user_id', userId)
      .eq('baby_id', babyId)
      .order('saved_at', { ascending: false })
    if (!error && data) setSavedTips(data as SavedTip[])
    setLoading(false)
  }, [babyId, userId])

  useEffect(() => {
    fetchSaved()
  }, [fetchSaved])

  async function saveTip(tipId: string): Promise<void> {
    const { data, error } = await supabase
      .from('saved_tips')
      .insert({ user_id: userId, baby_id: babyId, tip_id: tipId })
      .select()
      .single()
    if (!error && data) {
      setSavedTips(prev => [data as SavedTip, ...prev])
    }
  }

  async function unsaveTip(tipId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_tips')
      .delete()
      .eq('user_id', userId)
      .eq('baby_id', babyId)
      .eq('tip_id', tipId)
    if (!error) {
      setSavedTips(prev => prev.filter(t => t.tip_id !== tipId))
    }
  }

  function isSaved(tipId: string): boolean {
    return savedTips.some(t => t.tip_id === tipId)
  }

  async function toggleSave(tipId: string): Promise<void> {
    if (isSaved(tipId)) {
      await unsaveTip(tipId)
    } else {
      await saveTip(tipId)
    }
  }

  return { savedTips, loading, saveTip, unsaveTip, isSaved, toggleSave, refetch: fetchSaved }
}
