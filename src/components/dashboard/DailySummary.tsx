import { SummaryCard } from '@/components/dashboard/SummaryCard'

interface DailySummaryProps {
  lastFeed?: { minutesAgo: number; side?: string } | null
  sleepHoursToday?: number | null
  diapersToday?: number | null
}

export function DailySummary({ lastFeed, sleepHoursToday, diapersToday }: DailySummaryProps) {
  const feedValue = lastFeed ? `${lastFeed.minutesAgo}min atrás` : '—'
  const feedSubValue = lastFeed?.side

  const sleepValue = sleepHoursToday != null ? `${sleepHoursToday.toFixed(1)}h hoje` : '—'

  const diapersValue = diapersToday != null ? `${diapersToday} hoje` : '—'

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
          subValue={feedSubValue}
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
