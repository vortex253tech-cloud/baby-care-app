import { Link } from 'react-router-dom'
import { useBabies } from '@/hooks/useBabies'
import { useDashboardData } from '@/hooks/useDashboardData'
import { BabyHeader } from '@/components/dashboard/BabyHeader'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { DailySummary } from '@/components/dashboard/DailySummary'
import { NextReminders } from '@/components/dashboard/NextReminders'
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner'

export function DashboardPage() {
  const { activeBaby, loading } = useBabies()
  const { data: dashData } = useDashboardData(activeBaby?.id ?? '')

  if (loading) return <FullScreenSpinner />
  if (!activeBaby) return null

  // Use scheduled reminders from the reminders table.
  // upcomingReminders already includes urgency based on <= 30 min threshold.
  const reminders = dashData.upcomingReminders.length > 0
    ? dashData.upcomingReminders
    : null

  return (
    <div className="flex flex-col gap-4 pb-4 px-4 pt-4">
      <BabyHeader baby={activeBaby} />
      <QuickActions />
      <DailySummary
        lastFeed={dashData.lastFeed}
        sleepHoursToday={dashData.sleepHoursToday}
        diapersToday={dashData.diapersToday}
      />
      <NextReminders reminders={reminders} />

      {/* Tips card */}
      <Link
        to="/tips"
        className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-pink-100 dark:border-pink-800 flex items-center gap-3"
      >
        <span className="text-2xl">💡</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Dicas para você</p>
          <p className="text-xs text-gray-400 truncate">Conteúdo selecionado para a idade de {activeBaby.name}</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}
