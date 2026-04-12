---
plan: "03-core-trackers/03"
phase: 3
sequence: 3
title: "FeedPage — Solid food form + feeding history list"
status: pending
requires: ["03-core-trackers/02"]
---

# Plan 03: FeedPage — Solid food form + feeding history list

## Objective
Implementar a aba de alimentos sólidos no `FeedPage` e adicionar a lista de mamadas do dia com possibilidade de exclusão.

## Requirements Addressed
- FEED-03 (registrar alimentos sólidos)
- FEED-04 (listar e excluir registros do dia)

## Tasks

<task id="3.1" type="code">
  <title>SolidFeedForm component</title>
  <description>
Criar `src/components/feed/SolidFeedForm.tsx`:

- Campo `food_name` text required (ex: "Purê de batata")
- Campo `amount_g` número opcional (gramas)
- Textarea notas opcional
- Botão "Salvar refeição"

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { FeedFormData } from '@/hooks/useFeedLog'

const schema = z.object({
  food_name: z.string().min(1, 'Informe o alimento'),
  amount_g: z.coerce.number().int().nonnegative().optional().or(z.literal('')).transform(v => v === '' ? undefined : v as number | undefined),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  onSave: (data: FeedFormData) => void
  saving: boolean
}

export function SolidFeedForm({ onSave, saving }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function onSubmit(values: FormValues) {
    onSave({
      type: 'solid',
      food_name: values.food_name,
      amount_g: values.amount_g as number | undefined,
      notes: values.notes || undefined,
      started_at: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Alimento
        </label>
        <input
          type="text"
          {...register('food_name')}
          placeholder="Ex: Purê de batata"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />
        {errors.food_name && (
          <p className="text-xs text-red-500 mt-1">{errors.food_name.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Quantidade (g) — opcional
        </label>
        <input
          type="number"
          {...register('amount_g')}
          placeholder="Ex: 80"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
        />
      </div>

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
        {saving ? 'Salvando…' : 'Salvar refeição'}
      </button>
    </form>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/feed/SolidFeedForm.tsx</file>
  </files>
</task>

<task id="3.2" type="code">
  <title>Hook useFeedingList</title>
  <description>
Criar `src/hooks/useFeedingList.ts`:

- Busca feedings do bebê do dia atual (started_at >= hoje 00:00)
- Ordenadas por started_at desc
- Expõe `deleteFeeding(id)` que remove da tabela
- Re-fetcha automaticamente a lista após deleção

```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Feeding } from '@/types'

export function useFeedingList(babyId: string) {
  const [feedings, setFeedings] = useState<Feeding[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeedings = useCallback(async () => {
    if (!babyId) { setLoading(false); return }
    setLoading(true)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('feedings')
      .select('*')
      .eq('baby_id', babyId)
      .gte('started_at', todayStart.toISOString())
      .order('started_at', { ascending: false })
    setFeedings((data as Feeding[]) ?? [])
    setLoading(false)
  }, [babyId])

  useEffect(() => { fetchFeedings() }, [fetchFeedings])

  async function deleteFeeding(id: string) {
    await supabase.from('feedings').delete().eq('id', id)
    setFeedings(prev => prev.filter(f => f.id !== id))
  }

  return { feedings, loading, refetch: fetchFeedings, deleteFeeding }
}
```
  </description>
  <files>
    <file action="create">src/hooks/useFeedingList.ts</file>
  </files>
</task>

<task id="3.3" type="code">
  <title>FeedingList component</title>
  <description>
Criar `src/components/feed/FeedingList.tsx`:

- Recebe `feedings: Feeding[]`, `loading: boolean`, `onDelete: (id: string) => void`
- Se loading: spinner de linha
- Se lista vazia: texto "Nenhum registro hoje"
- Para cada item: ícone por tipo (🤱 peito, 🍼 mamadeira, 🥣 sólido) + hora formatada + detalhe (duração em min / volume mL / nome do alimento) + botão lixeira vermelho com confirmação inline (`confirm`)

```typescript
import type { Feeding } from '@/types'

interface Props {
  feedings: Feeding[]
  loading: boolean
  onDelete: (id: string) => void
}

function typeIcon(type: Feeding['type']) {
  return type === 'breast' ? '🤱' : type === 'bottle' ? '🍼' : '🥣'
}

function typeDetail(f: Feeding): string {
  if (f.type === 'breast') {
    const side = f.side === 'left' ? 'Esquerdo' : f.side === 'right' ? 'Direito' : 'Ambos'
    const dur = f.duration_seconds ? ` · ${Math.round(f.duration_seconds / 60)}min` : ''
    return `Peito ${side}${dur}`
  }
  if (f.type === 'bottle') {
    const vol = f.volume_ml ? `${f.volume_ml}mL` : ''
    const milk = f.milk_type === 'breast_milk' ? 'Leite materno' : f.milk_type === 'formula' ? 'Fórmula' : 'Misto'
    return [vol, milk].filter(Boolean).join(' · ')
  }
  return f.food_name ?? 'Sólido'
}

export function FeedingList({ feedings, loading, onDelete }: Props) {
  if (loading) {
    return <p className="text-sm text-gray-400 text-center py-2">Carregando…</p>
  }
  if (feedings.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-2">Nenhum registro hoje</p>
  }

  return (
    <ul className="flex flex-col gap-2">
      {feedings.map(f => (
        <li key={f.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
          <span className="text-xl">{typeIcon(f.type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {typeDetail(f)}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(f.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Excluir este registro?')) onDelete(f.id)
            }}
            className="text-red-400 hover:text-red-600 text-lg leading-none"
            aria-label="Excluir"
          >
            🗑
          </button>
        </li>
      ))}
    </ul>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/feed/FeedingList.tsx</file>
  </files>
</task>

<task id="3.4" type="code">
  <title>Atualizar FeedPage para incluir SolidFeedForm e FeedingList</title>
  <description>
Modificar `src/pages/FeedPage.tsx`:

1. Importar `SolidFeedForm`, `useFeedingList`, `FeedingList`
2. Trocar placeholder da aba Sólido por `<SolidFeedForm>`
3. Adicionar seção "Hoje" abaixo das abas com `<FeedingList>`
4. Após salvar, chamar `refetch()` do `useFeedingList`

Estrutura da página após mudança:
```
<div gap-4>
  <h2>Alimentação</h2>
  <TabBar />
  <FormCard>  ← BreastFeedForm | BottleFeedForm | SolidFeedForm
  <SectionTitle>Hoje</SectionTitle>
  <FeedingList />
  <Snackbar />
</div>
```

O hook `useFeedingList` é chamado no nível do `FeedPage`. O `handleSave` chama `refetch()` após salvar com sucesso.
  </description>
  <files>
    <file action="modify">src/pages/FeedPage.tsx</file>
  </files>
</task>

## Verification
- [ ] Aba Sólido: salva `food_name` e `amount_g` corretos
- [ ] `FeedingList` exibe registros do dia com ícone, hora e detalhe
- [ ] Botão lixeira: abre confirm nativo → exclui e remove da lista
- [ ] Salvar qualquer tipo atualiza a lista imediatamente
- [ ] `tsc --noEmit` exits 0
