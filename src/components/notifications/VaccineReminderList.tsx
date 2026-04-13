import { useState } from 'react'
import { getUpcomingVaccines } from '@/data/sus-calendar'
import type { Reminder } from '@/types'

interface Props {
  birthDate: string
  existingReminders: Reminder[]
  onEnable: (vaccineId: string, name: string, dueDate: Date) => Promise<void>
  onDisable: (reminderId: string) => Promise<void>
}

export function VaccineReminderList({ birthDate, existingReminders, onEnable, onDisable }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const upcoming = getUpcomingVaccines(new Date(birthDate), 90)

  if (!upcoming.length) return (
    <p className="text-xs text-gray-400 text-center py-2">
      Nenhuma vacina prevista nos próximos 90 dias.
    </p>
  )

  function findReminder(vaccineId: string): Reminder | undefined {
    return existingReminders.find((r) => r.vaccine_id === vaccineId)
  }

  async function handleToggle(vaccineId: string, name: string, dueDate: Date) {
    setLoading(vaccineId)
    try {
      const existing = findReminder(vaccineId)
      if (existing) {
        await onDisable(existing.id)
      } else {
        await onEnable(vaccineId, name, dueDate)
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <ul className="space-y-2">
      {upcoming.map((v) => {
        const existing = findReminder(v.id)
        const daysUntil = Math.round((v.due_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        const isOverdue = daysUntil < 0

        return (
          <li
            key={v.id}
            className="flex items-start justify-between rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2 gap-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                💉 {v.name}{' '}
                <span className="font-normal text-gray-500">({v.dose})</span>
              </p>
              <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                {isOverdue
                  ? `Atrasada ${Math.abs(daysUntil)} dia${Math.abs(daysUntil) !== 1 ? 's' : ''}`
                  : daysUntil === 0
                  ? 'Hoje!'
                  : `Daqui a ${daysUntil} dia${daysUntil !== 1 ? 's' : ''}`}
                {' '}· {v.due_date.toLocaleDateString('pt-BR')}
              </p>
            </div>
            <button
              onClick={() => handleToggle(v.id, `${v.name} (${v.dose})`, v.due_date)}
              disabled={loading === v.id}
              className={`flex-shrink-0 text-xs px-3 py-1 rounded-full border font-medium transition-colors disabled:opacity-60 ${
                existing
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700'
                  : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
              }`}
            >
              {loading === v.id ? '…' : existing ? 'Ativo' : 'Ativar'}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
