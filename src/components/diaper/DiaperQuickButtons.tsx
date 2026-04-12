import { useState } from 'react'
import type { Diaper } from '@/types'

interface Props {
  onSave: (type: Diaper['type'], notes?: string) => void
  saving: boolean
}

const diaperTypes = [
  {
    id: 'wet' as Diaper['type'],
    label: 'Molhada',
    emoji: '💧',
    idle: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300',
    active: 'bg-blue-500 border-blue-500 text-white',
    saveColor: 'bg-blue-500',
  },
  {
    id: 'dirty' as Diaper['type'],
    label: 'Suja',
    emoji: '💩',
    idle: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300',
    active: 'bg-amber-500 border-amber-500 text-white',
    saveColor: 'bg-amber-500',
  },
  {
    id: 'both' as Diaper['type'],
    label: 'Ambas',
    emoji: '🔄',
    idle: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300',
    active: 'bg-green-500 border-green-500 text-white',
    saveColor: 'bg-green-500',
  },
]

export function DiaperQuickButtons({ onSave, saving }: Props) {
  const [selected, setSelected] = useState<Diaper['type'] | null>(null)
  const [notes, setNotes] = useState('')

  const selectedDef = diaperTypes.find(d => d.id === selected)

  function handleSave() {
    if (!selected) return
    onSave(selected, notes || undefined)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {diaperTypes.map(t => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`flex flex-col items-center justify-center gap-2 min-h-[80px] rounded-2xl border-2 transition-colors ${
              selected === t.id ? t.active : t.idle
            }`}
          >
            <span className="text-3xl">{t.emoji}</span>
            <span className="text-sm font-semibold">{t.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observações (opcional)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white resize-none"
        />
      )}

      {selected && (
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 disabled:opacity-50 text-white rounded-2xl font-semibold text-base ${selectedDef?.saveColor ?? 'bg-amber-500'}`}
        >
          {saving ? 'Salvando…' : 'Registrar troca'}
        </button>
      )}
    </div>
  )
}
