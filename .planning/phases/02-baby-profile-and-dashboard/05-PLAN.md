---
plan: "02-baby-profile-and-dashboard/05"
phase: 2
sequence: 5
title: "Quick action buttons on dashboard"
status: pending
requires: ["02-baby-profile-and-dashboard/04"]
---

# Plan 05: Quick action buttons on dashboard

## Objective
Add three large quick-action buttons to the dashboard for feeding, diaper, and sleep registration (navigating to their respective tracker pages), with a proper mobile touch-target size.

## Requirements Addressed
- DASH-04: Dashboard exibe botões de registro rápido (mamada, fralda, sono)

## Tasks

<task id="5.1" type="code">
  <title>Create QuickActions component</title>
  <description>
Create `src/components/dashboard/QuickActions.tsx`:

3 primary action cards in a horizontal grid (3 cols):

| Action | Emoji | Color | Route |
|--------|-------|-------|-------|
| Mamada | 🍼 | pink-500 | /feed |
| Fralda | 💧 | amber-500 | /diaper |
| Sono | 😴 | indigo-500 | /sleep |

Each card:
- Minimum 80×80px touch area (WCAG 2.5.5)
- Colored icon background (light opacity circle)
- Emoji + label below
- Active state: scale-95 on press
- `useNavigate` to route on click
- Rounded-2xl, soft shadow, bg-white dark:bg-gray-800

```tsx
const ACTIONS = [
  { label: 'Mamada', emoji: '🍼', color: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30', route: '/feed' },
  { label: 'Fralda', emoji: '💧', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30', route: '/diaper' },
  { label: 'Sono',   emoji: '😴', color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30', route: '/sleep' },
]
```

Section title: "Registrar" in small gray uppercase label above the grid.
  </description>
  <files>
    <file action="create">src/components/dashboard/QuickActions.tsx</file>
  </files>
</task>

<task id="5.2" type="code">
  <title>Integrate QuickActions into DashboardPage</title>
  <description>
In `src/pages/DashboardPage.tsx`, replace the `id="quick-actions-placeholder"` div with `<QuickActions />`.

Import QuickActions from `@/components/dashboard/QuickActions`.
  </description>
  <files>
    <file action="modify">src/pages/DashboardPage.tsx</file>
  </files>
</task>

<task id="5.3" type="code">
  <title>Update tracker page stubs with minimal content</title>
  <description>
Update `src/pages/FeedPage.tsx`, `src/pages/SleepPage.tsx`, `src/pages/DiaperPage.tsx` with a simple stub that at least shows the page name and a "← Voltar" link, so navigation from QuickActions feels intentional:

```tsx
export function FeedPage() {
  return (
    <div className="py-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">🍼 Alimentação</h2>
      <p className="text-sm text-gray-500 mt-2">Registro de mamadas — disponível na Fase 3.</p>
    </div>
  )
}
```

Similar for SleepPage (😴 Sono) and DiaperPage (💧 Fralda).
  </description>
  <files>
    <file action="modify">src/pages/FeedPage.tsx</file>
    <file action="modify">src/pages/SleepPage.tsx</file>
    <file action="modify">src/pages/DiaperPage.tsx</file>
  </files>
</task>

## Verification
- [ ] Dashboard shows 3 quick action buttons: Mamada, Fralda, Sono
- [ ] Tapping each button navigates to the correct route (/feed, /diaper, /sleep)
- [ ] Each button has touch area >= 80×80px
- [ ] Buttons look good in both light and dark mode
- [ ] `tsc --noEmit` exits 0
