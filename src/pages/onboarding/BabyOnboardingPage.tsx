import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { AvatarUploader } from '@/components/baby/AvatarUploader'

// ── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, 'Nome precisa ter ao menos 2 caracteres').max(60),
  birth_date: z
    .string()
    .min(1, 'Informe a data de nascimento')
    .refine((d) => !isNaN(Date.parse(d)), 'Data inválida')
    .refine((d) => new Date(d) <= new Date(), 'Data não pode ser no futuro'),
  sex: z.enum(['M', 'F', 'other'], { required_error: 'Selecione o sexo' }),
})

type FormValues = z.infer<typeof schema>

// ── Sex options ──────────────────────────────────────────────────────────────

const SEX_OPTIONS: { value: 'M' | 'F' | 'other'; label: string; emoji: string }[] = [
  { value: 'M', label: 'Menino', emoji: '👦' },
  { value: 'F', label: 'Menina', emoji: '👧' },
  { value: 'other', label: 'Outro', emoji: '🌈' },
]

// ── Component ────────────────────────────────────────────────────────────────

export function BabyOnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Two-step flow: 'form' → 'photo'
  const [step, setStep] = useState<'form' | 'photo'>('form')
  const [serverError, setServerError] = useState<string | null>(null)
  const [babyId, setBabyId] = useState<string | null>(null)
  const [photoUploaded, setPhotoUploaded] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  // ── Step 1: submit baby profile ────────────────────────────────────────────

  async function onSubmit(values: FormValues) {
    if (!user) return
    setServerError(null)

    const { data, error } = await supabase
      .from('babies')
      .insert({
        user_id: user.id,
        name: values.name,
        birth_date: values.birth_date,
        sex: values.sex,
      })
      .select()
      .single()

    if (error) {
      setServerError('Não foi possível salvar. Tente novamente.')
      return
    }

    setBabyId(data?.id ?? null)
    setStep('photo')
  }

  // ── Step 2: photo step (AvatarUploader comes in Plan 03) ──────────────────

  function handleSkipPhoto() {
    navigate('/dashboard', { replace: true })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (step === 'photo') {
    return (
      <div className="flex flex-col gap-6 pt-2">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Bebê cadastrado com sucesso!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Quer adicionar uma foto do seu bebê?
          </p>
        </div>

        {/* AvatarUploader — real implementation */}
        {babyId && (
          <div className="flex justify-center">
            <AvatarUploader
              babyId={babyId}
              currentUrl={null}
              onUpload={() => setPhotoUploaded(true)}
            />
          </div>
        )}

        {photoUploaded ? (
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/dashboard', { replace: true })}
            type="button"
          >
            Continuar
          </Button>
        ) : (
          <Button
            variant="ghost"
            fullWidth
            onClick={handleSkipPhoto}
            type="button"
          >
            Pular por agora
          </Button>
        )}
      </div>
    )
  }

  // Step === 'form'
  return (
    <div className="flex flex-col gap-6 pt-2">
      {/* Header copy */}
      <div className="text-center">
        <div className="text-4xl mb-3">🍼</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Vamos conhecer seu bebê!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Preencha as informações básicas para começar.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {/* Name */}
        <Input
          label="Nome do bebê"
          placeholder="Ex: Sofia, Miguel..."
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Birth date */}
        <Input
          label="Data de nascimento"
          type="date"
          error={errors.birth_date?.message}
          {...register('birth_date')}
        />

        {/* Sex — styled radio cards */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sexo</span>
          <Controller
            control={control}
            name="sex"
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Sexo">
                {SEX_OPTIONS.map((opt) => {
                  const selected = field.value === opt.value
                  return (
                    <label
                      key={opt.value}
                      className={`
                        flex flex-col items-center justify-center gap-1.5
                        cursor-pointer rounded-2xl border-2 p-4
                        transition-all duration-150 select-none
                        ${
                          selected
                            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:border-pink-400'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-pink-300 dark:hover:border-pink-600'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        checked={selected}
                        onChange={() => field.onChange(opt.value)}
                        className="sr-only"
                        aria-label={opt.label}
                      />
                      <span className="text-2xl" aria-hidden="true">{opt.emoji}</span>
                      <span
                        className={`text-xs font-semibold ${
                          selected
                            ? 'text-pink-600 dark:text-pink-400'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {opt.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          />
          {errors.sex && (
            <p role="alert" className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.sex.message}
            </p>
          )}
        </div>

        {/* Server error */}
        <FormError message={serverError} />

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isSubmitting}
        >
          Continuar
        </Button>
      </form>
    </div>
  )
}
