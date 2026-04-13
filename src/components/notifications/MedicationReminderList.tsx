import type { Reminder } from '@/types'

interface Props {
  reminders: Reminder[]
  onToggle: (id: string, enabled: boolean) => Promise<Reminder | null>
  onDelete: (id: string) => Promise<void>
}

export function MedicationReminderList({ reminders, onToggle, onDelete }: Props) {
  if (!reminders.length) return (
    <p className="text-xs text-gray-400 text-center py-2">Nenhum medicamento configurado.</p>
  )

  return (
    <ul className="space-y-2">
      {reminders.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2 gap-2"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              💊 {r.label}
            </p>
            <p className="text-xs text-gray-400">
              {r.medication_dose ? `${r.medication_dose} · ` : ''}a cada {r.interval_hours}h
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            {/* Toggle */}
            <button
              onClick={() => onToggle(r.id, !r.enabled)}
              aria-label={r.enabled ? 'Desativar' : 'Ativar'}
              className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${
                r.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  r.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            {/* Delete */}
            <button
              onClick={() => {
                if (window.confirm('Remover este medicamento?')) onDelete(r.id)
              }}
              aria-label="Remover medicamento"
              className="text-gray-400 hover:text-red-500 text-xl leading-none w-6 text-center"
            >
              ×
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
