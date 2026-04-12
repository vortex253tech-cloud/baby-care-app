---
plan: "03-core-trackers/02"
phase: 3
sequence: 2
title: "FeedPage — Breast & Bottle logging"
status: pending
requires: ["03-core-trackers/01"]
---

# Plan 02: FeedPage — Breast & Bottle logging

## Objective
Implementar o formulário de registro de mamada (peito e mamadeira) na `FeedPage`, com hook `useFeedLog` que grava na tabela `feedings`.

## Requirements Addressed
- FEED-01 (registrar mamada no peito com lado e duração)
- FEED-02 (registrar mamadeira com volume e tipo de leite)

## Tasks

<task id="2.1" type="code">
  <title>Hook useFeedLog</title>
  <description>
Criar `src/hooks/useFeedLog.ts`:

```typescript
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Feeding } from '@/types'

export interface FeedFormData {
  type: 'breast' | 'bottle' | 'solid'
  side?: 'left' | 'right' | 'both'
  duration_seconds?: number
  volume_ml?: number
  milk_type?: 'breast_milk' | 'formula' | 'mixed'
  food_name?: string
  amount_g?: number
  notes?: string
  started_at: string   // ISO
  ended_at?: string    // ISO
}

export function useFeedLog(babyId: string, userId: string) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveFeeding(data: FeedFormData): Promise<Feeding | null> {
    setSaving(true)
    setError(null)
    const { data: row, error: err } = await supabase
      .from('feedings')
      .insert({ ...data, baby_id: babyId, user_id: userId })
      .select()
      .single()
    setSaving(false)
    if (err) { setError(err.message); return null }
    return row as Feeding
  }

  return { saveFeeding, saving, error }
}
```
  </description>
  <files>
    <file action="create">src/hooks/useFeedLog.ts</file>
  </files>
</task>

<task id="2.2" type="code">
  <title>BreastFeedForm component</title>
  <description>
Criar `src/components/feed/BreastFeedForm.tsx`:

- Props: `onSave: (data: FeedFormData) => void`, `saving: boolean`
- Side selector: três botões pill (Esquerdo / Direito / Ambos), valor padrão 'left'
- Timer integrado: botão "Iniciar" → conta segundos → botão "Parar" (salva `duration_seconds`); se não usar timer, campo numérico manual em minutos (converte para segundos)
- Textarea `notes` opcional (2 linhas)
- Botão "Salvar mamada" (disabled enquanto `saving`)
- `started_at` = `new Date().toISOString()` no momento de salvar
- Usa react-hook-form + zod (side required, duration_seconds optional int)

