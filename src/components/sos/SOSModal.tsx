// ─── SOS Modal — Emergency guides with step-by-step instructions ─────────────
import { useState } from 'react'
import { getGuideBySlug } from '@/data/guides'
import type { GuideArticle } from '@/data/guides'

interface SOSModalProps {
  onClose: () => void
}

type SOSTopic = 'choking' | 'fever' | 'crying' | null

const SOS_TOPICS = [
  {
    id: 'choking' as const,
    emoji: '🫁',
    label: 'Engasgo',
    color: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-300',
    slug: 'engasgo',
  },
  {
    id: 'fever' as const,
    emoji: '🌡️',
    label: 'Febre',
    color: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
    textColor: 'text-orange-700 dark:text-orange-300',
    slug: 'febre',
  },
  {
    id: 'crying' as const,
    emoji: '😢',
    label: 'Choro Intenso',
    color: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
    textColor: 'text-purple-700 dark:text-purple-300',
    slug: 'colica-choro',
  },
]

export function SOSModal({ onClose }: SOSModalProps) {
  const [selected, setSelected] = useState<SOSTopic>(null)

  const selectedTopic = SOS_TOPICS.find(t => t.id === selected)
  const guide = selectedTopic ? getGuideBySlug(selectedTopic.slug) : null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="flex-shrink-0 flex flex-col items-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {selected === null ? (
          // Topic selection
          <>
            <div className="px-6 pb-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    🆘 O que está acontecendo?
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Selecione a situação de emergência
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-3 flex-shrink-0">
              {SOS_TOPICS.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelected(topic.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-95 ${topic.color}`}
                >
                  <span className="text-4xl">{topic.emoji}</span>
                  <span className={`text-lg font-bold ${topic.textColor}`}>
                    {topic.label}
                  </span>
                  <svg
                    className={`ml-auto w-5 h-5 ${topic.textColor}`}
                    fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}

              {/* Emergency call */}
              <a
                href="tel:192"
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 bg-red-600 border-red-600 text-white active:scale-95 transition-all"
              >
                <span className="text-4xl">📞</span>
                <div className="text-left">
                  <p className="text-lg font-bold">Ligar 192 (SAMU)</p>
                  <p className="text-sm text-red-100">Emergência médica</p>
                </div>
              </a>
            </div>
          </>
        ) : guide ? (
          // Guide detail
          <GuideDetail guide={guide} onBack={() => setSelected(null)} onClose={onClose} />
        ) : null}
      </div>
    </div>
  )
}

// ─── Inline guide detail (simplified for emergency context) ──────────────────
function GuideDetail({
  guide,
  onBack,
  onClose,
}: {
  guide: GuideArticle
  onBack: () => void
  onClose: () => void
}) {
  return (
    <>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-6 pb-4">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {guide.emoji} {guide.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
        >
          ✕
        </button>
      </div>

      {/* Emergency call button always at top */}
      <div className="flex-shrink-0 px-6 pb-3">
        <a
          href="tel:192"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 text-white font-bold text-sm active:scale-95 transition-all"
        >
          📞 Ligar 192 (SAMU) — Emergência
        </a>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {guide.sections.map((section, i) => {
          if (section.type === 'warning') {
            return (
              <div key={i} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="font-bold text-red-800 dark:text-red-300 text-sm">{section.title}</p>
                {section.body && <p className="text-red-700 dark:text-red-400 text-sm mt-1">{section.body}</p>}
              </div>
            )
          }
          if (section.type === 'steps' && section.steps) {
            return (
              <div key={i}>
                {section.title && (
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{section.title}</h3>
                )}
                <div className="space-y-2">
                  {section.steps.map(step => (
                    <div
                      key={step.order}
                      className={`flex gap-3 p-3 rounded-xl ${
                        step.warning
                          ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                          : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                        {step.order}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{step.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
          if (section.type === 'intro' || section.type === 'tip') {
            return (
              <div key={i} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                {section.title && (
                  <p className="font-bold text-blue-800 dark:text-blue-300 text-sm">{section.title}</p>
                )}
                {section.body && (
                  <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">{section.body}</p>
                )}
              </div>
            )
          }
          return null
        })}

        {guide.disclaimer && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">{guide.disclaimer}</p>
          </div>
        )}
      </div>
    </>
  )
}
