import type { Baby } from '@/types'
import { BabyAvatar } from '@/components/baby/BabyAvatar'
import { calculateBabyAge } from '@/hooks/useBabyAge'

interface BabyHeaderProps {
  baby: Baby
}

/**
 * Dashboard header card showing baby avatar, name, and age.
 * Pink subtle background for quick visual recognition.
 */
export function BabyHeader({ baby }: BabyHeaderProps) {
  const age = calculateBabyAge(baby.birth_date)

  return (
    <div className="bg-pink-50 dark:bg-pink-950/20 rounded-2xl p-4 flex items-center gap-4">
      <BabyAvatar src={baby.avatar_url} name={baby.name} size="lg" />
      <div className="flex flex-col min-w-0">
        <span className="text-xl font-bold text-gray-900 dark:text-white truncate">
          {baby.name}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {age.label}
        </span>
      </div>
    </div>
  )
}
