import { useEffect, useRef, useState } from 'react'
import type { Baby } from '@/types'

interface BabySwitcherProps {
  babies: Baby[]
  activeBaby: Baby
  onSelect: (id: string) => void
}

export function BabySwitcher({ babies, activeBaby, onSelect }: BabySwitcherProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Returns nothing when there's only one baby
  if (babies.length <= 1) return null

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  function handleSelect(id: string) {
    onSelect(id)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white max-w-32 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{activeBaby.name}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown list */}
      {open && (
        <ul
          role="listbox"
          aria-label="Selecionar bebê"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 min-w-[160px] bg-white dark:bg-gray-800 rounded-xl shadow-lg z-50 overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          {babies.map((baby) => {
            const isActive = baby.id === activeBaby.id
            return (
              <li key={baby.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => handleSelect(baby.id)}
                  className={`
                    w-full text-left px-4 py-2.5 text-sm transition-colors
                    ${
                      isActive
                        ? 'font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {baby.name}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
