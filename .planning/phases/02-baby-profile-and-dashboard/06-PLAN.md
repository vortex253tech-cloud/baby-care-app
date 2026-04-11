---
plan: "02-baby-profile-and-dashboard/06"
phase: 2
sequence: 6
title: "Daily summary section + next reminders placeholder"
status: pending
requires: ["02-baby-profile-and-dashboard/05"]
---

# Plan 06: Daily summary section + next reminders placeholder

## Objective
Add the daily summary cards (última mamada, sono, fraldas) and a next reminders section to the dashboard, displaying "—" placeholders until Phase 3 trackers provide real data.

## Requirements Addressed
- DASH-01: Dashboard exibe resumo do dia: última mamada, horas de sono, trocas de fralda
- DASH-02: Dashboard exibe próximos lembretes ativos

## Tasks

<task id="6.1" type="code">
  <title>Create SummaryCard sub-component</title>
  <description>
Create `src/components/dashboard/SummaryCard.tsx`:

```typescript
interface SummaryCardProps {
  icon: string          // emoji
  label: string         // "Última mamada"
  value: string         // "14min atrás" or "—"
  subValue?: string     // "Peito esquerdo" or undefined
  color: string         // Tailwind color class for icon bg, e.g. 'bg-pink-100 text-pink-500'
}
```

Layout: horizontal card, icon circle (40px) on left, label+value on right.
- value in font-semibold text-gray-900 dark:text-white
- label in text-xs text-gray-500
- subValue in text-xs text-gray-400 (optional)
- Card: bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm

When value === "—": render value with text-gray-400 (de-emphasized).
  </description>
  <files>
    <file action="create">src/components/dashboard/SummaryCard.tsx</file>
  </files>
</task>

<task id="6.2" type="code">
  <title>Create DailySummary component</title>
  <description>
Create `src/components/dashboard/DailySummary.tsx`:

Props:
```typescript
interface DailySummaryProps {
  lastFeed?: { minutesAgo: number; side?: string } | null
  sleepHoursToday?: number | null
  diapersToday?: number | null
}
```

Renders 3 `SummaryCard` components:

1. Mamada: value = lastFeed ? `${lastFeed.minutesAgo}min atrás` : "—", subValue = lastFeed?.side
2. Sono: value = sleepHoursToday ? `${sleepHoursToday.toFixed(1)}h hoje` : "—"
3. Fraldas: value = diapersToday != null ? `${diapersToday} hoje` : "—"

Colors:
- Mamada: `bg-pink-100 text-pink-500`
- Sono: `bg-indigo-100 text-indigo-500`
- Fraldas: `bg-amber-100 text-amber-500`

Section title: "Hoje" above the cards.

For Phase 2, DashboardPage passes all nulls → all "—". Phase 3 will provide real data.
  </description>
  <files>
    <file action="create">src/components/dashboard/DailySummary.tsx</file>
  </files>
</task>

<task id="6.3" type="code">
  <title>Create NextReminders component (empty state)</title>
  <description>
Create `src/components/dashboard/NextReminders.tsx`:

Props:
```typescript
interface NextRemindersProps {
  reminders?: Array<{ id: string; label: string; time: string }> | null
}
```

- If no reminders (default for Phase 2): show empty state card
  - Bell icon (gray), text "Nenhum lembrete ativo", sub "Configure lembretes para receber alertas"
  - Small "Configurar" button (ghost variant, navigates to settings — stub for now)
- If reminders provided (Phase 4): render list of reminder pills

Section title: "Próximos lembretes" above.
  </description>
  <files>
    <file action="create">src/components/dashboard/NextReminders.tsx</file>
  </files>
</task>

<task id="6.4" type="code">
  <title>Integrate DailySummary + NextReminders into DashboardPage</title>
  <description>
In `src/pages/DashboardPage.tsx`, replace the placeholder divs with real components:

```tsx
<DailySummary
  lastFeed={null}
  sleepHoursToday={null}
  diapersToday={null}
/>
<NextReminders reminders={null} />
```

Import from `@/components/dashboard/DailySummary` and `@/components/dashboard/NextReminders`.
  </description>
  <files>
    <file action="modify">src/pages/DashboardPage.tsx</file>
  </files>
</task>

## Verification
- [ ] Dashboard shows 3 summary cards all displaying "—"
- [ ] NextReminders shows empty state with bell icon
- [ ] Cards look correct in both light and dark mode
- [ ] Section titles "Hoje" and "Próximos lembretes" are visible
- [ ] `tsc --noEmit` exits 0
