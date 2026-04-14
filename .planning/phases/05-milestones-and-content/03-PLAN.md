---
plan: "05-milestones-and-content/03"
phase: 5
sequence: 3
wave: 2
title: "Marcar marco como conquistado + upload de foto"
status: pending
requires: ["05-milestones-and-content/02"]
files_modified:
  - src/components/milestones/AchieveModal.tsx
  - src/pages/MilestonesPage.tsx
---

# Plan 03: Marcar marco como conquistado + upload de foto

## Objective
Implementar o modal de confirmação de conquista de marco com date picker e campo de nota opcional, upload de foto para Supabase Storage (`milestone-photos/`), e destaque visual quando o bebê entra numa nova faixa etária. Substituir o placeholder do modal no Plan 02 pelo componente `AchieveModal` completo.

## Requirements Addressed
- MILE-02: Marcar marco como conquistado com data
- MILE-03: Destaque visual quando bebê atinge nova faixa de marcos
- MILE-04: Adicionar foto ao marco conquistado

## Tasks

<task id="3.1" type="code">
  <title>AchieveModal — confirmação + foto + data</title>
  <description>
Criar `src/components/milestones/AchieveModal.tsx`:

```typescript
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { MilestoneDefinition } from '@/data/milestones'
import type { BabyMilestone } from '@/types'

interface Props {
  milestone: MilestoneDefinition
  existing: BabyMilestone | undefined
  userId: string
  babyId: string
  onAchieve: (milestoneId: string, date: string, photoUrl: string | null, notes: string | null) => Promise<BabyMilestone | null>
  onUnachieve: (milestoneId: string) => Promise<void>
  onClose: () => void
}

export function AchieveModal({ milestone, existing, userId, babyId, onAchieve, onUnachieve, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(existing?.achieved_at ?? today)
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(existing?.photo_url ?? null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSave() {
    setSaving(true)
    let photoUrl = existing?.photo_url ?? null

    // Upload new photo if selected
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${userId}/${babyId}/${milestone.id}-${Date.now()}.${ext}`
      const { data: uploadData } = await supabase.storage
        .from('milestone-photos')
        .upload(path, photoFile, { upsert: true, contentType: photoFile.type })
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('milestone-photos')
          .getPublicUrl(uploadData.path)
        photoUrl = urlData.publicUrl
      }
    }

    await onAchieve(milestone.id, date, photoUrl, notes || null)
    setSaving(false)
    onClose()
  }

  async function handleUnachieve() {
    if (!window.confirm('Remover esta conquista?')) return
    setSaving(true)
    await onUnachieve(milestone.id)
    setSaving(false)
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">{milestone.icon}</span>
              {milestone.title}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{milestone.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none ml-2">×</button>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data da conquista</label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Observações (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ex: Sorriu pela primeira vez na manhã de hoje!"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm resize-none"
          />
        </div>

        {/* Photo */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Foto (opcional)</label>
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="Marco" className="w-full h-32 object-cover rounded-lg" />
              <button
                onClick={() => { setPhotoPreview(null); setPhotoFile(null) }}
                className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-gray-500 shadow"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 py-4 text-sm text-gray-400 text-center"
            >
              📷 Adicionar foto
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {existing && (
            <button
              onClick={handleUnachieve}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-500 text-sm font-medium disabled:opacity-60"
            >
              Remover
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !date}
            className="flex-1 rounded-lg bg-pink-500 text-white py-3 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? 'Salvando…' : existing ? 'Atualizar' : '🌟 Conquistado!'}
          </button>
        </div>
      </div>
    </div>
  )
}
```
  </description>
  <files>
    <file action="create">src/components/milestones/AchieveModal.tsx</file>
  </files>
</task>

<task id="3.2" type="code">
  <title>MilestonesPage — integrar AchieveModal + new-band highlight</title>
  <description>
Atualizar `src/pages/MilestonesPage.tsx`:

1. Importar `AchieveModal` e `getAchievement` do hook
2. Substituir o placeholder do modal pelo `AchieveModal` completo:

```typescript
{achieveTarget && (
  <AchieveModal
    milestone={achieveTarget}
    existing={getAchievement(achieveTarget.id)}
    userId={user!.id}
    babyId={activeBaby.id}
    onAchieve={achieve}
    onUnachieve={unachieve}
    onClose={() => setAchieveTarget(null)}
  />
)}
```

3. Adicionar destaque "Nova fase!" quando o bebê estiver na faixa atual com 0 marcos conquistados:

```typescript
{currentBand && activeBandDisplay === currentBand &&
 MILESTONES.filter(m => m.age_band === currentBand).every(m => !isAchieved(m.id)) && (
  <div className="mb-3 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-100 dark:border-pink-800 p-4 text-center">
    <div className="text-2xl mb-1">🌟</div>
    <p className="text-sm font-semibold text-pink-700 dark:text-pink-300">
      {activeBaby.name} chegou em uma nova fase!
    </p>
    <p className="text-xs text-gray-400 mt-0.5">
      {AGE_BAND_LABELS[currentBand]} — Registre os primeiros marcos!
    </p>
  </div>
)}
```
  </description>
  <files>
    <file action="modify">src/pages/MilestonesPage.tsx</file>
  </files>
</task>

<task id="3.3" type="schema">
  <title>Supabase Storage: bucket milestone-photos</title>
  <description>
Adicionar ao final de `supabase/migrations/0008_milestones.sql` o bloco de configuração do storage bucket (executar manualmente no SQL Editor caso o bucket não exista):

```sql
-- Storage bucket for milestone photos
-- Run manually in SQL Editor if the bucket doesn't exist:
/*
insert into storage.buckets (id, name, public)
values ('milestone-photos', 'milestone-photos', true)
on conflict (id) do nothing;

create policy "Users upload their milestone photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'milestone-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

create policy "Milestone photos are public" on storage.objects
  for select using (bucket_id = 'milestone-photos');

create policy "Users delete their milestone photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'milestone-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
*/
```
  </description>
  <files>
    <file action="modify">supabase/migrations/0008_milestones.sql</file>
  </files>
</task>

## Verification
- [ ] AchieveModal abre ao clicar em qualquer marco
- [ ] Salvar marco com data cria registro em baby_milestones (isAchieved retorna true)
- [ ] Marco salvo exibe ✓ e fundo rosa na lista
- [ ] Upload de foto funciona (preview imediato, URL salvo no banco)
- [ ] "Remover conquista" deleta o registro e remove destaque
- [ ] Banner "Nova fase!" exibe apenas na faixa atual sem marcos
- [ ] tsc --noEmit exits 0

## must_haves
- Photo upload usa path `{userId}/{babyId}/{milestoneId}-{timestamp}` para evitar colisões
- `date max` no input restrito a hoje (não permitir datas futuras)
- Modal fecha ao clicar fora (stopPropagation no conteúdo)
