import { Button } from '@/components/ui/Button'

interface Reminder {
  id: string
  label: string
  urgency: 'high' | 'normal'
}

interface NextRemindersProps {
  reminders?: Array<Reminder> | null
}

export function NextReminders({ reminders }: NextRemindersProps) {
  const hasReminders = reminders && reminders.length > 0

  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Próximos lembretes
      </h2>
      {hasReminders ? (
        <div className="flex flex-col gap-2">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`rounded-2xl p-4 shadow-sm flex items-center gap-3 ${
                reminder.urgency === 'high'
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <span className="text-xl">{reminder.urgency === 'high' ? '🍼' : '🔔'}</span>
              <span className={`text-sm font-medium ${
                reminder.urgency === 'high'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {reminder.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-2xl text-gray-400">🔔</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sem lembretes no momento
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Alertas aparecerão aqui conforme os registros
            </p>
          </div>
          <Button variant="ghost" size="sm">
            Configurar
          </Button>
        </div>
      )}
    </section>
  )
}
