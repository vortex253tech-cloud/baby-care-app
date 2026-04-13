---
plan: "04-notifications-and-reminders/03"
phase: 4
sequence: 3
title: "UI de lembretes de alimentação + página NotificationsPage"
status: pending
requires: ["04-notifications-and-reminders/02"]
---

# Plan 03: UI de lembretes de alimentação + página NotificationsPage

## Objective
Criar a `NotificationsPage` com a seção de lembretes de alimentação: formulário para configurar intervalo (h), horário de início, toggle ativo/inativo, preview do próximo lembrete, e botão para solicitar permissão de push. Adicionar a rota `/notifications` ao router e link no bottom nav.

## Requirements Addressed
- NOTF-01: Lembretes de alimentação recorrentes
- NOTF-04: Web Push
- NOTF-05: Ativar/desativar notificações individualmente

## Tasks

<task id="3.1" type="code">
  <title>NotificationsPage shell + rota</title>
  <description>
1. Criar `src/pages/NotificationsPage.tsx` — shell com header "Notificações" e três seções colapsáveis: Alimentação, Medicamentos, Silêncio.

2. Adicionar ao router em `src/router.tsx` (dentro do ProtectedRoute):
```typescript
{ path: 'notifications', element: <NotificationsPage /> }
```

3. Adicionar ícone de sino ao bottom nav em `src/components/layout/BottomNav.tsx`:
```typescript
{ to: '/notifications', icon: BellIcon, label: 'Alertas' }
```
Use `BellIcon` de `@heroicons/react/24/outline` (já instalado em Phase 2).
  </description>
  <files>
    <file action="create">src/pages/NotificationsPage.tsx</file>
    <file action="modify">src/router.tsx</file>
    <file action="modify">src/components/layout/BottomNav.tsx</file>
  </files>
</task>

<task id="3.2" type="code">
  <title>PushPermissionBanner</title>
  <description>
Criar `src/components/notifications/PushPermissionBanner.tsx`:

```typescript
import { usePushSubscription } from '@/hooks/usePushSubscription'

interface Props { userId: string }

export function PushPermissionBanner({ userId }: Props) {
  const { state, subscribing, subscribe } = usePushSubscription(userId)

  if (state === 'unsupported') return (
    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
      Notificações push não são suportadas neste navegador.
    </div>
  )
  if (state === 'granted') return (
    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
      <span>🔔</span> Notificações push ativas neste dispositivo.
    </div>
  )
  if (state === 'denied') return (
    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
      Permissão bloqueada pelo navegador. Habilite nas configurações do Chrome para receber notificações.
    </div>
  )

  // idle
  return (
    <button
      onClick={subscribe}
      disabled={subscribing}
      className="w-full rounded-lg bg-indigo-600 text-white py-3 font-medium text-sm disabled:opacity-60"
    >
      {subscribing ? 'Ativando…' : '🔔 Ativar notificações push'}
    </button>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/notifications/PushPermissionBanner.tsx</file>
  </files>
</task>

<task id="3.3" type="code">
  <title>FeedingReminderForm</title>
  <description>
Criar `src/components/notifications/FeedingReminderForm.tsx`:

```typescript
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Reminder } from '@/types'

