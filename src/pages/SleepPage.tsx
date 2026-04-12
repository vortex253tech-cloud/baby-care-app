import { useState } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSleepTimer } from '@/hooks/useSleepTimer'
import { useSleepList } from '@/hooks/useSleepList'
import { supabase } from '@/lib/supabase'
import { SleepTimerCard } from '@/components/sleep/SleepTimerCard'
import { SleepList } from '@/components/sleep/SleepList'
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner'

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export function SleepPage() {
  const { activeBaby, loading: babyLoading } = useBabies()
  const { user } = useAuthContext()
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const { activeSleep, loading: timerLoading, elapsed, startSleep, stopSleep, error } =
    useSleepTimer(activeBaby?.id ?? '', user?.id ?? '')

  const { sleeps, loading: listLoading, refetch } = useSleepList(activeBaby?.id ?? '')

  if (babyLoading) return <FullScreenSpinner />
  if (!activeBaby || !user) return null

  async function handleStop(notes?: string) {
    const elapsedSnapshot = elapsed
    const result = await stopSleep(notes)
    if (result) {
      setSavedMsg(`Sono de ${formatDuration(elapsedSnapshot)} registrado!`)
      refetch()
      setTimeout(() => setSavedMsg(null), 3000)
    }
  }

  async function handleStart() {
    await startSleep()
    refetch()
  }

  async function handleDelete(id: string) {
    await supabase.from('sleeps').delete().eq('id', id)
    refetch()
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sono</h2>

      <SleepTimerCard
        activeSleep={activeSleep}
        elapsed={elapsed}
        loading={timerLoading}
        onStart={handleStart}
        onStop={handleStop}
        error={error}
      />

      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Hoje
      </h3>
      <SleepList sleeps={sleeps} loading={listLoading} onDelete={handleDelete} />

      {savedMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          ✓ {savedMsg}
        </div>
      )}
    </div>
  )
}
