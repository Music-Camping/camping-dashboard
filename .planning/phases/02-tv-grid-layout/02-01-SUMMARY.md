---
phase: 02-tv-grid-layout
plan: "01"
subsystem: ui
tags: [tailwind, css-grid, presentation-mode, framer-motion, next-js]

# Dependency graph
requires: []
provides:
  - "h-dvh grid shell (grid-rows-[auto_1fr]) in dashboard-client.tsx for presentation mode"
  - "Two-column content area (grid-cols-2) with viewport-relative gaps/padding"
  - "Clean globals.css with no conflicting presentation-mode CSS overrides"
affects:
  - "02-02 — PerformerPresentation layout (receives h-full context from grid shell)"
  - "02-03 — CompanyDisplay layout (receives h-full context from grid shell)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Viewport-relative spacing: gap-[1vh] and p-[1vh] for TV-safe proportional gaps"
    - "h-dvh over h-screen for dynamic viewport height on TVs"
    - "CSS Grid height chain: h-dvh → h-full → child components (no scroll leaks)"

key-files:
  created: []
  modified:
    - "components/dashboard/dashboard-client.tsx"
    - "app/globals.css"

key-decisions:
  - "h-dvh instead of h-screen: better for TVs where browser chrome may affect viewport height"
  - "grid-cols-2 applied to motion.div wrappers so child components receive 50% width context"
  - "Remove blanket presentation-mode CSS transition: conflicts with Framer Motion's own transition control"

patterns-established:
  - "Viewport units pattern: gap-[1vh] and p-[1vh] for all presentation-mode spacing"
  - "Height chain: outermost div uses h-dvh, inner grid uses h-full, motion.div uses absolute inset-0"

requirements-completed:
  - GRID-01
  - GRID-03

# Metrics
duration: 15min
completed: 2026-04-06
---

# Phase 02 Plan 01: TV Grid Shell Summary

**h-dvh CSS Grid shell with grid-rows-[auto_1fr] and two-column content area, plus cleaned globals.css removing all conflicting presentation-mode overrides**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-06T23:00:00Z
- **Completed:** 2026-04-06T23:15:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Removed 35 lines of conflicting CSS from globals.css (font-size overrides, card padding, blanket transition)
- Changed outermost presentation container from h-screen to h-dvh with p-0 (padding moves to content grid)
- Added grid-cols-2 with gap-[1vh] and p-[1vh] to AnimatePresence motion.div wrappers for two-column layout
- Height chain now intact: h-dvh → h-full (inner grid) → absolute inset-0 (motion.div) → child components

## Task Commits

Each task was committed atomically:

1. **Task 1: Clean globals.css presentation-mode overrides** - `753848c` (chore)
2. **Task 2: Restructure dashboard-client.tsx presentation mode container** - `86ca49e` (feat)
3. **Prettier formatting fix** - `85c201a` (chore — Rule 1 auto-fix)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `app/globals.css` - Removed font-size, h1/h2/h3, text-sm/text-xs, card padding, and blanket transition overrides; kept scrollbar-hiding rules
- `components/dashboard/dashboard-client.tsx` - Changed h-screen→h-dvh, p-6→p-0, gap-3→gap-[1vh]; added grid-cols-2 gap-[1vh] p-[1vh] to motion.div wrappers

## Decisions Made

- Used h-dvh (dynamic viewport height) instead of h-screen: TV browsers may have variable chrome height, dvh adapts correctly
- Applied grid-cols-2 on the motion.div (not on a static wrapper) so the slide-in animation carries the grid context with it
- Removed the blanket `.presentation-mode * { transition: opacity 0.5s }` because it overrides Framer Motion's own transition timing and causes visual conflicts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Prettier formatting error in dashboard-client.tsx**
- **Found during:** Task 2 (after editing the file)
- **Issue:** Trailing newline inside the cn() className string triggered a Prettier error (line 354), causing `npm run lint` to fail with 1 error
- **Fix:** Ran `npx prettier --write` on the file; formatting was auto-corrected
- **Files modified:** `components/dashboard/dashboard-client.tsx`
- **Verification:** `npm run lint` shows 0 errors after fix
- **Committed in:** `85c201a`

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug/formatting)
**Impact on plan:** Formatting-only fix, no logic changes. No scope creep.

## Issues Encountered

None beyond the auto-fixed Prettier issue above.

## Next Phase Readiness

- Height chain established: Plans 02 and 03 can now restructure PerformerPresentation and CompanyDisplay into left/right grid children
- The motion.div wrappers already carry grid-cols-2 context — child components just need to emit two direct children
- No blockers

---
*Phase: 02-tv-grid-layout*
*Completed: 2026-04-06*
