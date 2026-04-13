---
plan: "04-notifications-and-reminders/05"
phase: 4
sequence: 5
title: "Horário de silêncio + lembretes de vacina"
status: pending
requires: ["04-notifications-and-reminders/04"]
---

# Plan 05: Horário de silêncio + lembretes de vacina

## Objective
Adicionar na NotificationsPage a seção de horário de silêncio (time pickers de início/fim que atualizam todos os reminders do bebê) e a seção de vacinas (agenda automática baseada no calendário SUS seedada localmente, com possibilidade de ativar lembretes 7 dias antes e no dia).

## Requirements Addressed
- NOTF-02: Lembrete de vacina (7 dias antes, no dia)
- NOTF-06: Horário de silêncio configurável

## Tasks

<task id="5.1" type="code">
  <title>SilenceWindowForm</title>
  <description>
Criar `src/components/notifications/SilenceWindowForm.tsx`:

```typescript
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  silence_start: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  silence_end: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
})
type FormData = z.infer<typeof schema>

interface Props {
  currentStart: string
  currentEnd: string
  onSave: (start: string, end: string) => Promise<void>
  saving: boolean
}

export function SilenceWindowForm({ currentStart, currentEnd, onSave, saving }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { silence_start: currentStart || '22:00', silence_end: currentEnd || '06:00' },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSave(d.silence_start, d.silence_end))} className="space-y-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Notificações não serão enviadas neste intervalo.
      </p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">De</label>
          <input
            type="time"
            {...register('silence_start')}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
          />
          {errors.silence_start && <p className="text-xs text-red-500 mt-1">{errors.silence_start.message}</p>}
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Até</label>
          <input
            type="time"
            {...register('silence_end')}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
          />
          {errors.silence_end && <p className="text-xs text-red-500 mt-1">{errors.silence_end.message}</p>}
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium disabled:opacity-60"
      >
        {saving ? 'Salvando…' : 'Salvar horário'}
      </button>
    </form>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/notifications/SilenceWindowForm.tsx</file>
  </files>
</task>

<task id="5.2" type="code">
  <title>Calendário SUS local (seed data)</title>
  <description>
Criar `src/data/sus-calendar.ts` com as vacinas do calendário infantil SUS 2024 por faixa etária:

```typescript
export interface SusVaccine {
  id: string
  name: string
  dose: string
  age_days_from: number   // earliest recommended age in days
  age_days_to: number     // latest recommended age (tolerance window)
  description: string
}

// Age constants
const D = (n: number) => n           // days
const M = (n: number) => n * 30      // approx months → days
const Y = (n: number) => n * 365     // approx years → days

