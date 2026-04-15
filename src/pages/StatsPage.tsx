// ─── Stats Page — Charts & analytics ─────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useBabies } from '@/hooks/useBabies'
import { supabase } from '@/lib/supabase'
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner'

// ─── Data types ──────────────────────────────────────────────────────────────
interface DayData {
  day: string       // 'Seg', 'Ter', …
  date: string      // 'YYYY-MM-DD'
  sleep: number     // hours
  feeds: number     // count
  diapers: number   // count
}

// ─── Build last-7-days skeleton ───────────────────────────────────────────────
function buildDaySkeleton(): DayData[] {
  const SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    return {
      day: SHORT[d.getDay()],
      date: d.toISOString().slice(0, 10),
      sleep: 0,
      feeds: 0,
      diapers: 0,
    }
  })
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
  unit?: string
}

function ChartTooltip({ active, payload, label, unit = '' }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-pink-500">{p.value.toFixed(1)}{unit}</p>
      ))}
    </div>
  )
}

// ─── Stat Summary Card ────────────────────────────────────────────────────────
function StatSummary({ label, value, unit, emoji }: {
  label: string; value: string; unit: string; emoji: string
}) {
  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 text-center">
      <p className="text-xl mb-1">{emoji}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}<span className="text-xs text-gray-400 ml-0.5">{unit}</span></p>
      <p className="text-[11px] text-gray-400">{label}</p>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function StatsPage() {
  const { activeBaby, loading: babyLoading } = useBabies()
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!activeBaby) { setLoading(false); return }
    const skeleton = buildDaySkeleton()
    const since = skeleton[0].date + 'T00:00:00.000Z'

    const [feedRes, sleepRes, diaperRes] = await Promise.all([
      supabase.from('feedings').select('started_at').eq('baby_id', activeBaby.id).gte('started_at', since),
      supabase.from('sleeps').select('started_at, ended_at').eq('baby_id', activeBaby.id).gte('started_at', since),
      supabase.from('diapers').select('changed_at').eq('baby_id', activeBaby.id).gte('changed_at', since),
    ])

    const map: Record<string, DayData> = {}
    skeleton.forEach(d => { map[d.date] = { ...d } })

    // Feeds
    ;(feedRes.data ?? []).forEach(f => {
      const day = f.started_at.slice(0, 10)
      if (map[day]) map[day].feeds += 1
    })

    // Sleep
    ;(sleepRes.data ?? []).forEach(s => {
      const day = s.started_at.slice(0, 10)
      if (!map[day]) return
      const end = s.ended_at ? new Date(s.ended_at).getTime() : Date.now()
      map[day].sleep += Math.max(0, end - new Date(s.started_at).getTime()) / 3600000
    })

    // Diapers
    ;(diaperRes.data ?? []).forEach(d => {
      const day = d.changed_at.slice(0, 10)
      if (map[day]) map[day].diapers += 1
    })

    setData(Object.values(map))
    setLoading(false)
  }, [activeBaby])

  useEffect(() => { fetch() }, [fetch])

  if (babyLoading) return <FullScreenSpinner />
  if (!activeBaby) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Nenhum bebê selecionado.</p>
      </div>
    )
  }

  const avgSleep = data.length ? data.reduce((a, d) => a + d.sleep, 0) / data.length : 0
  const totalFeeds = data.reduce((a, d) => a + d.feeds, 0)
  const totalDiapers = data.reduce((a, d) => a + d.diapers, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Estatísticas</h1>
        <p className="text-xs text-gray-400 mt-0.5">Últimos 7 dias · {activeBaby.name}</p>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Summary row */}
        <div className="flex gap-2">
          <StatSummary label="Sono médio" value={avgSleep.toFixed(1)} unit="h/dia" emoji="😴" />
          <StatSummary label="Mamadas" value={String(totalFeeds)} unit="/sem" emoji="🍼" />
          <StatSummary label="Fraldas" value={String(totalDiapers)} unit="/sem" emoji="👶" />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Sleep chart */}
            <ChartCard title="Sono por dia" unit="h" emoji="😴">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip unit="h" />} />
                  <Bar dataKey="sleep" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Feed chart */}
            <ChartCard title="Mamadas por dia" unit="" emoji="🍼">
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone" dataKey="feeds"
                    stroke="#f472b6" strokeWidth={2.5}
                    dot={{ fill: '#f472b6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Diaper chart */}
            <ChartCard title="Fraldas por dia" unit="" emoji="👶">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="diapers" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </div>
    </div>
  )
}

function ChartCard({ title, emoji, children }: {
  title: string; unit: string; emoji: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {emoji} {title}
      </p>
      {children}
    </div>
  )
}
