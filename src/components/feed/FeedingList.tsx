import type { Feeding } from '@/types'

interface Props {
  feedings: Feeding[]
  loading: boolean
  onDelete: (id: string) => void
}

function typeIcon(type: Feeding['type']) {
  return type === 'breast' ? '🤱' : type === 'bottle' ? '🍼' : '🥣'
}

function typeDetail(f: Feeding): string {
  if (f.type === 'breast') {
    const side = f.side === 'left' ? 'Esquerdo' : f.side === 'right' ? 'Direito' : 'Ambos'
    const dur = f.duration_seconds ? ` · ${Math.round(f.duration_seconds / 60)}min` : ''
    return `Peito ${side}${dur}`
  }
  if (f.type === 'bottle') {
    const vol = f.volume_ml ? `${f.volume_ml}mL` : ''
    const milk = f.milk_type === 'breast_milk' ? 'Leite materno' : f.milk_type === 'formula' ? 'Fórmula' : 'Misto'
    return [vol, milk].filter(Boolean).join(' · ')
  }
  return f.food_name ?? 'Sólido'
}

export function FeedingList({ feedings, loading, onDelete }: Props) {
  if (loading) {
    return <p className="text-sm text-gray-400 text-center py-2">Carregando…</p>
  }
  if (feedings.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-2">Nenhum registro hoje</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {feedings.map(f => (
        <li key={f.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
          <span className="text-xl">{typeIcon(f.type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {typeDetail(f)}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(f.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Excluir este registro?')) onDelete(f.id)
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
