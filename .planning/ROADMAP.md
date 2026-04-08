# Roadmap: MamãeApp

**Created:** 2026-04-08
**Phases:** 10
**Requirements:** 67 v1 requirements

---

## Phase Summary

| # | Phase | Goal | Requirements | Plans |
|---|-------|------|--------------|-------|
| 1 | Foundation & Auth | Usuária pode criar conta, fazer login e ter sessão persistida | AUTH-01–06 | 6 |
| 2 | Baby Profile & Dashboard | Usuária pode cadastrar o bebê e ver o dashboard com resumo diário | BABY-01–03, BABY-05, DASH-01–05 | 7 |
| 3 | Core Trackers | Usuária pode registrar mamadas, fraldas e sono e ver tudo no dashboard | FEED-01–07, SLEEP-01–05, DIAP-01–04 | 8 |
| 4 | Notifications & Reminders | Usuária recebe alertas push de alimentação, medicamentos e vacinas | NOTF-01–06 | 6 |
| 5 | Milestones & Content | Usuária acompanha marcos de desenvolvimento e lê dicas contextualizadas | MILE-01–05, CONT-01–04 | 6 |
| 6 | Growth & Health | Usuária registra crescimento, vacinas, consultas e medicamentos | GROW-01–05, HLTH-01–07 | 7 |
| 7 | Reports & History | Usuária premium pode ver histórico detalhado e exportar PDF para o médico | REPT-01–04 | 5 |
| 8 | Subscription & Payments | Usuária pode assinar o plano premium e fazer upgrade/downgrade via Stripe | SUBS-01–06, BABY-04 | 7 |
| 9 | PWA Polish & Settings | App é instalável, funciona offline, tem dark mode e preferências configuráveis | PWA-01–05, SETT-01–05 | 7 |
| 10 | QA & Launch Prep | App está testado, performático, LGPD-compliant e pronto para lançamento | Cross-cutting | 8 |

---

## Phase Details

---

### Phase 1: Foundation & Auth

**Goal:** Usuária pode criar conta com email/senha ou Google, confirmar o email, redefinir a senha e ter a sessão mantida entre acessos. Base técnica do projeto está operacional.

**Requirements:**
- AUTH-01: Usuária pode criar conta com email e senha
- AUTH-02: Usuária recebe email de verificação após cadastro
- AUTH-03: Usuária pode redefinir senha via link por email
- AUTH-04: Sessão persiste entre atualizações de página (stay logged in)
- AUTH-05: Usuária pode fazer login com Google (OAuth)
- AUTH-06: Usuária pode excluir conta e todos os dados (LGPD)

**Success Criteria:**
1. Uma nova usuária consegue criar conta, confirmar email e acessar o app em menos de 2 minutos
2. Ao fechar e reabrir o navegador, a usuária continua logada sem precisar inserir senha novamente
3. Ao clicar em "Entrar com Google", a usuária é autenticada e redirecionada ao app em 1 clique
4. Ao solicitar redefinição de senha, a usuária recebe o email em até 1 minuto e consegue trocar a senha
5. Ao excluir a conta, todos os dados são removidos e a usuária recebe confirmação (LGPD)

**Plans (6):**
1. Supabase project setup + schema inicial + variáveis de ambiente — criar projeto Supabase, configurar .env, definir schema base (users, babies), habilitar Row Level Security
2. Vite + React 18 + TypeScript + TailwindCSS + PWA manifest base — scaffolding do projeto, configurar Tailwind, instalar dependências, criar manifest.json e estrutura de pastas
3. React Router + layout shell + mobile nav — configurar rotas protegidas e públicas, criar layout com bottom nav mobile-first, placeholder pages
4. Tela de cadastro e login com email/senha — formulários com validação (react-hook-form + zod), integração com Supabase Auth, tratamento de erros
5. Google OAuth + email de verificação + reset de senha — configurar OAuth no Supabase, fluxo de verificação de email, tela de reset, email templates
6. Exclusão de conta (LGPD) + persistência de sessão + testes manuais de auth — fluxo de delete account com cascade no Supabase, verificar sessão persistida via Supabase session, smoke test completo do auth

---

### Phase 2: Baby Profile & Dashboard

