import type { BabyMilestone } from '@/types'
import type { MilestoneDefinition, AgeBand } from '@/data/milestones'
import { AGE_BAND_LABELS } from '@/data/milestones'

interface Props {
  achievements: BabyMilestone[]
  milestoneMap: Record<string, MilestoneDefinition>
  filterBand: AgeBand | 'all'
  onFilterChange: (band: AgeBand | 'all') => void
  onCardClick: (milestoneId: string) => void
}

export function MilestoneTimeline({
  achievements,
  milestoneMap,
  filterBand,
  onFilterChange,
  onCardClick,
}: Props) {
  // Sort by achieved_at ascending (oldest first = top of timeline)
  const sorted = [...achievements]
    .filter((a) => filterBand === 'all' || milestoneMap[a.milestone_id]?.age_band === filterBand)
    .sort((a, b) => a.achieved_at.localeCompare(b.achieved_at))

  if (sorted.length === 0) {
    return (
      <>
        <FilterChips filterBand={filterBand} onFilterChange={onFilterChange} />
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <span className="text-5xl mb-4">🌱</span>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nenhum marco conquistado ainda
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {filterBand === 'all'
              ? 'Registre o primeiro marco na aba Lista!'
              : `Nenhum marco de ${AGE_BAND_LABELS[filterBand]} registrado.`}
          </p>
        </div>
      </>
    )
  }

  // Group by month-year of achieved_at
  const groups: { label: string; items: BabyMilestone[] }[] = []
  let currentLabel = ''
  for (const a of sorted) {
    const [year, month] = a.achieved_at.split('-')
    const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })
    if (label !== currentLabel) {
      groups.push({ label, items: [] })
      currentLabel = label
    }
    groups[groups.length - 1].items.push(a)
  }

  return (
    <div className="px-4 py-4">
      <FilterChips filterBand={filterBand} onFilterChange={onFilterChange} />

      {/* Timeline groups */}
      {groups.map((group) => (
        <div key={group.label} className="mb-6">
          {/* Month label */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 capitalize">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {group.items.map((achievement) => {
              const def = milestoneMap[achievement.milestone_id]
              if (!def) return null
              return (
                <button
                  key={achievement.id}
                  onClick={() => onCardClick(achievement.milestone_id)}
                  className="w-full text-left bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden flex items-stretch border border-pink-100 dark:border-pink-900/30"
                >
                  {/* Photo thumbnail or icon fallback */}
                  <div className="w-20 flex-shrink-0 bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
                    {achievement.photo_url ? (
                      <img
                        src={achievement.photo_url}
                        alt={def.title}
                        className="w-20 h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">{def.icon}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-3 min-w-0">
                    <p className="text-sm font-semibold text-pink-700 dark:text-pink-300 truncate">
                      {def.title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">
                      {def.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-pink-400 text-xs">✓</span>
                      <span className="text-xs text-gray-400">
                        {new Date(achievement.achieved_at + 'T12:00:00').toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {achievement.notes && (
                        <span className="text-xs text-gray-400 ml-1 truncate">· {achievement.notes}</span>
                      )}
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center pr-3 text-gray-300 dark:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── FilterChips ──────────────────────────────────────────────────────────────

interface FilterChipsProps {
  filterBand: AgeBand | 'all'
  onFilterChange: (band: AgeBand | 'all') => void
}

function FilterChips({ filterBand, onFilterChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
      <button
        onClick={() => onFilterChange('all')}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          filterBand === 'all'
            ? 'bg-pink-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}
      >
        Todos
      </button>
      {(Object.keys(AGE_BAND_LABELS) as AgeBand[]).map((band) => (
        <button
          key={band}
          onClick={() => onFilterChange(band)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filterBand === band
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          {AGE_BAND_LABELS[band]}
        </button>
      ))}
    </div>
  )
}
