# Requirements: MamãeApp

**Defined:** 2026-04-08
**Core Value:** Uma mãe exausta consegue registrar uma mamada ou verificar o próximo lembrete em menos de 10 segundos, com uma mão só.

---

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: Usuária pode criar conta com email e senha
- [ ] **AUTH-02**: Usuária recebe email de verificação após cadastro
- [ ] **AUTH-03**: Usuária pode redefinir senha via link por email
- [ ] **AUTH-04**: Sessão persiste entre atualizações de página (stay logged in)
- [ ] **AUTH-05**: Usuária pode fazer login com Google (OAuth)
- [ ] **AUTH-06**: Usuária pode excluir conta e todos os dados (LGPD)

### Baby Profile

- [ ] **BABY-01**: Usuária pode cadastrar um bebê com nome, data de nascimento e sexo
- [ ] **BABY-02**: Usuária pode adicionar foto do bebê ao perfil
- [ ] **BABY-03**: Usuária pode editar os dados do bebê
- [ ] **BABY-04**: Usuária pode cadastrar múltiplos bebês (plano premium)
- [ ] **BABY-05**: Usuária pode selecionar qual bebê está visualizando (switcher)

### Feeding Tracker

- [ ] **FEED-01**: Usuária pode registrar mamada no peito com lado (esquerdo/direito) e duração
- [ ] **FEED-02**: Usuária pode registrar mamadeira com volume (ml) e tipo (leite materno/fórmula)
- [ ] **FEED-03**: Usuária pode registrar introdução alimentar com alimento e quantidade
- [ ] **FEED-04**: Usuária pode editar ou excluir registros de alimentação
- [ ] **FEED-05**: Usuária vê o histórico das últimas 24 horas no dashboard
- [ ] **FEED-06**: Usuária vê quanto tempo faz desde a última mamada
- [ ] **FEED-07**: App exibe alerta visual quando bebê está há mais de N horas sem mamar (N configurável)

### Sleep Tracker

- [ ] **SLEEP-01**: Usuária pode iniciar e encerrar registro de sono com um toque
- [ ] **SLEEP-02**: Usuária pode adicionar registro de sono manualmente (horário passado)
- [ ] **SLEEP-03**: Usuária vê total de horas de sono nas últimas 24 horas no dashboard
- [ ] **SLEEP-04**: Usuária pode editar ou excluir registros de sono
- [ ] **SLEEP-05**: App exibe recomendação de horas de sono por faixa etária

### Diaper Tracker

- [ ] **DIAP-01**: Usuária pode registrar troca de fralda com tipo (xixi, cocô, ambos) com um toque
- [ ] **DIAP-02**: Usuária vê total de trocas do dia no dashboard
- [ ] **DIAP-03**: Usuária pode adicionar nota à troca (cor, consistência)
- [ ] **DIAP-04**: Usuária pode editar ou excluir registros de fralda

### Growth Tracking

- [ ] **GROW-01**: Usuária pode registrar peso do bebê com data
- [ ] **GROW-02**: Usuária pode registrar altura do bebê com data
- [ ] **GROW-03**: Usuária pode registrar perímetro cefálico com data
- [ ] **GROW-04**: App exibe gráfico de curva de crescimento comparado à OMS
- [ ] **GROW-05**: App exibe percentil atual de peso e altura

### Milestones

- [ ] **MILE-01**: App exibe lista de marcos por faixa etária (0-1m, 1-3m, 3-6m, 6-9m, 9-12m, 12-18m, 18-24m)
- [ ] **MILE-02**: Usuária pode marcar marco como conquistado com data
- [ ] **MILE-03**: App exibe destaque visual quando bebê atinge nova faixa de marcos
- [ ] **MILE-04**: Usuária pode adicionar foto ao marco conquistado
- [ ] **MILE-05**: Usuária pode ver timeline visual de todos os marcos conquistados

### Health & Vaccinations

- [ ] **HLTH-01**: Usuária pode registrar consultas médicas com data, médico e observações
- [ ] **HLTH-02**: App exibe calendário de vacinação padrão SUS por faixa etária
- [ ] **HLTH-03**: Usuária pode marcar vacinas como aplicadas com data e local
- [ ] **HLTH-04**: Usuária pode registrar sintomas/intercorrências com data e descrição
- [ ] **HLTH-05**: App exibe aviso quando vacina do calendário está próxima (7 dias antes)
- [ ] **HLTH-06**: Usuária pode registrar medicamentos com horários e doses
- [ ] **HLTH-07**: App lembra da próxima dose de medicamento via notificação

### Content & Tips

- [ ] **CONT-01**: App exibe dicas contextualizadas à idade atual do bebê (atualiza automaticamente)
- [ ] **CONT-02**: Dicas cobrem categorias: desenvolvimento, sono, alimentação, saúde, brincadeiras
- [ ] **CONT-03**: Usuária pode salvar dicas favoritas
- [ ] **CONT-04**: App exibe artigo de boas-vindas por faixa etária ao atingir novo mês

### Notifications & Reminders

