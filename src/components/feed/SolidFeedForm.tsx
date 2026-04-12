import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FeedFormData } from '@/hooks/useFeedLog'

const schema = z.object({
  food_name: z.string().min(1, 'Informe o alimento'),
  amount_g: z.preprocess(
    v => (v === '' ? undefined : v),
    z.coerce.number().int().nonnegative().optional()
  ),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  onSave: (data: FeedFormData) => void
  saving: boolean
}

export function SolidFeedForm({ onSave, saving }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function onSubmit(values: FormValues) {
    onSave({
      type: 'solid',
      food_name: values.food_name,
      amount_g: values.amount_g,
      notes: values.notes || undefined,
      started_at: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Alimento
        </label>
        <input
          type="text"
          {...register('food_name')}
          placeholder="Ex: Purê de batata"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />
        {errors.food_name && (
          <p className="text-xs text-red-500 mt-1">{errors.food_name.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Quantidade (g) — opcional
        </label>
        <input
          type="number"
          {...register('amount_g')}
          placeholder="Ex: 80"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />
      </div>

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
        {saving ? 'Salvando…' : 'Salvar refeição'}
      </button>
    </form>
  )
}
