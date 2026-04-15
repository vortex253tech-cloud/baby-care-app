// ─── Guide Article Page — Full educational article with sections ──────────────
import { useNavigate, useParams } from 'react-router-dom'
import { getGuideBySlug, type GuideSection } from '@/data/guides'

export default function GuideArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const guide = slug ? getGuideBySlug(slug) : undefined

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
        <p className="text-gray-400 text-sm">Artigo não encontrado.</p>
        <button
          onClick={() => navigate('/guide')}
          className="mt-4 text-pink-500 text-sm font-medium"
        >
          Voltar ao Guia
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/guide')}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">
              {guide.emoji} {guide.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Meta */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-2 py-1 rounded-full font-medium capitalize">
            {guide.category}
          </span>
          <span className="text-xs text-gray-400">{guide.readMinutes} min de leitura</span>
          {guide.isEmergency && (
            <span className="text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
              🚨 EMERGÊNCIA
            </span>
          )}
        </div>

        {/* Emergency call for emergency articles */}
        {guide.isEmergency && (
          <a
            href="tel:192"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-red-600 text-white font-bold active:scale-95 transition-transform"
          >
            📞 Ligar 192 (SAMU) — Emergência
          </a>
        )}

        {/* Sections */}
        {guide.sections.map((section, i) => (
          <Section key={i} section={section} />
        ))}

        {/* Disclaimer */}
        {guide.disclaimer && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              ⚠️ {guide.disclaimer}
            </p>
          </div>
        )}

        {/* Tags */}
        {guide.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {guide.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Section renderers ────────────────────────────────────────────────────────
function Section({ section }: { section: GuideSection }) {
  switch (section.type) {
    case 'intro':
      return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          {section.title && (
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{section.title}</h2>
          )}
          {section.body && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{section.body}</p>
          )}
        </div>
      )

    case 'warning':
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          {section.title && (
            <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">{section.title}</p>
          )}
          {section.body && (
            <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">{section.body}</p>
          )}
        </div>
      )

    case 'tip':
      return (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4">
          {section.title && (
            <p className="text-sm font-bold text-green-800 dark:text-green-300 mb-1">{section.title}</p>
          )}
          {section.body && (
            <p className="text-sm text-green-700 dark:text-green-400 leading-relaxed">{section.body}</p>
          )}
        </div>
      )

    case 'steps':
      return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {section.title && (
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">{section.title}</h2>
            </div>
          )}
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {(section.steps ?? []).map(step => (
              <div
                key={step.order}
                className={`flex gap-3 px-4 py-3 ${
                  step.warning ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                }`}
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                  {step.order}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'comparison':
      return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {section.title && (
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">{section.title}</h2>
            </div>
          )}
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {(section.comparison ?? []).map((item, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  item.correct
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                }`}>
                  {item.correct ? '✓' : '✗'}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${
                    item.correct ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return null
  }
}
