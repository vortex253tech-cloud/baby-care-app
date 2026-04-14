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
