---
plan: "05-milestones-and-content/04"
phase: 5
sequence: 4
wave: 2
title: "Timeline visual de marcos conquistados"
status: pending
requires: ["05-milestones-and-content/03"]
files_modified:
  - src/pages/MilestonesPage.tsx
  - src/components/milestones/MilestoneTimeline.tsx
---

# Plan 04: Timeline visual de marcos conquistados

## Objective
Criar a aba/view de Timeline dentro da MilestonesPage que exibe todos os marcos conquistados em ordem cronológica, com miniatura de foto quando disponível, data formatada, filtro por faixa etária, e estado vazio encorajador quando não há conquistas.

## Requirements Addressed
- MILE-05: Timeline visual de todos os marcos conquistados

## Tasks

<task id="4.1" type="code">
  <title>MilestoneTimeline — componente de view cronológica</title>
  <description>
Criar `src/components/milestones/MilestoneTimeline.tsx`:

```typescript
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
      {/* Filter chips */}
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
```
  </description>
  <files>
    <file action="create">src/components/milestones/MilestoneTimeline.tsx</file>
  </files>
</task>

<task id="4.2" type="code">
  <title>MilestonesPage — adicionar aba Timeline</title>
  <description>
Atualizar `src/pages/MilestonesPage.tsx` para suportar duas views: "Lista" e "Timeline".

1. Adicionar estado de view e filtro de faixa para a timeline:
```typescript
import { MilestoneTimeline } from '@/components/milestones/MilestoneTimeline'
import type { AgeBand } from '@/data/milestones'

// Estado adicional no componente:
const [view, setView] = useState<'list' | 'timeline'>('list')
const [timelineFilter, setTimelineFilter] = useState<AgeBand | 'all'>('all')
```

2. Construir milestoneMap para o componente de timeline:
```typescript
const milestoneMap = useMemo(
  () => Object.fromEntries(MILESTONES.map((m) => [m.id, m])),
  []
)
```

3. Substituir o header atual por header com toggle de view:
```typescript
{/* Header */}
<div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-lg font-bold text-gray-900 dark:text-white">Marcos de Desenvolvimento</h1>
      <p className="text-xs text-gray-400 mt-0.5">{activeBaby.name}</p>
    </div>
    {/* View toggle */}
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
      <button
        onClick={() => setView('list')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          view === 'list'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        Lista
      </button>
      <button
        onClick={() => setView('timeline')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          view === 'timeline'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        Timeline
        {milestones.length > 0 && (
          <span className="ml-1 bg-pink-500 text-white rounded-full text-[10px] px-1.5 py-0.5">
            {milestones.length}
          </span>
        )}
      </button>
    </div>
  </div>
</div>
```

4. Renderizar condicionalmente o conteúdo baseado na view ativa.
   - view === 'list' → renderizar as band tabs + milestone cards existentes
   - view === 'timeline' → renderizar `<MilestoneTimeline />`

```typescript
{view === 'timeline' ? (
  <MilestoneTimeline
    achievements={milestones}
    milestoneMap={milestoneMap}
    filterBand={timelineFilter}
    onFilterChange={setTimelineFilter}
    onCardClick={(milestoneId) => {
      const def = MILESTONES.find((m) => m.id === milestoneId)
      if (def) setAchieveTarget(def)
    }}
  />
) : (
  <>
    {/* Band selector tabs */}
    {/* ... existing band tabs code ... */}

    {/* Milestone list */}
    {/* ... existing milestone cards code ... */}
  </>
)}
```

5. Adicionar `import { useMemo } from 'react'` no topo.
  </description>
  <files>
    <file action="modify">src/pages/MilestonesPage.tsx</file>
  </files>
</task>

## Verification
- [ ] Aba "Lista" / "Timeline" visível no header da MilestonesPage
- [ ] Timeline vazia exibe estado encorajador (🌱) quando não há conquistas
- [ ] Conquistas aparecem agrupadas por mês em ordem cronológica
- [ ] Cards com foto exibem thumbnail; sem foto exibem emoji do marco
- [ ] Clicar num card da timeline abre o AchieveModal (editar/remover)
- [ ] Filtro por faixa etária funciona na timeline
- [ ] Badge com total de conquistas aparece no botão "Timeline"
- [ ] tsc --noEmit exits 0

## must_haves
- Data exibida com `achieved_at + 'T12:00:00'` para evitar bug de fuso horário ao formatar
- Agrupamento por mês usa `toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })` — capitalizado visualmente
- milestoneMap construído com `useMemo` para evitar re-criação em cada render
