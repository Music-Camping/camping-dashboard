---
phase: 02-tv-grid-layout
plan: "03"
subsystem: ui
tags: [tailwind, css-grid, presentation-mode, framer-motion, clamp-typography]

# Dependency graph
requires:
  - "02-01 — h-dvh grid shell and grid-cols-2 parent container in dashboard-client.tsx"
provides:
  - "Two-column Fragment layout for CompanyDisplay filling parent grid-cols-2"
  - "Left half: 2x3 aggregate metric cards grid with viewport-relative spacing"
  - "Right half: performer cards at h-1/3 each with carousel auto-rotation"
  - "clamp() typography throughout: display/heading/caption tiers"
affects:
  - "TV presentation mode company view rendering"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fragment with two direct children to fill CSS Grid columns from parent"
    - "h-1/3 shrink-0 min-h-0 per D-15: fixed 1/3 height cards regardless of count"
    - "BannerBackground extracted helper applied to both halves independently"
    - "clamp() tiers: display=clamp(1.5rem,3vw,4rem), heading=clamp(1.5rem,1.3vw,2rem), caption=clamp(0.75rem,0.9vw,1rem)"

key-files:
  created: []
  modified:
    - "components/presentation-mode/company-display.tsx"

key-decisions:
  - "Fragment return pattern: CompanyDisplay returns <> two children </> so parent grid-cols-2 places them as separate columns"
  - "BannerBackground extracted as shared helper: both halves get the same background treatment independently"
  - "h-1/3 over flex-1 for artist cards: enforces fixed 1/3 height per D-15 even with 1-2 performers"

patterns-established:
  - "Fragment-as-two-grid-children: client component returns Fragment to fill multi-column CSS Grid"

requirements-completed:
  - GRID-02
  - GRID-04
  - GRID-05

# Metrics
duration: 5min
completed: 2026-04-06
---

# Phase 02 Plan 03: CompanyDisplay Two-Column Layout Summary

**Fragment layout with 2x3 aggregate metric grid left half and h-1/3 performer cards right half with clamp() typography throughout**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-06T22:59:42Z
- **Completed:** 2026-04-06T23:04:26Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Rewrote CompanyDisplay to return a React Fragment with two direct children for the parent `grid-cols-2` container established in Plan 01
- Left half: `grid grid-cols-2 grid-rows-3 gap-[1vh]` with h-full metric cards, banner background applied independently
- Right half: `flex flex-col gap-[1vh]` with performer cards at `h-1/3 min-h-0 shrink-0` each per D-15
- Extracted `BannerBackground` helper component — both halves get identical background treatment without code duplication
- Replaced all fixed font size classes (`text-sm`, `text-xs`, `text-xl`, `text-2xl`) with clamp() values:
  - Display tier: `text-[clamp(1.5rem,3vw,4rem)]` — metric values, delta badges, performer name
  - Heading tier: `text-[clamp(1.5rem,1.3vw,2rem)]` — metric card labels
  - Caption tier: `text-[clamp(0.75rem,0.9vw,1rem)]` — city entries, quick stats, carousel indicator
- Replaced fixed padding/gap with viewport-relative units: `p-[1.5vh]`, `gap-[1vh]`
- Carousel logic unchanged (D-10): `rotationInterval * 1000 / totalPages` ms per page

## Task Commits

1. **Task 1: Restructure CompanyDisplay to two-column layout** - `0f29c45` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `components/presentation-mode/company-display.tsx` — Rewritten as Fragment, two-column layout, clamp() typography, BannerBackground helper extracted

## Decisions Made

- Fragment return pattern: Component returns `<>left half, right half</>` so the parent `grid-cols-2` in `dashboard-client.tsx` places them in separate grid columns — no wrapper div needed
- Both halves share the same `BannerBackground` component: avoids repeating 10+ lines of JSX for the background overlay layers
- `h-1/3` not `flex-1` for artist card wrappers: with `flex-1` a single card would expand to fill the full column; `h-1/3` enforces consistent sizing per D-15 (empty space below is acceptable)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data paths are wired to `initialData` and `spotifyData` props.

---

## Self-Check

### Files Created/Modified

- `components/presentation-mode/company-display.tsx` — FOUND

### Commits

- `0f29c45` — FOUND

## Self-Check: PASSED

---

*Phase: 02-tv-grid-layout*
*Completed: 2026-04-06*
