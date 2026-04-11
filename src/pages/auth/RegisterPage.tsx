import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/FormError'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Nome precisa ter ao menos 2 caracteres')
      .max(80, 'Nome muito longo'),
    email: z
      .string()
      .min(1, 'Informe seu e-mail')
      .email('E-mail inválido'),
    password: z
      .string()
      .min(8, 'A senha precisa ter ao menos 8 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormData) {
    setServerError(null)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.name },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        setServerError('Este e-mail já está cadastrado. Tente entrar ou recuperar sua senha.')
      } else {
        setServerError('Erro ao criar conta. Tente novamente.')
      }
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="py-4 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-4">
          <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Verifique seu e-mail 💌
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar sua conta.
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
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Criar conta gratuita 🍼
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormError message={serverError} />

        <Input
          label="Seu nome"
          type="text"
          autoComplete="name"
          placeholder="Maria"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          hint="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth loading={isSubmitting} className="mt-2">
          Criar conta
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-400 font-medium">ou</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <GoogleAuthButton mode="register" />

      <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4 px-4">
        Ao criar uma conta, você concorda com nossos{' '}
        <span className="text-brand-500">Termos de Uso</span> e{' '}
        <span className="text-brand-500">Política de Privacidade</span>.
      </p>

      <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
        Já tem conta?{' '}
        <Link to="/login" className="text-brand-500 hover:text-brand-600 font-semibold">
          Entrar
        </Link>
      </p>
    </div>
  )
}
