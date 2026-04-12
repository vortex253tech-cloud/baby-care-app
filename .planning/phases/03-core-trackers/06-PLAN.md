---
plan: "03-core-trackers/06"
phase: 3
sequence: 6
title: "DiaperPage — Quick diaper log"
status: pending
requires: ["03-core-trackers/01"]
---

# Plan 06: DiaperPage — Quick diaper log

## Objective
Implementar registro rápido de troca de fralda em `DiaperPage`: três botões grandes (Molhada / Suja / Ambas) com campo de notas opcional e gravação na tabela `diapers`.

## Requirements Addressed
- DIAP-01 (registrar troca de fralda com tipo)

## Tasks

<task id="6.1" type="code">
  <title>Hook useDiaperLog</title>
  <description>
Criar `src/hooks/useDiaperLog.ts`:

```typescript
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Diaper } from '@/types'

export interface DiaperFormData {
  type: 'wet' | 'dirty' | 'both'
  notes?: string
  changed_at?: string  // ISO — defaults to now() on DB side
}

export function useDiaperLog(babyId: string, userId: string) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function saveDiaper(data: DiaperFormData): Promise<Diaper | null> {
    setSaving(true)
    setError(null)
    const { data: row, error: err } = await supabase
      .from('diapers')
      .insert({ ...data, baby_id: babyId, user_id: userId })
      .select()
      .single()
    setSaving(false)
    if (err) { setError(err.message); return null }
    return row as Diaper
  }

  return { saveDiaper, saving, error }
}
```
  </description>
  <files>
    <file action="create">src/hooks/useDiaperLog.ts</file>
  </files>
</task>

<task id="6.2" type="code">
  <title>DiaperQuickButtons component</title>
  <description>
Criar `src/components/diaper/DiaperQuickButtons.tsx`:

- Três botões grandes (min-height 80px, WCAG touch target)
- Molhada 💧 (azul claro), Suja 💩 (âmbar), Ambas 🔄 (verde)
- Ao clicar: seleciona o tipo (estado `selected`)
- Campo de notas opcional (textarea)
- Botão "Registrar" aparece apenas quando tipo está selecionado
- Props: `onSave(type, notes?)`, `saving: boolean`

```typescript
import { useState } from 'react'
import type { Diaper } from '@/types'

interface Props {
  onSave: (type: Diaper['type'], notes?: string) => void
  saving: boolean
}

const diaperTypes = [
  { id: 'wet' as Diaper['type'], label: 'Molhada', emoji: '💧', color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300', selected: 'bg-blue-500 border-blue-500 text-white' },
  { id: 'dirty' as Diaper['type'], label: 'Suja', emoji: '💩', color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300', selected: 'bg-amber-500 border-amber-500 text-white' },
  { id: 'both' as Diaper['type'], label: 'Ambas', emoji: '🔄', color: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300', selected: 'bg-green-500 border-green-500 text-white' },
] as const

export function DiaperQuickButtons({ onSave, saving }: Props) {
  const [selected, setSelected] = useState<Diaper['type'] | null>(null)
  const [notes, setNotes] = useState('')

  function handleSave() {
    if (!selected) return
    onSave(selected, notes || undefined)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Type buttons */}
      <div className="grid grid-cols-3 gap-3">
        {diaperTypes.map(t => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            className={`flex flex-col items-center justify-center gap-2 min-h-[80px] rounded-2xl border-2 transition-colors ${
              selected === t.id ? t.selected : t.color
            }`}
          >
            <span className="text-3xl">{t.emoji}</span>
            <span className="text-sm font-semibold">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Notes */}
      {selected && (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observações (opcional)"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white resize-none"
        />
      )}

      {/* Save button */}
      {selected && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-amber-500 disabled:opacity-50 text-white rounded-2xl font-semibold text-base"
        >
          {saving ? 'Salvando…' : 'Registrar troca'}
        </button>
      )}
    </div>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/diaper/DiaperQuickButtons.tsx</file>
  </files>
</task>

<task id="6.3" type="code">
  <title>DiaperPage com registro rápido</title>
  <description>
Substituir stub `src/pages/DiaperPage.tsx`:

- Usa `useBabies()`, `useAuth()`, `useDiaperLog(babyId, userId)`
- Renderiza `<DiaperQuickButtons>`
- Após salvar: snackbar âmbar "Fralda registrada!", reset do componente via `key` counter
- Placeholder "Histórico de fraldas — disponível em breve"

```typescript
import { useState } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useAuth } from '@/contexts/AuthContext'
import { useDiaperLog } from '@/hooks/useDiaperLog'
import { DiaperQuickButtons } from '@/components/diaper/DiaperQuickButtons'
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner'
import type { Diaper } from '@/types'

export function DiaperPage() {
  const { activeBaby, loading: babyLoading } = useBabies()
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [formKey, setFormKey] = useState(0)

  const { saveDiaper, saving, error } = useDiaperLog(
    activeBaby?.id ?? '',
    user?.id ?? '',
  )

  if (babyLoading) return <FullScreenSpinner />
  if (!activeBaby || !user) return null

  async function handleSave(type: Diaper['type'], notes?: string) {
    const result = await saveDiaper({ type, notes })
    if (result) {
      setSaved(true)
      setFormKey(k => k + 1)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fraldas</h2>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
        <DiaperQuickButtons key={formKey} onSave={handleSave} saving={saving} />
        {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
      </div>

      <p className="text-sm text-gray-400 text-center mt-2">
        Histórico de fraldas — disponível em breve
      </p>

      {saved && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          ✓ Fralda registrada!
        </div>
      )}
    </div>
  )
}
```
  </description>
  <files>
    <file action="modify">src/pages/DiaperPage.tsx</file>
  </files>
</task>

## Verification
- [ ] Três botões grandes com cores corretas visíveis em `DiaperPage`
- [ ] Clicar seleciona (destaque visual), campo de notas e botão aparecem
- [ ] Salvar: snackbar âmbar, botões resetam para estado inicial
- [ ] `tsc --noEmit` exits 0
