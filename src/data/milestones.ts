export type MilestoneCategory = 'motor' | 'comunicacao' | 'social' | 'cognitivo'

export interface MilestoneDefinition {
  id: string
  category: MilestoneCategory
  title: string
  description: string
  age_band: AgeBand
  icon: string  // emoji
}

export type AgeBand =
  | '0-1m'   // 0–30 dias
  | '1-3m'   // 1–3 meses
  | '3-6m'   // 3–6 meses
  | '6-9m'   // 6–9 meses
  | '9-12m'  // 9–12 meses
  | '12-18m' // 12–18 meses
  | '18-24m' // 18–24 meses

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  '0-1m':   '0–1 mês',
  '1-3m':   '1–3 meses',
  '3-6m':   '3–6 meses',
  '6-9m':   '6–9 meses',
  '9-12m':  '9–12 meses',
  '12-18m': '12–18 meses',
  '18-24m': '18–24 meses',
}

// Age band boundaries in days (from birth)
export const AGE_BAND_RANGES: Record<AgeBand, [number, number]> = {
  '0-1m':   [0,   30],
  '1-3m':   [31,  90],
  '3-6m':   [91,  180],
  '6-9m':   [181, 270],
  '9-12m':  [271, 365],
  '12-18m': [366, 548],
  '18-24m': [549, 730],
}

