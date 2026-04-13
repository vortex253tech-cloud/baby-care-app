---
plan: "04-notifications-and-reminders/06"
phase: 4
sequence: 6
title: "Dashboard: próximos lembretes com hora prevista"
status: pending
requires: ["04-notifications-and-reminders/05"]
---

# Plan 06: Dashboard: próximos lembretes com hora prevista

## Objective
Atualizar o dashboard para exibir os próximos lembretes ativos com a hora prevista real (vinda do campo `next_fire_at`). Substituir o componente `NextReminders` mock por dados reais do Supabase. Adicionar `upcomingReminders` ao hook `useDashboardData`.

## Requirements Addressed
- DASH-02: Dashboard exibe próximos lembretes ativos

## Tasks

<task id="6.1" type="code">
  <title>Adicionar upcomingReminders ao useDashboardData</title>
  <description>
Atualizar `src/hooks/useDashboardData.ts` para incluir próximos lembretes:

```typescript
import type { Reminder } from '@/types'

export interface DashboardData {
  lastFeed: { minutesAgo: number } | null
  sleepHoursToday: number
  diapersToday: number
  hungerAlertMinutes: number | null
  upcomingReminders: Array<{
    id: string
    label: string
    fireAt: string          // ISO string
    urgency: 'high' | 'normal'
  }>
}

export function useDashboardData(babyId: string) {
  // ... existing Promise.all for feeds/sleeps/diapers ...
  // Add 4th query: upcoming reminders (next 24h, enabled=true)
  //
  // const { data: reminderRows } = await supabase
  //   .from('reminders')
  //   .select('id, label, next_fire_at, type')
  //   .eq('baby_id', babyId)
  //   .eq('enabled', true)
  //   .not('next_fire_at', 'is', null)
  //   .gte('next_fire_at', new Date().toISOString())
  //   .lte('next_fire_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
  //   .order('next_fire_at', { ascending: true })
  //   .limit(5)
  //
  // Map to upcomingReminders:
  //   urgency: 'high' if next_fire_at <= now + 30min, else 'normal'
  //   label: row.label
  //   fireAt: row.next_fire_at
}
```

Reescrever `useDashboardData` completo com o quarto query no `Promise.all`.
  </description>
  <files>
    <file action="modify">src/hooks/useDashboardData.ts</file>
  </files>
</task>

<task id="6.2" type="code">
  <title>Atualizar NextReminders para usar fireAt</title>
  <description>
Atualizar `src/components/dashboard/NextReminders.tsx`:

```typescript
interface Reminder {
  id: string
  label: string
  urgency: 'high' | 'normal'
  fireAt: string   // ISO string
}

// Add helper:
function formatFireAt(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// In the list item, show time:
// <span className="text-xs text-gray-400">{formatFireAt(r.fireAt)}</span>
// next to the label.
```

Cada item do lembrete no dashboard deve exibir:
- ícone (🔴 para high, 🔔 para normal)
- label
- hora prevista formatada em HH:MM
- fundo vermelho-claro para urgência high
  </description>
  <files>
    <file action="modify">src/components/dashboard/NextReminders.tsx</file>
  </files>
</task>

<task id="6.3" type="code">
  <title>DashboardPage — passar upcomingReminders</title>
  <description>
Atualizar `src/pages/DashboardPage.tsx`:

```typescript
// Replace the manual reminders array construction with:
const reminders = dashData?.upcomingReminders?.length
  ? dashData.upcomingReminders
  : null

// Pass to NextReminders:
<NextReminders reminders={reminders} />
```

Remover a lógica manual de construção de `reminders` que só continha o hungerAlert. O `hungerAlert` agora é tratado apenas pelo `DailySummary` (o painel visual já existe). Os lembretes reais do scheduler aparecem em `upcomingReminders`.

**ATENÇÃO:** Manter o `hungerAlertMinutes` em `DailySummary` — ele é um alerta visual inline no card, diferente dos lembretes push. Apenas remover a construção manual do array `reminders` para o `NextReminders`.
  </description>
  <files>
    <file action="modify">src/pages/DashboardPage.tsx</file>
  </files>
</task>

<task id="6.4" type="docs">
  <title>08-SUMMARY.md da Phase 4</title>
  <description>
Criar `.planning/phases/04-notifications-and-reminders/06-SUMMARY.md` após execução confirmada (este step será preenchido na execução).
  </description>
  <files>
    <file action="create">.planning/phases/04-notifications-and-reminders/06-SUMMARY.md</file>
  </files>
</task>

<task id="6.5" type="docs">
  <title>Atualizar STATE.md</title>
  <description>
Atualizar `.planning/STATE.md`:
- Phase 4 status: ✅ Complete
- Plans Done: 6/6
- Progress: 100%
- Total: 27/67 plans complete
- Adicionar ao Phase Completion Log: "Phase 4 — 2026-04-12: Push subscriptions, reminders schema, feeding/medication/vaccine reminder UIs, silence window, dashboard com lembretes reais"
  </description>
  <files>
    <file action="modify">.planning/STATE.md</file>
  </files>
</task>

## Verification
- [ ] Dashboard exibe próximos lembretes com hora (HH:MM)
- [ ] Lembretes high urgency (≤30min) têm fundo vermelho
- [ ] upcomingReminders limitado a 5 itens nas próximas 24h
- [ ] tsc --noEmit exits 0
- [ ] STATE.md atualizado para 27/67 plans
