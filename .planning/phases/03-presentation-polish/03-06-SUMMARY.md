---
phase: 03-presentation-polish
plan: "06"
subsystem: presentation-mode
tags: [performance, animation, framer-motion, tv-hardware]
dependency_graph:
  requires: [03-03, 03-05]
  provides: [smooth-tv-transitions]
  affects:
    - components/dashboard/dashboard-client.tsx
    - components/presentation-mode/company-display.tsx
    - components/presentation-mode/performer-presentation.tsx
tech_stack:
  added: []
  patterns:
    - Opacity fade (compositor-thread S-tier) over x-translate for AnimatePresence entity transitions
    - Permanent backdrop-blur removal over conditional isTransitioning state machine
key_files:
  modified:
    - components/dashboard/dashboard-client.tsx
    - components/presentation-mode/company-display.tsx
    - components/presentation-mode/performer-presentation.tsx
decisions:
  - "Opacity fade (0 -> 1 -> 0, 0.35s) over horizontal slide for entity transitions: Chromium compositor-thread S-tier animation, eliminates main-thread paint on Android TV box"
  - "Permanent backdrop-blur-md removal: eliminates 12+ compositing layers during cross-dissolve (6+ cards x 2 simultaneous entities), simpler than conditional isTransitioning state machine"
  - "mode=sync preserved on AnimatePresence: avoids 0.35s blank-screen gap that mode=wait would introduce"
metrics:
  duration: "~4min"
  completed_date: "2026-04-10"
  tasks: 3
  files_modified: 3
---

# Phase 03 Plan 06: TV Box Smooth Entity Transitions Summary

Opacity-fade AnimatePresence transitions (0.35s, compositor-thread only) with permanent backdrop-blur-md removal across all presentation-mode cards for Android TV box performance.

## What Was Built

### Task 1: Opacity Fade Transitions in dashboard-client.tsx

Both `motion.div` wrappers inside `<AnimatePresence mode="sync">` (company branch and performer branch) now use opacity-only transitions:

- `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}`, `exit={{ opacity: 0 }}`
- `transition={{ duration: 0.35 }}` (down from 0.45s)
- `mode="sync"` preserved for cross-dissolve (no blank screen between entities)
- No `isTransitioning` state added — permanent blur removal (Tasks 2-3) makes it unnecessary

Commit: `56e4995`

### Task 2: Remove backdrop-blur-md from company-display.tsx

Removed `backdrop-blur-md` from 3 card elements:

- `MetricCard` root (`className` on motion.div at line 141)
- `ArtistCard` root (`className` on motion.div at line 187)
- Top Cidades motion.div (`className` at line 583)

All `bg-white/[0.03]` and `shadow-lg` card backgrounds preserved. `backdrop-blur-sm` on carousel page indicator (line 576) left untouched.

Commit: `0523bb8`

### Task 3: Remove backdrop-blur-md from performer-presentation.tsx

Removed `backdrop-blur-md` from 4 card elements:

- `MetricCard` root (line 92)
- `ArtistCard` root (line 298)
- Tracks list container div (line 354)
- Empty state container div (line 399)

All `bg-white/[0.03]` backgrounds preserved. No `backdrop-blur-sm` variants were present in this file.

Commit: `78ccdfe`

## Decisions Made

1. **Opacity fade over horizontal slide**: Opacity is Chromium's S-tier compositor-thread animation — cheapest possible on Android TV hardware. Horizontal x-translate forces paint recalculation as content slides across viewport.

2. **Permanent backdrop-blur-md removal**: 6+ cards visible per entity x 2 entities simultaneously during transition = 12+ separate compositing layers for backdrop-filter during cross-dissolve. Permanent removal eliminates the layer explosion entirely — simpler than conditional removal (no `isTransitioning` state machine, no `onAnimationStart`/`onAnimationComplete` coordination, no 1-frame flash risk).

3. **mode="sync" preserved**: Research §8 recommendation — `mode="wait"` would add 0.35s of blank screen between entities (exit completes before enter begins). `mode="sync"` enables true cross-dissolve.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. All changes are complete and production-ready.

## Self-Check: PASSED

Files exist:

- FOUND: components/dashboard/dashboard-client.tsx (modified)
- FOUND: components/presentation-mode/company-display.tsx (modified)
- FOUND: components/presentation-mode/performer-presentation.tsx (modified)

Commits verified:

- FOUND: 56e4995 (Task 1 - opacity fade)
- FOUND: 0523bb8 (Task 2 - company-display blur removal)
- FOUND: 78ccdfe (Task 3 - performer-presentation blur removal)

Grep verifications:

- `grep -rc "backdrop-blur-md" components/presentation-mode/`: 0 matches across all files
- `grep "x: \"100%\"" components/dashboard/dashboard-client.tsx`: 0 matches
- `grep "mode=\"sync\"" components/dashboard/dashboard-client.tsx`: 1 match (preserved)
- Build: PASSED
- Type-check: PASSED
- Lint: PASSED (2 pre-existing warnings, 0 errors)
