---
phase: "03-presentation-polish"
plan: "02"
subsystem: "presentation-mode/company-display"
tags: ["company-view", "metric-cards", "background", "layout", "bug-fix"]
dependency_graph:
  requires: []
  provides:
    - "company-display: D-22 card order (Streams → Ouvintes Mensais → Vídeos → Views → Seguidores → Top Cidades)"
    - "company-display: single BannerBackground col-span-2 wrapper (D-23)"
  affects:
    - "components/presentation-mode/company-display.tsx"
tech_stack:
  added: []
  patterns:
    - "col-span-2 wrapper spanning parent grid-cols-2 with inner gap-[1vh] to preserve visual gap"
    - "Fragment-to-wrapper refactor: single BannerBackground behind two transparent half-panels"
key_files:
  created: []
  modified:
    - "components/presentation-mode/company-display.tsx"
decisions:
  - "D-22: Company card order matches D-04 performer order exactly"
  - "D-23: Single BannerBackground behind both halves, edge-to-edge fullscreen"
  - "Fragment pattern replaced with col-span-2 wrapper for CompanyDisplay only; PerformerPresentation unchanged"
  - "Gap contract preserved by adding gap-[1vh] to the new col-span-2 wrapper's inner grid rather than relying on parent motion.div gap"
metrics:
  duration: "135s"
  completed: "2026-04-10"
  tasks_completed: 2
  files_modified: 1
---

# Phase 03 Plan 02: Company Display Bug Fixes Summary

**One-liner:** Reordered company metric cards to match D-04 performer order and unified two BannerBackground instances into a single edge-to-edge col-span-2 wrapper.

## What Was Done

### Task 1: Reorder company metric cards (D-22)

The company view had cards in a different order than the performer view (D-04): Streams → Vídeos → Views → Seguidores → Ouvintes Mensais → Top Cidades. Reordered to match D-04 exactly: Streams → Ouvintes Mensais → Vídeos → Views → Seguidores → Top Cidades. Stagger delays re-indexed in top-down source order: 0, 0.06, 0.12, 0.18, 0.24, 0.30.

- Commit: `2d8f3ba`
- Files: `components/presentation-mode/company-display.tsx`

### Task 2: Unify BannerBackground into single col-span-2 wrapper (D-23)

Two separate `BannerBackground` instances (one per half-panel) caused a visible seam. Changed `CompanyDisplay` return from a Fragment with two children to a single `div` with `col-span-2 grid grid-cols-2 gap-[1vh]`. Single `BannerBackground` placed as first child of this wrapper fills the entire span via its `absolute inset-0` positioning. Both half-panel wrappers lost their `rounded-2xl` and own `BannerBackground` — they are now transparent `relative z-10 h-full overflow-hidden` containers. Inner MetricCard and ArtistCard `rounded-2xl` classes preserved (D-23 only removes rounding from the outer panels).

- Commit: `73d4285`
- Files: `components/presentation-mode/company-display.tsx`

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all values are wired from real aggregated data.

## Plan Truths Verified

- Company view metric cards render in exact D-22 order: Spotify Streams → Ouvintes Mensais → Vídeos → Views → Seguidores → Top Cidades
- Single BannerBackground JSX instance in return block (grep -c returns 1)
- `col-span-2` on new outer wrapper
- `rounded-2xl` NOT on half-panel wrappers (only on inner MetricCard, ArtistCard, Top Cidades motion.div, and performer card wrappers)
- `gap-[1vh]` on col-span-2 wrapper inner grid (gap contract preserved)
- `overflow-hidden` on inner halves (D-17 preserved)
- `relative z-10` on half wrappers (both halves render above the single background layer)
- PerformerPresentation NOT touched

## Verification Results

- `npm run type-check` — PASSED
- `npm run lint` (scoped) — 1 pre-existing warning in company-display.tsx (`react/no-array-index-key` in StackedIcons helper, line 54, pre-existing before this plan)
- `npm run build` — PASSED

## Self-Check: PASSED

- `components/presentation-mode/company-display.tsx` — FOUND (modified)
- Task 1 commit `2d8f3ba` — exists in git log
- Task 2 commit `73d4285` — exists in git log
