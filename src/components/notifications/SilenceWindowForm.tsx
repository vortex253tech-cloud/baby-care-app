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
    defaultValues: {
      silence_start: currentStart || '22:00',
      silence_end: currentEnd || '06:00',
    },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSave(d.silence_start, d.silence_end))} className="space-y-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Notificações não serão enviadas neste intervalo.
      </p>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">De</label>
          <input
            type="time"
            {...register('silence_start')}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.silence_start && (
            <p className="text-xs text-red-500 mt-1">{errors.silence_start.message}</p>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Até</label>
          <input
            type="time"
            {...register('silence_end')}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.silence_end && (
            <p className="text-xs text-red-500 mt-1">{errors.silence_end.message}</p>
          )}
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