**Goal:** Usuária pode cadastrar o bebê com nome, nascimento, sexo e foto, e ver um dashboard com a idade do bebê, registros rápidos e próximos lembretes (mesmo que ainda vazios).

**Requirements:**
- BABY-01: Usuária pode cadastrar um bebê com nome, data de nascimento e sexo
- BABY-02: Usuária pode adicionar foto do bebê ao perfil
- BABY-03: Usuária pode editar os dados do bebê
- BABY-05: Usuária pode selecionar qual bebê está visualizando (switcher — free: 1 bebê, premium: N)
- DASH-01: Dashboard exibe resumo do dia: última mamada, horas de sono, trocas de fralda
- DASH-02: Dashboard exibe próximos lembretes ativos
- DASH-03: Dashboard exibe idade do bebê em meses e dias
- DASH-04: Dashboard exibe botões de registro rápido (mamada, fralda, sono)
- DASH-05: Dashboard tem modo escuro automático (para uso na madrugada)

**Success Criteria:**
1. Após o cadastro, a usuária é direcionada para criar o perfil do bebê antes de ver o dashboard
2. O dashboard exibe a idade do bebê em "X meses e Y dias" atualizada automaticamente
3. Os botões de registro rápido estão acessíveis com o polegar sem precisar rolar a tela
4. O dark mode ativa automaticamente quando o sistema está em modo escuro
5. Usuária consegue editar nome, data e foto do bebê sem sair do fluxo principal

**Plans (7):**
1. Schema Supabase para bebês + RLS por usuária — tabela `babies` com FK para `users`, políticas RLS, migration
2. Tela de onboarding + criação do perfil do bebê — formulário pós-cadastro (nome, nascimento, sexo), redirect obrigatório antes do dashboard
3. Upload de foto do bebê — integração com Supabase Storage, compressão de imagem no cliente, placeholder avatar
4. Dashboard shell com cálculo de idade + modo escuro — componente de idade, layout responsivo, Tailwind dark mode (class strategy), detecção via prefers-color-scheme
5. Seção de registro rápido no dashboard — botões FAB-style para mamada/fralda/sono (ações ainda não funcionais, apenas UI preparada)
6. Seção de resumo diário no dashboard — slots para última mamada, horas de sono, trocas (exibir "—" enquanto sem dados)
7. Baby switcher + edição de perfil — switcher no header (ativo apenas se houver múltiplos bebês), tela de edição de perfil completa

---

### Phase 3: Core Trackers

**Goal:** Usuária pode registrar mamadas (peito e mamadeira), fraldas e sono com um toque, editar ou excluir registros, e ver o resumo do dia atualizado em tempo real no dashboard.

**Requirements:**
- FEED-01: Registrar mamada no peito com lado e duração
- FEED-02: Registrar mamadeira com volume e tipo
- FEED-03: Registrar introdução alimentar com alimento e quantidade
- FEED-04: Editar ou excluir registros de alimentação
- FEED-05: Ver histórico das últimas 24h no dashboard
- FEED-06: Ver quanto tempo faz desde a última mamada
- FEED-07: Alerta visual quando bebê está há mais de N horas sem mamar
- SLEEP-01: Iniciar e encerrar registro de sono com um toque
- SLEEP-02: Adicionar registro de sono manualmente (horário passado)
- SLEEP-03: Ver total de horas de sono nas últimas 24h no dashboard
- SLEEP-04: Editar ou excluir registros de sono
- SLEEP-05: Recomendação de horas de sono por faixa etária
- DIAP-01: Registrar troca de fralda com tipo (xixi, cocô, ambos) com um toque
- DIAP-02: Ver total de trocas do dia no dashboard
- DIAP-03: Adicionar nota à troca (cor, consistência)
- DIAP-04: Editar ou excluir registros de fralda

**Success Criteria:**
1. Usuária consegue registrar uma mamada completa (peito esquerdo, 15 min) em menos de 10 segundos com uma mão
2. Após registrar, o dashboard atualiza o resumo diário imediatamente sem recarregar a página
3. O timer de sono pode ser iniciado com um toque e encerrado ao retornar ao app
4. O alerta "bebê sem mamar há X horas" aparece visualmente no dashboard quando o threshold é atingido
5. Todos os registros podem ser editados ou excluídos a partir do histórico

