export interface BabyAge {
  totalDays: number
  months: number
  days: number         // remaining days after months
  label: string        // e.g. "3 meses e 5 dias" or "15 dias"
}

export function calculateBabyAge(birthDateStr: string): BabyAge {
  const birth = new Date(birthDateStr)
  const now = new Date()

  let months = (now.getFullYear() - birth.getFullYear()) * 12
    + (now.getMonth() - birth.getMonth())

  // Adjust if day-of-month hasn't arrived yet this month
  if (now.getDate() < birth.getDate()) months--
  if (months < 0) months = 0

  const monthStart = new Date(birth)
  monthStart.setMonth(monthStart.getMonth() + months)
  const days = Math.floor((now.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24))

  const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))

  let label: string
  if (months === 0) {
    label = days === 1 ? '1 dia' : `${days} dias`
  } else if (days === 0) {
    label = months === 1 ? '1 mês' : `${months} meses`
  } else {
    const m = months === 1 ? '1 mês' : `${months} meses`
    const d = days === 1 ? '1 dia' : `${days} dias`
    label = `${m} e ${d}`
  }

  return { totalDays, months, days, label }
}

/**
 * Hook that returns the age and auto-updates once per day.
 */
export function useBabyAge(birthDateStr: string | undefined): BabyAge | null {
  // Returns null if no birth date provided
  if (!birthDateStr) return null
  return calculateBabyAge(birthDateStr)
}