- [ ] **NOTF-01**: Usuária pode configurar lembretes de alimentação recorrentes (ex: a cada 3h)
- [ ] **NOTF-02**: Usuária pode configurar lembrete de vacina (7 dias antes, no dia)
- [ ] **NOTF-03**: Usuária pode configurar lembrete de medicamento com frequência personalizada
- [ ] **NOTF-04**: Notificações chegam via Web Push (mesmo com app fechado no Android)
- [ ] **NOTF-05**: Usuária pode ativar/desativar cada tipo de notificação individualmente
- [ ] **NOTF-06**: App respeita horário de silêncio configurável (ex: não notificar entre 22h–6h)

### Dashboard

- [ ] **DASH-01**: Dashboard exibe resumo do dia: última mamada, horas de sono, trocas de fralda
- [ ] **DASH-02**: Dashboard exibe próximos lembretes ativos
- [ ] **DASH-03**: Dashboard exibe idade do bebê em meses e dias
- [ ] **DASH-04**: Dashboard exibe botões de registro rápido (mamada, fralda, sono)
- [ ] **DASH-05**: Dashboard tem modo escuro automático (para uso na madrugada)

### Reports & History

- [ ] **REPT-01**: Usuária (premium) pode ver histórico completo de alimentação por período (7, 14, 30 dias)
- [ ] **REPT-02**: Usuária (premium) pode ver histórico completo de sono por período
- [ ] **REPT-03**: Usuária (premium) pode exportar histórico em PDF para consulta médica
- [ ] **REPT-04**: Usuária (free) vê histórico das últimas 48 horas (limite freemium)

### Subscription & Payments

- [ ] **SUBS-01**: Usuária pode visualizar comparativo de planos (free vs. premium)
- [ ] **SUBS-02**: Usuária pode assinar o plano premium via Stripe (R$19,90/mês)
- [ ] **SUBS-03**: Usuária premium recebe acesso imediato após pagamento confirmado
- [ ] **SUBS-04**: Usuária pode cancelar assinatura a qualquer momento
- [ ] **SUBS-05**: App downgrade automaticamente para free quando assinatura expira
- [ ] **SUBS-06**: Usuária recebe email de confirmação e recibo por pagamento

### PWA & Offline

- [ ] **PWA-01**: App instalável via "Adicionar à tela inicial" em Android e iOS
- [ ] **PWA-02**: Dashboard e últimos registros carregam offline (service worker cache)
- [ ] **PWA-03**: Registros feitos offline sincronizam automaticamente ao reconectar
- [ ] **PWA-04**: App carrega em menos de 3s em 4G
- [ ] **PWA-05**: App é responsivo e utilizável em telas a partir de 320px

### User Settings

- [ ] **SETT-01**: Usuária pode alternar entre tema claro e escuro manualmente
- [ ] **SETT-02**: App detecta preferência do sistema (prefers-color-scheme)
- [ ] **SETT-03**: Usuária pode configurar unidade de volume (ml / oz)
- [ ] **SETT-04**: Usuária pode configurar unidade de peso (kg / lb)
- [ ] **SETT-05**: Usuária pode exportar todos os seus dados (LGPD)

---

## v2 Requirements

### Social & Community
- **SOCL-01**: Usuária pode entrar em grupos por faixa etária do bebê
- **SOCL-02**: Usuária pode compartilhar marcos nas redes sociais

### AI & Personalization
- **AI-01**: App sugere rotina otimizada baseada nos registros históricos
- **AI-02**: App detecta padrões incomuns e alerta a mãe

### Wearables & Integrations
- **WEAR-01**: Integração com Apple Health / Google Fit para dados de sono
- **WEAR-02**: Integração com balança Bluetooth para peso automático

### Telemedicine
- **TELE-01**: Chat com enfermeira pediatra (parceria)
- **TELE-02**: Agendamento de consulta online

### App Nativo
- **NATV-01**: App iOS nativo (Swift/React Native)
- **NATV-02**: App Android nativo

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Diagnóstico médico por IA | Risco legal e médico — exige registro no CFM |
| Chat em tempo real com médicos | Complexidade operacional e legal fora do v1 |
| Marketplace de produtos para bebê | Distrai do core value; modelo de negócio diferente |
| Multi-idioma (EN, ES) | Foco PT-BR para validar no mercado brasileiro primeiro |
| App nativo (iOS/Android) | PWA suficiente para v1; nativo só com tração comprovada |
| Vídeos de conteúdo | Custo de armazenamento/CDN alto; links externos suficientes |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01–06 | Phase 1 | Pending |
| BABY-01–03, BABY-05 | Phase 2 | Pending |
| BABY-04 | Phase 8 | Pending |
| DASH-01–05 | Phase 2 | Pending |
| FEED-01–07 | Phase 3 | Pending |
| SLEEP-01–05 | Phase 3 | Pending |
| DIAP-01–04 | Phase 3 | Pending |
| NOTF-01–06 | Phase 4 | Pending |
| MILE-01–05 | Phase 5 | Pending |
| CONT-01–04 | Phase 5 | Pending |
| GROW-01–05 | Phase 6 | Pending |
| HLTH-01–07 | Phase 6 | Pending |
| REPT-01–04 | Phase 7 | Pending |
| SUBS-01–06 | Phase 8 | Pending |
| PWA-01–05 | Phase 9 | Pending |
| SETT-01–05 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 67 total
- Mapped to phases: 67
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-08 after initial definition*