**Plans (8):**
1. Schema Supabase para trackers — tabelas `feedings`, `sleeps`, `diapers` com FK para `babies`, RLS, índices por `baby_id + started_at`
2. Feeding tracker UI — formulário de amamentação (lado + timer ativo) + formulário de mamadeira (volume + tipo)
3. Feeding tracker — introdução alimentar + edição/exclusão + histórico 24h no dashboard
4. Sleep tracker — botão de iniciar/encerrar sono (timer em tempo real) + registro manual retroativo
5. Sleep tracker — edição/exclusão + total de sono no dashboard + recomendação por faixa etária
6. Diaper tracker — registro rápido de troca (3 botões: xixi / cocô / ambos) + nota opcional
7. Diaper tracker — edição/exclusão + contador de trocas no dashboard
8. Alerta visual de "sem mamar há N horas" + integração dos 3 trackers no dashboard (resumo em tempo real via Supabase realtime ou polling)

---

### Phase 4: Notifications & Reminders

**Goal:** Usuária pode ativar notificações push, configurar lembretes de alimentação recorrentes, definir horário de silêncio e receber alertas de medicamentos e vacinas diretamente no celular mesmo com o app fechado.

**Requirements:**
- NOTF-01: Configurar lembretes de alimentação recorrentes (ex: a cada 3h)
- NOTF-02: Configurar lembrete de vacina (7 dias antes, no dia)
- NOTF-03: Configurar lembrete de medicamento com frequência personalizada
- NOTF-04: Notificações via Web Push (mesmo com app fechado no Android)
- NOTF-05: Ativar/desativar cada tipo de notificação individualmente
- NOTF-06: App respeita horário de silêncio configurável

**Success Criteria:**
1. Usuária recebe notificação push de alimentação no celular mesmo com a tela bloqueada (Android Chrome)
2. Ao configurar lembrete a cada 3h, a notificação chega consistentemente no horário correto
3. Notificações não chegam durante o horário de silêncio configurado pela usuária
4. Usuária consegue desativar lembretes de alimentação sem afetar os de medicamento
5. No dashboard, os próximos lembretes ativos aparecem com hora prevista

**Plans (6):**
1. Service worker setup + Web Push API — registrar SW, solicitar permissão de notificação, gerar VAPID keys, configurar Supabase Edge Function para envio de push
2. Schema de reminders + Supabase cron ou Edge Function scheduler — tabela `reminders`, lógica de recorrência, agendamento server-side
3. UI de configuração de lembretes de alimentação — formulário (intervalo, hora de início), toggle ativar/desativar, preview de próximo lembrete
4. Lembretes de medicamento — formulário (nome, dose, frequência), integração com HLTH-06 (Phase 6 forward-compat)
5. Horário de silêncio + lembretes de vacina — configuração de janela de silêncio (start/end time), alerta 7 dias antes e no dia da vacina (baseado no calendário SUS)
6. Dashboard: exibir próximos lembretes ativos + smoke test de push em dispositivo Android real

---

### Phase 5: Milestones & Content

**Goal:** Usuária pode visualizar os marcos de desenvolvimento organizados por faixa etária, marcar os conquistados com data e foto, e receber dicas contextualizadas à idade atual do bebê.

**Requirements:**
- MILE-01: Lista de marcos por faixa etária (7 faixas: 0–1m até 18–24m)
- MILE-02: Marcar marco como conquistado com data
- MILE-03: Destaque visual quando bebê atinge nova faixa de marcos
- MILE-04: Adicionar foto ao marco conquistado
- MILE-05: Timeline visual de todos os marcos conquistados
- CONT-01: Dicas contextualizadas à idade atual do bebê (auto-atualiza)
- CONT-02: Dicas cobrem 5 categorias: desenvolvimento, sono, alimentação, saúde, brincadeiras
- CONT-03: Usuária pode salvar dicas favoritas
- CONT-04: Artigo de boas-vindas ao atingir novo mês de vida

**Success Criteria:**
1. Ao abrir "Marcos", a usuária vê imediatamente a faixa etária atual do bebê em destaque
2. Marcar um marco como conquistado requer no máximo 2 toques (selecionar + confirmar data)
3. As dicas exibidas mudam automaticamente quando o bebê completa um novo mês
4. Usuária consegue adicionar foto a um marco diretamente da câmera ou galeria
5. A timeline mostra os marcos conquistados em ordem cronológica com foto quando disponível

