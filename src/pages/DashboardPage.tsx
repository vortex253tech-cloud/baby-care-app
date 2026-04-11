import { useBabies } from '@/hooks/useBabies'
import { BabyHeader } from '@/components/dashboard/BabyHeader'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { DailySummary } from '@/components/dashboard/DailySummary'
import { NextReminders } from '@/components/dashboard/NextReminders'
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner'

export function DashboardPage() {
  const { activeBaby, loading } = useBabies()

  if (loading) return <FullScreenSpinner />
  if (!activeBaby) return null  // ProtectedRoute handles redirect

  return (
    <div className="flex flex-col gap-4 pb-4 px-4 pt-4">
      <BabyHeader baby={activeBaby} />
      <QuickActions />
      <DailySummary
        lastFeed={null}
        sleepHoursToday={null}
        diapersToday={null}
      />
      <NextReminders reminders={null} />
    </div>
  )
}
