---
plan: "05-milestones-and-content/06"
phase: 5
sequence: 6
wave: 3
title: "TipsPage: dicas contextualizadas + favoritos + artigo de novo mês"
status: pending
requires: ["05-milestones-and-content/05"]
files_modified:
  - src/pages/TipsPage.tsx
  - src/router.tsx
  - src/components/layout/BottomNav.tsx
---

# Plan 06: TipsPage: dicas contextualizadas + favoritos + artigo de novo mês

## Objective
Criar a `TipsPage` com dicas filtradas automaticamente pela idade do bebê, tabs por categoria (5 + Favoritos), toggle de favorito por card, artigo de boas-vindas ao novo mês quando o bebê completa meses redondos, e estado vazio elegante. Adicionar rota `/tips` e entrada no bottom nav (acessível via dashboard card em fase futura; por agora, rota direta).

## Requirements Addressed
- CONT-01: Dicas contextualizadas à idade atual do bebê (auto-atualiza)
- CONT-02: Dicas cobrem 5 categorias: desenvolvimento, sono, alimentação, saúde, brincadeiras
- CONT-03: Usuária pode salvar dicas favoritas
- CONT-04: Artigo de boas-vindas ao atingir novo mês de vida

## Tasks

<task id="6.1" type="code">
  <title>TipsPage — completa</title>
  <description>
Criar `src/pages/TipsPage.tsx`:

```typescript
import { useState, useMemo } from 'react'
import { useBabies } from '@/hooks/useBabies'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSavedTips } from '@/hooks/useSavedTips'
import {
  getTipsByAge,
  TIP_CATEGORIES,
  TIP_CATEGORY_LABELS,
  TIP_CATEGORY_ICONS,
  TIPS,
  type TipCategory,
  type Tip,
} from '@/data/tips'

export default function TipsPage() {
  const { activeBaby } = useBabies()
  const { user } = useAuthContext()
  const { savedTips, loading: savedLoading, isSaved, toggleSave } = useSavedTips(
    activeBaby?.id ?? '',
    user?.id ?? ''
  )
  const [activeTab, setActiveTab] = useState<TipCategory | 'favoritos'>('desenvolvimento')

  if (!activeBaby) {
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Nenhum bebê selecionado.</div>
    )
  }

  // Calculate baby age in days
  const ageDays = Math.floor(
    (Date.now() - new Date(activeBaby.birth_date).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Welcome article: baby completing a new month (ageDays divisible by ~30, within a 3-day window)
  const ageMonths = Math.floor(ageDays / 30)
  const daysIntoCurrentMonth = ageDays % 30
  const showWelcomeArticle = ageMonths > 0 && daysIntoCurrentMonth <= 3

  // All age-relevant tips
  const ageTips = useMemo(() => getTipsByAge(ageDays), [ageDays])

  // Favorites: any saved tip from the full TIPS list
  const favoriteTips = useMemo(
    () => TIPS.filter((t) => isSaved(t.id)),
    [savedTips]
  )

  // Tips for active tab
  const displayedTips: Tip[] =
    activeTab === 'favoritos'
      ? favoriteTips
      : ageTips.filter((t) => t.category === activeTab)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Dicas para você</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {activeBaby.name} · {ageMonths} {ageMonths === 1 ? 'mês' : 'meses'} e {daysIntoCurrentMonth} dias
        </p>
      </div>

      {/* Welcome article banner */}
      {showWelcomeArticle && (
        <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-white shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0">🎉</span>
            <div>
              <p className="text-sm font-bold leading-tight">
                {activeBaby.name} completou {ageMonths} {ageMonths === 1 ? 'mês' : 'meses'}!
              </p>
              <p className="text-xs opacity-90 mt-1">
                Uma nova fase começa. As dicas abaixo foram selecionadas especialmente para essa etapa do desenvolvimento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category tabs (horizontal scroll) */}
      <div className="overflow-x-auto px-4 py-3 flex gap-2">
        {TIP_CATEGORIES.map((cat) => {
          const count = ageTips.filter((t) => t.category === cat).length
          const isActive = activeTab === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-pink-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span>{TIP_CATEGORY_ICONS[cat]}</span>
              {TIP_CATEGORY_LABELS[cat]}
              {count > 0 && (
                <span className={`text-[10px] ${isActive ? 'opacity-80' : 'text-pink-500 dark:text-pink-400'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}

        {/* Favoritos tab */}
        <button
          onClick={() => setActiveTab('favoritos')}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeTab === 'favoritos'
              ? 'bg-pink-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
          }`}
        >
          <span>⭐</span>
          Favoritos
          {favoriteTips.length > 0 && (
            <span className={`text-[10px] ${activeTab === 'favoritos' ? 'opacity-80' : 'text-pink-500 dark:text-pink-400'}`}>
              {favoriteTips.length}
            </span>
          )}
        </button>
      </div>

      {/* Tips list */}
      <div className="px-4 pb-4 space-y-3">
        {displayedTips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3">
              {activeTab === 'favoritos' ? '⭐' : TIP_CATEGORY_ICONS[activeTab as TipCategory]}
            </span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {activeTab === 'favoritos'
                ? 'Nenhuma dica salva ainda'
                : 'Nenhuma dica para esta categoria agora'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'favoritos'
                ? 'Toque no ♡ de qualquer dica para salvar'
                : 'Novas dicas aparecem conforme o bebê cresce'}
            </p>
          </div>
        ) : (
          displayedTips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              saved={isSaved(tip.id)}
              onToggleSave={() => toggleSave(tip.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── TipCard ──────────────────────────────────────────────────────────────────

interface TipCardProps {
  tip: Tip
  saved: boolean
  onToggleSave: () => void
}

function TipCard({ tip, saved, onToggleSave }: TipCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Simple markdown: **bold** and line breaks
  function renderBody(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Card header */}
      <button
        className="w-full text-left p-4"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">{tip.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {tip.title}
            </p>
            {!expanded && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {tip.body.replace(/\*\*/g, '')}
              </p>
            )}
          </div>
          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="pl-9">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {renderBody(tip.body)}
            </p>
          </div>
          {/* Save button */}
          <div className="flex justify-end mt-3 pl-9">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave() }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                saved
                  ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {saved ? '⭐ Salvo' : '☆ Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```
  </description>
  <files>
    <file action="create">src/pages/TipsPage.tsx</file>
  </files>
