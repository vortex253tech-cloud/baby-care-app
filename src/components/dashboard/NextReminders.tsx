import { Button } from '@/components/ui/Button'

interface Reminder {
  id: string
  label: string
  time: string
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {reminder.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{reminder.time}</span>
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
              Nenhum lembrete ativo
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Configure lembretes para receber alertas
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
