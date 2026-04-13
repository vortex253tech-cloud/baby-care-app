import { usePushSubscription } from '@/hooks/usePushSubscription'

interface Props {
  userId: string
}

export function PushPermissionBanner({ userId }: Props) {
  const { state, subscribing, subscribe } = usePushSubscription(userId)

  if (state === 'unsupported') return (
    <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
      Notificações push não são suportadas neste navegador.
    </div>
  )

  if (state === 'granted') return (
    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
      <span>🔔</span>
      <span>Notificações push ativas neste dispositivo.</span>
    </div>
  )

  if (state === 'denied') return (
    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
      Permissão bloqueada pelo navegador. Habilite nas configurações do Chrome para receber notificações.
    </div>
  )

  // idle
  return (
    <button
      onClick={subscribe}
      disabled={subscribing}
      className="w-full rounded-lg bg-indigo-600 text-white py-3 font-medium text-sm disabled:opacity-60"
    >
      {subscribing ? 'Ativando…' : '🔔 Ativar notificações push'}
    </button>
  )
}
