import { useNavigate } from 'react-router-dom'
import { useBabies } from '@/hooks/useBabies'
import { BabySwitcher } from '@/components/baby/BabySwitcher'

interface TopBarProps {
  title?: string
  showBack?: boolean
}

/**
 * Top navigation bar for authenticated pages.
 * Shows optional back button and page title.
 * When the user has 2+ babies, the center shows the BabySwitcher.
 * Height: 56px (standard mobile top bar)
 */
export function TopBar({ title = 'MamãeApp', showBack = false }: TopBarProps) {
  const navigate = useNavigate()
  const { babies, activeBaby, setActiveBaby } = useBabies()

  return (
    <header className="sticky top-0 z-40 h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center -ml-2 w-10 h-10 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Voltar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div className="flex-1 flex items-center">
        {babies.length >= 2 && activeBaby ? (
          <BabySwitcher
            babies={babies}
            activeBaby={activeBaby}
            onSelect={setActiveBaby}
          />
        ) : (
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        )}
      </div>
    </header>
  )
}
