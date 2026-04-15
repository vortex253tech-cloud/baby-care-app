// ─── useTimeline — Unified activity feed ─────────────────────────────────────
// Merges feedings, sleeps, and diapers into a chronological event stream.

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Feeding, Sleep, Diaper } from '@/types'

export type TimelineEventType = 'feeding' | 'sleep' | 'diaper'

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  timestamp: string          // ISO — used for sorting
  label: string
  sublabel?: string
  icon: string
  color: string
  raw: Feeding | Sleep | Diaper
}

function feedingToEvent(f: Feeding): TimelineEvent {
  const typeLabel = f.type === 'breast' ? 'Amamentação'
    : f.type === 'bottle' ? 'Mamadeira'
    : 'Alimentação sólida'
  let sublabel: string | undefined
  if (f.type === 'breast' && f.duration_seconds) {
    sublabel = `${Math.round(f.duration_seconds / 60)} min`
  } else if (f.type === 'bottle' && f.volume_ml) {
    sublabel = `${f.volume_ml} ml`
  } else if (f.type === 'solid' && f.food_name) {
    sublabel = f.food_name
  }
  return {
    id: f.id,
    type: 'feeding',
    timestamp: f.started_at,
    label: typeLabel,
    sublabel,
    icon: '🍼',
    color: 'pink',
    raw: f,
  }
}

function sleepToEvent(s: Sleep): TimelineEvent {
  const isOngoing = !s.ended_at
  let sublabel: string | undefined
  if (!isOngoing && s.ended_at) {
    const durationSec = (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000
    const h = Math.floor(durationSec / 3600)
    const m = Math.floor((durationSec % 3600) / 60)
    sublabel = h > 0 ? `${h}h ${m}min` : `${m} min`
  } else {
    sublabel = 'Em andamento'
  }
  return {
    id: s.id,
    type: 'sleep',
    timestamp: s.started_at,
    label: 'Sono',
    sublabel,
    icon: '😴',
    color: 'indigo',
    raw: s,
  }
}

function diaperToEvent(d: Diaper): TimelineEvent {
  const label = d.type === 'wet' ? 'Fralda molhada'
    : d.type === 'dirty' ? 'Fralda suja'
    : 'Fralda mista'
  return {
    id: d.id,
    type: 'diaper',
    timestamp: d.changed_at,
    label,
    icon: '👶',
    color: 'amber',
    raw: d,
  }
}

export function useTimeline(babyId: string, limitDays = 7) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)

  const fetch = useCallback(async (days = limitDays) => {
    if (!babyId) { setLoading(false); return }

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const [feedRes, sleepRes, diaperRes] = await Promise.all([
      supabase
        .from('feedings')
        .select('*')
        .eq('baby_id', babyId)
        .gte('started_at', since)
        .order('started_at', { ascending: false })
        .limit(100),

      supabase
        .from('sleeps')
        .select('*')
        .eq('baby_id', babyId)
        .gte('started_at', since)
        .order('started_at', { ascending: false })
        .limit(100),

      supabase
        .from('diapers')
        .select('*')
        .eq('baby_id', babyId)
        .gte('changed_at', since)
        .order('changed_at', { ascending: false })
        .limit(100),
    ])

    const feedEvents = (feedRes.data ?? []).map(f => feedingToEvent(f as Feeding))
    const sleepEvents = (sleepRes.data ?? []).map(s => sleepToEvent(s as Sleep))
    const diaperEvents = (diaperRes.data ?? []).map(d => diaperToEvent(d as Diaper))

    const all = [...feedEvents, ...sleepEvents, ...diaperEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    setEvents(all)
    setHasMore(all.length >= 50)
    setLoading(false)
  }, [babyId, limitDays])

  useEffect(() => { fetch() }, [fetch])

  return { events, loading, hasMore, refetch: fetch }
}
