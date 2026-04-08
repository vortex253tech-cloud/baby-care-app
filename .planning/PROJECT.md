# MamãeApp — Cuidado Inteligente para Bebês

## What This Is

Progressive Web App (PWA) voltado para mães de bebês recém-nascidos e bebês de até 2 anos. Centraliza lembretes de alimentação, acompanhamento de marcos de desenvolvimento, rastreamento de rotinas (sono, fraldas, amamentação) e suporte básico de saúde infantil. Design criado especificamente para mães de primeira viagem — intuitivo, rápido e acessível via qualquer navegador sem instalação de app.

## Core Value

Uma mãe exausta consegue registrar uma mamada ou verificar o próximo lembrete em menos de 10 segundos, com uma mão só.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Usuária pode criar conta e cadastrar perfil do bebê
- [ ] Lembretes de alimentação com notificações push personalizáveis
- [ ] Registro rápido de mamadas, fraldas e sono
- [ ] Linha do tempo de marcos de desenvolvimento com checklist por faixa etária
- [ ] Dicas de saúde e desenvolvimento contextualizadas à idade do bebê
- [ ] Dashboard com resumo diário (última mamada, horas de sono, fraldas)
- [ ] Relatórios de histórico (plano premium)
- [ ] Múltiplos bebês por conta (plano premium)
- [ ] Assinatura freemium com upgrade via Stripe

### Out of Scope

- App nativo iOS/Android (App Store/Play Store) — v2 se tração validada
- Chat ao vivo com pediatras — complexidade legal e operacional fora do escopo v1
- Inteligência artificial generativa para diagnóstico — risco médico, fora de escopo
- Grupos e comunidade social — distrai do core; v2 se validado
- Suporte multi-idioma v1 — foco em PT-BR inicialmente

## Context

- **Plataforma:** PWA (React + Vite + Tailwind + Supabase)
- **Usuária-alvo:** Mães de primeira viagem, bebês 0–24 meses, Brasil
- **Monetização:** Freemium — básico grátis, premium R$19,90/mês via Stripe
- **Diferencial:** UX extremamente simples (uso com uma mão, tela escura para madrugada), sem necessidade de instalar app
- **Push Notifications:** Web Push API (funciona em Android Chrome, limitado em iOS Safari até iOS 16.4+)
- **Estado:** Projeto novo, greenfield

## Constraints

- **Tech Stack:** React 18 + TypeScript + Vite + TailwindCSS + Supabase + Stripe — não trocar sem justificativa forte
- **PWA First:** Service worker + manifest + offline básico obrigatório desde o início
- **Mobile-first:** 90%+ das usuárias acessarão por celular; desktop é secundário
- **Acessibilidade:** Modo noturno (dark mode) obrigatório — uso frequente na madrugada
- **Segurança:** Dados de saúde de menores — LGPD compliance obrigatório, dados nunca expostos publicamente

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA em vez de app nativo | Elimina fricção de instalação, menor custo de desenvolvimento, funciona em qualquer dispositivo | — Pending |
| Supabase como backend | Auth + DB + realtime + storage em uma plataforma, grátis até escala relevante | — Pending |
| Freemium R$19,90/mês | Ticket acessível para mães brasileiras, Stripe já suporta BRL | — Pending |
| Stripe para pagamentos | Melhor suporte a assinaturas recorrentes, SDK maduro | — Pending |
| PT-BR apenas v1 | Foco no mercado brasileiro, simplifica conteúdo de dicas/marcos | — Pending |

---
*Last updated: 2026-04-08 after initialization*
