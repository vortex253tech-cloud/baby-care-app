import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu e-mail')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Informe sua senha'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setServerError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setServerError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
      } else {
        setServerError('E-mail ou senha incorretos.')
      }
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Bem-vinda de volta 💕
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormError message={serverError} />

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="flex flex-col gap-1.5">
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-xs text-brand-500 hover:text-brand-600 font-medium"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
          Entrar
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-400 font-medium">ou</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <GoogleAuthButton mode="login" />

      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
        Ainda não tem conta?{' '}
        <Link to="/register" className="text-brand-500 hover:text-brand-600 font-semibold">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
