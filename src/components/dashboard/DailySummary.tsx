import { SummaryCard } from '@/components/dashboard/SummaryCard'

interface DailySummaryProps {
  lastFeed?: { minutesAgo: number } | null
  sleepHoursToday?: number | null
  diapersToday?: number | null
}

function formatFeedAgo(minutesAgo: number): string {
  if (minutesAgo < 60) return `${minutesAgo}min atrás`
  const h = Math.floor(minutesAgo / 60)
  const m = minutesAgo % 60
  return m > 0 ? `${h}h ${m}min atrás` : `${h}h atrás`
}

export function DailySummary({ lastFeed, sleepHoursToday, diapersToday }: DailySummaryProps) {
  const feedValue = lastFeed ? formatFeedAgo(lastFeed.minutesAgo) : '—'
  const sleepValue = sleepHoursToday != null && sleepHoursToday > 0
    ? `${sleepHoursToday.toFixed(1)}h hoje`
    : '—'
  const diapersValue = diapersToday != null && diapersToday > 0
    ? `${diapersToday} hoje`
    : '—'

  return (
    <section>
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Hoje
      </h2>
      <div className="flex flex-col gap-3">
        <SummaryCard
          icon="🤱"
          label="Última mamada"
          value={feedValue}
          color="bg-pink-100 text-pink-500"
        />
        <SummaryCard
          icon="😴"
          label="Sono"
          value={sleepValue}
          color="bg-indigo-100 text-indigo-500"
        />
        <SummaryCard
          icon="🧷"
          label="Fraldas"
          value={diapersValue}
          color="bg-amber-100 text-amber-500"
        />
      </div>
    </section>
  )
}
