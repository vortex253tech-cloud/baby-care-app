// ─── Dashboard Page — Home screen with insights & gamification ────────────────
import { Link } from 'react-router-dom'
import { useBabies } from '@/hooks/useBabies'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useInsights } from '@/hooks/useInsights'
import { useStreak } from '@/hooks/useStreak'
import { BabyHeader } from '@/components/dashboard/BabyHeader'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { DailySummary } from '@/components/dashboard/DailySummary'
import { NextReminders } from '@/components/dashboard/NextReminders'
import { InsightCard } from '@/components/dashboard/InsightCard'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner'

export function DashboardPage() {
  const { activeBaby, loading } = useBabies()
  const { data: dashData } = useDashboardData(activeBaby?.id ?? '')
  const { insights, loading: insightsLoading } = useInsights(activeBaby?.id ?? '')
  const { streak, loading: streakLoading } = useStreak(activeBaby?.id ?? '')

  if (loading) return <FullScreenSpinner />
  if (!activeBaby) return null

  const reminders = dashData.upcomingReminders.length > 0
    ? dashData.upcomingReminders
    : null

  return (
    <div className="flex flex-col gap-4 pb-4 px-4 pt-4">
      {/* Baby header with switcher */}
      <BabyHeader baby={activeBaby} />

      {/* Quick log actions */}
      <QuickActions />

      {/* Daily summary tiles */}
      <DailySummary
        lastFeed={dashData.lastFeed}
        sleepHoursToday={dashData.sleepHoursToday}
        diapersToday={dashData.diapersToday}
      />

      {/* Smart insights */}
      <InsightCard insights={insights} loading={insightsLoading} />

      {/* Streak gamification */}
      <StreakCard streak={streak} loading={streakLoading} />

      {/* Next reminders */}
      <NextReminders reminders={reminders} />

      {/* Quick navigation cards row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Stats */}
        <Link
          to="/stats"
          className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800 flex flex-col gap-2 active:scale-95 transition-transform"
        >
          <span className="text-2xl">📊</span>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Estatísticas</p>
            <p className="text-xs text-gray-400">Gráficos dos últimos 7 dias</p>
          </div>
        </Link>

        {/* Timeline */}
        <Link
          to="/timeline"
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-800 flex flex-col gap-2 active:scale-95 transition-transform"
        >
          <span className="text-2xl">📋</span>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Timeline</p>
            <p className="text-xs text-gray-400">Histórico de atividades</p>
          </div>
        </Link>
      </div>

      {/* Guide / Tips */}
      <Link
        to="/guide"
        className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-pink-100 dark:border-pink-800 flex items-center gap-3 active:scale-[0.99] transition-transform"
      >
        <span className="text-2xl">📚</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Guia da Mamãe</p>
          <p className="text-xs text-gray-400 truncate">Sono seguro, amamentação, primeiros socorros…</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Milestones link (moved from nav) */}
      <Link
        to="/milestones"
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex items-center gap-3 active:scale-[0.99] transition-transform shadow-sm"
      >
        <span className="text-2xl">⭐</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Marcos de Desenvolvimento</p>
          <p className="text-xs text-gray-400 truncate">Acompanhe as conquistas de {activeBaby.name}</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}
