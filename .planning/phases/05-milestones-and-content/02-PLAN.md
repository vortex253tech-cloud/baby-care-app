---
plan: "05-milestones-and-content/02"
phase: 5
sequence: 2
wave: 1
title: "Hook useMilestones + MilestonesPage: lista por faixa etária"
status: pending
requires: ["05-milestones-and-content/01"]
files_modified:
  - src/hooks/useMilestones.ts
  - src/pages/MilestonesPage.tsx
  - src/router.tsx
  - src/components/layout/BottomNav.tsx
---

# Plan 02: Hook useMilestones + MilestonesPage: lista por faixa etária

## Objective
Criar o hook `useMilestones` para CRUD de conquistas no banco, e a `MilestonesPage` com a listagem de marcos agrupados por faixa etária, destaque na faixa atual do bebê, e indicador de progresso por faixa. Adicionar rota `/milestones` e substituir o item "Alertas" no bottom nav por "Marcos" (mantendo Alertas acessível via dashboard/settings).

## Requirements Addressed
- MILE-01: Lista de marcos por faixa etária (7 faixas)
- MILE-03: Destaque visual quando bebê atinge nova faixa

## Tasks

<task id="2.1" type="code">
  <title>Hook useMilestones</title>
  <description>
Criar `src/hooks/useMilestones.ts`:

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { BabyMilestone } from '@/types'

export function useMilestones(babyId: string, userId: string) {
  const [milestones, setMilestones] = useState<BabyMilestone[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchMilestones() {
    if (!babyId) { setLoading(false); return }
    const { data } = await supabase
      .from('baby_milestones')
      .select('*')
      .eq('baby_id', babyId)
      .order('achieved_at', { ascending: true })
    setMilestones(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchMilestones() }, [babyId])

  async function achieve(
    milestoneId: string,
    achievedAt: string,         // 'YYYY-MM-DD'
    photoUrl?: string | null,
    notes?: string | null
  ): Promise<BabyMilestone | null> {
    const { data } = await supabase
      .from('baby_milestones')
      .upsert(
        { user_id: userId, baby_id: babyId, milestone_id: milestoneId, achieved_at: achievedAt, photo_url: photoUrl ?? null, notes: notes ?? null },
        { onConflict: 'baby_id,milestone_id' }
      )
      .select()
      .single()
    if (data) setMilestones((prev) => {
      const exists = prev.find((m) => m.milestone_id === milestoneId)
      return exists ? prev.map((m) => m.milestone_id === milestoneId ? data : m) : [...prev, data]
    })
    return data
  }

  async function unachieve(milestoneId: string): Promise<void> {
    await supabase
      .from('baby_milestones')
      .delete()
      .eq('baby_id', babyId)
      .eq('milestone_id', milestoneId)
    setMilestones((prev) => prev.filter((m) => m.milestone_id !== milestoneId))
  }

  function isAchieved(milestoneId: string): boolean {
    return milestones.some((m) => m.milestone_id === milestoneId)
  }

  function getAchievement(milestoneId: string): BabyMilestone | undefined {
    return milestones.find((m) => m.milestone_id === milestoneId)
  }

  return { milestones, loading, achieve, unachieve, isAchieved, getAchievement, refetch: fetchMilestones }
}
```
  </description>
  <files>
    <file action="create">src/hooks/useMilestones.ts</file>
  </files>
</task>

<task id="2.2" type="code">
  <title>MilestonesPage — lista por faixa</title>
  <description>
Criar `src/pages/MilestonesPage.tsx`:

```typescript
import { useState } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useAuthContext } from '@/contexts/AuthContext'
import { useMilestones } from '@/hooks/useMilestones'
import { useBabyAge } from '@/hooks/useBabyAge'
import {
  AGE_BANDS, AGE_BAND_LABELS, AGE_BAND_RANGES, MILESTONES, getAgeBand,
  type AgeBand, type MilestoneDefinition
} from '@/data/milestones'