const schema = z.object({
  interval_hours: z.number({ invalid_type_error: 'Obrigatório' }).min(1).max(12),
  silence_start: z.string().optional(),
  silence_end: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  existing: Reminder | null
  onSave: (data: FormData) => Promise<void>
  onToggle: (enabled: boolean) => Promise<void>
  saving: boolean
}

export function FeedingReminderForm({ existing, onSave, onToggle, saving }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      interval_hours: existing?.interval_hours ?? 3,
      silence_start: existing?.silence_start ?? '',
      silence_end: existing?.silence_end ?? '',
    },
  })

  const intervalHours = watch('interval_hours')

  // Compute next fire preview
  function nextFirePreview(): string {
    if (!intervalHours || isNaN(intervalHours)) return '—'
    const next = new Date(Date.now() + intervalHours * 3600 * 1000)
    return next.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      {/* Toggle enabled */}
      {existing && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lembrete ativo</span>
          <button
            type="button"
            onClick={() => onToggle(!existing.enabled)}
            className={`w-11 h-6 rounded-full transition-colors ${existing.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <span className={`block w-4 h-4 bg-white rounded-full shadow mx-1 transition-transform ${existing.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      )}

      {/* Interval */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          A cada quantas horas?
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={12}
            step={0.5}
            {...register('interval_hours', { valueAsNumber: true })}
            className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
          />
          <span className="text-sm text-gray-500">horas</span>
        </div>
        {errors.interval_hours && (
          <p className="mt-1 text-xs text-red-500">{errors.interval_hours.message}</p>
        )}
      </div>

      {/* Next fire preview */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Próximo lembrete previsto: <span className="font-semibold text-indigo-600">{nextFirePreview()}</span>
      </p>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-indigo-600 text-white py-3 text-sm font-medium disabled:opacity-60"
      >
        {saving ? 'Salvando…' : existing ? 'Salvar alterações' : 'Criar lembrete'}
      </button>
    </form>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/notifications/FeedingReminderForm.tsx</file>
  </files>
</task>

<task id="3.4" type="code">
  <title>NotificationsPage — seção Alimentação completa</title>
  <description>
Atualizar `src/pages/NotificationsPage.tsx` com lógica completa da seção Alimentação:

```typescript
import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useBabyContext } from '@/contexts/BabyContext'
import { useReminders } from '@/hooks/useReminders'
import { PushPermissionBanner } from '@/components/notifications/PushPermissionBanner'
import { FeedingReminderForm } from '@/components/notifications/FeedingReminderForm'

export default function NotificationsPage() {
  const { user } = useAuthContext()
  const { activeBaby } = useBabyContext()
  const { reminders, loading, createReminder, updateReminder, toggleReminder } = useReminders(
    activeBaby?.id ?? '',
    user?.id ?? ''
  )
  const [saving, setSaving] = useState(false)

  const feedingReminder = reminders.find((r) => r.type === 'feeding') ?? null

  async function handleFeedingSave(data: { interval_hours: number; silence_start?: string; silence_end?: string }) {
    if (!activeBaby || !user) return
    setSaving(true)
    const next = new Date(Date.now() + data.interval_hours * 3600 * 1000)
    if (feedingReminder) {
      await updateReminder(feedingReminder.id, {
        interval_hours: data.interval_hours,
        silence_start: data.silence_start || null,
        silence_end: data.silence_end || null,
        next_fire_at: next.toISOString(),
      })
    } else {
      await createReminder({
        type: 'feeding',
        label: 'Hora de mamar! 🍼',
        enabled: true,
        interval_hours: data.interval_hours,
        next_fire_at: next.toISOString(),
        silence_start: data.silence_start || null,
        silence_end: data.silence_end || null,
        medication_dose: null,
        vaccine_id: null,
        vaccine_date: null,
      })
    }
    setSaving(false)
  }

  if (!activeBaby) return (
    <div className="p-4 text-sm text-gray-500">Nenhum bebê selecionado.</div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Notificações</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {user && <PushPermissionBanner userId={user.id} />}

        {/* Feeding reminders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            🍼 Lembrete de Alimentação
          </h2>
          {!loading && (
            <FeedingReminderForm
              existing={feedingReminder}
              onSave={handleFeedingSave}
              onToggle={(enabled) => feedingReminder && toggleReminder(feedingReminder.id, enabled)}
              saving={saving}
            />
          )}
        </div>

        {/* Medication — placeholder for Plan 04 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm opacity-50">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            💊 Medicamentos
          </h2>
          <p className="text-xs text-gray-400 mt-1">Em breve</p>
        </div>

        {/* Silence window — placeholder for Plan 05 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm opacity-50">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            🌙 Horário de Silêncio
          </h2>
          <p className="text-xs text-gray-400 mt-1">Em breve</p>
        </div>
      </div>
    </div>
  )
}
```
  </description>
  <files>
    <file action="modify">src/pages/NotificationsPage.tsx</file>
  </files>
</task>

## Verification
- [ ] Rota /notifications acessível via bottom nav
- [ ] PushPermissionBanner mostra estado correto (idle/granted/denied/unsupported)
- [ ] FeedingReminderForm cria/edita lembrete e exibe próxima hora prevista
- [ ] Toggle ativa/desativa o lembrete sem reload
- [ ] tsc --noEmit exits 0
