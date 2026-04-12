---
plan: "03-core-trackers/07"
phase: 3
sequence: 7
title: "DiaperPage — Diaper history + dashboard diaper count"
status: pending
requires: ["03-core-trackers/06"]
---

# Plan 07: DiaperPage — Diaper history + dashboard diaper count

## Objective
Adicionar histórico de fraldas do dia em `DiaperPage` e expor `diapersToday` para alimentar o `DailySummary` do dashboard.

## Requirements Addressed
- DIAP-04 (listar trocas do dia)
- Dashboard card de fraldas com contagem real

## Tasks

<task id="7.1" type="code">
  <title>Hook useDiaperList</title>
  <description>
Criar `src/hooks/useDiaperList.ts`:

- Busca diapers do bebê do dia atual (`changed_at >= hoje 00:00`)
- Calcula `diapersToday`: `data.length`
- Expõe: `diapers: Diaper[]`, `loading: boolean`, `diapersToday: number`, `refetch()`, `deleteDiaper(id)`

```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Diaper } from '@/types'

export function useDiaperList(babyId: string) {
  const [diapers, setDiapers] = useState<Diaper[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDiapers = useCallback(async () => {
    if (!babyId) { setLoading(false); return }
    setLoading(true)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('diapers')
      .select('*')
      .eq('baby_id', babyId)
      .gte('changed_at', todayStart.toISOString())
      .order('changed_at', { ascending: false })
    setDiapers((data as Diaper[]) ?? [])
    setLoading(false)
  }, [babyId])

  useEffect(() => { fetchDiapers() }, [fetchDiapers])

  async function deleteDiaper(id: string) {
    await supabase.from('diapers').delete().eq('id', id)
    setDiapers(prev => prev.filter(d => d.id !== id))
  }

  return {
    diapers,
    loading,
    diapersToday: diapers.length,
    refetch: fetchDiapers,
    deleteDiaper,
  }
}
```
  </description>
  <files>
    <file action="create">src/hooks/useDiaperList.ts</file>
  </files>
</task>

<task id="7.2" type="code">
  <title>DiaperList component</title>
  <description>
Criar `src/components/diaper/DiaperList.tsx`:

- Recebe `diapers: Diaper[]`, `loading: boolean`, `onDelete: (id: string) => void`
- Item: emoji por tipo (💧 molhada, 💩 suja, 🔄 ambas) + hora da troca + lixeira
- Vazio: "Nenhuma troca hoje"

```typescript
import type { Diaper } from '@/types'

interface Props {
  diapers: Diaper[]
  loading: boolean
  onDelete: (id: string) => void
}

function diaperEmoji(type: Diaper['type']) {
  return type === 'wet' ? '💧' : type === 'dirty' ? '💩' : '🔄'
}

function diaperLabel(type: Diaper['type']) {
  return type === 'wet' ? 'Molhada' : type === 'dirty' ? 'Suja' : 'Molhada + Suja'
}

export function DiaperList({ diapers, loading, onDelete }: Props) {
  if (loading) return <p className="text-sm text-gray-400 text-center py-2">Carregando…</p>
  if (diapers.length === 0) return <p className="text-sm text-gray-400 text-center py-2">Nenhuma troca hoje</p>

  return (
    <ul className="flex flex-col gap-2">
      {diapers.map(d => (
        <li key={d.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
          <span className="text-xl">{diaperEmoji(d.type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {diaperLabel(d.type)}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(d.changed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Excluir este registro?')) onDelete(d.id)
            }}
            className="text-red-400 hover:text-red-600 text-lg leading-none"
            aria-label="Excluir"
          >
            🗑
          </button>
        </li>
      ))}
    </ul>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/diaper/DiaperList.tsx</file>
  </files>
</task>

<task id="7.3" type="code">
  <title>Atualizar DiaperPage para incluir DiaperList</title>
  <description>
Modificar `src/pages/DiaperPage.tsx`:

1. Importar `useDiaperList`, `DiaperList`
2. Instanciar `useDiaperList(activeBaby.id)`
3. Substituir placeholder por seção "Hoje" + `<DiaperList>`
4. Após salvar, chamar `refetch()`

Estrutura final:
```
<div gap-4>
  <h2>Fraldas</h2>
  <DiaperQuickButtons />
  <h3 className="text-sm font-semibold...">Hoje ({diapersToday})</h3>
  <DiaperList />
  <Snackbar />
</div>
```
  </description>
  <files>
    <file action="modify">src/pages/DiaperPage.tsx</file>
  </files>
</task>

## Verification
- [ ] Histórico do dia aparece em `DiaperPage` com emoji, label e hora
- [ ] Deletar item remove da lista sem reload
- [ ] Contador "Hoje (N)" no header da seção reflete número correto
- [ ] `diapersToday` é acessível via `useDiaperList` para o Plan 08
- [ ] `tsc --noEmit` exits 0