</task>

<task id="6.2" type="code">
  <title>Rota /tips no router</title>
  <description>
Adicionar a `src/router.tsx`:

```typescript
import TipsPage from '@/pages/TipsPage'
// Na lista de routes dentro de AppShell:
{ path: '/tips', element: <TipsPage /> },
```
  </description>
  <files>
    <file action="modify">src/router.tsx</file>
  </files>
</task>

<task id="6.3" type="code">
  <title>Dashboard card de acesso rápido a Dicas (opcional)</title>
  <description>
Adicionar no dashboard principal um card de "Dicas de hoje" que leva à TipsPage. Isso é opcional se o dashboard estiver muito cheio — neste caso, `/tips` permanece acessível via URL direta ou via uma futura reorganização do nav na Phase 9.

Se implementado, adicionar em `src/pages/DashboardPage.tsx` (ou o componente de dashboard atual) um card compacto:

```typescript
import { Link } from 'react-router-dom'

// No grid/lista de cards do dashboard:
<Link
  to="/tips"
  className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-pink-100 dark:border-pink-800 flex items-center gap-3"
>
  <span className="text-2xl">💡</span>
  <div>
    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Dicas para você</p>
    <p className="text-xs text-gray-400">Conteúdo selecionado para a idade de {activeBaby?.name}</p>
  </div>
  <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
</Link>
```

**Nota:** Este task é "best effort" — se o dashboard já estiver poluído, pule e registre `/tips` como rota direta apenas.
  </description>
  <files>
    <file action="modify">src/pages/DashboardPage.tsx</file>
  </files>
</task>

## Verification
- [ ] /tips acessível por rota direta
- [ ] Dicas exibidas são filtradas pela idade atual do bebê
- [ ] 5 tabs de categoria funcionam com contagem correta
- [ ] Tab "Favoritos" exibe dicas salvas da tabela saved_tips
- [ ] Clicar em card expande o body completo com markdown bold renderizado
- [ ] Botão "Salvar / Salvo" togla a dica nos favoritos (Supabase + estado local)
- [ ] Banner de "novo mês!" aparece quando bebê completou mês há ≤ 3 dias
- [ ] Estado vazio com mensagem encorajadora para tab favoritos vazia
- [ ] tsc --noEmit exits 0

## must_haves
- `showWelcomeArticle` usa janela de 3 dias para não desaparecer imediatamente após o aniversário
- `ageDays % 30 <= 3` com `ageMonths > 0` (não exibir no dia do nascimento)
- favoriteTips filtra de `TIPS` completo (não apenas ageTips) para exibir favoritos de outras faixas ainda
- TipCard é definido no mesmo arquivo (sem criar arquivo separado) — componente simples não justifica arquivo próprio
- renderBody não usa `dangerouslySetInnerHTML` — parse manual seguro de `**bold**`