export default function MilestonesPage() {
  const { activeBaby } = useBabies()
  const { user } = useAuthContext()
  const { milestones, loading, isAchieved } = useMilestones(activeBaby?.id ?? '', user?.id ?? '')
  const [selectedBand, setSelectedBand] = useState<AgeBand | null>(null)
  const [achieveTarget, setAchieveTarget] = useState<MilestoneDefinition | null>(null)

  if (!activeBaby) return (
    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Nenhum bebê selecionado.</div>
  )

  // Calculate current age band
  const birthDate = new Date(activeBaby.birth_date)
  const ageDays = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24))
  const currentBand = getAgeBand(ageDays)

  // Display all bands, but show current band expanded by default
  const activeBandDisplay = selectedBand ?? currentBand ?? '0-1m'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Marcos de Desenvolvimento</h1>
        <p className="text-xs text-gray-400 mt-0.5">{activeBaby.name}</p>
      </div>

      {/* Band selector tabs (horizontal scroll) */}
      <div className="overflow-x-auto px-4 py-3 flex gap-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        {AGE_BANDS.map((band) => {
          const bandMilestones = MILESTONES.filter((m) => m.age_band === band)
          const achievedCount = bandMilestones.filter((m) => isAchieved(m.id)).length
          const isCurrentBand = band === currentBand
          const isActive = band === activeBandDisplay

          return (
            <button
              key={band}
              onClick={() => setSelectedBand(band)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors relative ${
                isActive
                  ? 'bg-pink-500 text-white'
                  : isCurrentBand
                  ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {AGE_BAND_LABELS[band]}
              {achievedCount > 0 && (
                <span className={`ml-1.5 text-[10px] ${isActive ? 'opacity-80' : 'text-pink-500 dark:text-pink-400'}`}>
                  {achievedCount}/{bandMilestones.length}
                </span>
              )}
              {isCurrentBand && !isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Milestone list for active band */}
      <div className="px-4 py-4">
        {/* Band header */}
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {AGE_BAND_LABELS[activeBandDisplay]}
            {activeBandDisplay === currentBand && (
              <span className="ml-2 text-xs font-normal bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded-full">
                Fase atual
              </span>
            )}
          </h2>
          {/* Progress bar */}
          {(() => {
            const bandMs = MILESTONES.filter((m) => m.age_band === activeBandDisplay)
            const done = bandMs.filter((m) => isAchieved(m.id)).length
            const pct = bandMs.length > 0 ? Math.round((done / bandMs.length) * 100) : 0
            return (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{done}/{bandMs.length}</span>
              </div>
            )
          })()}
        </div>

        {/* Milestone cards */}
        {!loading && (
          <div className="space-y-2">
            {MILESTONES.filter((m) => m.age_band === activeBandDisplay).map((milestone) => {
              const achieved = isAchieved(milestone.id)
              return (
                <button
                  key={milestone.id}
                  onClick={() => setAchieveTarget(milestone)}
                  className={`w-full text-left rounded-2xl p-4 shadow-sm flex items-start gap-3 transition-colors ${
                    achieved
                      ? 'bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800'
                      : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{milestone.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${achieved ? 'text-pink-700 dark:text-pink-300' : 'text-gray-900 dark:text-white'}`}>
                        {milestone.title}
                      </p>
                      {achieved && <span className="text-pink-500 text-sm">✓</span>}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{milestone.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Achieve modal rendered conditionally — implemented in Plan 03 */}
      {achieveTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 pb-0">
          <div className="bg-white dark:bg-gray-800 w-full rounded-t-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {achieveTarget.icon} {achieveTarget.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{achieveTarget.description}</p>
            <button
              onClick={() => setAchieveTarget(null)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 py-3 text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```
  </description>
  <files>
    <file action="create">src/pages/MilestonesPage.tsx</file>
  </files>
</task>

<task id="2.3" type="code">
  <title>Rota /milestones + bottom nav "Marcos"</title>
  <description>
1. Adicionar a `src/router.tsx`:
```typescript
import MilestonesPage from '@/pages/MilestonesPage'
// Na lista de routes dentro de AppShell:
{ path: '/milestones', element: <MilestonesPage /> },
```

2. Atualizar `src/components/layout/BottomNav.tsx`:
- Substituir o item "Alertas" (`/notifications`) por "Marcos" (`/milestones`)
- Manter a rota /notifications acessível via ProfilePage ou dashboard card (Phase 9 reorganiza o nav)
- Adicionar `MilestoneIcon` e `MilestoneIconFilled` (SVG inline):

```typescript
// Substitui o navItem de Alertas:
{
  to: '/milestones',
  label: 'Marcos',
  icon: <MilestoneIcon />,
  activeIcon: <MilestoneIconFilled />,
},

// SVG icons (star/award style):
function MilestoneIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.040.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
}
function MilestoneIconFilled() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  )
}
```
  </description>
  <files>
    <file action="modify">src/router.tsx</file>
    <file action="modify">src/components/layout/BottomNav.tsx</file>
  </files>
</task>

## Verification
- [ ] Rota /milestones acessível via bottom nav (ícone de estrela)
- [ ] Faixas etárias exibidas como tabs horizontais com scroll
- [ ] Faixa atual do bebê em destaque (badge "Fase atual" + dot indicator)
- [ ] Barra de progresso mostra X/Y por faixa
- [ ] Clicar em marco abre sheet modal (implementação completa no Plan 03)
- [ ] tsc --noEmit exits 0

## must_haves
- getAgeBand() usado para determinar a faixa atual do bebê
- Bottom nav mantém 6 itens (Inicio, Feed, Sono, Fralda, Marcos, Perfil)
- /notifications continua acessível via rota direta (link no ProfilePage ou dashboard)
