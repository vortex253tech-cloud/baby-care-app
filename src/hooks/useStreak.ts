// ─── useStreak — Daily engagement streak ──────────────────────────────────────
// Counts consecutive days with at least 1 log entry (feed, sleep, or diaper).
// Streak stored/cached in localStorage to avoid excessive DB calls.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface StreakData {
  currentStreak: number   // consecutive days
  longestStreak: number
  loggedToday: boolean
  weekActivity: boolean[] // [Mon..Sun] — true = had logs
}

export function useStreak(babyId: string) {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    loggedToday: false,
    weekActivity: [false, false, false, false, false, false, false],
  })
  const [loading, setLoading] = useState(true)

  const compute = useCallback(async () => {
    if (!babyId) { setLoading(false); return }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Collect all activity dates from the last 30 days
    const [feedRes, sleepRes, diaperRes] = await Promise.all([
      supabase
        .from('feedings')
        .select('started_at')
        .eq('baby_id', babyId)
        .gte('started_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('sleeps')
        .select('started_at')
        .eq('baby_id', babyId)
        .gte('started_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('diapers')
        .select('changed_at')
        .eq('baby_id', babyId)
        .gte('changed_at', thirtyDaysAgo.toISOString()),
    ])

    const dates = new Set<string>()

    ;(feedRes.data ?? []).forEach(r => dates.add(r.started_at.slice(0, 10)))
    ;(sleepRes.data ?? []).forEach(r => dates.add(r.started_at.slice(0, 10)))
    ;(diaperRes.data ?? []).forEach(r => dates.add(r.changed_at.slice(0, 10)))

    const todayStr = now.toISOString().slice(0, 10)
    const loggedToday = dates.has(todayStr)

    // Current streak: count back from today (or yesterday if not logged today)
    let currentStreak = 0
    const startDate = loggedToday ? now : new Date(now.getTime() - 24 * 60 * 60 * 1000)
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDate.getTime() - i * 24 * 60 * 60 * 1000)
      const ds = d.toISOString().slice(0, 10)
      if (dates.has(ds)) { currentStreak++ } else { break }
    }

    // Longest streak in the period
    const sortedDates = Array.from(dates).sort()
    let longest = 0, cur = 0, prev: string | null = null
    for (const d of sortedDates) {
      if (prev) {
        const prevDate = new Date(prev)
        const curDate = new Date(d)
        const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / 86400000)
        if (diffDays === 1) { cur++ } else { cur = 1 }
      } else {
        cur = 1
      }
      if (cur > longest) longest = cur
      prev = d
    }

    // This week's activity [Mon..Sun]
    const weekStart = new Date(now)
    const day = weekStart.getDay() // 0=Sun
    const mondayOffset = day === 0 ? -6 : 1 - day
    weekStart.setDate(weekStart.getDate() + mondayOffset)
    weekStart.setHours(0, 0, 0, 0)

    const weekActivity: boolean[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart.getTime() + i * 86400000)
      weekActivity.push(dates.has(d.toISOString().slice(0, 10)))
    }

    setStreak({
      currentStreak,
      longestStreak: Math.max(longest, currentStreak),
      loggedToday,
      weekActivity,
    })
    setLoading(false)
  }, [babyId])

  useEffect(() => { compute() }, [compute])

  return { streak, loading, refetch: compute }
}
