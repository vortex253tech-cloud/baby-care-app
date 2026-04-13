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
    <form onSubmit={handleSubmit(onSave)} className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Nome do medicamento
        </label>
        <input
          {...register('label')}
          placeholder="Ex: Vitamina D"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
