import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Reminder } from '@/types'

export function useReminders(babyId: string, userId: string) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchReminders() {
    if (!babyId) { setLoading(false); return }
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('baby_id', babyId)
      .order('created_at', { ascending: true })
    setReminders(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchReminders()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [babyId])

  async function createReminder(
    input: Omit<Reminder, 'id' | 'user_id' | 'baby_id' | 'created_at' | 'updated_at'>
  ): Promise<Reminder | null> {
    const { data } = await supabase
      .from('reminders')
      .insert({ ...input, user_id: userId, baby_id: babyId })
      .select()
      .single()
    if (data) setReminders((prev) => [...prev, data])
    return data
  }

  async function updateReminder(id: string, patch: Partial<Reminder>): Promise<Reminder | null> {
    const { data } = await supabase
      .from('reminders')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (data) setReminders((prev) => prev.map((r) => (r.id === id ? data : r)))
    return data
  }

  async function deleteReminder(id: string): Promise<void> {
    await supabase.from('reminders').delete().eq('id', id)
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  async function toggleReminder(id: string, enabled: boolean): Promise<Reminder | null> {
    return updateReminder(id, { enabled })
  }

  return {
    reminders,
    loading,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    refetch: fetchReminders,
  }
}
