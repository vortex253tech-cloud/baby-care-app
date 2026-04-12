---
plan: "03-core-trackers/08"
phase: 3
sequence: 8
title: "Dashboard — Real data integration + hunger alert"
status: pending
requires: ["03-core-trackers/03", "03-core-trackers/05", "03-core-trackers/07"]
---

# Plan 08: Dashboard — Real data integration + hunger alert

## Objective
Compor todos os dados dos trackers no dashboard: `lastFeed`, `sleepHoursToday`, `diapersToday` reais em `DailySummary`, e `NextReminders` com alerta de fome (quando última mamada há mais de 3 horas).

## Requirements Addressed
- Dashboard com dados reais de alimentação, sono e fraldas
- Alerta de fome no painel "Próximos lembretes"

## Tasks

<task id="8.1" type="code">
  <title>Hook useDashboardData</title>
  <description>
Criar `src/hooks/useDashboardData.ts`:

- Agrupa dados de alimentação, sono e fraldas do dia para o dashboard
- Executa 3 queries em paralelo via `Promise.all`
- Retorna dados formatados prontos para consumo pelo `DashboardPage`

```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Feeding, Sleep, Diaper } from '@/types'

export interface DashboardData {
  lastFeed: { minutesAgo: number } | null
  sleepHoursToday: number
  diapersToday: number
  hungerAlertMinutes: number | null   // null = no alert; number = minutes since last feed
}

export function useDashboardData(babyId: string) {
  const [data, setData] = useState<DashboardData>({
    lastFeed: null,
    sleepHoursToday: 0,
    diapersToday: 0,
    hungerAlertMinutes: null,
  })
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!babyId) { setLoading(false); return }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayIso = todayStart.toISOString()

    const [feedRes, sleepRes, diaperRes] = await Promise.all([
      // Most recent feeding (any time, not just today)
      supabase
        .from('feedings')
        .select('started_at')
        .eq('baby_id', babyId)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(),

      // Sleeps today
      supabase
        .from('sleeps')
        .select('started_at, ended_at')
        .eq('baby_id', babyId)
        .gte('started_at', todayIso),

      // Diapers today
      supabase
        .from('diapers')
        .select('id')
        .eq('baby_id', babyId)
        .gte('changed_at', todayIso),
    ])

    // Last feed
    const lastFeedRow = feedRes.data as Pick<Feeding, 'started_at'> | null
    let lastFeed: DashboardData['lastFeed'] = null
    let hungerAlertMinutes: number | null = null

    if (lastFeedRow) {
      const minutesAgo = Math.floor(
        (Date.now() - new Date(lastFeedRow.started_at).getTime()) / 60000
      )
      lastFeed = { minutesAgo }
      if (minutesAgo >= 180) hungerAlertMinutes = minutesAgo  // 3h threshold
    }

    // Sleep hours today
    const sleepRows = (sleepRes.data as Pick<Sleep, 'started_at' | 'ended_at'>[]) ?? []
    const totalSleepSeconds = sleepRows.reduce((acc, s) => {
      const end = s.ended_at ? new Date(s.ended_at).getTime() : Date.now()
      return acc + Math.max(0, (end - new Date(s.started_at).getTime()) / 1000)
    }, 0)
    const sleepHoursToday = totalSleepSeconds / 3600

    // Diapers today
    const diapersToday = (diaperRes.data ?? []).length

    setData({ lastFeed, sleepHoursToday, diapersToday, hungerAlertMinutes })
    setLoading(false)
  }, [babyId])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { data, loading, refetch: fetchAll }
}
```
  </description>
  <files>
    <file action="create">src/hooks/useDashboardData.ts</file>
  </files>
</task>

<task id="8.2" type="code">
  <title>Atualizar DailySummary para aceitar lastFeed.minutesAgo</title>
  <description>
Modificar `src/components/dashboard/DailySummary.tsx` para alinhar a prop `lastFeed` com o formato de `useDashboardData`:

O tipo de `lastFeed` muda de `{ minutesAgo: number } | null` (já estava assim na definição do Plan 06 do Fase 2, verificar):

```typescript
interface Props {
  lastFeed: { minutesAgo: number } | null
  sleepHoursToday: number | null
  diapersToday: number | null
}
```

Verificar que os valores null exibem "—" e valores reais exibem:
- `lastFeed`: `{minutesAgo}min atrás` (se < 60) ou `{Math.floor(minutesAgo/60)}h atrás`
- `sleepHoursToday`: `{sleepHoursToday.toFixed(1)}h hoje`
- `diapersToday`: `{diapersToday} hoje`
  </description>
  <files>
    <file action="modify">src/components/dashboard/DailySummary.tsx</file>
  </files>
</task>

<task id="8.3" type="code">
  <title>Atualizar NextReminders para mostrar alerta de fome</title>
  <description>
Modificar `src/components/dashboard/NextReminders.tsx`:

O tipo `reminders` muda de array genérico para:
```typescript
interface Reminder {
  id: string
  label: string
  urgency: 'high' | 'normal'
}

interface Props {
  reminders: Reminder[] | null
}
```

Item com `urgency: 'high'`: fundo vermelho/rosa claro, texto mais forte.
Item com `urgency: 'normal'`: fundo cinza/azul claro.

Estado vazio sem reminders: mantém bell emoji + "Sem lembretes no momento".
  </description>
  <files>
    <file action="modify">src/components/dashboard/NextReminders.tsx</file>
  </files>
</task>

<task id="8.4" type="code">
  <title>Atualizar DashboardPage para usar dados reais</title>
  <description>
Modificar `src/pages/DashboardPage.tsx`:

1. Importar `useDashboardData`
2. Instanciar `useDashboardData(activeBaby.id)`
3. Passar dados reais para `<DailySummary>` e `<NextReminders>`
4. Construir array de reminders a partir de `hungerAlertMinutes`:

```typescript
const { data: dashData, loading: dashLoading } = useDashboardData(activeBaby.id)

const reminders = dashData.hungerAlertMinutes !== null
  ? [{
      id: 'hunger',
      label: `Última mamada há ${Math.floor(dashData.hungerAlertMinutes / 60)}h ${dashData.hungerAlertMinutes % 60}min — hora de mamar?`,
      urgency: 'high' as const,
    }]
  : null

// Passe para os componentes:
<DailySummary
  lastFeed={dashData.lastFeed}
  sleepHoursToday={dashData.sleepHoursToday}
  diapersToday={dashData.diapersToday}
/>
<NextReminders reminders={reminders} />
```

Se `dashLoading` ainda carregando, manter `DailySummary` com null (exibe "—") e `NextReminders` com null — não bloquear a tela inteira.
  </description>
  <files>
    <file action="modify">src/pages/DashboardPage.tsx</file>
  </files>
</task>

## Verification
- [ ] Dashboard mostra "Xmin atrás" ou "Xh atrás" após registrar mamada
- [ ] Dashboard mostra horas de sono calculadas corretamente
- [ ] Dashboard mostra contagem real de fraldas do dia
- [ ] Após 3h sem mamada: alerta de fome aparece em `NextReminders` com urgency high
- [ ] Sem dados: cards mostram "—" e NextReminders mostra estado vazio
- [ ] `tsc --noEmit` exits 0
