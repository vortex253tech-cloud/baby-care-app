import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FeedFormData } from '@/hooks/useFeedLog'

const schema = z.object({
  side: z.enum(['left', 'right', 'both']),
  duration_manual_min: z.coerce.number().int().nonnegative().optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  onSave: (data: FeedFormData) => void
  saving: boolean
}

export function BreastFeedForm({ onSave, saving }: Props) {
  const [timerActive, setTimerActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { side: 'left' },
  })

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  function startTimer() {
    startRef.current = Date.now() - elapsed * 1000
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current!) / 1000))
    }, 1000)
    setTimerActive(true)
  }

  function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerActive(false)
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  function onSubmit(values: FormValues) {
    const duration_seconds = elapsed > 0
      ? elapsed
      : values.duration_manual_min ? values.duration_manual_min * 60 : undefined
    onSave({
      type: 'breast',
      side: values.side,
      duration_seconds,
      notes: values.notes || undefined,
      started_at: new Date().toISOString(),
    })
  }

  const side = watch('side')
  const sides = [
    { value: 'left' as const, label: 'Esquerdo' },
    { value: 'right' as const, label: 'Direito' },
    { value: 'both' as const, label: 'Ambos' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Side selector */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lado</p>
        <div className="flex gap-2">
          {sides.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setValue('side', s.value)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                side === s.value
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timer */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duração</p>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-mono text-gray-900 dark:text-white w-20">
            {formatTime(elapsed)}
          </span>
          {!timerActive ? (
            <button type="button" onClick={startTimer}
              className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-xl text-sm font-medium">
              Iniciar
            </button>
          ) : (
            <button type="button" onClick={stopTimer}
              className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium">
              Parar
            </button>
          )}
        </div>
        {elapsed === 0 && (
          <div className="mt-2">
            <input
              type="number"
              placeholder="Ou informe minutos manualmente"
              {...register('duration_manual_min')}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <textarea
          {...register('notes')}
          placeholder="Observações (opcional)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-pink-500 disabled:opacity-50 text-white rounded-2xl font-semibold text-base"
      >
        {saving ? 'Salvando…' : 'Salvar mamada'}
      </button>
    </form>
  )
}
