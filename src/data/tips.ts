export type TipCategory = 'desenvolvimento' | 'sono' | 'alimentacao' | 'saude' | 'brincadeiras'

export interface Tip {
  id: string
  category: TipCategory
  title: string
  body: string          // supports **bold** markdown
  min_age_days: number  // inclusive
  max_age_days: number  // inclusive; -1 = no upper limit
  icon: string          // emoji
}

export const TIP_CATEGORY_LABELS: Record<TipCategory, string> = {
  desenvolvimento: 'Desenvolvimento',
  sono:            'Sono',
  alimentacao:     'Alimentação',
  saude:           'Saúde',
  brincadeiras:    'Brincadeiras',
}

export const TIP_CATEGORY_ICONS: Record<TipCategory, string> = {
  desenvolvimento: '🧠',
  sono:            '😴',
  alimentacao:     '🍼',
  saude:           '❤️',
  brincadeiras:    '🎉',
}

export const TIPS: Tip[] = [
  // ── 0–30 dias ─────────────────────────────────────────────────────────────

  { id: 't-001', category: 'desenvolvimento', icon: '👁️', min_age_days: 0, max_age_days: 30,
    title: 'Contato visual próximo',
    body: 'Nos primeiros dias, o bebê enxerga melhor a **~25 cm** de distância — a distância perfeita durante a amamentação. Olhe nos olhos dele durante a mamada para estimular o vínculo e o desenvolvimento visual.' },
  { id: 't-002', category: 'desenvolvimento', icon: '🗣️', min_age_days: 0, max_age_days: 30,
    title: 'Converse com seu bebê',
    body: 'Mesmo sem entender as palavras, o recém-nascido reconhece e se acalma com a voz dos pais. Fale durante a troca de fralda, o banho e os cuidados diários — isso estimula o desenvolvimento da linguagem desde o início.' },
  { id: 't-003', category: 'sono', icon: '😴', min_age_days: 0, max_age_days: 30,
    title: 'Sempre de costas para dormir',
    body: 'O bebê deve **sempre** dormir de costas em superfície firme e plana. Essa posição reduz o risco de morte súbita (SMSL). Evite almofadas, protetores de berço e cobertas soltas dentro do berço.' },
  { id: 't-004', category: 'sono', icon: '🌙', min_age_days: 0, max_age_days: 30,
    title: 'Ciclos de sono curtos são normais',
    body: 'Recém-nascidos dormem de **16 a 20 horas por dia**, mas em períodos de 2–4 horas. Isso é completamente normal — o estômago pequeno precisa ser reabastecido com frequência. O sono longo noturno vem gradualmente.' },
  { id: 't-005', category: 'alimentacao', icon: '🤱', min_age_days: 0, max_age_days: 30,
    title: 'Amamentar sob demanda',
    body: 'Nos primeiros dias, ofereça o peito sempre que o bebê demonstrar sinais de fome: agitação, levar as mãos à boca, virar a cabeça procurando. **Não espere o choro** — ele é um sinal tardio de fome.' },
  { id: 't-006', category: 'alimentacao', icon: '💧', min_age_days: 0, max_age_days: 30,
    title: 'Sinais de pega adequada',
    body: 'Na pega correta, o bebê abocanhe **o mamilo e boa parte da aréola**. Lábios virados para fora, bochechas cheias, queixo tocando o peito — e você não sente dor. Se sentir, reposicione gentilmente.' },
  { id: 't-007', category: 'saude', icon: '🩺', min_age_days: 0, max_age_days: 30,
    title: 'Triagem neonatal: "Testes do Bebê"',
    body: 'Nas primeiras 48–72h, realize o **Teste do Pezinho** (detecta 50+ doenças), o **Teste da Orelhinha** (audição), o **Teste do Olhinho** (retinoblastoma) e o **Teste do Coraçãozinho** (cardiopatias). Todos são gratuitos pelo SUS.' },
  { id: 't-008', category: 'brincadeiras', icon: '🎵', min_age_days: 0, max_age_days: 30,
    title: 'Canções de ninar',
    body: 'Cantar para o bebê não é "bobagem" — é estimulação! A melodia e o ritmo ativam áreas do cérebro ligadas à emoção e linguagem. Músicas calmas ajudam a regular o sistema nervoso e criar rotina de sono.' },

  // ── 31–90 dias (1–3 meses) ────────────────────────────────────────────────

  { id: 't-009', category: 'desenvolvimento', icon: '😊', min_age_days: 31, max_age_days: 90,
    title: 'O primeiro sorriso social',
    body: 'Entre 6–8 semanas, o bebê começa a sorrir **em resposta ao seu rosto e voz** — não apenas reflexivamente. Corresponda ao sorriso, faça expressões e aguarde a resposta. Essa troca é a base da comunicação emocional.' },
  { id: 't-010', category: 'desenvolvimento', icon: '🦁', min_age_days: 31, max_age_days: 90,
    title: 'Tummy time: fundamental',
    body: 'Coloque o bebê de barriga para baixo **quando estiver acordado e supervisionado**, por 3–5 minutos, várias vezes ao dia. O tummy time fortalece pescoço, ombros e prepara para engatinhar. Comece devagar e aumente gradualmente.' },
  { id: 't-011', category: 'sono', icon: '🔄', min_age_days: 31, max_age_days: 90,
    title: 'Introduzindo ritmo dia/noite',
    body: 'Ajude o bebê a diferenciar dia e noite: **durante o dia**, mantenha a casa iluminada, faça barulho normal, interaja bastante. **À noite**, ambiente escuro, voz baixa, sem estímulos durante a mamada noturna.' },
  { id: 't-012', category: 'sono', icon: '👐', min_age_days: 31, max_age_days: 90,
    title: 'Reflexo de Moro e o sono',
    body: 'O reflexo de Moro (susto com braços abertos) pode acordar o bebê. O **enfaixamento** — com os braços dentro — pode ajudar, mas só até os 2 meses. Após isso, o bebê precisa ter os braços livres para virar.' },
  { id: 't-013', category: 'alimentacao', icon: '📈', min_age_days: 31, max_age_days: 90,
    title: 'Ganho de peso esperado',
    body: 'Após recuperar o peso de nascimento (~10–14 dias), espere **150–200g por semana** no primeiro mês e **~100–150g** do 2º ao 3º mês. Consulte o pediatra se o ganho estiver fora dessa faixa.' },
  { id: 't-014', category: 'alimentacao', icon: '🚫', min_age_days: 31, max_age_days: 90,
    title: 'Nada além do leite materno',
    body: 'Até os **6 meses**, o bebê não precisa de nada além do leite materno — nem água, nem chá, nem suco. O leite materno já contém toda a água necessária, mesmo em dias quentes.' },
  { id: 't-015', category: 'saude', icon: '💉', min_age_days: 31, max_age_days: 90,
    title: 'Vacinas dos 2 meses',
    body: 'Aos 2 meses: **Pentavalente** (difteria, tétano, coqueluche, Hib, hepatite B), **VIP** (poliomielite), **VRH** (rotavírus) e **PCV10** (pneumocócica). Espere febre baixa e irritabilidade — é normal. Dê paracetamol conforme indicação do pediatra.' },
  { id: 't-016', category: 'brincadeiras', icon: '🖐️', min_age_days: 31, max_age_days: 90,
    title: 'Massagem no bebê',
    body: 'A massagem estimula o sistema nervoso, melhora a digestão e fortalece o vínculo. Use óleo vegetal morno, faça movimentos suaves nas pernas, barriga (sentido horário) e costas. Escolha um momento em que o bebê esteja acordado e tranquilo.' },

  // ── 91–180 dias (3–6 meses) ───────────────────────────────────────────────

  { id: 't-017', category: 'desenvolvimento', icon: '🎯', min_age_days: 91, max_age_days: 180,
    title: 'Grasping: pegar objetos',
    body: 'Por volta dos 4 meses, o bebê começa a alcançar e pegar objetos intencionalmente. Ofereça **chocalhos leves, argolas de borracha e objetos macios** de cores contrastantes. Isso estimula coordenação olho-mão.' },
  { id: 't-018', category: 'desenvolvimento', icon: '😂', min_age_days: 91, max_age_days: 180,
    title: 'Gargalhada e vocalização',
    body: 'Entre 3–5 meses surgem as primeiras gargalhadas e sons consonantais ("ba", "ga", "da"). Responda imitando os sons — isso é a base de uma "conversa" e estimula o desenvolvimento da linguagem.' },
  { id: 't-019', category: 'sono', icon: '📅', min_age_days: 91, max_age_days: 180,
    title: 'Rotina de sono começa aqui',
    body: 'Por volta dos 3–4 meses, o ritmo circadiano começa a se consolidar. Hora consistente para dormir, sequência previsível (banho → amamentação → canção → apagar a luz) ajuda o cérebro a antecipar o sono.' },
  { id: 't-020', category: 'alimentacao', icon: '⏳', min_age_days: 91, max_age_days: 180,
    title: 'Ainda não é hora de papinha',
    body: 'A OMS recomenda **aleitamento materno exclusivo até os 6 meses**. Mesmo que o bebê pareça mais interessado em comida, o sistema digestivo ainda não está pronto. Paciência — a introdução alimentar está chegando!' },
  { id: 't-021', category: 'saude', icon: '🦷', min_age_days: 91, max_age_days: 180,
    title: 'Primeiros dentes: o que esperar',
    body: 'Os dentes de leite geralmente surgem entre **4 e 7 meses**. Sintomas: salivação excessiva, querer morder tudo, irritabilidade. Massageie a gengiva com dedo limpo. Evite mordedores gelados demais — podem machucar.' },
  { id: 't-022', category: 'saude', icon: '☀️', min_age_days: 91, max_age_days: 180,
    title: 'Vitamina D',
    body: 'A SBP recomenda suplementação de **vitamina D (400 UI/dia)** desde o nascimento até pelo menos 1 ano para bebês amamentados, pois o leite materno tem pouca vitamina D. Converse com o pediatra sobre a dosagem.' },
  { id: 't-023', category: 'brincadeiras', icon: '🔴', min_age_days: 91, max_age_days: 180,
    title: 'Contraste de cores',
    body: 'Até os 4 meses, o bebê vê melhor **preto, branco e vermelho** do que cores pastéis. Livros com alto contraste, móbiles e fichas com padrões geométricos são ótimos estímulos visuais nesta fase.' },

  // ── 181–270 dias (6–9 meses) ──────────────────────────────────────────────

  { id: 't-024', category: 'desenvolvimento', icon: '🧸', min_age_days: 181, max_age_days: 270,
    title: 'Sentar com apoio',
    body: 'Por volta dos 6 meses, o bebê começa a sentar com apoio das mãos ou de almofadas. Coloque-o no chão com brinquedos na frente para que ele explore. Não force a posição — ele se ajustará naturalmente conforme fortalece o tronco.' },
  { id: 't-025', category: 'desenvolvimento', icon: '🙈', min_age_days: 181, max_age_days: 270,
    title: 'Estranhamento: sinal de desenvolvimento',
    body: 'Por volta dos 7–9 meses, o bebê pode chorar com estranhos ou até com familiares que vê raramente. Isso é sinal de que ele entende que você é *diferente* — o **apego seguro** está se formando. É uma fase, não um problema.' },
  { id: 't-026', category: 'sono', icon: '🔔', min_age_days: 181, max_age_days: 270,
    title: 'Regressão de sono dos 6 meses',
    body: 'A maioria dos bebês passa por uma **regressão de sono** por volta dos 6 meses. Causas: salto de desenvolvimento, novos marcos motores (rolar, sentar). Mantenha a rotina, responda aos chamados com calma — dura cerca de 2–4 semanas.' },
  { id: 't-027', category: 'alimentacao', icon: '🥦', min_age_days: 181, max_age_days: 270,
    title: 'Introdução alimentar: primeiros alimentos',
    body: 'A partir dos 6 meses, inicie com **purês de vegetais**: batata, cenoura, abobrinha. Introduza **um alimento por vez**, aguardando 3 dias antes do próximo para identificar alergias. Continue o aleitamento materno.' },
  { id: 't-028', category: 'alimentacao', icon: '🥄', min_age_days: 181, max_age_days: 270,
    title: 'BLW ou papinha: ambos funcionam',
    body: 'Tanto o **BLW** (baby-led weaning — pedaços macios) quanto as papinhas são seguros e eficazes. O importante é oferecer alimentos variados, sem sal, sem açúcar e sem mel até 1 ano. Escolha o que funciona para sua família.' },
  { id: 't-029', category: 'saude', icon: '💉', min_age_days: 181, max_age_days: 270,
    title: 'Vacinas dos 6 meses',
    body: 'Aos 6 meses: **3ª dose da Pentavalente e VIP**, **2ª dose da Meningocócica C** e **influenza** (a partir de 6 meses). A gripe pode ser grave em bebês pequenos — a vacina anual é essencial.' },
  { id: 't-030', category: 'brincadeiras', icon: '🎭', min_age_days: 181, max_age_days: 270,
    title: 'Esconde-esconde com rosto',
    body: 'Cubra o rosto com as mãos e revele-se com "achou!". O bebê vai adorar porque **entende a permanência do objeto** mas ainda se surpreende com o retorno. Além de divertido, esse jogo desenvolve memória e antecipação.' },

  // ── 271–365 dias (9–12 meses) ─────────────────────────────────────────────

  { id: 't-031', category: 'desenvolvimento', icon: '🚶', min_age_days: 271, max_age_days: 365,
    title: 'Andar com apoio: incentive!',
    body: 'Por volta dos 9–12 meses, o bebê fica em pé segurando em móveis e começa a dar passos laterais. Deixe-o explorar com segurança — retire objetos pontiagudos baixos e cubra tomadas. Não force ou use andador.' },
  { id: 't-032', category: 'desenvolvimento', icon: '👉', min_age_days: 271, max_age_days: 365,
    title: 'Apontar: comunicação pré-verbal',
    body: 'O gesto de apontar (protodeclarativo) surge por volta dos 9–12 meses. É um marco importante de comunicação — o bebê compartilha interesse, não apenas pede. Responda sempre: "É isso? Um cachorro!" — valide a comunicação dele.' },
  { id: 't-033', category: 'sono', icon: '😴', min_age_days: 271, max_age_days: 365,
    title: 'Transição para 1 soneca diária',
    body: 'Por volta dos 9–12 meses, muitos bebês reduzem de 2 para 1 soneca diária. Se ele resistir à soneca da manhã, pode ser a hora. Mova a soneca única para o início da tarde (12h–14h) e antecipe um pouco a hora de dormir à noite.' },
  { id: 't-034', category: 'alimentacao', icon: '🥚', min_age_days: 271, max_age_days: 365,
    title: 'Introduzindo alergênicos',
    body: 'A APLV (alergia à proteína do leite de vaca) e alergia ao ovo são comuns. **Introduza cedo** (entre 6–12 meses) — evidências mostram que isso *reduz* o risco de alergia. Introduza em casa durante o dia para observar reações.' },
  { id: 't-035', category: 'alimentacao', icon: '🍯', min_age_days: 271, max_age_days: 365,
    title: 'Mel: proibido antes de 1 ano',
    body: 'O mel pode conter esporos de *Clostridium botulinum*, que causam **botulismo infantil** — doença grave em bebês. Não ofereça mel de nenhuma forma antes de completar **1 ano**. Após isso, é seguro.' },
  { id: 't-036', category: 'saude', icon: '🦷', min_age_days: 271, max_age_days: 365,
    title: 'Escovação desde o primeiro dente',
    body: 'Assim que o primeiro dente surgir, comece a escovar com escova infantil macia e **pasta de dente com flúor** (quantidade de grão de arroz até 3 anos). Escove após a mamada noturna — essa é a mais cariogênica.' },
  { id: 't-037', category: 'brincadeiras', icon: '🧩', min_age_days: 271, max_age_days: 365,
    title: 'Encaixe e permanência do objeto',
    body: 'Atividades como tirar e colocar objetos em recipientes, empilhar e derrubar blocos desenvolvem **coordenação motora fina** e o conceito de causalidade. Potes plásticos com tampas são brinquedos excelentes (e gratuitos!).' },

  // ── 366–548 dias (12–18 meses) ────────────────────────────────────────────

  { id: 't-038', category: 'desenvolvimento', icon: '🗣️', min_age_days: 366, max_age_days: 548,
    title: 'Explosão vocabular: estimule',
    body: 'Entre 12–18 meses, o vocabulário cresce rapidamente. Nomeie **tudo o que vê**, leia livros apontando figuras, responda às tentativas de fala expandindo: "baba?" → "Sim, é a bola!". Conversas ricas moldam o cérebro linguístico.' },
  { id: 't-039', category: 'desenvolvimento', icon: '🏃', min_age_days: 366, max_age_days: 548,
    title: 'Primeiros passos: cada bebê tem seu tempo',
    body: 'A maioria dos bebês anda sozinho entre **10 e 18 meses**. Variações dentro dessa faixa são normais. Se o bebê já engatinha bem, senta e fica em pé, está no caminho certo. Só consulte o pediatra se aos 18 meses ainda não andar.' },
  { id: 't-040', category: 'sono', icon: '😬', min_age_days: 366, max_age_days: 548,
    title: 'Resistência ao sono: normal nessa fase',
    body: 'A autonomia crescente traz resistência na hora de dormir. **Seja consistente**: hora fixa, rotina previsível, sem negociação. Uma rotina curta (15–20 min) e previsível é mais eficaz do que esticar o processo.' },
  { id: 't-041', category: 'alimentacao', icon: '🍽️', min_age_days: 366, max_age_days: 548,
    title: 'Refeições em família',
    body: 'A partir de 1 ano, o bebê deve comer **o que a família come** (sem sal em excesso, sem frituras, sem ultraprocessados). Refeições em família ensinam comportamento alimentar — coloque-o à mesa junto, mesmo que bagunce.' },
  { id: 't-042', category: 'alimentacao', icon: '😤', min_age_days: 366, max_age_days: 548,
    title: 'Neofobia alimentar: fase esperada',
    body: 'É normal o bebê recusar alimentos que antes aceitava — chama-se **neofobia alimentar** e é pico entre 12–18 meses. Continue oferecendo sem pressão. Estudos mostram que requer em média **15–20 exposições** a um alimento novo para aceitação.' },
  { id: 't-043', category: 'saude', icon: '💉', min_age_days: 366, max_age_days: 548,
    title: 'Vacinas do 1 ano',
    body: 'Com 1 ano: **Tríplice viral** (sarampo, caxumba, rubéola), **Varicela**, **Hepatite A** e **Meningocócica A,C,W,Y**. Consulte a caderneta e o pediatra para verificar se está em dia.' },
  { id: 't-044', category: 'brincadeiras', icon: '📚', min_age_days: 366, max_age_days: 548,
    title: 'Leitura compartilhada: construindo leitores',
    body: 'Leia com o bebê **todo dia**, mesmo que por 5 minutos. Livros com poucas palavras, imagens grandes e texturas são ideais. A leitura compartilhada amplia vocabulário, concentração e o amor pelos livros — investimento de vida inteira.' },

  // ── 549–730 dias (18–24 meses) ────────────────────────────────────────────

  { id: 't-045', category: 'desenvolvimento', icon: '🎭', min_age_days: 549, max_age_days: 730,
    title: 'Brincadeira simbólica: faz-de-conta',
    body: 'Ao "dar comida à boneca" ou "falar ao telefone de brinquedo", o bebê demonstra **pensamento simbólico** — habilidade cognitiva avançada. Brinque junto: "O urso está com fome? Que tal darmos uma sopa?" Isso desenvolve linguagem e criatividade.' },
  { id: 't-046', category: 'desenvolvimento', icon: '🪞', min_age_days: 549, max_age_days: 730,
    title: 'Autoconsciência: o teste do espelho',
    body: 'Por volta dos 18–24 meses, o bebê passa a reconhecer a própria imagem no espelho — sinal de **autoconsciência**. Pode surgir também o "eu" e o "meu" no vocabulário. Marcos de identidade importantes!' },
  { id: 't-047', category: 'sono', icon: '🛏️', min_age_days: 549, max_age_days: 730,
    title: 'Transição berço–cama',
    body: 'Se o bebê está tentando sair do berço (queda de risco!), pode ser hora da cama. Coloque um protetor no chão, explique que é a "cama de criança grande". Mantenha **a mesma rotina** — o ambiente muda, o ritual não.' },
  { id: 't-048', category: 'alimentacao', icon: '🥤', min_age_days: 549, max_age_days: 730,
    title: 'Transição para leite de vaca',
    body: 'Após 1 ano (sem alergia), o bebê pode tomar **leite de vaca integral pasteurizado** — sem precisar de fórmula. A SBP recomenda limitar a **400–500 mL/dia** para não reduzir o apetite por outros alimentos sólidos.' },
  { id: 't-049', category: 'saude', icon: '🦷', min_age_days: 549, max_age_days: 730,
    title: 'Primeira consulta ao dentista',
    body: 'Leve à primeira consulta odontológica **até os 12 meses** ou quando o primeiro dente surgir. O dentista avaliará oclusão, frenilhos, hábitos (chupeta, dedo) e ensina a higiene correta. Prevenção desde cedo evita cáries e problemas futuros.' },
  { id: 't-050', category: 'brincadeiras', icon: '🎨', min_age_days: 549, max_age_days: 730,
    title: 'Arte sensorial: explorar é aprender',
    body: 'Pintura com os dedos, massinha sem glúten, areia cinética — experiências sensoriais enriquecem **esquema corporal, criatividade e tolerância a texturas**. Aceite a bagunça (com proteção na mesa!). O processo importa, não o resultado.' },

  // ── Atemporais (todas as idades) ───────────────────────────────────────────

  { id: 't-051', category: 'saude', icon: '❤️', min_age_days: 0, max_age_days: -1,
    title: 'Saúde mental materna importa',
    body: 'O bem-estar da mãe afeta diretamente o bebê. Se você está se sentindo sobrecarregada, triste há mais de 2 semanas ou ansiosa em excesso, procure ajuda — pode ser **depressão pós-parto**. Não é fraqueza, é saúde. Converse com seu médico.' },
  { id: 't-052', category: 'desenvolvimento', icon: '🤱', min_age_days: 0, max_age_days: -1,
    title: 'Pele com pele: poder do contato',
    body: 'O contato pele a pele (método canguru) regula temperatura, frequência cardíaca e cortisol do bebê, aumenta produção de leite e fortalece o vínculo. Não é só para prematuros — todos os bebês se beneficiam.' },
]

/**
 * Returns tips relevant to the given baby age in days.
 * max_age_days === -1 means the tip applies to all ages.
 */
export function getTipsByAge(ageDays: number): Tip[] {
  return TIPS.filter(
    (t) => ageDays >= t.min_age_days && (t.max_age_days === -1 || ageDays <= t.max_age_days)
  )
}

/**
 * Returns tips filtered by age and category.
 */
export function getTipsByAgeAndCategory(ageDays: number, category: TipCategory): Tip[] {
  return getTipsByAge(ageDays).filter((t) => t.category === category)
}

export const TIP_CATEGORIES: TipCategory[] = [
  'desenvolvimento',
  'sono',
  'alimentacao',
  'saude',
  'brincadeiras',
]
