---
plan: "03-core-trackers/05"
phase: 3
sequence: 5
title: "SleepPage — Sleep history + dashboard sleep hours"
status: pending
requires: ["03-core-trackers/04"]
---

# Plan 05: SleepPage — Sleep history + dashboard sleep hours

## Objective
Adicionar histórico de sono do dia em `SleepPage` e calcular `sleepHoursToday` para alimentar o `DailySummary` do dashboard.

## Requirements Addressed
- SLEEP-04 (listar registros de sono do dia)
- Dashboard card de sono com horas reais

## Tasks

<task id="5.1" type="code">
  <title>Hook useSleepList</title>
  <description>
Criar `src/hooks/useSleepList.ts`:

- Busca sleeps do bebê do dia atual (`started_at >= hoje 00:00`)
- Inclui sono ativo (ended_at IS NULL)
- Calcula `sleepHoursToday`: soma de `(ended_at - started_at)` para solos encerrados; sono ativo conta até `now()`
- Expõe: `sleeps: Sleep[]`, `loading: boolean`, `sleepHoursToday: number`, `refetch()`

```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Sleep } from '@/types'

export function useSleepList(babyId: string) {
  const [sleeps, setSleeps] = useState<Sleep[]>([])
  const [loading, setLoading] = useState(true)
  const [sleepHoursToday, setSleepHoursToday] = useState(0)

  const fetchSleeps = useCallback(async () => {
    if (!babyId) { setLoading(false); return }
    setLoading(true)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('sleeps')
      .select('*')
      .eq('baby_id', babyId)
      .gte('started_at', todayStart.toISOString())
      .order('started_at', { ascending: false })
    const rows = (data as Sleep[]) ?? []
    setSleeps(rows)

    // Calculate total sleep hours
    const totalSeconds = rows.reduce((acc, s) => {
      const start = new Date(s.started_at).getTime()
      const end = s.ended_at ? new Date(s.ended_at).getTime() : Date.now()
      return acc + Math.max(0, (end - start) / 1000)
    }, 0)
    setSleepHoursToday(totalSeconds / 3600)
    setLoading(false)
  }, [babyId])

  useEffect(() => { fetchSleeps() }, [fetchSleeps])

  return { sleeps, loading, sleepHoursToday, refetch: fetchSleeps }
}
```
  </description>
  <files>
    <file action="create">src/hooks/useSleepList.ts</file>
  </files>
</task>

<task id="5.2" type="code">
  <title>SleepList component</title>
  <description>
Criar `src/components/sleep/SleepList.tsx`:

- Recebe `sleeps: Sleep[]`, `loading: boolean`, `onDelete: (id: string) => void`
- Item: ícone 😴 + hora de início + duração (ou "Ativo" se ended_at null) + lixeira
- Duração: `Math.round((end - start) / 60000)` minutos → formata como "Xh Ymin" ou "Ymin"
- Sono ativo: badge "Ativo" em indigo, sem lixeira

```typescript
import type { Sleep } from '@/types'

interface Props {
  sleeps: Sleep[]
  loading: boolean
  onDelete: (id: string) => void
}

function formatDuration(start: string, end: string | null): string {
  const endMs = end ? new Date(end).getTime() : Date.now()
  const totalMin = Math.round((endMs - new Date(start).getTime()) / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export function SleepList({ sleeps, loading, onDelete }: Props) {
  if (loading) return <p className="text-sm text-gray-400 text-center py-2">Carregando…</p>
  if (sleeps.length === 0) return <p className="text-sm text-gray-400 text-center py-2">Nenhum sono registrado hoje</p>

  return (
    <ul className="flex flex-col gap-2">
      {sleeps.map(s => (
        <li key={s.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
          <span className="text-xl">😴</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDuration(s.started_at, s.ended_at)}
              </p>
              {!s.ended_at && (
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  Ativo
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {new Date(s.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              {s.ended_at && ` — ${new Date(s.ended_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
          {s.ended_at && (
            <button
              onClick={() => {
                if (window.confirm('Excluir este registro?')) onDelete(s.id)
              }}
              className="text-red-400 hover:text-red-600 text-lg leading-none"
              aria-label="Excluir"
            >
              🗑
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/sleep/SleepList.tsx</file>
  </files>
</task>

<task id="5.3" type="code">
  <title>Atualizar SleepPage para incluir SleepList</title>
  <description>
Modificar `src/pages/SleepPage.tsx`:

1. Importar `useSleepList` e `SleepList`
2. Substituir placeholder por `<SleepList>`
3. Seção "Hoje" com título + SleepList abaixo do SleepTimerCard
4. Ao encerrar sono, chamar `refetch()` do `useSleepList`
5. `deleteFeeding(id)` via `supabase.from('sleeps').delete().eq('id', id)` + refetch

Estrutura final da página:
```
<div gap-4>
  <h2>Sono</h2>
  <SleepTimerCard />
  <h3>Hoje</h3>
  <SleepList sleeps={sleeps} loading={loading} onDelete={handleDelete} />
  <Snackbar />
</div>
```

Para `handleDelete`:
```typescript
async function handleDelete(id: string) {
  await supabase.from('sleeps').delete().eq('id', id)
  refetch()
}
```
  </description>
  <files>
    <file action="modify">src/pages/SleepPage.tsx</file>
  </files>
</task>

<task id="5.4" type="code">
  <title>Hook useDashboardSleep — expor sleepHoursToday para o dashboard</title>
  <description>
Não é necessário um hook separado para o dashboard neste plan — `useSleepList` já expõe `sleepHoursToday`. O plano 08 vai compor todos os dados do dashboard.

Por ora, exportar `useSleepList` de `src/hooks/index.ts` (se existir) ou garantir que está acessível via import direto.

Não criar novo arquivo — apenas verificar que `useSleepList.ts` está correto e exportado.
  </description>
  <files>
    <file action="modify">src/hooks/useSleepList.ts</file>
  </files>
</task>

## Verification
- [ ] Histórico de sono do dia aparece em `SleepPage` abaixo do timer
- [ ] Sono ativo mostra badge "Ativo", sem botão de exclusão
- [ ] Deletar sono encerrado remove da lista
- [ ] `sleepHoursToday` calculado corretamente (solos encerrados + sono ativo)
- [ ] `tsc --noEmit` exits 0
