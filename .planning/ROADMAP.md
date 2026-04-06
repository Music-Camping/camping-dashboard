# Roadmap: Camping Dashboard

## Overview

Two targeted phases deliver the TV presentation mode improvements. Phase 1 fixes the streams
metric bug — a standalone data correctness change with no risk. Phase 2 rebuilds the grid layout
for proper 100vh containment with proportional text scaling across all TV resolutions.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Streams Fix** - Remove YouTube views from the total streams count, Spotify-only metric
- [ ] **Phase 2: TV Grid Layout** - 2x3 CSS Grid filling 100vh with proportional text scaling across TV sizes

## Phase Details

### Phase 1: Streams Fix

**Goal**: Total streams count is accurate — Spotify streams only, clearly labeled
**Depends on**: Nothing (first phase)
**Requirements**: STRM-01, STRM-02
**Success Criteria** (what must be TRUE):

1. The total streams number shown on the dashboard matches Spotify stream counts, not a YouTube+Spotify sum
2. The metric label for streams identifies it as Spotify streams, not generic "streams"
3. YouTube views remain visible as their own separate metric — they are not removed, just excluded from the streams total
   **Plans**: TBD

### Phase 2: TV Grid Layout

**Goal**: Presentation mode displays all content in a two-column viewport-filling layout with proportional text scaling across 1080p to 4K TVs
**Depends on**: Phase 1
**Requirements**: GRID-01, GRID-02, GRID-03, GRID-04, GRID-05
**Success Criteria** (what must be TRUE):

1. All 6 performer cards are visible at once in a 2 columns x 3 rows grid — no auto-rotation, no scroll
2. The grid fills exactly 100vh on both 1080p and 4K TV resolutions without overflow or empty space
3. No content is clipped or hidden — overflow-hidden contains everything within the viewport
4. Text on all cards remains readable at TV viewing distance — metric labels are at minimum 24px equivalent size on a 1080p display
5. Text scales proportionally on 4K without fixed-size classes that produce illegible small text

**Plans:** 1/3 plans executed

Plans:

- [x] 02-01-PLAN.md — Restructure outer container (h-dvh grid shell) + clean globals.css
- [ ] 02-02-PLAN.md — Adapt performer-presentation.tsx (two-column layout + clamp typography)
- [ ] 02-03-PLAN.md — Adapt company-display.tsx (two-column layout + h-1/3 artist cards + clamp typography)

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase             | Plans Complete | Status      | Completed |
| ----------------- | -------------- | ----------- | --------- |
| 1. Streams Fix    | 0/TBD          | Not started | -         |
| 2. TV Grid Layout | 1/3 | In Progress|  |
