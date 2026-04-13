---
plan: "04-notifications-and-reminders/04"
phase: 4
sequence: 4
title: "Lembretes de medicamento"
status: pending
requires: ["04-notifications-and-reminders/03"]
---

# Plan 04: Lembretes de medicamento

## Objective
Adicionar na NotificationsPage a seção de lembretes de medicamento: formulário (nome, dose, frequência em horas), lista de medicamentos configurados com toggle e exclusão. Cada medicamento gera um reminder do tipo `medication` na tabela `reminders`.

## Requirements Addressed
- NOTF-03: Lembrete de medicamento com frequência personalizada
- NOTF-05: Ativar/desativar cada tipo de notificação individualmente

## Tasks

<task id="4.1" type="code">
  <title>MedicationReminderForm</title>
  <description>
Criar `src/components/notifications/MedicationReminderForm.tsx`:

```typescript
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  label: z.string().min(1, 'Nome do medicamento obrigatório').max(60),
  medication_dose: z.string().max(40).optional(),
  interval_hours: z.number({ invalid_type_error: 'Obrigatório' }).min(1).max(72),
})
export type MedFormData = z.infer<typeof schema>

interface Props {
  onSave: (data: MedFormData) => Promise<void>
  saving: boolean
  onCancel: () => void
}

export function MedicationReminderForm({ onSave, saving, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<MedFormData>({
    resolver: zodResolver(schema),
    defaultValues: { interval_hours: 8 },
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-3 pt-2">
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Nome do medicamento
        </label>
        <input
          {...register('label')}
          placeholder="Ex: Vitamina D"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
        />
        {errors.label && <p className="mt-1 text-xs text-red-500">{errors.label.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Dose (opcional)
        </label>
        <input
          {...register('medication_dose')}
          placeholder="Ex: 1 gota"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          A cada quantas horas?
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={72}
            {...register('interval_hours', { valueAsNumber: true })}
            className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
          />
          <span className="text-sm text-gray-500">horas</span>
        </div>
        {errors.interval_hours && <p className="mt-1 text-xs text-red-500">{errors.interval_hours.message}</p>}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 py-2 text-sm font-medium text-gray-600 dark:text-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Salvando…' : 'Adicionar'}
        </button>
      </div>
    </form>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/notifications/MedicationReminderForm.tsx</file>
  </files>
</task>

<task id="4.2" type="code">
  <title>MedicationReminderList</title>
  <description>
Criar `src/components/notifications/MedicationReminderList.tsx`:

```typescript
import type { Reminder } from '@/types'

interface Props {
  reminders: Reminder[]
  onToggle: (id: string, enabled: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function MedicationReminderList({ reminders, onToggle, onDelete }: Props) {
  if (!reminders.length) return (
    <p className="text-xs text-gray-400 text-center py-2">Nenhum medicamento configurado.</p>
  )

  return (
    <ul className="space-y-2">
      {reminders.map((r) => (
        <li key={r.id} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              💊 {r.label}
            </p>
            <p className="text-xs text-gray-400">
              {r.medication_dose ? `${r.medication_dose} · ` : ''}a cada {r.interval_hours}h
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {/* Toggle */}
            <button
              onClick={() => onToggle(r.id, !r.enabled)}
              className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${r.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full shadow mx-0.5 transition-transform ${r.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            {/* Delete */}
            <button
              onClick={() => window.confirm('Remover este medicamento?') && onDelete(r.id)}
              className="text-gray-400 hover:text-red-500 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/notifications/MedicationReminderList.tsx</file>
  </files>
</task>

<task id="4.3" type="code">
  <title>NotificationsPage — seção Medicamentos</title>
  <description>
Atualizar `src/pages/NotificationsPage.tsx` para substituir o placeholder de Medicamentos pela implementação real:

- Importar `MedicationReminderForm` e `MedicationReminderList`
- Estado `showMedForm: boolean` controlando visibilidade do formulário
- `medReminders = reminders.filter(r => r.type === 'medication')`
- `handleMedSave`: `createReminder` com type 'medication', label, medication_dose, interval_hours, next_fire_at = now + interval
- `handleMedDelete`: `deleteReminder(id)`
- Renderizar `MedicationReminderList` + botão "+ Adicionar medicamento" que exibe `MedicationReminderForm`

Seção completa:
```tsx
<div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
  <div className="flex items-center justify-between">
    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">💊 Medicamentos</h2>
    {!showMedForm && (
      <button
        onClick={() => setShowMedForm(true)}
        className="text-xs text-indigo-600 font-medium"
      >
        + Adicionar
      </button>
    )}
  </div>
  <MedicationReminderList
    reminders={medReminders}
    onToggle={toggleReminder}
    onDelete={deleteReminder}
  />
  {showMedForm && (
    <MedicationReminderForm
      onSave={handleMedSave}
      saving={saving}
      onCancel={() => setShowMedForm(false)}
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
- [ ] Seção Medicamentos exibe lista de reminders com toggle e delete
- [ ] Formulário "+ Adicionar medicamento" salva e fecha automaticamente
- [ ] Cada medicamento salvo aparece imediatamente na lista sem reload
- [ ] tsc --noEmit exits 0
