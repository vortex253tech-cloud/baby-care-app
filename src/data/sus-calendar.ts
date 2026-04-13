export interface SusVaccine {
  id: string
  name: string
  dose: string
  age_days_from: number
  age_days_to: number
  description: string
}

const M = (n: number) => n * 30
const Y = (n: number) => n * 365

export const SUS_VACCINES: SusVaccine[] = [
  { id: 'hep-b-0',        name: 'Hepatite B',                    dose: '1ª dose',   age_days_from: 0,       age_days_to: 1,         description: 'Ao nascer' },
  { id: 'bcg',            name: 'BCG',                           dose: 'dose única', age_days_from: 0,       age_days_to: 30,        description: 'Ao nascer' },
  { id: 'penta-1',        name: 'Pentavalente (DTP+Hib+HepB)',   dose: '1ª dose',   age_days_from: M(2),    age_days_to: M(3),      description: '2 meses' },
  { id: 'vip-1',          name: 'VIP (Poliomielite inativada)',   dose: '1ª dose',   age_days_from: M(2),    age_days_to: M(3),      description: '2 meses' },
  { id: 'pneumo-1',       name: 'Pneumocócica 10-valente',        dose: '1ª dose',   age_days_from: M(2),    age_days_to: M(3),      description: '2 meses' },
  { id: 'rota-1',         name: 'Rotavírus Humano G1P1',          dose: '1ª dose',   age_days_from: M(2),    age_days_to: M(3),      description: '2 meses' },
  { id: 'meningo-1',      name: 'Meningocócica C',                dose: '1ª dose',   age_days_from: M(3),    age_days_to: M(4),      description: '3 meses' },
  { id: 'penta-2',        name: 'Pentavalente',                   dose: '2ª dose',   age_days_from: M(4),    age_days_to: M(5),      description: '4 meses' },
  { id: 'vip-2',          name: 'VIP',                            dose: '2ª dose',   age_days_from: M(4),    age_days_to: M(5),      description: '4 meses' },
  { id: 'pneumo-2',       name: 'Pneumocócica 10-valente',        dose: '2ª dose',   age_days_from: M(4),    age_days_to: M(5),      description: '4 meses' },
  { id: 'rota-2',         name: 'Rotavírus Humano G1P1',          dose: '2ª dose',   age_days_from: M(4),    age_days_to: M(5),      description: '4 meses' },
  { id: 'penta-3',        name: 'Pentavalente',                   dose: '3ª dose',   age_days_from: M(6),    age_days_to: M(7),      description: '6 meses' },
  { id: 'vip-3',          name: 'VIP',                            dose: '3ª dose',   age_days_from: M(6),    age_days_to: M(7),      description: '6 meses' },
  { id: 'hep-a',          name: 'Hepatite A',                     dose: 'dose única', age_days_from: M(12),   age_days_to: M(15),     description: '12 meses' },
  { id: 'triplice-viral-1', name: 'Tríplice Viral (SCR)',         dose: '1ª dose',   age_days_from: M(12),   age_days_to: M(15),     description: '12 meses' },
  { id: 'pneumo-ref',     name: 'Pneumocócica 10-valente',        dose: 'reforço',   age_days_from: M(12),   age_days_to: M(15),     description: '12 meses' },
  { id: 'meningo-ref',    name: 'Meningocócica C',                dose: 'reforço',   age_days_from: M(12),   age_days_to: M(15),     description: '12 meses' },
  { id: 'varicela-1',     name: 'Varicela',                       dose: '1ª dose',   age_days_from: M(15),   age_days_to: M(18),     description: '15 meses' },
  { id: 'dtp-ref1',       name: 'DTP',                            dose: '1º reforço', age_days_from: M(15),  age_days_to: M(18),     description: '15 meses' },
  { id: 'vop-ref1',       name: 'VOP (Poliomielite oral)',         dose: '1º reforço', age_days_from: M(15),  age_days_to: M(18),     description: '15 meses' },
  { id: 'triplice-viral-2', name: 'Tríplice Viral',               dose: '2ª dose',   age_days_from: Y(4),    age_days_to: Y(4) + M(6), description: '4 anos' },
  { id: 'dtp-ref2',       name: 'DTP',                            dose: '2º reforço', age_days_from: Y(4),   age_days_to: Y(4) + M(6), description: '4 anos' },
  { id: 'vop-ref2',       name: 'VOP',                            dose: '2º reforço', age_days_from: Y(4),   age_days_to: Y(4) + M(6), description: '4 anos' },
  { id: 'varicela-ref',   name: 'Varicela',                       dose: '2ª dose',   age_days_from: Y(4),    age_days_to: Y(4) + M(6), description: '4 anos' },
]

/**
 * Returns vaccines whose recommended window starts within the next `windowDays`
 * days, or is already open (baby is within the recommended age range).
 */
export function getUpcomingVaccines(
  birthDate: Date,
  windowDays = 90
): (SusVaccine & { due_date: Date })[] {
  const today = new Date()
  const babyAgeDays = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)

  return SUS_VACCINES
    .filter((v) => {
      // Already past the tolerance window → skip
      if (babyAgeDays > v.age_days_to) return false
      // Not due for another `windowDays` days → skip
      const daysUntilDue = v.age_days_from - babyAgeDays
      return daysUntilDue <= windowDays
    })
    .map((v) => ({
      ...v,
      due_date: new Date(birthDate.getTime() + v.age_days_from * 24 * 60 * 60 * 1000),
    }))
}
