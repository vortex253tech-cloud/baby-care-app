import { useState } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useAuthContext } from '@/contexts/AuthContext'
import { useFeedLog } from '@/hooks/useFeedLog'
import { useFeedingList } from '@/hooks/useFeedingList'
import { BreastFeedForm } from '@/components/feed/BreastFeedForm'
import { BottleFeedForm } from '@/components/feed/BottleFeedForm'
import { SolidFeedForm } from '@/components/feed/SolidFeedForm'
import { FeedingList } from '@/components/feed/FeedingList'
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner'
import type { FeedFormData } from '@/hooks/useFeedLog'

type Tab = 'breast' | 'bottle' | 'solid'

export function FeedPage() {
  const { activeBaby, loading: babyLoading } = useBabies()
  const { user } = useAuthContext()
  const [tab, setTab] = useState<Tab>('breast')
  const [saved, setSaved] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const { saveFeeding, saving, error } = useFeedLog(
    activeBaby?.id ?? '',
    user?.id ?? '',
  )
  const { feedings, loading: listLoading, refetch, deleteFeeding } = useFeedingList(
    activeBaby?.id ?? '',
  )

  if (babyLoading) return <FullScreenSpinner />
  if (!activeBaby || !user) return null

  async function handleSave(data: FeedFormData) {
    const result = await saveFeeding(data)
    if (result) {
      setSaved(true)
      setFormKey(k => k + 1)
      refetch()
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const tabs = [
    { id: 'breast' as Tab, label: '🤱 Peito' },
    { id: 'bottle' as Tab, label: '🍼 Mamadeira' },
    { id: 'solid' as Tab, label: '🥣 Sólido' },
  ]

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alimentação</h2>

      {/* Tab bar */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 gap-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Form area */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        {tab === 'breast' && (
          <BreastFeedForm key={`breast-${formKey}`} onSave={handleSave} saving={saving} />
        )}
        {tab === 'bottle' && (
          <BottleFeedForm key={`bottle-${formKey}`} onSave={handleSave} saving={saving} />
        )}
        {tab === 'solid' && (
          <SolidFeedForm key={`solid-${formKey}`} onSave={handleSave} saving={saving} />
        )}
        {error && (
          <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
        )}
      </div>

      {/* Today's feedings */}
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Hoje
      </h3>
      <FeedingList feedings={feedings} loading={listLoading} onDelete={deleteFeeding} />

      {/* Snackbar */}
      {saved && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          ✓ Mamada registrada!
        </div>
      )}
    </div>
  )
}
