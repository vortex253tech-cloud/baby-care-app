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

  const reminders = dashData.hungerAlertMinutes !== null
    ? [{
        id: 'hunger',
        label: `Última mamada há ${Math.floor(dashData.hungerAlertMinutes / 60)}h ${dashData.hungerAlertMinutes % 60}min — hora de mamar?`,
        urgency: 'high' as const,
      }]
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
    </div>
  )
}
