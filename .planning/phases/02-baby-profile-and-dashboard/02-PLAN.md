---
plan: "02-baby-profile-and-dashboard/02"
phase: 2
sequence: 2
title: "Baby onboarding screen + useBabies hook"
status: pending
requires: ["02-baby-profile-and-dashboard/01"]
---

# Plan 02: Baby onboarding screen + useBabies hook

## Objective
Create the post-registration baby profile wizard, a `useBabies` hook, and a gate in `ProtectedRoute` that redirects new users to `/onboarding/baby` before they see the dashboard.

## Requirements Addressed
- BABY-01: Usuária pode cadastrar um bebê com nome, data de nascimento e sexo
- BABY-05: Switcher infrastructure (hook stores active baby id)

## Tasks

<task id="2.1" type="code">
  <title>Create useBabies hook</title>
  <description>
Create `src/hooks/useBabies.ts`:

```typescript
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Baby } from '@/types'

const ACTIVE_BABY_KEY = 'mamaeapp_active_baby_id'

export function useBabies() {
  const { user } = useAuth()
  const [babies, setBabies] = useState<Baby[]>([])
  const [activeBabyId, setActiveBabyIdState] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_BABY_KEY)
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setBabies([])
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('babies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const list = data ?? []
        setBabies(list)
        // Auto-select first baby if stored id is gone
        if (list.length > 0) {
          const stored = localStorage.getItem(ACTIVE_BABY_KEY)
          const valid = stored && list.some((b) => b.id === stored)
          if (!valid) {
            localStorage.setItem(ACTIVE_BABY_KEY, list[0].id)
            setActiveBabyIdState(list[0].id)
          }
        }
        setLoading(false)
      })
  }, [user])

  const activeBaby = babies.find((b) => b.id === activeBabyId) ?? babies[0] ?? null

  const setActiveBaby = useCallback((id: string) => {
    localStorage.setItem(ACTIVE_BABY_KEY, id)
    setActiveBabyIdState(id)
  }, [])

  const refetch = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('babies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    setBabies(data ?? [])
  }, [user])

  return { babies, activeBaby, loading, setActiveBaby, refetch }
}
```
  </description>
  <files>
    <file action="create">src/hooks/useBabies.ts</file>
  </files>
</task>

<task id="2.2" type="code">
  <title>Create BabyOnboardingPage</title>
  <description>
Create `src/pages/onboarding/BabyOnboardingPage.tsx`:

- Form fields: name (text, required, min 2 chars), birth_date (date, required, not in future), sex (radio: Menino/Menina/Outro)
- On submit: `supabase.from('babies').insert({ user_id: user.id, name, birth_date, sex })`
- On success: navigate to `/dashboard`
- Use react-hook-form + zod for validation
- Layout: full screen with pink gradient (same as AuthLayout), no bottom nav, centered card
- Add helpful copy: "Vamos conhecer seu bebê! 🍼"

Schema:
```typescript
const schema = z.object({
  name: z.string().min(2, 'Nome precisa ter ao menos 2 caracteres').max(60),
  birth_date: z
    .string()
    .min(1, 'Informe a data de nascimento')
    .refine((d) => !isNaN(Date.parse(d)), 'Data inválida')
    .refine((d) => new Date(d) <= new Date(), 'Data não pode ser no futuro'),
  sex: z.enum(['M', 'F', 'other'], { required_error: 'Selecione o sexo' }),
})
```

Sex radio buttons: styled cards (selected = pink border + background), not raw radio inputs.
  </description>
  <files>
    <file action="create">src/pages/onboarding/BabyOnboardingPage.tsx</file>
  </files>
</task>

<task id="2.3" type="code">
  <title>Add /onboarding/baby route to router + update AppRoute type</title>
  <description>
In `src/router.tsx`, add the `/onboarding/baby` route nested INSIDE the existing `ProtectedRoute` wrapper (so auth is checked), but with `AuthLayout` instead of `AppShell`:

```tsx
// Inside the ProtectedRoute wrapper, BEFORE the AppShell children block:
{
  element: <AuthLayout />,
  children: [
    { path: '/onboarding/baby', element: <BabyOnboardingPage /> },
  ],
},
```

So the router tree becomes:
```tsx
{
  element: <ProtectedRoute />,  // checks auth + baby gate
  children: [
    // Onboarding: auth required, no bottom nav
    {
      element: <AuthLayout />,
      children: [
        { path: '/onboarding/baby', element: <BabyOnboardingPage /> },
      ],
    },
    // Main app: auth required + has baby
    {
      element: <AppShell />,
      children: [ /* dashboard, feed, etc. */ ],
    },
  ],
},
```

Also update `AppRoute` type in `src/types/index.ts`: add `'/onboarding/baby'` to the union.
  </description>
  <files>
    <file action="modify">src/router.tsx</file>
    <file action="modify">src/types/index.ts</file>
  </files>
</task>

<task id="2.4" type="code">
  <title>Update ProtectedRoute with baby-gate redirect</title>
  <description>
Update `src/components/layout/ProtectedRoute.tsx` to check if the authenticated user has any babies, and redirect to `/onboarding/baby` if not:

```typescript
import { useBabies } from '@/hooks/useBabies'

export function ProtectedRoute() {
  const { user, loading: authLoading } = useAuth()
  const { babies, loading: babiesLoading } = useBabies()
  const location = useLocation()

  // Wait for both auth and babies to resolve
  if (authLoading || babiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirect unauthenticated users with no babies to onboarding
  // Allow /onboarding/baby itself to pass through (avoid redirect loop)
  if (babies.length === 0 && location.pathname !== '/onboarding/baby') {
    return <Navigate to="/onboarding/baby" replace />
  }

  return <Outlet />
}
```

Note: `useBabies()` returns `loading: true` initially and resolves quickly (single lightweight query). This is acceptable for Phase 2.
  </description>
  <files>
    <file action="modify">src/components/layout/ProtectedRoute.tsx</file>
  </files>
</task>

## Verification
- [ ] `src/hooks/useBabies.ts` exists and exports `useBabies`
- [ ] `src/pages/onboarding/BabyOnboardingPage.tsx` has working form with name/birth_date/sex
- [ ] New user without babies is redirected to `/onboarding/baby`
- [ ] After creating baby, user reaches `/dashboard`
- [ ] `tsc --noEmit` exits 0