export const SUS_VACCINES: SusVaccine[] = [
  { id: 'hep-b-0', name: 'Hepatite B', dose: '1ª dose', age_days_from: D(0), age_days_to: D(1), description: 'Ao nascer' },
  { id: 'bcg', name: 'BCG', dose: 'dose única', age_days_from: D(0), age_days_to: D(30), description: 'Ao nascer' },
  { id: 'penta-1', name: 'Pentavalente (DTP+Hib+HepB)', dose: '1ª dose', age_days_from: M(2), age_days_to: M(3), description: '2 meses' },
  { id: 'vip-1', name: 'VIP (Poliomielite inativada)', dose: '1ª dose', age_days_from: M(2), age_days_to: M(3), description: '2 meses' },
  { id: 'pneumo-1', name: 'Pneumocócica 10-valente', dose: '1ª dose', age_days_from: M(2), age_days_to: M(3), description: '2 meses' },
  { id: 'rota-1', name: 'Rotavírus Humano G1P1', dose: '1ª dose', age_days_from: M(2), age_days_to: M(3), description: '2 meses' },
  { id: 'meningo-1', name: 'Meningocócica C', dose: '1ª dose', age_days_from: M(3), age_days_to: M(4), description: '3 meses' },
  { id: 'penta-2', name: 'Pentavalente', dose: '2ª dose', age_days_from: M(4), age_days_to: M(5), description: '4 meses' },
  { id: 'vip-2', name: 'VIP', dose: '2ª dose', age_days_from: M(4), age_days_to: M(5), description: '4 meses' },
  { id: 'pneumo-2', name: 'Pneumocócica 10-valente', dose: '2ª dose', age_days_from: M(4), age_days_to: M(5), description: '4 meses' },
  { id: 'rota-2', name: 'Rotavírus Humano G1P1', dose: '2ª dose', age_days_from: M(4), age_days_to: M(5), description: '4 meses' },
  { id: 'penta-3', name: 'Pentavalente', dose: '3ª dose', age_days_from: M(6), age_days_to: M(7), description: '6 meses' },
  { id: 'vip-3', name: 'VIP', dose: '3ª dose', age_days_from: M(6), age_days_to: M(7), description: '6 meses' },
  { id: 'hep-a', name: 'Hepatite A', dose: 'dose única', age_days_from: M(12), age_days_to: M(15), description: '12 meses' },
  { id: 'triplice-viral-1', name: 'Tríplice Viral (SCR)', dose: '1ª dose', age_days_from: M(12), age_days_to: M(15), description: '12 meses' },
  { id: 'pneumo-ref', name: 'Pneumocócica 10-valente', dose: 'reforço', age_days_from: M(12), age_days_to: M(15), description: '12 meses' },
  { id: 'meningo-2', name: 'Meningocócica C', dose: 'reforço', age_days_from: M(12), age_days_to: M(15), description: '12 meses' },
  { id: 'varicela', name: 'Varicela', dose: '1ª dose', age_days_from: M(15), age_days_to: M(18), description: '15 meses' },
  { id: 'dtp-ref1', name: 'DTP', dose: '1º reforço', age_days_from: M(15), age_days_to: M(18), description: '15 meses' },
  { id: 'vop-ref1', name: 'VOP (Poliomielite oral)', dose: '1º reforço', age_days_from: M(15), age_days_to: M(18), description: '15 meses' },
  { id: 'triplice-viral-2', name: 'Tríplice Viral', dose: '2ª dose', age_days_from: Y(4), age_days_to: Y(4) + M(6), description: '4 anos' },
  { id: 'dtp-ref2', name: 'DTP', dose: '2º reforço', age_days_from: Y(4), age_days_to: Y(4) + M(6), description: '4 anos' },
  { id: 'vop-ref2', name: 'VOP', dose: '2º reforço', age_days_from: Y(4), age_days_to: Y(4) + M(6), description: '4 anos' },
  { id: 'varicela-ref', name: 'Varicela', dose: '2ª dose', age_days_from: Y(4), age_days_to: Y(4) + M(6), description: '4 anos' },
]

/**
 * Returns vaccines due within the next `windowDays` days based on baby birthDate.
 * "Due" = vaccine age window starts within the next `windowDays`.
 */
export function getUpcomingVaccines(birthDate: Date, windowDays = 30): (SusVaccine & { due_date: Date })[] {
  const today = new Date()
  const babyAgeMs = today.getTime() - birthDate.getTime()
  const babyAgeDays = babyAgeMs / (1000 * 60 * 60 * 24)

  return SUS_VACCINES
    .filter((v) => {
      const daysUntilDue = v.age_days_from - babyAgeDays
      return daysUntilDue >= -v.age_days_to && daysUntilDue <= windowDays
    })
    .map((v) => ({
      ...v,
      due_date: new Date(birthDate.getTime() + v.age_days_from * 24 * 60 * 60 * 1000),
    }))
}
```
  </description>
  <files>
    <file action="create">src/data/sus-calendar.ts</file>
  </files>
</task>

<task id="5.3" type="code">
  <title>VaccineReminderList</title>
  <description>
Criar `src/components/notifications/VaccineReminderList.tsx`:

```typescript
import { useState } from 'react'
import { getUpcomingVaccines } from '@/data/sus-calendar'
import type { Reminder } from '@/types'

interface Props {
  birthDate: string           // ISO date string from baby profile
  existingReminders: Reminder[]
  onEnable: (vaccineId: string, name: string, dueDate: Date) => Promise<void>
  onDisable: (reminderId: string) => Promise<void>
}

