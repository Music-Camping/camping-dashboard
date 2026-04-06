---
phase: 01-streams-fix
plan: "01"
subsystem: ui
tags: [react, presentation-mode, metrics, spotify, youtube]

# Dependency graph
requires: []
provides:
  - Streams metric now reflects Spotify-only data in both presentation views
  - Both streams MetricCards labeled "Spotify Streams" instead of "Streams"
  - YouTube views remain visible in separate "Views" MetricCard (unchanged)
  - No delta badge shown on streams card in performer view (streamsDelta undefined)
affects: [02-tv-grid]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Metric separation: YouTube views tracked in their own metric only, never added to Spotify streams"
    - "Undefined delta pattern: streamsDelta={undefined} suppresses delta badge rendering"

key-files:
  created: []
  modified:
    - components/presentation-mode/company-display.tsx
    - components/dashboard/dashboard-client.tsx
    - components/presentation-mode/performer-presentation.tsx

key-decisions:
  - "Spotify-only streams: YouTube views are a separate metric, should not inflate stream counts"
  - "No streams delta: Spotify ranking streams do not carry delta data, so streamsDelta is set to undefined"

patterns-established:
  - "Label honesty: MetricCard labels must reflect actual data sources (Spotify Streams vs generic Streams)"
  - "Icon honesty: MetricCard icons must match contributing platforms only"

requirements-completed: [STRM-01, STRM-02]

# Metrics
duration: 3min
completed: 2026-04-06
---

# Phase 01: Streams Fix Summary

**Removed YouTube views from Spotify streams total and delta in both company and performer presentation views; updated both MetricCard labels to "Spotify Streams"**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-06T21:46:29Z
- **Completed:** 2026-04-06T21:49:23Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- YouTube views no longer inflate the streams total in `company-display.tsx` aggregated useMemo
- YouTube views delta no longer inflates the streams delta in `company-display.tsx` deltas useMemo
- YouTube views block removed from `tvTotalStreams` useMemo in `dashboard-client.tsx`
- `streamsDelta` prop set to `undefined` so no delta badge appears on the performer streams card
- Both streams MetricCards now labeled "Spotify Streams" (company and performer views)
- YouTube icon removed from streams MetricCard in company view (icon now Spotify only)

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove YouTube from streams calculations (D-01, D-02)** - `34b231a` (fix)
2. **Task 2: Update streams metric labels and icon (D-04, discretion)** - `98d5f84` (fix)

## Files Created/Modified

- `components/presentation-mode/company-display.tsx` - Removed YouTube from streams total and delta; updated label to "Spotify Streams"; removed YouTube icon from streams card
- `components/dashboard/dashboard-client.tsx` - Removed YouTube views block from tvTotalStreams useMemo; removed initialData from dependency array; set streamsDelta={undefined}; updated comment
- `components/presentation-mode/performer-presentation.tsx` - Updated streams MetricCard label to "Spotify Streams"

## Decisions Made

- Set `streamsDelta={undefined}` rather than computing a Spotify-only delta, because Spotify ranking streams do not carry delta data in the current API response. Showing no delta badge is more honest than showing zero.
- Removed YouTube icon from the company streams MetricCard because the icon set should only represent contributing data sources.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

The commitlint config enforces sentence-case subjects and a specific scope enum. First two commit attempts failed the `commit-msg` hook. Resolved by using a capitalized subject and the `components` scope from the allowed list.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Streams metric fix complete. Both presentation views show accurate Spotify-only stream counts.
- YouTube views remain visible in their own "Views" MetricCard — data integrity preserved.
- Ready for Phase 02: TV grid layout fix.

---

_Phase: 01-streams-fix_
_Completed: 2026-04-06_
