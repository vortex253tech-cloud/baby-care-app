import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu e-mail')
    .email('E-mail inválido'),
})

type ForgotFormData = z.infer<typeof forgotSchema>

export function ForgotPasswordPage() {
  // Anti-enumeration: always show success regardless of whether email exists
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  })

  async function onSubmit(data: ForgotFormData) {
    // Fire-and-forget — we show success even if the email doesn't exist
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="py-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-4">
          <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Verifique seu e-mail
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Se existe uma conta com este e-mail, você receberá um link para redefinir sua senha em breve.
        </p>
        <Link
          to="/login"
          className="text-sm text-brand-500 hover:text-brand-600 font-semibold"
        >
          ← Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Esqueci minha senha
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Digite seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
          Enviar link de redefinição
        </Button>
      </form>

      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
        <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">
          ← Voltar para o login
        </Link>
      </p>
    </div>
  )
}
