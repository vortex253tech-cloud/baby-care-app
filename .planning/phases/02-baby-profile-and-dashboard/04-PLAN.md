---
plan: "02-baby-profile-and-dashboard/04"
phase: 2
sequence: 4
title: "Dashboard shell + age calculation + dark mode"
status: pending
requires: ["02-baby-profile-and-dashboard/02"]
---

# Plan 04: Dashboard shell + age calculation + dark mode

## Objective
Replace the `DashboardPage` stub with a real layout that shows the baby's name, age in months+days, and handles automatic dark mode based on system preference.

## Requirements Addressed
- DASH-03: Dashboard exibe idade do bebê em meses e dias
- DASH-05: Dashboard tem modo escuro automático (para uso na madrugada)

## Tasks

<task id="4.1" type="code">
  <title>Create useBabyAge hook</title>
  <description>
Create `src/hooks/useBabyAge.ts`:

```typescript
export interface BabyAge {
  totalDays: number
  months: number
  days: number         // remaining days after months
  label: string        // e.g. "3 meses e 5 dias" or "15 dias"
}

export function calculateBabyAge(birthDateStr: string): BabyAge {
  const birth = new Date(birthDateStr)
  const now = new Date()
  
  let months = (now.getFullYear() - birth.getFullYear()) * 12
    + (now.getMonth() - birth.getMonth())
  
  // Adjust if day-of-month hasn't arrived yet this month
  if (now.getDate() < birth.getDate()) months--
  if (months < 0) months = 0
  
  const monthStart = new Date(birth)
  monthStart.setMonth(monthStart.getMonth() + months)
  const days = Math.floor((now.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24))
  
  const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
  
  let label: string
  if (months === 0) {
    label = days === 1 ? '1 dia' : `${days} dias`
  } else if (days === 0) {
    label = months === 1 ? '1 mês' : `${months} meses`
  } else {
    const m = months === 1 ? '1 mês' : `${months} meses`
    const d = days === 1 ? '1 dia' : `${days} dias`
    label = `${m} e ${d}`
  }
  
  return { totalDays, months, days, label }
}

/**
 * Hook that returns the age and auto-updates once per day.
 */
export function useBabyAge(birthDateStr: string | undefined): BabyAge | null {
  // Returns null if no birth date provided
  if (!birthDateStr) return null
  return calculateBabyAge(birthDateStr)
}
```
  </description>
  <files>
    <file action="create">src/hooks/useBabyAge.ts</file>
  </files>
</task>

<task id="4.2" type="code">
  <title>Create useTheme hook + ThemeProvider</title>
  <description>
Create `src/hooks/useTheme.ts`:

```typescript
type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = 'mamaeapp_theme'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme) ?? 'system'
  )

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Listen for system preference changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (t: Theme) => {
    localStorage.setItem(THEME_KEY, t)
    setThemeState(t)
  }

  return { theme, setTheme }
}
```

Also call `applyTheme` once on app init in `src/main.tsx` BEFORE rendering (to prevent flash of wrong theme):
```typescript
// In main.tsx, before createRoot:
const stored = localStorage.getItem('mamaeapp_theme') ?? 'system'
if (stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}
```
  </description>
  <files>
    <file action="create">src/hooks/useTheme.ts</file>
    <file action="modify">src/main.tsx</file>
  </files>
</task>

<task id="4.3" type="code">
  <title>Create BabyHeader dashboard component</title>
  <description>
Create `src/components/dashboard/BabyHeader.tsx`:

Props:
```typescript
interface BabyHeaderProps {
  baby: Baby
}
```

Layout:
- Horizontal card: left = BabyAvatar (size lg), right = name (text-xl font-bold) + age label (text-sm text-gray-500)
- Pink subtle background card: `bg-pink-50 dark:bg-pink-950/20 rounded-2xl p-4`
- Example: "Luna 🌙 · 3 meses e 5 dias"

Uses `BabyAvatar` from Plan 03 and `calculateBabyAge` from Plan 04.
  </description>
  <files>
    <file action="create">src/components/dashboard/BabyHeader.tsx</file>
  </files>
</task>

<task id="4.4" type="code">
  <title>Replace DashboardPage stub with real layout</title>
  <description>
Replace `src/pages/DashboardPage.tsx` with a real layout:

```typescript
export function DashboardPage() {
  const { activeBaby, loading } = useBabies()

  if (loading) return <FullScreenSpinner />
  if (!activeBaby) return null  // ProtectedRoute handles redirect

  return (
    <div className="flex flex-col gap-4 pb-4">
      <BabyHeader baby={activeBaby} />
      {/* Plan 05: QuickActions placeholder */}
      <div id="quick-actions-placeholder" />
      {/* Plan 06: DailySummary placeholder */}
      <div id="daily-summary-placeholder" />
      {/* Plan 06: NextReminders placeholder */}
      <div id="next-reminders-placeholder" />
    </div>
  )
}
```

Use named export, not default.
  </description>
  <files>
    <file action="modify">src/pages/DashboardPage.tsx</file>
  </files>
</task>

## Verification
- [ ] `calculateBabyAge('2025-01-01')` returns correct months/days/label
- [ ] Dashboard shows BabyHeader with baby name and age
- [ ] Dark mode activates when system is in dark mode (on page load)
- [ ] `localStorage.setItem('mamaeapp_theme', 'dark')` + reload → dark mode active
- [ ] `tsc --noEmit` exits 0
