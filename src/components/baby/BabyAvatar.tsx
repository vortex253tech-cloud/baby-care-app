// ── Props ─────────────────────────────────────────────────────────────────────

interface BabyAvatarProps {
  src: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// ── Size map ──────────────────────────────────────────────────────────────────

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',   // 32px
  md: 'w-12 h-12 text-sm', // 48px
  lg: 'w-20 h-20 text-xl', // 80px
} as const

// ── Component ─────────────────────────────────────────────────────────────────

export function BabyAvatar({ src, name, size = 'md', className = '' }: BabyAvatarProps) {
  const sizeClass = SIZE_CLASSES[size]
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <span
      aria-label={name}
      className={`
        ${sizeClass}
        rounded-full flex-shrink-0
        inline-flex items-center justify-center
        bg-pink-200 dark:bg-pink-800
        text-pink-700 dark:text-pink-200
        font-semibold select-none
        ${className}
      `}
    >
      {initial}
    </span>
  )
}
