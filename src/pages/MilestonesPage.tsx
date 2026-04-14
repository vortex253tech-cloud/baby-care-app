import { useMemo, useState } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useAuthContext } from '@/contexts/AuthContext'
import { useMilestones } from '@/hooks/useMilestones'
import { AchieveModal } from '@/components/milestones/AchieveModal'
import { MilestoneTimeline } from '@/components/milestones/MilestoneTimeline'
import {
  AGE_BANDS,
  AGE_BAND_LABELS,
  MILESTONES,
  getAgeBand,
  type AgeBand,
  type MilestoneDefinition,
} from '@/data/milestones'

export default function MilestonesPage() {
  const { activeBaby } = useBabies()
  const { user } = useAuthContext()
  const { milestones, loading, achieve, unachieve, isAchieved, getAchievement } = useMilestones(
    activeBaby?.id ?? '',
    user?.id ?? ''
  )
  const [selectedBand, setSelectedBand] = useState<AgeBand | null>(null)
  const [achieveTarget, setAchieveTarget] = useState<MilestoneDefinition | null>(null)
  const [view, setView] = useState<'list' | 'timeline'>('list')
  const [timelineFilter, setTimelineFilter] = useState<AgeBand | 'all'>('all')

  if (!activeBaby) return (
    <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Nenhum bebê selecionado.</div>
  )

  // Calculate current age band
  const birthDate = new Date(activeBaby.birth_date)
  const ageDays = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24))
  const currentBand = getAgeBand(ageDays)

  // Display all bands, but show current band expanded by default
  const activeBandDisplay = selectedBand ?? currentBand ?? '0-1m'

  // Milestone map for timeline
  const milestoneMap = useMemo(
    () => Object.fromEntries(MILESTONES.map((m) => [m.id, m])),
    []
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Marcos de Desenvolvimento</h1>
            <p className="text-xs text-gray-400 mt-0.5">{activeBaby.name}</p>
          </div>
          {/* View toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                view === 'timeline'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Timeline
              {milestones.length > 0 && (
                <span className="bg-pink-500 text-white rounded-full text-[10px] px-1.5 py-0.5 leading-none">
                  {milestones.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {view === 'timeline' ? (
        <MilestoneTimeline
          achievements={milestones}
          milestoneMap={milestoneMap}
          filterBand={timelineFilter}
          onFilterChange={setTimelineFilter}
          onCardClick={(milestoneId) => {
            const def = MILESTONES.find((m) => m.id === milestoneId)
            if (def) setAchieveTarget(def)
          }}
        />
      ) : (
        <>
          {/* Band selector tabs (horizontal scroll) */}
          <div className="overflow-x-auto px-4 py-3 flex gap-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            {AGE_BANDS.map((band) => {
              const bandMilestones = MILESTONES.filter((m) => m.age_band === band)
              const achievedCount = bandMilestones.filter((m) => isAchieved(m.id)).length
              const isCurrentBand = band === currentBand
              const isActive = band === activeBandDisplay

              return (
                <button
                  key={band}
                  onClick={() => setSelectedBand(band)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors relative ${
                    isActive
                      ? 'bg-pink-500 text-white'
                      : isCurrentBand
                      ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {AGE_BAND_LABELS[band]}
                  {achievedCount > 0 && (
                    <span className={`ml-1.5 text-[10px] ${isActive ? 'opacity-80' : 'text-pink-500 dark:text-pink-400'}`}>
                      {achievedCount}/{bandMilestones.length}
                    </span>
                  )}
                  {isCurrentBand && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Milestone list for active band */}
          <div className="px-4 py-4">
            {/* Band header */}
            <div className="mb-3">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {AGE_BAND_LABELS[activeBandDisplay]}
                {activeBandDisplay === currentBand && (
                  <span className="ml-2 text-xs font-normal bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded-full">
                    Fase atual
                  </span>
                )}
              </h2>
              {/* Progress bar */}
              {(() => {
                const bandMs = MILESTONES.filter((m) => m.age_band === activeBandDisplay)
                const done = bandMs.filter((m) => isAchieved(m.id)).length
                const pct = bandMs.length > 0 ? Math.round((done / bandMs.length) * 100) : 0
                return (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{done}/{bandMs.length}</span>
                  </div>
                )
              })()}
            </div>

            {/* "Nova fase!" banner — shown when bebê is in current band with 0 achievements */}
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

            {/* Milestone cards */}
            {!loading && (
              <div className="space-y-2">
                {MILESTONES.filter((m) => m.age_band === activeBandDisplay).map((milestone) => {
                  const achieved = isAchieved(milestone.id)
                  return (
                    <button
                      key={milestone.id}
                      onClick={() => setAchieveTarget(milestone)}
                      className={`w-full text-left rounded-2xl p-4 shadow-sm flex items-start gap-3 transition-colors ${
                        achieved
                          ? 'bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800'
                          : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      <span className="text-2xl flex-shrink-0">{milestone.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${achieved ? 'text-pink-700 dark:text-pink-300' : 'text-gray-900 dark:text-white'}`}>
                            {milestone.title}
                          </p>
                          {achieved && <span className="text-pink-500 text-sm">✓</span>}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{milestone.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* AchieveModal */}
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
    </div>
  )
}
