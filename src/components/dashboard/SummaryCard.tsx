interface SummaryCardProps {
  icon: string
  label: string
  value: string
  subValue?: string
  color: string
}

export function SummaryCard({ icon, label, value, subValue, color }: SummaryCardProps) {
  const isEmpty = value === '—'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color}`}
      >
        <span className="text-lg">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p
          className={`font-semibold leading-tight ${
            isEmpty ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'
          }`}
        >
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{subValue}</p>
        )}
      </div>
    </div>
  )
}
