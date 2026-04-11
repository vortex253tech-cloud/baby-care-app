import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'A senha precisa ter ao menos 8 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Confirme sua nova senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ResetFormData = z.infer<typeof resetSchema>

type PageState = 'loading' | 'ready' | 'success' | 'invalid'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  })

  useEffect(() => {
    // Supabase sends a PASSWORD_RECOVERY event when the user clicks the reset link.
    // The URL fragment (#access_token=...&type=recovery) is consumed by the client
    // and converted into this event. We just need to wait for it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready')
      } else if (event === 'SIGNED_IN' && pageState === 'loading') {
        // Already signed in but no recovery event — treat as invalid link
        setPageState('invalid')
      }
    })

    // Give the client a moment to parse the URL fragment
    const timeout = setTimeout(() => {
      setPageState((prev) => (prev === 'loading' ? 'invalid' : prev))
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data: ResetFormData) {
    setServerError(null)
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      setServerError('Erro ao atualizar senha. O link pode ter expirado.')
      return
    }
    setPageState('success')
    setTimeout(() => navigate('/dashboard', { replace: true }), 2000)
  }

  if (pageState === 'loading') {
    return (
      <div className="py-8 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Verificando seu link...</p>
      </div>
    )
  }

  if (pageState === 'invalid') {
    return (
      <div className="py-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Link inválido ou expirado
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Solicite um novo link de redefinição de senha.
        </p>
        <button
          onClick={() => navigate('/forgot-password')}
          className="text-sm text-brand-500 hover:text-brand-600 font-semibold"
        >
          Solicitar novo link
        </button>
      </div>
    )
  }

  if (pageState === 'success') {
    return (
      <div className="py-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Senha atualizada! ✅
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirecionando para o app...
        </p>
      </div>
    )
  }

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Nova senha
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Escolha uma senha segura para sua conta.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormError message={serverError} />

        <Input
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
          Salvar nova senha
        </Button>
      </form>
    </div>
  )
}
