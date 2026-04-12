import { useState } from 'react'
import type { Sleep } from '@/types'

function formatElapsed(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, '0')}min`
  }
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

interface Props {
  activeSleep: Sleep | null
  elapsed: number
  loading: boolean
  onStart: () => void
  onStop: (notes?: string) => void
  error: string | null
}

export function SleepTimerCard({ activeSleep, elapsed, loading, onStart, onStop, error }: Props) {
  const [notes, setNotes] = useState('')

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm text-center">
        <p className="text-gray-400">Verificando…</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
      <span className="text-5xl">{activeSleep ? '😴' : '😊'}</span>

      {activeSleep ? (
        <>
          <div className="text-center">
            <p className="text-sm text-indigo-500 font-medium">Dormindo há</p>
            <p className="text-4xl font-mono font-bold text-gray-900 dark:text-white mt-1">
              {formatElapsed(elapsed)}
            </p>
          </div>

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observações (opcional)"
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white resize-none"
          />

          <button
            onClick={() => onStop(notes || undefined)}
            className="w-full py-3 bg-red-500 text-white rounded-2xl font-semibold text-base"
          >
            Encerrar sono
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Bebê acordado</p>
          <button
            onClick={onStart}
            className="w-full py-3 bg-indigo-500 text-white rounded-2xl font-semibold text-base"
          >
            Registrar início do sono
          </button>
        </>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