**Plans (6):**
1. Schema Supabase para milestones — tabela `milestone_definitions` (seed com marcos OMS/SBP), tabela `baby_milestones` (conquistas por bebê), RLS
2. Tela de marcos por faixa etária — lista agrupada por faixa, destaque da faixa atual, indicador de progresso por faixa
3. Marcar marco como conquistado + foto — modal de confirmação com data picker, upload de foto (Supabase Storage), destaque visual de nova faixa
4. Timeline visual de marcos conquistados — view cronológica, miniatura de foto, filtro por faixa
5. Schema + seed de dicas de conteúdo — tabela `tips` com campos (categoria, min_age_days, max_age_days, título, corpo), seed com 50+ dicas PT-BR
6. Tela de dicas contextualizadas — filtro automático por idade, tabs por categoria, salvar favoritos, artigo de boas-vindas ao novo mês (trigger por idade calculada)

---

### Phase 6: Growth & Health

**Goal:** Usuária pode registrar peso, altura e perímetro cefálico com visualização em gráfico de curva de crescimento (OMS), gerenciar o calendário de vacinação SUS, registrar consultas, sintomas e medicamentos.

**Requirements:**
- GROW-01: Registrar peso com data
- GROW-02: Registrar altura com data
- GROW-03: Registrar perímetro cefálico com data
- GROW-04: Gráfico de curva de crescimento comparado à OMS
- GROW-05: Exibir percentil atual de peso e altura
- HLTH-01: Registrar consultas médicas com data, médico e observações
- HLTH-02: Calendário de vacinação padrão SUS por faixa etária
- HLTH-03: Marcar vacinas como aplicadas com data e local
- HLTH-04: Registrar sintomas/intercorrências com data e descrição
- HLTH-05: Aviso quando vacina está próxima (7 dias antes)
- HLTH-06: Registrar medicamentos com horários e doses
- HLTH-07: Lembrete da próxima dose de medicamento via notificação

**Success Criteria:**
1. Após registrar o peso, o gráfico atualiza imediatamente e mostra o ponto novo na curva OMS
2. O percentil atual é exibido em linguagem simples ("seu bebê está acima de 60% dos bebês da mesma idade")
3. O calendário de vacinação SUS mostra claramente quais vacinas estão em atraso, em dia ou futuras
4. Usuária consegue registrar um medicamento e o lembrete é configurado automaticamente na próxima dose
5. Ao marcar uma vacina como aplicada, o lembrete correspondente (NOTF-02) é desativado automaticamente

**Plans (7):**
1. Schema Supabase para crescimento — tabela `growth_records` (peso, altura, perímetro, data), RLS
2. Formulário de registro de crescimento — inputs com validação de range (peso 1–30kg, altura 30–120cm), histórico de medições em lista
3. Gráfico de curva de crescimento OMS — integrar Recharts ou Chart.js, dataset OMS p3/p15/p50/p85/p97 por sexo, overlay com pontos reais, percentil calculado
4. Schema para saúde — tabelas `health_appointments`, `vaccinations`, `symptoms`, `medications`, seed com calendário SUS 2024
5. Calendário de vacinação SUS — view por faixa etária, status (pendente/em atraso/aplicada), tela de marcar como aplicada (data + local)
6. Registro de consultas e sintomas — formulário de consulta (data, médico, observações), formulário de sintoma (data, descrição, gravidade)
7. Registro de medicamentos + integração com reminders — formulário (nome, dose, frequência, início), criação automática de reminder (NOTF-03), desativação de vacina ao marcar como aplicada

---

### Phase 7: Reports & History

**Goal:** Usuária premium pode visualizar histórico detalhado de alimentação e sono por período (7, 14 ou 30 dias) e exportar um PDF organizado para levar à consulta médica. Usuária free vê apenas 48h.

**Requirements:**
- REPT-01: Usuária (premium) pode ver histórico completo de alimentação por período (7, 14, 30 dias)
- REPT-02: Usuária (premium) pode ver histórico completo de sono por período
- REPT-03: Usuária (premium) pode exportar histórico em PDF para consulta médica
- REPT-04: Usuária (free) vê histórico das últimas 48 horas (limite freemium)

