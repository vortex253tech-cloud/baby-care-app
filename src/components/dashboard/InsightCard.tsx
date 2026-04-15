// ─── InsightCard — Smart daily insights widget ────────────────────────────────
import type { Insight } from '@/hooks/useInsights'

interface InsightCardProps {
  insights: Insight[]
  loading?: boolean
}

const levelStyle = {
  positive: 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800',
  warning: 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
  info: 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800',
}

const levelText = {
  positive: 'text-green-800 dark:text-green-300',
  warning: 'text-amber-800 dark:text-amber-300',
  info: 'text-blue-800 dark:text-blue-300',
}

const levelSubtext = {
  positive: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
}

export function InsightCard({ insights, loading }: InsightCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (insights.length === 0) return null

  // Show only the first 2 most relevant insights
  const visible = insights.slice(0, 2)

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1">
        Insights do dia
      </p>
      {visible.map(insight => (
        <div
          key={insight.id}
          className={`rounded-2xl border p-4 flex items-start gap-3 ${levelStyle[insight.level]}`}
        >
          <span className="text-xl flex-shrink-0 mt-0.5">{insight.icon}</span>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${levelText[insight.level]}`}>
              {insight.title}
            </p>
            <p className={`text-xs mt-0.5 ${levelSubtext[insight.level]}`}>
              {insight.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
