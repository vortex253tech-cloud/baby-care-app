import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Reminder } from '@/types'

const schema = z.object({
  interval_hours: z.number({ invalid_type_error: 'Obrigatório' }).min(1).max(12),
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
    },
  })

  const intervalHours = watch('interval_hours')

  function nextFirePreview(): string {
    const h = Number(intervalHours)
    if (!h || isNaN(h)) return '—'
    const next = new Date(Date.now() + h * 3600 * 1000)
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
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
              existing.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-label={existing.enabled ? 'Desativar lembrete' : 'Ativar lembrete'}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                existing.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
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
            className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-500">horas</span>
        </div>
        {errors.interval_hours && (
          <p className="mt-1 text-xs text-red-500">{errors.interval_hours.message}</p>
        )}
      </div>

      {/* Next fire preview */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Próximo lembrete previsto:{' '}
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{nextFirePreview()}</span>
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
