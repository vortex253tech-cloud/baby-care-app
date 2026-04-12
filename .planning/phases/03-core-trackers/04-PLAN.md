---
plan: "03-core-trackers/04"
phase: 3
sequence: 4
title: "SleepPage — Sleep timer"
status: pending
requires: ["03-core-trackers/01"]
---

# Plan 04: SleepPage — Sleep timer

## Objective
Implementar o timer de sono em `SleepPage`: iniciar e encerrar uma sessão de sono, gravando na tabela `sleeps`. Um sono com `ended_at = null` representa o bebê dormindo atualmente.

## Requirements Addressed
- SLEEP-01 (iniciar registro de sono)
- SLEEP-02 (encerrar registro e salvar duração)

## Tasks

<task id="4.1" type="code">
  <title>Hook useSleepTimer</title>
  <description>
Criar `src/hooks/useSleepTimer.ts`:

- Ao montar: verifica se existe sono ativo (`ended_at IS NULL`) para o bebê
- `startSleep()`: insere row com `started_at = now()`, `ended_at = null`
- `stopSleep()`: faz update `ended_at = now()` no sono ativo
- Expõe: `activeSleep: Sleep | null`, `loading: boolean`, `elapsed: number` (segundos desde started_at, atualizado a cada segundo enquanto ativo), `startSleep`, `stopSleep`, `error`

```typescript
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Sleep } from '@/types'

export function useSleepTimer(babyId: string, userId: string) {
  const [activeSleep, setActiveSleep] = useState<Sleep | null>(null)
  const [loading, setLoading] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchActive = useCallback(async () => {
    if (!babyId) { setLoading(false); return }
    const { data } = await supabase
      .from('sleeps')
      .select('*')
      .eq('baby_id', babyId)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setActiveSleep(data as Sleep | null)
    setLoading(false)
  }, [babyId])

  useEffect(() => { fetchActive() }, [fetchActive])

  // Tick elapsed when active
  useEffect(() => {
    if (activeSleep) {
      const startMs = new Date(activeSleep.started_at).getTime()
      setElapsed(Math.floor((Date.now() - startMs) / 1000))
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startMs) / 1000))
      }, 1000)
    } else {
      setElapsed(0)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeSleep])

  async function startSleep() {
    setError(null)
    const { data, error: err } = await supabase
      .from('sleeps')
      .insert({ baby_id: babyId, user_id: userId, started_at: new Date().toISOString() })
      .select()
      .single()
    if (err) { setError(err.message); return }
    setActiveSleep(data as Sleep)
  }

  async function stopSleep(notes?: string) {
    if (!activeSleep) return
    setError(null)
    const { data, error: err } = await supabase
      .from('sleeps')
      .update({ ended_at: new Date().toISOString(), notes: notes || null })
      .eq('id', activeSleep.id)
      .select()
      .single()
    if (err) { setError(err.message); return }
    setActiveSleep(null)
    return data as Sleep
  }

  return { activeSleep, loading, elapsed, startSleep, stopSleep, error }
}
```
  </description>
  <files>
    <file action="create">src/hooks/useSleepTimer.ts</file>
  </files>
</task>

<task id="4.2" type="code">
  <title>SleepTimerCard component</title>
  <description>
Criar `src/components/sleep/SleepTimerCard.tsx`:

- Exibe estado do sono: "Bebê acordado" ou "Dormindo há MM:SS"
- Botão grande: "Registrar início do sono" (verde) quando sem sono ativo
- Quando dormindo: timer em destaque (HH:MM:SS ou MM:SS), campo de notas opcional, botão "Encerrar sono" (vermelho)
- Ao encerrar: mostra duração total no snackbar "Sono de Xh Ymin registrado!"

```typescript
import { useState } from 'react'
import type { UseSleepTimerReturn } from '@/hooks/useSleepTimer'

function formatElapsed(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, '0')}min`
  }
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

