// ─── Guia da Mamãe — Educational Content ────────────────────────────────────
// Static content. No DB required. Saved/viewed state tracked via localStorage.

export type GuideCategory = 'sono' | 'alimentacao' | 'saude' | 'seguranca' | 'higiene'

export interface GuideStep {
  order: number
  text: string
  warning?: boolean
}

export interface GuideSection {
  type: 'intro' | 'steps' | 'warning' | 'tip' | 'comparison' | 'emergency'
  title?: string
  body?: string
  steps?: GuideStep[]
  comparison?: { label: string; correct: boolean; description: string }[]
}

export interface GuideArticle {
  id: string
  slug: string
  category: GuideCategory
  emoji: string
  title: string
  subtitle: string
  readMinutes: number
  isEmergency: boolean
  sections: GuideSection[]
  disclaimer?: string
  tags: string[]
}

export const GUIDE_CATEGORIES: { id: GuideCategory; label: string; emoji: string }[] = [
  { id: 'seguranca', label: 'Segurança', emoji: '🛡️' },
  { id: 'sono', label: 'Sono', emoji: '😴' },
  { id: 'alimentacao', label: 'Alimentação', emoji: '🍼' },
  { id: 'saude', label: 'Saúde', emoji: '❤️' },
  { id: 'higiene', label: 'Higiene', emoji: '🛁' },
]

