import type { Diaper } from '@/types'

interface Props {
  diapers: Diaper[]
  loading: boolean
  onDelete: (id: string) => void
}

function diaperEmoji(type: Diaper['type']) {
  return type === 'wet' ? '💧' : type === 'dirty' ? '💩' : '🔄'
}

function diaperLabel(type: Diaper['type']) {
  return type === 'wet' ? 'Molhada' : type === 'dirty' ? 'Suja' : 'Molhada + Suja'
}

export function DiaperList({ diapers, loading, onDelete }: Props) {
  if (loading) return <p className="text-sm text-gray-400 text-center py-2">Carregando…</p>
  if (diapers.length === 0) return <p className="text-sm text-gray-400 text-center py-2">Nenhuma troca hoje</p>

  return (
    <ul className="flex flex-col gap-2">
      {diapers.map(d => (
        <li key={d.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
          <span className="text-xl">{diaperEmoji(d.type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {diaperLabel(d.type)}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(d.changed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Excluir este registro?')) onDelete(d.id)
            }}
            className="text-red-400 hover:text-red-600 text-lg leading-none"
            aria-label="Excluir"
          >
            🗑
          </button>
        </li>
      ))}
    </ul>
  )
}
