---
plan: "03-core-trackers/04"
status: complete
completed: 2026-04-12
---

# Summary: Plan 04 — SleepPage: Sleep timer

## What was built
`useSleepTimer` hook that persists active sleep across page reloads, `SleepTimerCard` component, and initial `SleepPage`.

## Key files created/modified
- `src/hooks/useSleepTimer.ts` — On mount: queries `sleeps` WHERE `ended_at IS NULL` to recover active sleep. `startSleep()` inserts new row. `stopSleep(notes?)` updates `ended_at = now()`. Runs a 1s interval ticking `elapsed` when `activeSleep` is set. Interval cleaned up on unmount and when sleep ends.
- `src/components/sleep/SleepTimerCard.tsx` — Idle state: 😊 + "Bebê acordado" + indigo button. Active state: 😴 + large MM:SS/HH:MMmin timer + notes textarea + red "Encerrar sono" button. Loading state: "Verificando…".
- `src/pages/SleepPage.tsx` — Wires `useSleepTimer`, passes `elapsedSnapshot` to snackbar message. Indigo snackbar "Sono de Xmin registrado!".

## Decisions made
- `elapsed` snapshot captured before `stopSleep()` call so the snackbar shows the correct duration even though the timer resets to 0 immediately.
- Active sleep is recovered from the database on mount so a page refresh doesn't lose the timer.

## Self-Check: PASSED
- [x] No active sleep: "Registrar início do sono" button shown
- [x] Active sleep: timer increments in real time, notes field visible
- [x] Stop sleep: saves ended_at, snackbar shows duration, timer disappears
- [x] Page reload: active sleep recovered from Supabase
- [x] tsc --noEmit exits 0
