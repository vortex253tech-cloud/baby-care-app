// ─── Timeline Page — Unified activity feed ────────────────────────────────────
import { useState } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useTimeline, type TimelineEventType } from '@/hooks/useTimeline'
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner'

type FilterType = TimelineEventType | 'all'

const FILTERS: { id: FilterType; label: string; emoji: string }[] = [
  { id: 'all', label: 'Tudo', emoji: '📋' },
  { id: 'feeding', label: 'Mamadas', emoji: '🍼' },
  { id: 'sleep', label: 'Sono', emoji: '😴' },
  { id: 'diaper', label: 'Fraldas', emoji: '👶' },
]

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateHeader(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 86400000)
  if (d.toDateString() === today.toDateString()) return 'Hoje'
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })
}

const colorMap = {
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-600 dark:text-pink-400',
    dot: 'bg-pink-400',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    dot: 'bg-indigo-400',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-400',
  },
}

export default function TimelinePage() {
  const { activeBaby, loading: babyLoading } = useBabies()
  const { events, loading } = useTimeline(activeBaby?.id ?? '', 14)
  const [filter, setFilter] = useState<FilterType>('all')

  if (babyLoading) return <FullScreenSpinner />

  if (!activeBaby) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
        <p className="text-gray-400 text-sm">Nenhum bebê selecionado.</p>
      </div>
    )
  }

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter)

  // Group by day
  const groups: { date: string; events: typeof filtered }[] = []
  filtered.forEach(evt => {
    const day = evt.timestamp.slice(0, 10)
    const last = groups[groups.length - 1]
    if (last && last.date === day) {
      last.events.push(evt)
    } else {
      groups.push({ date: day, events: [evt] })
    }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Timeline</h1>
        <p className="text-xs text-gray-400 mt-0.5">Atividades de {activeBaby.name}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto py-3 px-4 -mx-0 no-scrollbar border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              filter === f.id
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}
          >
            <span>{f.emoji}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="px-4 py-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <span className="text-4xl mb-3">📋</span>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Nenhum registro nos últimos 14 dias
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Registre mamadas, sono e fraldas para ver aqui
          </p>
        </div>
      )}

      {/* Timeline groups */}
      {!loading && groups.map(group => (
        <div key={group.date}>
          {/* Day header */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 capitalize">
              {formatDateHeader(group.date + 'T12:00:00')}
            </p>
          </div>

          {/* Events for this day */}
          <div className="px-4 py-2 space-y-2">
            {group.events.map(evt => {
              const c = colorMap[evt.color as keyof typeof colorMap] ?? colorMap.pink
              return (
                <div key={evt.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-50 dark:border-gray-700 shadow-sm">
                  <div className={`w-10 h-10 rounded-2xl ${c.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                    {evt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{evt.label}</p>
                    {evt.sublabel && (
                      <p className={`text-xs ${c.text}`}>{evt.sublabel}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatTime(evt.timestamp)}</p>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
