import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useBabies } from '@/hooks/useBabies'
import { useReminders } from '@/hooks/useReminders'
import { PushPermissionBanner } from '@/components/notifications/PushPermissionBanner'
import { FeedingReminderForm } from '@/components/notifications/FeedingReminderForm'
import { MedicationReminderForm, type MedFormData } from '@/components/notifications/MedicationReminderForm'
import { MedicationReminderList } from '@/components/notifications/MedicationReminderList'
import { SilenceWindowForm } from '@/components/notifications/SilenceWindowForm'
import { VaccineReminderList } from '@/components/notifications/VaccineReminderList'

export default function NotificationsPage() {
  const { user } = useAuthContext()
  const { activeBaby } = useBabies()
  const { reminders, loading, createReminder, updateReminder, deleteReminder, toggleReminder } =
    useReminders(activeBaby?.id ?? '', user?.id ?? '')

  const [saving, setSaving] = useState(false)
  const [showMedForm, setShowMedForm] = useState(false)

  const feedingReminder = reminders.find((r) => r.type === 'feeding') ?? null
  const medReminders = reminders.filter((r) => r.type === 'medication')
  const vaccineReminders = reminders.filter((r) => r.type === 'vaccine')

  // Infer current silence window from any existing reminder
  const silenceReminder = reminders.find((r) => r.silence_start)
  const currentSilenceStart = silenceReminder?.silence_start ?? '22:00'
  const currentSilenceEnd = silenceReminder?.silence_end ?? '06:00'

  // ---------- Feeding ----------
  async function handleFeedingSave(data: { interval_hours: number }) {
    if (!activeBaby || !user) return
    setSaving(true)
    const next = new Date(Date.now() + data.interval_hours * 3600 * 1000)
    if (feedingReminder) {
      await updateReminder(feedingReminder.id, {
        interval_hours: data.interval_hours,
        next_fire_at: next.toISOString(),
      })
    } else {
      await createReminder({
        type: 'feeding',
        label: 'Hora de mamar! 🍼',
        enabled: true,
        interval_hours: data.interval_hours,
        next_fire_at: next.toISOString(),
        silence_start: currentSilenceStart,
        silence_end: currentSilenceEnd,
        medication_dose: null,
        vaccine_id: null,
        vaccine_date: null,
      })
    }
    setSaving(false)
  }

  // ---------- Medication ----------
  async function handleMedSave(data: MedFormData) {
    if (!activeBaby || !user) return
    setSaving(true)
    const next = new Date(Date.now() + data.interval_hours * 3600 * 1000)
    await createReminder({
      type: 'medication',
      label: data.label,
      enabled: true,
      interval_hours: data.interval_hours,
      next_fire_at: next.toISOString(),
      silence_start: currentSilenceStart,
      silence_end: currentSilenceEnd,
      medication_dose: data.medication_dose ?? null,
      vaccine_id: null,
      vaccine_date: null,
    })
    setSaving(false)
    setShowMedForm(false)
  }

  // ---------- Silence window ----------
  async function handleSilenceSave(start: string, end: string) {
    setSaving(true)
    // Update all existing reminders with new silence window
    await Promise.all(
      reminders.map((r) => updateReminder(r.id, { silence_start: start, silence_end: end }))
    )
    setSaving(false)
  }

  // ---------- Vaccines ----------
  async function handleVaccineEnable(vaccineId: string, name: string, dueDate: Date) {
    if (!activeBaby || !user) return
    const sevenDaysBefore = new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    const now = new Date()
    // 7-day-before reminder (only if still in the future)
    if (sevenDaysBefore > now) {
      await createReminder({
        type: 'vaccine',
        label: `Vacina em 7 dias: ${name}`,
        enabled: true,
        interval_hours: null,
        next_fire_at: sevenDaysBefore.toISOString(),
        silence_start: currentSilenceStart,
        silence_end: currentSilenceEnd,
        medication_dose: null,
        vaccine_id: vaccineId,
        vaccine_date: dueDate.toISOString().split('T')[0],
      })
    }
    // On-the-day reminder
    const onDay = new Date(dueDate)
    onDay.setHours(8, 0, 0, 0) // 8am on due date
    if (onDay > now) {
      await createReminder({
        type: 'vaccine',
        label: `Dia da vacina: ${name}`,
        enabled: true,
        interval_hours: null,
        next_fire_at: onDay.toISOString(),
        silence_start: currentSilenceStart,
        silence_end: currentSilenceEnd,
        medication_dose: null,
        vaccine_id: vaccineId,
        vaccine_date: dueDate.toISOString().split('T')[0],
      })
    }
  }

  async function handleVaccineDisable(id: string) {
    await deleteReminder(id)
  }

  // ---------- Render ----------
  if (!activeBaby) return (
    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
      Nenhum bebê selecionado.
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Notificações</h1>
        <p className="text-xs text-gray-400 mt-0.5">{activeBaby.name}</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Push permission */}
        {user && <PushPermissionBanner userId={user.id} />}

        {/* Feeding */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            🍼 Lembrete de Alimentação
          </h2>
          {!loading && (
            <FeedingReminderForm
              existing={feedingReminder}
              onSave={handleFeedingSave}
              onToggle={async (enabled) => {
                if (feedingReminder) await toggleReminder(feedingReminder.id, enabled)
              }}
              saving={saving}
            />
          )}
        </div>

        {/* Medication */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              💊 Medicamentos
            </h2>
            {!showMedForm && (
              <button
                onClick={() => setShowMedForm(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium"
              >
                + Adicionar
              </button>
            )}
          </div>
          {!loading && (
            <MedicationReminderList
              reminders={medReminders}
              onToggle={toggleReminder}
              onDelete={deleteReminder}
            />
          )}
          {showMedForm && (
            <MedicationReminderForm
              onSave={handleMedSave}
              saving={saving}
              onCancel={() => setShowMedForm(false)}
            />
          )}
        </div>

        {/* Silence window */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            🌙 Horário de Silêncio
          </h2>
          <SilenceWindowForm
            currentStart={currentSilenceStart}
            currentEnd={currentSilenceEnd}
            onSave={handleSilenceSave}
            saving={saving}
          />
        </div>

        {/* Vaccines */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            💉 Vacinas <span className="font-normal text-gray-400">(próximos 90 dias)</span>
          </h2>
          {!loading && (
            <VaccineReminderList
              birthDate={activeBaby.birth_date}
              existingReminders={vaccineReminders}
              onEnable={handleVaccineEnable}
              onDisable={handleVaccineDisable}
            />
          )}
        </div>
      </div>
    </div>
  )
}
