import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FeedFormData } from '@/hooks/useFeedLog'

const schema = z.object({
  volume_ml: z.coerce.number().int().min(1, 'Informe o volume').max(500),
  milk_type: z.enum(['breast_milk', 'formula', 'mixed']),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  onSave: (data: FeedFormData) => void
  saving: boolean
}

export function BottleFeedForm({ onSave, saving }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { milk_type: 'breast_milk' },
  })

  const milkType = watch('milk_type')
  const milkOptions = [
    { value: 'breast_milk' as const, label: 'Leite materno' },
    { value: 'formula' as const, label: 'Fórmula' },
    { value: 'mixed' as const, label: 'Misto' },
  ]

  function onSubmit(values: FormValues) {
    onSave({
      type: 'bottle',
      volume_ml: values.volume_ml,
      milk_type: values.milk_type,
      notes: values.notes || undefined,
      started_at: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Volume */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Volume (mL)
        </label>
        <input
          type="number"
          {...register('volume_ml')}
          placeholder="Ex: 120"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />
        {errors.volume_ml && (
          <p className="text-xs text-red-500 mt-1">{errors.volume_ml.message}</p>
        )}
      </div>

      {/* Milk type */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de leite</p>
        <div className="flex gap-2">
          {milkOptions.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => setValue('milk_type', m.value)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                milkType === m.value
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <textarea
        {...register('notes')}
        placeholder="Observações (opcional)"
        rows={2}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white resize-none"
      />

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-pink-500 disabled:opacity-50 text-white rounded-2xl font-semibold text-base"
      >
        {saving ? 'Salvando…' : 'Salvar mamadeira'}
      </button>
    </form>
  )
}