**Success Criteria:**
1. Usuária free vê claramente o limite de 48h e um CTA para upgrade sem que a experiência pareça bloqueada de forma agressiva
2. Usuária premium acessa o histórico de 30 dias com visualização gráfica (não apenas lista)
3. O PDF exportado é legível em papel A4, tem logo do app, nome do bebê, período e dados organizados por dia
4. A geração do PDF leva menos de 5 segundos para 30 dias de dados
5. O histórico é filtrável por tipo de registro (só alimentação, só sono, etc.)

**Plans (5):**
1. Feature flag de premium + gate de freemium — middleware de verificação de plano, componente `<PremiumGate>` reutilizável, CTA de upgrade inline
2. Tela de histórico de alimentação — filtro de período (48h / 7d / 14d / 30d), lista agrupada por dia, totais por dia, gráfico de barras de mamadas/dia
3. Tela de histórico de sono — mesma estrutura, gráfico de blocos de sono no tempo, comparação com recomendação por faixa etária
4. Geração de PDF — usar jsPDF + html2canvas ou react-pdf, template com cabeçalho (logo, bebê, período), seções por tracker, rodapé com data de geração
5. Integração de histórico no dashboard + testes de gatekeeping — links de "ver mais" no dashboard direcionando ao histórico, verificar que free não acessa rota premium diretamente

---

### Phase 8: Subscription & Payments

**Goal:** Usuária pode ver comparativo de planos, assinar o premium por R$19,90/mês via Stripe com cartão ou PIX, cancelar a qualquer momento, e o app aplica as restrições corretas de plano automaticamente.

**Requirements:**
- SUBS-01: Visualizar comparativo de planos (free vs. premium)
- SUBS-02: Assinar plano premium via Stripe (R$19,90/mês)
- SUBS-03: Acesso imediato após pagamento confirmado
- SUBS-04: Cancelar assinatura a qualquer momento
- SUBS-05: Downgrade automático para free quando assinatura expira
- SUBS-06: Email de confirmação e recibo por pagamento
- BABY-04: Cadastrar múltiplos bebês (plano premium)

**Success Criteria:**
1. Tela de comparativo mostra claramente o que cada plano inclui em menos de 5 segundos de leitura
2. Fluxo de checkout completo (do CTA ao acesso premium) leva menos de 2 minutos
3. Após pagamento confirmado via webhook Stripe, a usuária ganha acesso premium sem precisar sair e entrar de novo
4. Ao cancelar, a usuária mantém acesso premium até o fim do período pago e depois é downgradada automaticamente
5. Usuária premium consegue cadastrar um segundo bebê imediatamente após o upgrade

**Plans (7):**
1. Stripe setup + Supabase schema de assinaturas — criar produto e preço no Stripe (BRL), tabela `subscriptions`, Edge Function para webhook, variáveis de ambiente
2. Webhook Stripe — handler para eventos (checkout.session.completed, customer.subscription.deleted, invoice.payment_failed), update de status no Supabase
3. Tela de planos (pricing page) — comparativo visual free vs. premium, CTA de assinatura, exibição do preço em BRL, suporte a Stripe PIX (se disponível)
4. Checkout flow — Stripe Checkout Session criada via Edge Function, redirect para Stripe, return URL com estado de sucesso
5. Gestão de assinatura — tela "Minha Assinatura" (status, próxima cobrança, botão de cancelar), fluxo de cancelamento com confirmação
6. Downgrade automático + múltiplos bebês — cron job ou webhook handler para expiração, bloquear criação de bebê #2 para free, unlocks baby-04 para premium
7. Emails transacionais — configurar Supabase email templates para confirmação de pagamento e recibo, ou integrar Resend/SendGrid

---

### Phase 9: PWA Polish & Settings

**Goal:** O app é instalável na tela inicial do Android e iOS, funciona com dados básicos offline, carrega em menos de 3s em 4G, e a usuária pode configurar tema, unidades e exportar dados.

