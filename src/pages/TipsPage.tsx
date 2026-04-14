import { useState, useMemo } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSavedTips } from '@/hooks/useSavedTips'
import {
  getTipsByAge,
  TIP_CATEGORIES,
  TIP_CATEGORY_LABELS,
  TIP_CATEGORY_ICONS,
  TIPS,
  type TipCategory,
  type Tip,
} from '@/data/tips'

export default function TipsPage() {
  const { activeBaby } = useBabies()
  const { user } = useAuthContext()
  const { savedTips, isSaved, toggleSave } = useSavedTips(
    activeBaby?.id ?? '',
    user?.id ?? ''
  )
  const [activeTab, setActiveTab] = useState<TipCategory | 'favoritos'>('desenvolvimento')

  if (!activeBaby) {
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Nenhum bebê selecionado.</div>
    )
  }

  const ageDays = Math.floor(
    (Date.now() - new Date(activeBaby.birth_date).getTime()) / (1000 * 60 * 60 * 24)
  )

  const ageMonths = Math.floor(ageDays / 30)
  const daysIntoCurrentMonth = ageDays % 30
  const showWelcomeArticle = ageMonths > 0 && daysIntoCurrentMonth <= 3

  const ageTips = useMemo(() => getTipsByAge(ageDays), [ageDays])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const favoriteTips = useMemo(() => TIPS.filter((t) => isSaved(t.id)), [savedTips])

  const displayedTips: Tip[] =
    activeTab === 'favoritos'
      ? favoriteTips
      : ageTips.filter((t) => t.category === activeTab)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Dicas para você</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {activeBaby.name} · {ageMonths} {ageMonths === 1 ? 'mês' : 'meses'} e {daysIntoCurrentMonth} dias
        </p>
      </div>

      {/* Welcome article banner */}
      {showWelcomeArticle && (
        <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-white shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0">🎉</span>
            <div>
              <p className="text-sm font-bold leading-tight">
                {activeBaby.name} completou {ageMonths} {ageMonths === 1 ? 'mês' : 'meses'}!
              </p>
              <p className="text-xs opacity-90 mt-1">
                Uma nova fase começa. As dicas abaixo foram selecionadas especialmente para essa etapa do desenvolvimento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="overflow-x-auto px-4 py-3 flex gap-2">
        {TIP_CATEGORIES.map((cat) => {
          const count = ageTips.filter((t) => t.category === cat).length
          const isActive = activeTab === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-pink-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span>{TIP_CATEGORY_ICONS[cat]}</span>
              {TIP_CATEGORY_LABELS[cat]}
              {count > 0 && (
                <span className={`text-[10px] ${isActive ? 'opacity-80' : 'text-pink-500 dark:text-pink-400'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}

        {/* Favoritos tab */}
        <button
          onClick={() => setActiveTab('favoritos')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeTab === 'favoritos'
              ? 'bg-pink-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <span>⭐</span>
          Favoritos
          {favoriteTips.length > 0 && (
            <span className={`text-[10px] ${activeTab === 'favoritos' ? 'opacity-80' : 'text-pink-500 dark:text-pink-400'}`}>
              {favoriteTips.length}
            </span>
          )}
        </button>
      </div>

      {/* Tips list */}
      <div className="px-4 pb-4 space-y-3">
        {displayedTips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3">
              {activeTab === 'favoritos' ? '⭐' : TIP_CATEGORY_ICONS[activeTab as TipCategory]}
            </span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {activeTab === 'favoritos'
                ? 'Nenhuma dica salva ainda'
                : 'Nenhuma dica para esta categoria agora'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'favoritos'
                ? 'Toque no ☆ de qualquer dica para salvar'
                : 'Novas dicas aparecem conforme o bebê cresce'}
            </p>
          </div>
        ) : (
          displayedTips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              saved={isSaved(tip.id)}
              onToggleSave={() => toggleSave(tip.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── TipCard ──────────────────────────────────────────────────────────────────

interface TipCardProps {
  tip: Tip
  saved: boolean
  onToggleSave: () => void
}

function TipCard({ tip, saved, onToggleSave }: TipCardProps) {
  const [expanded, setExpanded] = useState(false)

  function renderBody(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">{tip.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {tip.title}
            </p>
            {!expanded && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {tip.body.replace(/\*\*/g, '')}
              </p>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="pl-9">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {renderBody(tip.body)}
            </p>
          </div>
          <div className="flex justify-end mt-3 pl-9">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave() }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                saved
                  ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {saved ? '⭐ Salvo' : '☆ Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