interface Props {
  activeSleep: UseSleepTimerReturn['activeSleep']
  elapsed: number
  loading: boolean
  onStart: () => void
  onStop: (notes?: string) => void
  error: string | null
}

export function SleepTimerCard({ activeSleep, elapsed, loading, onStart, onStop, error }: Props) {
  const [notes, setNotes] = useState('')

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm text-center">
        <p className="text-gray-400">Verificando…</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4">
      {/* Status icon */}
      <span className="text-5xl">{activeSleep ? '😴' : '😊'}</span>

      {activeSleep ? (
        <>
          <div className="text-center">
            <p className="text-sm text-indigo-500 font-medium">Dormindo há</p>
            <p className="text-4xl font-mono font-bold text-gray-900 dark:text-white mt-1">
              {formatElapsed(elapsed)}
            </p>
          </div>

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observações (opcional)"
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white resize-none"
          />

          <button
            onClick={() => onStop(notes || undefined)}
            className="w-full py-3 bg-red-500 text-white rounded-2xl font-semibold text-base"
          >
            Encerrar sono
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Bebê acordado</p>
          <button
            onClick={onStart}
            className="w-full py-3 bg-indigo-500 text-white rounded-2xl font-semibold text-base"
          >
            Registrar início do sono
          </button>
        </>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
```

Nota: o tipo `UseSleepTimerReturn` não é exportado pelo hook ainda — o componente usa `Props` diretas, sem depender do tipo exportado.
  </description>
  <files>
    <file action="create">src/components/sleep/SleepTimerCard.tsx</file>
  </files>
</task>

<task id="4.3" type="code">
  <title>SleepPage com timer</title>
  <description>
Substituir stub `src/pages/SleepPage.tsx`:

- Usa `useBabies()`, `useAuth()`, `useSleepTimer(babyId, userId)`
- Renderiza `<SleepTimerCard>`
- Snackbar após encerrar: "Sono de X registrado!" com auto-dismiss 3s
- Abaixo do card: placeholder "Histórico de sono — disponível em breve"

```typescript
import { useState } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useAuth } from '@/contexts/AuthContext'
import { useSleepTimer } from '@/hooks/useSleepTimer'
import { SleepTimerCard } from '@/components/sleep/SleepTimerCard'
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner'

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}min`
  return `${m}min`
}

export function SleepPage() {
  const { activeBaby, loading: babyLoading } = useBabies()
  const { user } = useAuth()
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const { activeSleep, loading, elapsed, startSleep, stopSleep, error } =
    useSleepTimer(activeBaby?.id ?? '', user?.id ?? '')

  if (babyLoading) return <FullScreenSpinner />
  if (!activeBaby || !user) return null

  async function handleStop(notes?: string) {
    const elapsedSnapshot = elapsed
    const result = await stopSleep(notes)
    if (result) {
      setSavedMsg(`Sono de ${formatDuration(elapsedSnapshot)} registrado!`)
      setTimeout(() => setSavedMsg(null), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sono</h2>

      <SleepTimerCard
        activeSleep={activeSleep}
        elapsed={elapsed}
        loading={loading}
        onStart={startSleep}
        onStop={handleStop}
        error={error}
      />

      <p className="text-sm text-gray-400 text-center mt-2">
        Histórico de sono — disponível em breve
      </p>

      {savedMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          ✓ {savedMsg}
        </div>
      )}
    </div>
  )
}
```
  </description>
  <files>
    <file action="modify">src/pages/SleepPage.tsx</file>
  </files>
</task>

## Verification
- [ ] Sem sono ativo: botão "Registrar início do sono" aparece
- [ ] Com sono ativo: timer sobe em tempo real, campo de notas visível
- [ ] Encerrar sono: salva `ended_at`, snackbar mostra duração, timer some
- [ ] Recarregar a página: sono ativo é recuperado do Supabase
- [ ] `tsc --noEmit` exits 0