export const GUIDE_ARTICLES: GuideArticle[] = [
  // ─── SEGURANÇA ──────────────────────────────────────────────────────────────
  {
    id: 'choking-guide',
    slug: 'engasgo',
    category: 'seguranca',
    emoji: '🚨',
    title: 'Engasgo no Bebê',
    subtitle: 'O que fazer em caso de engasgo',
    readMinutes: 3,
    isEmergency: true,
    tags: ['engasgo', 'emergência', 'primeiros socorros'],
    disclaimer: 'Este conteúdo é informativo e não substitui orientação médica profissional. Em caso de emergência, ligue 192 (SAMU) imediatamente.',
    sections: [
      {
        type: 'warning',
        title: '⚠️ Ligue 192 (SAMU) se o bebê ficar inconsciente',
        body: 'Se o bebê perder a consciência, parar de respirar ou ficar com a pele azulada — ligue 192 imediatamente e inicie RCP.',
      },
      {
        type: 'intro',
        title: 'Como identificar o engasgo',
        body: 'Engasgo leve: bebê chora, tosse com força, faz barulho. Engasgo grave: bebê não chora, não faz barulho, fica vermelho ou roxo, incapaz de respirar.',
      },
      {
        type: 'steps',
        title: '🟡 Engasgo LEVE — bebê tossindo ou chorando',
        steps: [
          { order: 1, text: 'Mantenha a calma. NÃO faça nada — a tosse do bebê é o melhor mecanismo de defesa.' },
          { order: 2, text: 'Observe o bebê de perto. Incentive-o a continuar tossindo.' },
          { order: 3, text: 'NÃO dê tapas nas costas se o bebê estiver tossindo bem.' },
          { order: 4, text: 'Se a situação piorar (silêncio, parada de respirar), passe para as etapas de engasgo grave.', warning: true },
        ],
      },
      {
        type: 'steps',
        title: '🔴 Engasgo GRAVE — bebê silencioso ou roxo',
        steps: [
          { order: 1, text: 'Ligue 192 (SAMU) ou peça alguém para ligar enquanto você age.' },
          { order: 2, text: 'Segure o bebê de bruços no seu antebraço, com a cabeça abaixo do tronco.' },
          { order: 3, text: 'Dê 5 tapas firmes nas costas com a palma da mão, entre as omoplatas.' },
          { order: 4, text: 'Vire o bebê de barriga para cima no seu antebraço.' },
          { order: 5, text: 'Com 2 dedos no centro do peito, faça 5 compressões para dentro e para cima.' },
          { order: 6, text: 'Alterne: 5 tapas nas costas + 5 compressões no peito.' },
          { order: 7, text: 'Continue até o objeto sair, o bebê respirar ou o SAMU chegar.', warning: true },
        ],
      },
      {
        type: 'tip',
        title: '💡 Prevenção',
        body: 'Não ofereça alimentos duros, redondos ou pequenos para bebês. Sempre supervise a alimentação. Aprenda RCP infantil com um profissional de saúde.',
      },
    ],
  },

  {
    id: 'safe-sleep',
    slug: 'sono-seguro',
    category: 'seguranca',
    emoji: '🛏️',
    title: 'Posição Segura para Dormir',
    subtitle: 'Prevenção da Morte Súbita Infantil (SMSI)',
    readMinutes: 4,
    isEmergency: false,
    tags: ['sono', 'segurança', 'SMSI', 'berço'],
    disclaimer: 'Recomendações baseadas nas diretrizes da Sociedade Brasileira de Pediatria (SBP) e da AAP.',
    sections: [
      {
        type: 'intro',
        title: 'Por que isso importa?',
        body: 'A Síndrome da Morte Súbita do Lactente (SMSI) é uma das principais causas de morte em bebês menores de 1 ano. A boa notícia: seguir práticas seguras de sono reduz o risco significativamente.',
      },
      {
        type: 'comparison',
        title: 'Posições de dormir',
        comparison: [
          { label: 'De barriga para cima', correct: true, description: 'Sempre coloque o bebê de costas para dormir — de barriga para cima. É a única posição segura até os 12 meses.' },
          { label: 'De lado', correct: false, description: 'Não recomendada. O bebê pode virar de barriga para baixo durante o sono.' },
          { label: 'De barriga para baixo', correct: false, description: 'Proibida para dormir. Risco elevado de SMSI. Somente durante a supervisão, quando o bebê estiver acordado.' },
        ],
      },
      {
        type: 'steps',
        title: '✅ Checklist do sono seguro',
        steps: [
          { order: 1, text: 'Sempre de costas (barriga para cima).' },
          { order: 2, text: 'Superfície firme e plana (colchão de berço ou berço de grade).' },
          { order: 3, text: 'Sem travesseiros, edredons, almofadas ou brinquedos no berço.' },
          { order: 4, text: 'Temperatura ambiente agradável (18–22°C). Sem superaquecimento.' },
          { order: 5, text: 'Compartilhe o quarto (não a cama) pelos primeiros 6 meses.' },
          { order: 6, text: 'Ofereça chupeta após amamentação estabelecida (a partir de 1 mês).' },
          { order: 7, text: 'Nunca fume dentro de casa ou perto do bebê.', warning: true },
        ],
      },
      {
        type: 'tip',
        title: '💡 Tummy time (tempo de barriga)',
        body: 'Durante o dia, quando o bebê estiver acordado e supervisionado, coloque-o de barriga para baixo por alguns minutos. Isso fortalece o pescoço e os músculos. Nunca deixe dormindo nessa posição.',
      },
    ],
  },

  // ─── SONO ───────────────────────────────────────────────────────────────────
  {
    id: 'sleep-routines',
    slug: 'rotina-do-sono',
    category: 'sono',
    emoji: '🌙',
    title: 'Rotina do Sono',
    subtitle: 'Como criar uma rotina saudável de sono',
    readMinutes: 5,
    isEmergency: false,
    tags: ['sono', 'rotina', 'noite'],
    sections: [
      {
        type: 'intro',
        title: 'A importância da rotina',
        body: 'Bebês se beneficiam de rotinas previsíveis. Um ritual consistente antes de dormir sinaliza para o cérebro do bebê que é hora de descansar, facilitando o adormecimento.',
      },
      {
        type: 'steps',
        title: '🌙 Rotina noturna recomendada',
        steps: [
          { order: 1, text: 'Banho morno (opcional, mas relaxante).' },
          { order: 2, text: 'Troca de fralda e pijama.' },
          { order: 3, text: 'Amamentação ou mamadeira na penumbra.' },
          { order: 4, text: 'Canto suave, história ou música calma.' },
          { order: 5, text: 'Coloque o bebê sonolento, mas ainda acordado, no berço.' },
          { order: 6, text: 'Diga boa noite com voz calma e saia do quarto.' },
        ],
      },
      {
        type: 'tip',
        title: '⏰ Horários por idade',
        body: 'Recém-nascidos (0-3m): dormem 14-17h por dia, sem padrão fixo. De 3-6 meses: começam a consolidar o sono noturno. De 6-12 meses: geralmente 12-16h, com 2 cochilos diurnos.',
      },
      {
        type: 'warning',
        title: '⚠️ Nunca faça',
        body: 'Nunca deixe o bebê chorar indefinidamente no começo da vida. Responder ao choro é fundamental para criar segurança emocional. Consulte seu pediatra sobre métodos de sono.',
      },
    ],
  },

  // ─── ALIMENTAÇÃO ────────────────────────────────────────────────────────────
  {
    id: 'breastfeeding',
    slug: 'amamentacao',
    category: 'alimentacao',
    emoji: '🤱',
    title: 'Amamentação',
    subtitle: 'Posições, pega correta e dicas',
    readMinutes: 6,
    isEmergency: false,
    tags: ['amamentação', 'mama', 'leite materno'],
    sections: [
      {
        type: 'intro',
        title: 'O leite materno',
        body: 'O leite materno é o alimento completo para o bebê até os 6 meses. A OMS recomenda amamentação exclusiva até os 6 meses e complementada até 2 anos ou mais.',
      },
      {
        type: 'comparison',
        title: 'Pega do bebê',
        comparison: [
          { label: 'Pega correta', correct: true, description: 'Boca aberta, lábio inferior voltado para fora, queixo tocando a mama. O bebê está com areola quase toda na boca, não só o bico.' },
          { label: 'Pega incorreta', correct: false, description: 'Bebê sugando apenas o bico. Causa dor, fissuras e mama mal esvaziada.' },
        ],
      },
      {
        type: 'steps',
        title: '🤱 Posições para amamentar',
        steps: [
          { order: 1, text: 'Posição tradicional (berço): bebê deitado no seu braço, barriga com barriga.' },
          { order: 2, text: 'Posição invertida (futebol americano): bebê sob o seu braço, cabeça na sua mão.' },
          { order: 3, text: 'Deitada de lado: boa para a madrugada.' },
          { order: 4, text: 'Reclinada (posição biológica): você reclinada, bebê sobre você. Ajuda com excesso de leite.' },
        ],
      },
      {
        type: 'tip',
        title: '💡 Dicas práticas',
        body: 'Ofereça as duas mamas em cada mamada. Bebês recém-nascidos mamam a cada 2-3 horas (8-12x por dia). Fralda molhada de 6-8x por dia indica boa ingesta de leite.',
      },
      {
        type: 'warning',
        title: '⚠️ Procure ajuda se',
        body: 'Você sentir dor intensa ao amamentar, notar o bebê não ganhando peso adequadamente, ou tiver suspeita de mastite (mama inchada, vermelha e dolorosa com febre). Consulte seu pediatra ou consultora de amamentação.',
      },
    ],
  },

  {
    id: 'introduction-foods',
    slug: 'introducao-alimentar',
    category: 'alimentacao',
    emoji: '🥕',
    title: 'Introdução Alimentar',
    subtitle: 'Começando os sólidos com segurança',
    readMinutes: 5,
    isEmergency: false,
    tags: ['alimentação', 'papinha', 'BLW', '6 meses'],
    sections: [
      {
        type: 'intro',
        title: 'Quando começar?',
        body: 'A introdução alimentar deve começar aos 6 meses completos. Antes disso, o leite materno (ou fórmula) é suficiente. Sinais de prontidão: bebê senta com apoio, interesse nos alimentos, movimentos de mastigação.',
      },
      {
        type: 'steps',
        title: '🥄 Primeiros alimentos',
        steps: [
          { order: 1, text: 'Comece com papinhas de legumes: cenoura, batata-doce, abobrinha, chuchu.' },
          { order: 2, text: 'Ofereça um alimento novo por vez. Aguarde 3 dias para observar reações.' },
          { order: 3, text: 'Não adicione sal, açúcar ou mel (mel proibido até 12 meses).' },
          { order: 4, text: 'Carne magra (frango, boi) desde o início da introdução.' },
          { order: 5, text: 'Frutas amassadas ou em pedaços macios.' },
          { order: 6, text: 'Continue amamentando normalmente.' },
        ],
      },
      {
        type: 'warning',
        title: '⚠️ Alimentos proibidos até 1 ano',
        body: 'Mel (risco de botulismo), sal excessivo, açúcar, leite de vaca como bebida principal, alimentos ultraprocessados, amendoim em pedaços (risco de engasgo).',
      },
    ],
  },

  // ─── SAÚDE ───────────────────────────────────────────────────────────────────
  {
    id: 'fever-guide',
    slug: 'febre',
    category: 'saude',
    emoji: '🌡️',
    title: 'Febre no Bebê',
    subtitle: 'Quando se preocupar e o que fazer',
    readMinutes: 4,
    isEmergency: false,
    tags: ['febre', 'temperatura', 'saúde'],
    disclaimer: 'Este conteúdo é informativo e não substitui orientação médica. Sempre consulte seu pediatra.',
    sections: [
      {
        type: 'intro',
        title: 'O que é febre?',
        body: 'Febre é temperatura acima de 37,5°C (axilar) ou 38°C (retal). É um sinal de que o sistema imunológico está trabalhando. A maioria das febres é causada por infecções virais leves.',
      },
      {
        type: 'comparison',
        title: 'Nível de urgência',
        comparison: [
          { label: 'Emergência imediata', correct: false, description: 'Bebê com menos de 3 meses com qualquer febre → vá ao pronto-socorro imediatamente.' },
          { label: 'Consulta no mesmo dia', correct: true, description: 'Febre acima de 39°C, febre por mais de 48h, bebê muito irritado ou letárgico.' },
          { label: 'Monitorar em casa', correct: true, description: 'Febre baixa (37,5–38,5°C) em bebê acima de 3 meses, ativo e bem hidratado.' },
        ],
      },
      {
        type: 'steps',
        title: '❄️ O que fazer em casa',
        steps: [
          { order: 1, text: 'Mantenha o bebê bem hidratado (amamente com mais frequência).' },
          { order: 2, text: 'Vista roupas leves. Ambiente fresco.' },
          { order: 3, text: 'Dipirona ou paracetamol na dose certa para o peso — conforme orientação do pediatra.' },
          { order: 4, text: 'Monitore a temperatura a cada 2-4 horas.' },
          { order: 5, text: 'Banho morno pode ajudar no conforto (não banho frio).', warning: false },
        ],
      },
      {
        type: 'warning',
        title: '🚨 Vá ao pronto-socorro se',
        body: 'Bebê com menos de 3 meses com febre. Febre acima de 40°C. Convulsão. Bebê não acorda, recusa alimentação, choro inconsolável, manchas na pele, dificuldade para respirar.',
      },
    ],
  },

  {
    id: 'colic-crying',
    slug: 'colica-choro',
    category: 'saude',
    emoji: '😢',
    title: 'Cólica e Choro Intenso',
    subtitle: 'Como acalmar e entender o choro',
    readMinutes: 5,
    isEmergency: false,
    tags: ['cólica', 'choro', 'bebê irritado'],
    sections: [
      {
        type: 'intro',
        title: 'O choro do bebê',
        body: 'O choro é a única forma de comunicação do bebê. Cólica infantil afeta cerca de 20% dos bebês, geralmente dos 2 semanas aos 3-4 meses. É intensa, mas temporária.',
      },
      {
        type: 'steps',
        title: '🤗 Técnicas para acalmar',
        steps: [
          { order: 1, text: 'Verifique o básico: fome, fralda suja, cansaço, calor ou frio.' },
          { order: 2, text: 'Embale o bebê com movimentos suaves e rítmicos.' },
          { order: 3, text: 'Ruído branco: ventilador, aspirador de pó (à distância), sons de natureza.' },
          { order: 4, text: 'Posição de "avião": bebê de barriga para baixo no seu antebraço, cabeça na sua mão.' },
          { order: 5, text: 'Massagem abdominal suave em movimentos circulares no sentido horário.' },
          { order: 6, text: 'Passeio de carrinho ou carro (movimento).' },
        ],
      },
      {
        type: 'tip',
        title: '💡 Dica importante',
        body: 'Se você se sentir sobrecarregada, coloque o bebê em segurança no berço e respire. Nunca sacuda o bebê — síndrome do bebê sacudido causa danos cerebrais graves.',
      },
    ],
  },

  // ─── HIGIENE ────────────────────────────────────────────────────────────────
  {
    id: 'bathing',
    slug: 'banho',
    category: 'higiene',
    emoji: '🛁',
    title: 'Banho do Bebê',
    subtitle: 'Passo a passo do primeiro banho',
    readMinutes: 4,
    isEmergency: false,
    tags: ['banho', 'higiene', 'cuidados'],
    sections: [
      {
        type: 'intro',
        title: 'Frequência',
        body: 'Bebês não precisam de banho diário. 2-3 vezes por semana é suficiente. O rosto, pescoço, mãos e área da fralda devem ser limpos diariamente.',
      },
      {
        type: 'steps',
        title: '🛁 Passo a passo',
        steps: [
          { order: 1, text: 'Separe tudo antes: toalha, fraldas, roupas, sabonete neutro.' },
          { order: 2, text: 'Água morna: 37°C (teste com o cotovelo, não a mão).' },
          { order: 3, text: 'Nunca deixe o bebê sozinho na banheira, nem por um segundo.', warning: true },
          { order: 4, text: 'Sustente a cabeça e o pescoço do bebê o tempo todo.' },
          { order: 5, text: 'Lave da cabeça para os pés, deixando a área da fralda por último.' },
          { order: 6, text: 'Seque bem as dobrinhas: pescoço, axilas, virilha.' },
          { order: 7, text: 'Vista rapidamente para evitar perda de calor.' },
        ],
      },
      {
        type: 'warning',
        title: '⚠️ Coto umbilical',
        body: 'Até o coto cair (7-15 dias), faça banhos de esponja. Limpe o coto com álcool 70% e deixe secar. Nunca mergulhe o bebê na banheira até o coto cair.',
      },
    ],
  },

  {
    id: 'diaper-change',
    slug: 'troca-fralda',
    category: 'higiene',
    emoji: '👶',
    title: 'Troca de Fralda',
    subtitle: 'Como trocar e prevenir assaduras',
    readMinutes: 3,
    isEmergency: false,
    tags: ['fralda', 'assadura', 'higiene'],
    sections: [
      {
        type: 'intro',
        title: 'Com que frequência?',
        body: 'Troque a fralda a cada 2-3 horas, ou imediatamente quando estiver suja. Recém-nascidos urinam 6-8x por dia e evacúam frequentemente.',
      },
      {
        type: 'steps',
        title: '👶 Passo a passo',
        steps: [
          { order: 1, text: 'Lave as mãos antes e depois da troca.' },
          { order: 2, text: 'Nunca deixe o bebê sozinho na superfície elevada.', warning: true },
          { order: 3, text: 'Retire a fralda suja. Limpe da frente para trás (meninas) ou do centro para fora.' },
          { order: 4, text: 'Use lenços umedecidos sem álcool ou algodão com água morna.' },
          { order: 5, text: 'Deixe a pele secar completamente antes de colocar a nova fralda.' },
          { order: 6, text: 'Aplique creme para assaduras se a pele estiver vermelha.' },
          { order: 7, text: 'Coloque a nova fralda — não muito apertada (cabe 2 dedos na cintura).' },
        ],
      },
      {
        type: 'tip',
        title: '💡 Prevenção de assaduras',
        body: 'Troque a fralda regularmente. Deixe o bebê sem fralda por alguns minutos por dia. Use creme preventivo com óxido de zinco. Se a assadura persistir por mais de 3 dias, consulte o pediatra.',
      },
    ],
  },
]

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getGuidesByCategory(category: GuideCategory): GuideArticle[] {
  return GUIDE_ARTICLES.filter(g => g.category === category)
}

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find(g => g.slug === slug)
}

export function getEmergencyGuides(): GuideArticle[] {
  return GUIDE_ARTICLES.filter(g => g.isEmergency)
}

export function getAllGuideSlugs(): string[] {
  return GUIDE_ARTICLES.map(g => g.slug)
}
