import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { BabyMilestone } from '@/types'

export function useMilestones(babyId: string, userId: string) {
  const [milestones, setMilestones] = useState<BabyMilestone[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchMilestones() {
    if (!babyId) { setLoading(false); return }
    const { data } = await supabase
      .from('baby_milestones')
      .select('*')
      .eq('baby_id', babyId)
      .order('achieved_at', { ascending: true })
    setMilestones(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchMilestones() }, [babyId])

  async function achieve(
    milestoneId: string,
    achievedAt: string,         // 'YYYY-MM-DD'
    photoUrl?: string | null,
    notes?: string | null
  ): Promise<BabyMilestone | null> {
    const { data } = await supabase
      .from('baby_milestones')
      .upsert(
        { user_id: userId, baby_id: babyId, milestone_id: milestoneId, achieved_at: achievedAt, photo_url: photoUrl ?? null, notes: notes ?? null },
        { onConflict: 'baby_id,milestone_id' }
      )
      .select()
      .single()
    if (data) setMilestones((prev) => {
      const exists = prev.find((m) => m.milestone_id === milestoneId)
      return exists ? prev.map((m) => m.milestone_id === milestoneId ? data : m) : [...prev, data]
    })
    return data
  }

  async function unachieve(milestoneId: string): Promise<void> {
    await supabase
      .from('baby_milestones')
      .delete()
      .eq('baby_id', babyId)
      .eq('milestone_id', milestoneId)
    setMilestones((prev) => prev.filter((m) => m.milestone_id !== milestoneId))
  }

  function isAchieved(milestoneId: string): boolean {
    return milestones.some((m) => m.milestone_id === milestoneId)
  }

  function getAchievement(milestoneId: string): BabyMilestone | undefined {
    return milestones.find((m) => m.milestone_id === milestoneId)
  }

  return { milestones, loading, achieve, unachieve, isAchieved, getAchievement, refetch: fetchMilestones }
}
