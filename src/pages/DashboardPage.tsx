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
    </div>
  )
}
