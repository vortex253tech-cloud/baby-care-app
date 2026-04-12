import { useState } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useAuthContext } from '@/contexts/AuthContext'
import { useDiaperLog } from '@/hooks/useDiaperLog'
import { useDiaperList } from '@/hooks/useDiaperList'
import { DiaperQuickButtons } from '@/components/diaper/DiaperQuickButtons'
import { DiaperList } from '@/components/diaper/DiaperList'
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner'
import type { Diaper } from '@/types'

export function DiaperPage() {
  const { activeBaby, loading: babyLoading } = useBabies()
  const { user } = useAuthContext()
  const [saved, setSaved] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const { saveDiaper, saving, error } = useDiaperLog(
    activeBaby?.id ?? '',
    user?.id ?? '',
  )
  const { diapers, loading: listLoading, diapersToday, refetch, deleteDiaper } = useDiaperList(
    activeBaby?.id ?? '',
  )

  if (babyLoading) return <FullScreenSpinner />
  if (!activeBaby || !user) return null

  async function handleSave(type: Diaper['type'], notes?: string) {
    const result = await saveDiaper({ type, notes })
    if (result) {
      setSaved(true)
      setFormKey(k => k + 1)
      refetch()
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fraldas</h2>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <DiaperQuickButtons key={formKey} onSave={handleSave} saving={saving} />
        {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
      </div>

      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Hoje ({diapersToday})
      </h3>
      <DiaperList diapers={diapers} loading={listLoading} onDelete={deleteDiaper} />

      {saved && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          ✓ Fralda registrada!
        </div>
      )}
    </div>
  )
}