```typescript
import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FeedFormData } from '@/hooks/useFeedLog'

const schema = z.object({
  side: z.enum(['left', 'right', 'both']),
  duration_manual_min: z.coerce.number().int().nonnegative().optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  onSave: (data: FeedFormData) => void
  saving: boolean
}

export function BreastFeedForm({ onSave, saving }: Props) {
  const [timerActive, setTimerActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { side: 'left' },
  })

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  function startTimer() {
    startRef.current = Date.now() - elapsed * 1000
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current!) / 1000))
    }, 1000)
    setTimerActive(true)
  }

  function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimerActive(false)
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  function onSubmit(values: FormValues) {
    const duration_seconds = elapsed > 0
      ? elapsed
      : values.duration_manual_min ? values.duration_manual_min * 60 : undefined
    onSave({
      type: 'breast',
      side: values.side,
      duration_seconds,
      notes: values.notes || undefined,
      started_at: new Date().toISOString(),
    })
  }

  const side = watch('side')
  const sides = [
    { value: 'left', label: 'Esquerdo' },
    { value: 'right', label: 'Direito' },
    { value: 'both', label: 'Ambos' },
  ] as const

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Side selector */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lado</p>
        <div className="flex gap-2">
          {sides.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setValue('side', s.value)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                side === s.value
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timer */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duração</p>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-mono text-gray-900 dark:text-white w-20">
            {formatTime(elapsed)}
          </span>
          {!timerActive ? (
            <button type="button" onClick={startTimer}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-xl text-sm font-medium">
              Iniciar
            </button>
          ) : (
            <button type="button" onClick={stopTimer}
              className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium">
              Parar
            </button>
          )}
        </div>
        {elapsed === 0 && (
          <div className="mt-2">
            <input
              type="number"
              placeholder="Ou informe minutos manualmente"
              {...register('duration_manual_min')}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <textarea
          {...register('notes')}
          placeholder="Observações (opcional)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-pink-500 disabled:opacity-50 text-white rounded-2xl font-semibold text-base"
      >
        {saving ? 'Salvando…' : 'Salvar mamada'}
      </button>
    </form>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/feed/BreastFeedForm.tsx</file>
  </files>
</task>

<task id="2.3" type="code">
  <title>BottleFeedForm component</title>
  <description>
Criar `src/components/feed/BottleFeedForm.tsx`:

- Volume em mL: input numérico required (0–500)
- Tipo de leite: 3 botões pill (Leite materno / Fórmula / Misto)
- Textarea notas opcional
- Botão "Salvar mamadeira"

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FeedFormData } from '@/hooks/useFeedLog'

const schema = z.object({
  volume_ml: z.coerce.number().int().min(1, 'Informe o volume').max(500),
  milk_type: z.enum(['breast_milk', 'formula', 'mixed']),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  onSave: (data: FeedFormData) => void
  saving: boolean
}

export function BottleFeedForm({ onSave, saving }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { milk_type: 'breast_milk' },
  })

  const milkType = watch('milk_type')
  const milkOptions = [
    { value: 'breast_milk', label: 'Leite materno' },
    { value: 'formula', label: 'Fórmula' },
    { value: 'mixed', label: 'Misto' },
  ] as const

  function onSubmit(values: FormValues) {
    onSave({
      type: 'bottle',
      volume_ml: values.volume_ml,
      milk_type: values.milk_type,
      notes: values.notes || undefined,
      started_at: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Volume */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Volume (mL)
        </label>
        <input
          type="number"
          {...register('volume_ml')}
          placeholder="Ex: 120"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />
        {errors.volume_ml && (
          <p className="text-xs text-red-500 mt-1">{errors.volume_ml.message}</p>
        )}
      </div>

      {/* Milk type */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de leite</p>
        <div className="flex gap-2">
          {milkOptions.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => setValue('milk_type', m.value)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                milkType === m.value
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <textarea
        {...register('notes')}
        placeholder="Observações (opcional)"
        rows={2}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white resize-none"
      />

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-pink-500 disabled:opacity-50 text-white rounded-2xl font-semibold text-base"
      >
        {saving ? 'Salvando…' : 'Salvar mamadeira'}
      </button>
    </form>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/feed/BottleFeedForm.tsx</file>
  </files>
</task>

<task id="2.4" type="code">
  <title>FeedPage com abas Peito / Mamadeira / Sólido</title>
  <description>
Substituir stub `src/pages/FeedPage.tsx`:

- Usa `useBabies()` para obter `activeBaby`
- Usa `useAuth()` para obter `user`
- Usa `useFeedLog(babyId, userId)`
- Três abas: "Peito" | "Mamadeira" | "Sólido"
- Peito e Mamadeira são implementados aqui (Plan 02)
- Sólido é placeholder `<p>Disponível em breve</p>` (Plan 03)
- Após salvar com sucesso: toast/snack verde "Mamada registrada!" e reset do formulário
- Snackbar simples: estado `saved` boolean com auto-dismiss após 2 segundos

```typescript
import { useState } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useAuth } from '@/contexts/AuthContext'
import { useFeedLog } from '@/hooks/useFeedLog'
import { BreastFeedForm } from '@/components/feed/BreastFeedForm'
import { BottleFeedForm } from '@/components/feed/BottleFeedForm'
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner'
import type { FeedFormData } from '@/hooks/useFeedLog'

type Tab = 'breast' | 'bottle' | 'solid'

export function FeedPage() {
  const { activeBaby, loading: babyLoading } = useBabies()
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('breast')
  const [saved, setSaved] = useState(false)
  const [formKey, setFormKey] = useState(0) // force remount to reset form

  const { saveFeeding, saving, error } = useFeedLog(
    activeBaby?.id ?? '',
    user?.id ?? '',
  )

  if (babyLoading) return <FullScreenSpinner />
  if (!activeBaby || !user) return null

  async function handleSave(data: FeedFormData) {
    const result = await saveFeeding(data)
    if (result) {
      setSaved(true)
      setFormKey(k => k + 1)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const tabs = [
    { id: 'breast' as Tab, label: '🤱 Peito' },
    { id: 'bottle' as Tab, label: '🍼 Mamadeira' },
    { id: 'solid' as Tab, label: '🥣 Sólido' },
  ]

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Alimentação</h2>

      {/* Tab bar */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 gap-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Form area */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        {tab === 'breast' && (
          <BreastFeedForm key={`breast-${formKey}`} onSave={handleSave} saving={saving} />
        )}
        {tab === 'bottle' && (
          <BottleFeedForm key={`bottle-${formKey}`} onSave={handleSave} saving={saving} />
        )}
        {tab === 'solid' && (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            Registro de alimentos sólidos — disponível em breve
          </p>
        )}
        {error && (
          <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
        )}
      </div>

      {/* Snackbar */}
      {saved && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          ✓ Mamada registrada!
        </div>
      )}
    </div>
  )
}
```
  </description>
  <files>
    <file action="modify">src/pages/FeedPage.tsx</file>
  </files>
</task>

## Verification
- [ ] `BreastFeedForm` mostra seletor de lado e timer; salva com `type: 'breast'`
- [ ] `BottleFeedForm` valida volume > 0; salva com `type: 'bottle'`
- [ ] `FeedPage` exibe 3 abas; aba Sólido mostra placeholder
- [ ] Após salvar: snackbar verde aparece e formulário é resetado
- [ ] `tsc --noEmit` exits 0
