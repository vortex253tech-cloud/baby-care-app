// ─── StreakCard — Daily engagement streak gamification widget ─────────────────
import type { StreakData } from '@/hooks/useStreak'

interface StreakCardProps {
  streak: StreakData
  loading?: boolean
}

const DAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export function StreakCard({ streak, loading }: StreakCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3" />
        <div className="flex gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
              {streak.currentStreak} {streak.currentStreak === 1 ? 'dia' : 'dias'} seguidos
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Recorde: {streak.longestStreak} {streak.longestStreak === 1 ? 'dia' : 'dias'}
            </p>
          </div>
        </div>
        {streak.loggedToday ? (
          <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
            ✓ Hoje
          </span>
        ) : (
          <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full">
            Registre hoje!
          </span>
        )}
      </div>

      {/* Week dots */}
      <div className="flex gap-1">
        {streak.weekActivity.map((active, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full h-2 rounded-full transition-colors ${
                active
                  ? 'bg-amber-500 dark:bg-amber-400'
                  : 'bg-amber-200 dark:bg-amber-800'
              }`}
            />
            <span className="text-[9px] font-medium text-amber-600 dark:text-amber-500">
              {DAY_LABELS[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