export const MILESTONES: MilestoneDefinition[] = [
  // 0–1 mês
  { id: 'm-01', age_band: '0-1m', category: 'motor',       icon: '👁️', title: 'Foca o olhar', description: 'Consegue focar o rosto da mãe a ~25cm de distância' },
  { id: 'm-02', age_band: '0-1m', category: 'motor',       icon: '🤚', title: 'Reflexo de preensão', description: 'Agarra o dedo quando colocado na palma da mão' },
  { id: 'm-03', age_band: '0-1m', category: 'comunicacao', icon: '😢', title: 'Choro como comunicação', description: 'Usa o choro para expressar fome, desconforto ou sono' },
  { id: 'm-04', age_band: '0-1m', category: 'social',      icon: '🧘', title: 'Acalma com voz familiar', description: 'Se acalma ao ouvir a voz da mãe ou do pai' },
  { id: 'm-05', age_band: '0-1m', category: 'motor',       icon: '🦶', title: 'Reflexo de Moro', description: 'Reage a sons altos com movimento de braços (normal até 4 meses)' },

  // 1–3 meses
  { id: 'm-06', age_band: '1-3m', category: 'social',      icon: '😊', title: 'Primeiro sorriso social', description: 'Sorri em resposta ao rosto e voz de adultos' },
  { id: 'm-07', age_band: '1-3m', category: 'motor',       icon: '🦁', title: 'Sustenta a cabeça', description: 'Levanta a cabeça brevemente quando no barrigão' },
  { id: 'm-08', age_band: '1-3m', category: 'comunicacao', icon: '🗣️', title: 'Primeiros gorjeios', description: 'Emite sons vocálicos tipo "aaah" e "eeeh"' },
  { id: 'm-09', age_band: '1-3m', category: 'cognitivo',   icon: '👀', title: 'Segue objetos com o olhar', description: 'Acompanha objetos em movimento por 180°' },
  { id: 'm-10', age_band: '1-3m', category: 'motor',       icon: '✊', title: 'Abre e fecha as mãos', description: 'Movimenta as mãos voluntariamente ao interesse por objetos' },

  // 3–6 meses
  { id: 'm-11', age_band: '3-6m', category: 'motor',       icon: '🙌', title: 'Vira de lado', description: 'Consegue rolar da barriga para as costas' },
  { id: 'm-12', age_band: '3-6m', category: 'motor',       icon: '🦸', title: 'Apoia no antebraço', description: 'Sustenta o tronco apoiado nos antebraços no barrigão' },
  { id: 'm-13', age_band: '3-6m', category: 'social',      icon: '😂', title: 'Gargalhada', description: 'Ri em voz alta quando estimulado' },
  { id: 'm-14', age_band: '3-6m', category: 'cognitivo',   icon: '🎯', title: 'Alcança objetos', description: 'Estende os braços para pegar objetos próximos' },
  { id: 'm-15', age_band: '3-6m', category: 'comunicacao', icon: '💬', title: 'Balbucia consoantes', description: 'Emite sons como "ba", "da", "ga"' },

  // 6–9 meses
  { id: 'm-16', age_band: '6-9m', category: 'motor',       icon: '🧸', title: 'Senta sem apoio', description: 'Mantém-se sentado sem suporte por alguns segundos' },
  { id: 'm-17', age_band: '6-9m', category: 'motor',       icon: '🐛', title: 'Engatinha', description: 'Move-se com mãos e joelhos para frente' },
  { id: 'm-18', age_band: '6-9m', category: 'cognitivo',   icon: '🙈', title: 'Permanência do objeto', description: 'Procura objeto escondido — sabe que ele continua existindo' },
  { id: 'm-19', age_band: '6-9m', category: 'social',      icon: '👋', title: 'Estranhamento', description: 'Demonstra ansiedade com desconhecidos' },
  { id: 'm-20', age_band: '6-9m', category: 'comunicacao', icon: '📣', title: 'Responde ao próprio nome', description: 'Vira a cabeça quando chamado pelo nome' },

  // 9–12 meses
  { id: 'm-21', age_band: '9-12m', category: 'motor',      icon: '🚶', title: 'Fica em pé com apoio', description: 'Sustenta o peso em pé segurando em móveis' },
  { id: 'm-22', age_band: '9-12m', category: 'motor',      icon: '🤌', title: 'Pinça fina', description: 'Pega objetos pequenos com polegar e indicador' },
  { id: 'm-23', age_band: '9-12m', category: 'comunicacao', icon: '👋', title: 'Gestos comunicativos', description: 'Acena tchau, bate palma por imitação' },
  { id: 'm-24', age_band: '9-12m', category: 'comunicacao', icon: '🗣️', title: 'Primeira palavra', description: 'Diz "mama" ou "papa" com intenção comunicativa' },
  { id: 'm-25', age_band: '9-12m', category: 'cognitivo',  icon: '👉', title: 'Aponta com o dedo', description: 'Aponta para objetos de interesse ou para mostrar algo' },

  // 12–18 meses
  { id: 'm-26', age_band: '12-18m', category: 'motor',     icon: '🚶', title: 'Primeiros passos', description: 'Anda sozinho sem apoio' },
  { id: 'm-27', age_band: '12-18m', category: 'cognitivo', icon: '🧩', title: 'Brincadeira de faz-de-conta', description: 'Alimenta boneca, fala ao telefone de brinquedo' },
  { id: 'm-28', age_band: '12-18m', category: 'comunicacao', icon: '💬', title: 'Vocabulário de 5–10 palavras', description: 'Usa palavras isoladas para nomear objetos e pessoas' },
  { id: 'm-29', age_band: '12-18m', category: 'motor',     icon: '📚', title: 'Vira páginas', description: 'Vira páginas de livro de cartão grosso' },
  { id: 'm-30', age_band: '12-18m', category: 'social',    icon: '🫂', title: 'Demonstra afeto', description: 'Abraça e beija espontaneamente os cuidadores' },

  // 18–24 meses
  { id: 'm-31', age_band: '18-24m', category: 'motor',     icon: '🏃', title: 'Corre', description: 'Corre sem cair com frequência' },
  { id: 'm-32', age_band: '18-24m', category: 'motor',     icon: '⬆️', title: 'Sobe escadas', description: 'Sobe escadas segurando o corrimão' },
  { id: 'm-33', age_band: '18-24m', category: 'comunicacao', icon: '🗣️', title: 'Frases de 2 palavras', description: 'Combina duas palavras ("mais leite", "papai foi")' },
  { id: 'm-34', age_band: '18-24m', category: 'cognitivo', icon: '🖍️', title: 'Rabisca no papel', description: 'Segura lápis e faz rabiscos intencionais' },
  { id: 'm-35', age_band: '18-24m', category: 'social',    icon: '🪞', title: 'Reconhece a si mesmo', description: 'Reconhece a própria imagem no espelho' },
]

/**
 * Returns the age band for a given baby age in days.
 */
export function getAgeBand(ageDays: number): AgeBand | null {
  for (const [band, [min, max]] of Object.entries(AGE_BAND_RANGES) as [AgeBand, [number, number]][]) {
    if (ageDays >= min && ageDays <= max) return band
  }
  return null
}

/**
 * Returns milestones for a specific age band, optionally filtered by category.
 */
export function getMilestonesByBand(band: AgeBand, category?: MilestoneCategory): MilestoneDefinition[] {
  return MILESTONES.filter(
    (m) => m.age_band === band && (category == null || m.category === category)
  )
}

export const AGE_BANDS: AgeBand[] = ['0-1m', '1-3m', '3-6m', '6-9m', '9-12m', '12-18m', '18-24m']