**Requirements:**
- PWA-01: Instalável via "Adicionar à tela inicial" em Android e iOS
- PWA-02: Dashboard e últimos registros carregam offline (service worker cache)
- PWA-03: Registros feitos offline sincronizam automaticamente ao reconectar
- PWA-04: App carrega em menos de 3s em 4G
- PWA-05: App é responsivo e utilizável em telas a partir de 320px
- SETT-01: Alternar entre tema claro e escuro manualmente
- SETT-02: App detecta preferência do sistema (prefers-color-scheme)
- SETT-03: Configurar unidade de volume (ml / oz)
- SETT-04: Configurar unidade de peso (kg / lb)
- SETT-05: Exportar todos os dados (LGPD)

**Success Criteria:**
1. No Android Chrome, o banner "Adicionar à tela inicial" aparece automaticamente após a segunda visita
2. Ao ficar sem internet, a usuária ainda consegue ver o dashboard e os últimos registros
3. Um registro feito offline aparece no histórico assim que a conexão é restaurada
4. Lighthouse PWA score >= 90 e Performance score >= 80 em mobile
5. A tela de configurações permite trocar tema, unidades e exportar dados em menos de 30 segundos

**Plans (7):**
1. Web App Manifest completo — ícones (192x192, 512x512, maskable), theme-color, display: standalone, screenshots para install prompt
2. Service worker com Workbox — estratégias de cache (cache-first para assets, network-first para API), precaching de shell
3. Offline data layer — cache de últimos registros no IndexedDB (idb-keyval), lógica de read-from-cache quando offline
4. Sync offline → online — background sync API ou listener de online event, fila de operações pendentes no IndexedDB, merge com Supabase ao reconectar
5. Performance: code splitting + lazy loading + image optimization — React.lazy por rota, compressão de imagens, bundle analysis, target < 3s FCP em 4G
6. Tela de configurações — toggle tema (light/dark/system), seletor de unidades (ml/oz, kg/lb), persistência em Supabase + localStorage
7. Exportação de dados LGPD + responsividade 320px — endpoint de export (JSON/CSV de todos os registros), testes de layout em viewport 320px, ajustes de breakpoints

---

### Phase 10: QA & Launch Prep

**Goal:** O app passou por testes cross-browser, não tem bugs críticos conhecidos, está em conformidade com a LGPD, tem monitoring básico ativo e o time está pronto para o lançamento público.

**Requirements:** Cross-cutting — todos os requisitos v1 devem estar funcionando corretamente e em conformidade com os critérios de aceite das fases anteriores.

**Success Criteria:**
1. App funciona sem bugs visuais ou funcionais no Chrome (Android), Safari (iOS 16.4+) e Chrome (desktop)
2. Lighthouse score: PWA >= 90, Performance >= 80, Accessibility >= 90, Best Practices >= 90
3. Política de privacidade e termos de uso estão publicados e acessíveis antes do cadastro
4. Dados de menores não são expostos em URLs, logs ou respostas de API sem autenticação
5. Error tracking (Sentry) está capturando erros em produção e alertas de uptime configurados

**Plans (8):**
1. Testes cross-browser — matriz de testes: Chrome Android, Safari iOS 16+, Chrome desktop, Firefox desktop; documentar e corrigir bugs encontrados
2. Audit de acessibilidade — verificar contraste de cores (WCAG AA), labels em formulários, navegação por teclado, screen reader básico
3. Audit de segurança — revisar RLS policies no Supabase, verificar que nenhuma rota retorna dados de outros usuários, sanitização de inputs, headers de segurança (CSP, HSTS)
4. LGPD compliance — política de privacidade escrita (dados coletados, finalidade, retenção, direitos), modal de consentimento no primeiro acesso, fluxo de exclusão de conta testado (AUTH-06)
5. Performance final — bundle analysis, lazy loading validado, WebP para imagens, Lighthouse audit em mobile real, correções de pontos críticos
6. Error tracking + monitoring — configurar Sentry (frontend), alertas de uptime (BetterUptime ou similar), logs de Edge Functions no Supabase
7. Seed de conteúdo final — completar seed de dicas (CONT-01–04) com 80+ dicas revisadas, seed de marcos (MILE-01) validado com referência pediátrica, calendário SUS 2025 verificado
8. Checklist de lançamento + deploy de produção — domínio próprio configurado, SSL ativo, variáveis de ambiente de prod configuradas, smoke test completo em produção, backups automáticos do banco habilitados

---

*Roadmap defined: 2026-04-08*
*Total plans: 67 plans across 10 phases*