export function VaccineReminderList({ birthDate, existingReminders, onEnable, onDisable }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const upcoming = getUpcomingVaccines(new Date(birthDate), 90)  // 90-day window

  if (!upcoming.length) return (
    <p className="text-xs text-gray-400 text-center py-2">
      Nenhuma vacina prevista nos próximos 90 dias.
    </p>
  )

  function findReminder(vaccineId: string): Reminder | undefined {
    return existingReminders.find((r) => r.vaccine_id === vaccineId)
  }

  async function handleToggle(vaccineId: string, name: string, dueDate: Date) {
    setLoading(vaccineId)
    const existing = findReminder(vaccineId)
    if (existing) {
      await onDisable(existing.id)
    } else {
      await onEnable(vaccineId, name, dueDate)
    }
    setLoading(null)
  }

  return (
    <ul className="space-y-2">
      {upcoming.map((v) => {
        const existing = findReminder(v.id)
        const daysUntil = Math.round((v.due_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        const isOverdue = daysUntil < 0

        return (
          <li key={v.id} className="flex items-start justify-between rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2 gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                💉 {v.name} <span className="font-normal text-gray-500">({v.dose})</span>
              </p>
              <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                {isOverdue
                  ? `Atrasada ${Math.abs(daysUntil)} dias`
                  : daysUntil === 0
                  ? 'Hoje!'
                  : `Daqui a ${daysUntil} dias`
                } · {v.due_date.toLocaleDateString('pt-BR')}
              </p>
            </div>
            <button
              onClick={() => handleToggle(v.id, `${v.name} (${v.dose})`, v.due_date)}
              disabled={loading === v.id}
              className={`flex-shrink-0 text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                existing
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700'
                  : 'bg-white dark:bg-gray-700 text-gray-500 border-gray-200 dark:border-gray-600'
              }`}
            >
              {loading === v.id ? '…' : existing ? 'Ativo' : 'Ativar'}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/notifications/VaccineReminderList.tsx</file>
  </files>
</task>

<task id="5.4" type="code">
  <title>NotificationsPage — seções Silêncio e Vacinas</title>
  <description>
Atualizar `src/pages/NotificationsPage.tsx`:

1. Substituir placeholder "Horário de Silêncio" pela implementação real com `SilenceWindowForm`:
   - `handleSilenceSave(start, end)`: itera sobre todos os reminders do bebê e chama `updateReminder(r.id, { silence_start: start, silence_end: end })`
   - Inferir valores atuais do primeiro reminder que os tiver definidos

2. Adicionar seção "Vacinas" com `VaccineReminderList`:
   - `vaccineReminders = reminders.filter(r => r.type === 'vaccine')`
   - `handleVaccineEnable(vaccineId, name, dueDate)`:
     - Cria reminder 7 dias antes: `next_fire_at = dueDate - 7 dias`
     - Cria reminder no dia: `next_fire_at = dueDate`
     - Na prática: criar 2 reminders, um com `label = "Vacina em 7 dias: ${name}"` e outro `"Dia da vacina: ${name}"`
     - vaccine_id = vaccineId, vaccine_date = dueDate.toISOString().split('T')[0]
   - `handleVaccineDisable(id)`: `deleteReminder(id)`

Seção Vacinas:
```tsx
<div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
    💉 Vacinas (próximos 90 dias)
  </h2>
  {activeBaby && (
    <VaccineReminderList
      birthDate={activeBaby.birth_date}
      existingReminders={vaccineReminders}
      onEnable={handleVaccineEnable}
      onDisable={handleVaccineDisable}
    />
  )}
</div>
```
  </description>
  <files>
    <file action="modify">src/pages/NotificationsPage.tsx</file>
  </files>
</task>

## Verification
- [ ] SilenceWindowForm atualiza silence_start/end de todos os reminders
- [ ] VaccineReminderList exibe vacinas dos próximos 90 dias com status de atraso
- [ ] Ativar vacina cria 2 reminders (7 dias antes + no dia)
- [ ] sus-calendar.ts exporta SUS_VACCINES com >= 20 entradas
- [ ] tsc --noEmit exits 0
