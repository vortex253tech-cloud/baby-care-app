// ─── useInsights — Pattern detection & smart insights ─────────────────────────
// Analyzes last 7 days of data and produces human-readable insights.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface Insight {
  id: string
  type: 'sleep' | 'feeding' | 'diaper' | 'milestone' | 'general'
  level: 'info' | 'warning' | 'positive'
  title: string
  body: string
  icon: string
}

export function useInsights(babyId: string) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  const analyze = useCallback(async () => {
    if (!babyId) { setLoading(false); return }

    const now = new Date()
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [feedsRes, sleepRes, diaperRes] = await Promise.all([
      supabase
        .from('feedings')
        .select('started_at')
        .eq('baby_id', babyId)
        .gte('started_at', sevenDaysAgo.toISOString())
        .order('started_at', { ascending: false }),

      supabase
        .from('sleeps')
        .select('started_at, ended_at')
        .eq('baby_id', babyId)
        .gte('started_at', sevenDaysAgo.toISOString()),

      supabase
        .from('diapers')
        .select('changed_at')
        .eq('baby_id', babyId)
        .gte('changed_at', sevenDaysAgo.toISOString()),
    ])

    const results: Insight[] = []

    // ── Sleep insights ────────────────────────────────────────────────────────
    const sleepRows = sleepRes.data ?? []

    // Today's sleep
    const todaySleeps = sleepRows.filter(
      s => new Date(s.started_at) >= todayStart
    )
    const todaySleepSec = todaySleeps.reduce((acc, s) => {
      const end = s.ended_at ? new Date(s.ended_at).getTime() : now.getTime()
      return acc + Math.max(0, end - new Date(s.started_at).getTime()) / 1000
    }, 0)
    const todaySleepHours = todaySleepSec / 3600

    // Average daily sleep (last 7 days)
    const dailySleepMap: Record<string, number> = {}
    sleepRows.forEach(s => {
      const day = s.started_at.slice(0, 10)
      const end = s.ended_at ? new Date(s.ended_at).getTime() : now.getTime()
      const sec = Math.max(0, end - new Date(s.started_at).getTime()) / 1000
      dailySleepMap[day] = (dailySleepMap[day] ?? 0) + sec
    })
    const sleepDays = Object.values(dailySleepMap)
    const avgSleepHours = sleepDays.length > 0
      ? sleepDays.reduce((a, b) => a + b, 0) / sleepDays.length / 3600
      : 0

    if (todaySleepHours > 0 && avgSleepHours > 0) {
      const diff = todaySleepHours - avgSleepHours
      if (diff < -1.5) {
        results.push({
          id: 'sleep-below',
          type: 'sleep',
          level: 'warning',
          icon: '😴',
          title: 'Menos sono que o habitual',
          body: `Hoje ${todaySleepHours.toFixed(1)}h de sono vs média de ${avgSleepHours.toFixed(1)}h.`,
        })
      } else if (diff > 1.5) {
        results.push({
          id: 'sleep-above',
          type: 'sleep',
          level: 'info',
          icon: '💤',
          title: 'Mais sono hoje',
          body: `Hoje ${todaySleepHours.toFixed(1)}h de sono. Bebês crescem dormindo!`,
        })
      } else {
        results.push({
          id: 'sleep-normal',
          type: 'sleep',
          level: 'positive',
          icon: '🌙',
          title: 'Sono em dia',
          body: `${todaySleepHours.toFixed(1)}h de sono hoje — dentro da média habitual.`,
        })
      }
    }

    // ── Feeding insights ──────────────────────────────────────────────────────
    const feedRows = feedsRes.data ?? []
    const todayFeeds = feedRows.filter(f => new Date(f.started_at) >= todayStart)

    if (feedRows.length > 0) {
      const lastFeed = feedRows[0]
      const minSinceLastFeed = Math.floor(
        (now.getTime() - new Date(lastFeed.started_at).getTime()) / 60000
      )

      if (minSinceLastFeed >= 240) {
        results.push({
          id: 'hunger-alert',
          type: 'feeding',
          level: 'warning',
          icon: '🍼',
          title: 'Hora de mamar?',
          body: `Última mamada há ${Math.floor(minSinceLastFeed / 60)}h${minSinceLastFeed % 60 > 0 ? ` ${minSinceLastFeed % 60}min` : ''}.`,
        })
      } else if (todayFeeds.length >= 8) {
        results.push({
          id: 'feeding-good',
          type: 'feeding',
          level: 'positive',
          icon: '🌟',
          title: 'Alimentação em dia',
          body: `${todayFeeds.length} mamadas hoje. Ótimo!`,
        })
      }
    } else if (feedRows.length === 0) {
      results.push({
        id: 'no-feeds',
        type: 'feeding',
        level: 'warning',
        icon: '🍼',
        title: 'Sem registros de mamada',
        body: 'Registre as mamadas para acompanhar o padrão de alimentação.',
      })
    }

    // ── Diaper insights ───────────────────────────────────────────────────────
    const diaperRows = diaperRes.data ?? []
    const todayDiapers = diaperRows.filter(
      d => new Date(d.changed_at) >= todayStart
    ).length

    if (todayDiapers >= 6) {
      results.push({
        id: 'diaper-normal',
        type: 'diaper',
        level: 'positive',
        icon: '✅',
        title: 'Fraldas em dia',
        body: `${todayDiapers} trocas hoje — sinal de boa hidratação.`,
      })
    } else if (todayDiapers <= 3 && diaperRows.length > 0) {
      results.push({
        id: 'diaper-low',
        type: 'diaper',
        level: 'info',
        icon: '💧',
        title: 'Poucas trocas hoje',
        body: `${todayDiapers} fraldas até agora. Bebês devem molhar 6-8 fraldas por dia.`,
      })
    }

    // ── Daily summary insight ─────────────────────────────────────────────────
    if (results.length === 0) {
      results.push({
        id: 'all-good',
        type: 'general',
        level: 'positive',
        icon: '💕',
        title: 'Tudo bem por aqui!',
        body: 'Continue registrando para receber insights personalizados.',
      })
    }

    setInsights(results)
    setLoading(false)
  }, [babyId])

  useEffect(() => { analyze() }, [analyze])

  return { insights, loading, refetch: analyze }
}
