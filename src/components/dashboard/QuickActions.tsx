import { useNavigate } from 'react-router-dom'

const ACTIONS = [
  { label: 'Mamada', emoji: '🍼', color: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30', route: '/feed' },
  { label: 'Fralda', emoji: '💧', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30', route: '/diaper' },
  { label: 'Sono',   emoji: '😴', color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30', route: '/sleep' },
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
        Registrar
      </p>
      <div className="grid grid-cols-3 gap-3">
        {ACTIONS.map(({ label, emoji, color, route }) => (
          <button
            key={route}
            onClick={() => navigate(route)}
            className="flex flex-col items-center justify-center gap-2 min-h-[80px] min-w-[80px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-95 transition-transform"
            aria-label={label}
          >
            <span className={`flex items-center justify-center w-12 h-12 rounded-full text-2xl ${color}`}>
              {emoji}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
