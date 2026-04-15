// ─── Guia da Mamãe — Educational content hub ─────────────────────────────────
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GUIDE_ARTICLES,
  GUIDE_CATEGORIES,
  type GuideCategory,
  type GuideArticle,
} from '@/data/guides'

function useViewedGuides() {
  const key = 'mamaeapp_viewed_guides'
  const getViewed = (): string[] => {
    try { return JSON.parse(localStorage.getItem(key) ?? '[]') } catch { return [] }
  }
  const markViewed = (slug: string) => {
    const v = new Set(getViewed()); v.add(slug)
    localStorage.setItem(key, JSON.stringify(Array.from(v)))
  }
  return { viewed: new Set(getViewed()), markViewed }
}

export default function GuidePage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory | 'all'>('all')
  const { viewed, markViewed } = useViewedGuides()

  const filtered = selectedCategory === 'all'
    ? GUIDE_ARTICLES
    : GUIDE_ARTICLES.filter(g => g.category === selectedCategory)

  const emergencyGuides = GUIDE_ARTICLES.filter(g => g.isEmergency)

  const handleOpen = (guide: GuideArticle) => {
    markViewed(guide.slug)
    navigate(`/guide/${guide.slug}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Guia da Mamãe</h1>
        <p className="text-xs text-gray-400 mt-0.5">Conteúdo educativo para o dia a dia</p>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Emergency quick-access */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Acesso rápido — Emergências
          </p>
          <div className="flex gap-2">
            {emergencyGuides.map(guide => (
              <button
                key={guide.slug}
                onClick={() => handleOpen(guide)}
                className="flex-1 flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 active:scale-95 transition-transform"
              >
                <span className="text-2xl">{guide.emoji}</span>
                <span className="text-xs font-semibold text-red-700 dark:text-red-400 text-center leading-tight">
                  {guide.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          <CategoryChip
            label="Todos"
            emoji="📚"
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          />
          {GUIDE_CATEGORIES.map(cat => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              emoji={cat.emoji}
              active={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            />
          ))}
        </div>

        {/* Articles grid */}
        <div className="space-y-3">
          {filtered.map(guide => {
            const isViewed = viewed.has(guide.slug)
            return (
              <button
                key={guide.slug}
                onClick={() => handleOpen(guide)}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 active:scale-[0.98] transition-transform shadow-sm"
              >
                <span className="text-3xl flex-shrink-0">{guide.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {guide.title}
                    </p>
                    {guide.isEmergency && (
                      <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full">
                        EMERGÊNCIA
                      </span>
                    )}
                    {isViewed && (
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full">
                        ✓ Visto
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{guide.subtitle}</p>
                  <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-1">
                    {guide.readMinutes} min de leitura
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CategoryChip({
  label, emoji, active, onClick,
}: {
  label: string; emoji: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
        active
          ? 'bg-pink-500 text-white'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
      }`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  )
}
