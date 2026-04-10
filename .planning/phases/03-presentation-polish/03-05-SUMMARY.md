---
phase: 03-presentation-polish
plan: 05
subsystem: presentation-mode
tags: [idle-timer, auto-hide, hooks, ux, tv]
dependency_graph:
  requires: []
  provides: [idle-timer-hook, presentation-controls-visible-prop, auto-hide-wiring]
  affects: [dashboard-client, presentation-controls]
tech_stack:
  added: []
  patterns: [custom-hook-ref-timer, css-fade-transition]
key_files:
  created:
    - hooks/use-idle-timer.ts
  modified:
    - components/dashboard/presentation-controls.tsx
    - components/dashboard/dashboard-client.tsx
decisions:
  - "Custom useIdleTimer hook (~55 lines) over react-idle-timer: avoids dependency for a 55-line problem"
  - "useRef for timer handle: prevents re-render storm on every mousemove reset"
  - "Three events (mousemove+click+keydown): covers desktop, TV remote click, TV remote d-pad"
  - "CSS transition-opacity duration-500 over Framer Motion: simple compositor-only fade, no JS"
  - "5s timeout wired to presentation.isActive as enabled flag: hook fully inert in normal mode"
metrics:
  duration: 2 min
  completed: 2026-04-10
  tasks: 3
  files: 3
---

# Phase 03 Plan 05: Auto-Hide Presentation Controls Summary

Custom `useIdleTimer` hook with mousemove/click/keydown tracking wired to `PresentationControls` via a `visible` CSS-fade prop — controls hide after 5s inactivity in presentation mode, always visible in normal dashboard mode.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create useIdleTimer hook | e7ac2bc | hooks/use-idle-timer.ts (created) |
| 2 | Add visible prop to PresentationControls with CSS fade | e05242e | components/dashboard/presentation-controls.tsx |
| 3 | Wire useIdleTimer in dashboard-client, pass visible prop | e4b918c | components/dashboard/dashboard-client.tsx |

## What Was Built

### hooks/use-idle-timer.ts
A reusable `useIdleTimer(timeoutMs, enabled)` hook that:
- Returns `true` when user has been idle for at least `timeoutMs`, `false` otherwise
- Tracks `mousemove`, `click`, and `keydown` window events (covers TV remotes via click/keydown)
- Uses `useRef` for the timeout handle — no re-renders on every `clearTimeout`/`setTimeout` call; only the `idle` state transition triggers reconciler work
- Fully inert when `enabled === false`: returns `false`, attaches no listeners
- Cleanup removes all three listeners and clears the pending timer

### components/dashboard/presentation-controls.tsx
- Added `visible?: boolean` prop to `PresentationControlsProps` (default `true`)
- `cn()` utility wraps the root active-state `<div>` with `transition-opacity duration-500`
- `visible === false` → `opacity-0 pointer-events-none` (smooth CSS fade + non-interactive)
- Inactive branch (start button) is unchanged

### components/dashboard/dashboard-client.tsx
- Imports `useIdleTimer` from `@/hooks/use-idle-timer`
- Calls `useIdleTimer(5000, presentation.isActive)` → `isMenuIdle`
- Passes `visible={!isMenuIdle}` to `<PresentationControls>`
- Normal dashboard mode: `presentation.isActive === false` → hook is inert, menu always visible

## Decisions Made

1. **No new dependencies** — `react-idle-timer` not installed; custom hook is ~55 lines, well within "don't install a library for this" threshold
2. **`useRef` for timer** — avoids re-render on every `clearTimeout`/`setTimeout`; only `isIdle` state transitions trigger React reconciler
3. **Three events** — `mousemove` for desktop, `click` for TV remote buttons, `keydown` for d-pad navigation (D-25 compliance)
4. **CSS `transition-opacity` over Framer Motion** — pure compositor fade, no JS overhead, S-tier TV performance
5. **5000ms / `presentation.isActive`** — satisfies D-24 exactly; auto-hide scoped strictly to fullscreen presentation mode

## Deviations from Plan

None — plan executed exactly as written. Prettier required a minor one-line formatting adjustment to the function signature (parameters fit on one line), applied automatically.

## Known Stubs

None — all wiring is functional. The `isMenuIdle` boolean flows from the real hook to the real `visible` prop; no placeholder data.

## Self-Check: PASSED
