import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useBabies } from '@/hooks/useBabies'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { AvatarUploader } from '@/components/baby/AvatarUploader'

// ── Validation schema ─────────────────────────────────────────────────────────

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

// ── Sex options ───────────────────────────────────────────────────────────────

const SEX_OPTIONS: { value: 'M' | 'F' | 'other'; label: string; emoji: string }[] = [
  { value: 'M', label: 'Menino', emoji: '👦' },
  { value: 'F', label: 'Menina', emoji: '👧' },
  { value: 'other', label: 'Outro', emoji: '🌈' },
]

// ── Baby Profile Card ─────────────────────────────────────────────────────────

function BabyProfileCard() {
  const { activeBaby, refetch } = useBabies()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: activeBaby
      ? {
          name: activeBaby.name,
          birth_date: activeBaby.birth_date,
          sex: activeBaby.sex,
        }
      : undefined,
  })

  if (!activeBaby) {
    return (
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Nenhum bebê cadastrado.
        </p>
      </div>
    )
  }

  async function onSubmit(values: FormValues) {
    if (!activeBaby) return
    setServerError(null)
    setSuccess(false)

    const { error } = await supabase
      .from('babies')
      .update({
        name: values.name,
        birth_date: values.birth_date,
        sex: values.sex,
      })
      .eq('id', activeBaby.id)

    if (error) {
      setServerError('Não foi possível salvar. Tente novamente.')
      return
    }

    await refetch()
    setSuccess(true)
  }

  function handleAvatarUpload(_url: string) {
    refetch()
  }

  return (
    <section
      aria-labelledby="baby-profile-heading"
      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-5"
    >
      <h2
        id="baby-profile-heading"
        className="text-base font-bold text-gray-900 dark:text-white"
      >
        Perfil do bebê
      </h2>

      {/* Avatar */}
      <div className="flex justify-center">
        <AvatarUploader
          babyId={activeBaby.id}
          currentUrl={activeBaby.avatar_url}
          onUpload={handleAvatarUpload}
        />
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Nome do bebê"
          placeholder="Ex: Sofia, Miguel..."
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Data de nascimento"
          type="date"
          error={errors.birth_date?.message}
          {...register('birth_date')}
        />

        {/* Sex selector */}
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
                        cursor-pointer rounded-2xl border-2 p-3
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

        <FormError message={serverError} />

        {success && (
          <p role="status" className="text-sm text-green-600 dark:text-green-400 text-center font-medium">
            Dados salvos com sucesso!
          </p>
        )}

        <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
          Salvar alterações
        </Button>
      </form>
    </section>
  )
}

// ── Minha Conta Card ──────────────────────────────────────────────────────────

function MinhaContaCard() {
  const { user, profile, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    // AuthProvider will clear the session; router will redirect to /login
  }

  return (
    <section
      aria-labelledby="my-account-heading"
      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-4"
    >
      <h2
        id="my-account-heading"
        className="text-base font-bold text-gray-900 dark:text-white"
      >
        Minha conta
      </h2>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
          E-mail
        </span>
        <span className="text-sm text-gray-800 dark:text-gray-200 break-all">
          {user?.email ?? '—'}
        </span>
      </div>

      {profile?.full_name && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
            Nome
          </span>
          <span className="text-sm text-gray-800 dark:text-gray-200">
            {profile.full_name}
          </span>
        </div>
      )}

      <Button
        variant="secondary"
        fullWidth
        loading={signingOut}
        onClick={handleSignOut}
      >
        Sair
      </Button>
    </section>
  )
}

// ── Danger Zone Card ──────────────────────────────────────────────────────────

function DangerZoneCard() {
  const { signOut } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError(null)

    const { error } = await supabase.functions.invoke('delete-account')

    if (error) {
      setDeleting(false)
      setDeleteError('Não foi possível excluir a conta. Tente novamente.')
      return
    }

    await signOut()
    // signOut clears session; router will redirect to /login
  }

  return (
    <section
      aria-labelledby="danger-zone-heading"
      className="rounded-2xl bg-white dark:bg-gray-900 border-2 border-red-200 dark:border-red-900 p-5 flex flex-col gap-4"
    >
      <h2
        id="danger-zone-heading"
        className="text-base font-bold text-red-600 dark:text-red-400"
      >
        Zona de perigo
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Excluir sua conta remove permanentemente todos os seus dados, incluindo os registros do bebê.
      </p>

      <FormError message={deleteError} />

      <Button
        variant="danger"
        fullWidth
        onClick={() => {
          setDeleteError(null)
          setModalOpen(true)
        }}
      >
        Excluir conta e dados
      </Button>

      <ConfirmModal
        open={modalOpen}
        title="Excluir conta?"
        message="Esta ação é irreversível. Todos os dados serão apagados permanentemente."
        confirmLabel="Excluir conta"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setModalOpen(false)}
      />
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProfilePage() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6 max-w-lg mx-auto">
      <BabyProfileCard />
      <MinhaContaCard />
      <DangerZoneCard />
    </div>
  )
}
