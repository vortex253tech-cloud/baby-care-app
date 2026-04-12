import type { Sleep } from '@/types'

interface Props {
  sleeps: Sleep[]
  loading: boolean
  onDelete: (id: string) => void
}

function formatDuration(start: string, end: string | null): string {
  const endMs = end ? new Date(end).getTime() : Date.now()
  const totalMin = Math.round((endMs - new Date(start).getTime()) / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export function SleepList({ sleeps, loading, onDelete }: Props) {
  if (loading) return <p className="text-sm text-gray-400 text-center py-2">Carregando…</p>
  if (sleeps.length === 0) return <p className="text-sm text-gray-400 text-center py-2">Nenhum sono registrado hoje</p>

  return (
    <ul className="flex flex-col gap-2">
      {sleeps.map(s => (
        <li key={s.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
          <span className="text-xl">😴</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDuration(s.started_at, s.ended_at)}
              </p>
              {!s.ended_at && (
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  Ativo
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {new Date(s.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              {s.ended_at && ` — ${new Date(s.ended_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
          {s.ended_at && (
            <button
              onClick={() => {
                if (window.confirm('Excluir este registro?')) onDelete(s.id)
              }}
              className="text-red-400 hover:text-red-600 text-lg leading-none"
              aria-label="Excluir"
            >
              🗑
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
