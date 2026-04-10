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
- [x] **Phase 2: TV Grid Layout** - 2x3 CSS Grid filling 100vh with proportional text scaling across TV sizes (completed 2026-04-06)
- [ ] **Phase 3: Presentation Polish** - Font scaling, streams aggregation fix, card order, background unification, auto-hide menu, dynamic icons, TV box transition smoothness

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

**Plans:** 3/3 plans complete

Plans:

- [x] 02-01-PLAN.md — Restructure outer container (h-dvh grid shell) + clean globals.css
- [x] 02-02-PLAN.md — Adapt performer-presentation.tsx (two-column layout + clamp typography)
- [x] 02-03-PLAN.md — Adapt company-display.tsx (two-column layout + h-1/3 artist cards + clamp typography)

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase                  | Plans Complete | Status      | Completed  |
| ---------------------- | -------------- | ----------- | ---------- |
| 1. Streams Fix         | 0/TBD          | Not started | -          |
| 2. TV Grid Layout      | 3/3            | Complete    | 2026-04-06 |
| 3. Presentation Polish | 0/6            | Planned     | -          |

### Phase 3: Presentation Polish

**Goal**: Presentation mode (TV fullscreen) is polished and bug-free — text sized correctly via container queries, company streams aggregation excludes playlist tracks, company card order matches performer order, a single edge-to-edge background unifies both halves, the menu auto-hides after 5s of inactivity, per-metric platform icons reflect actual data contribution, and entity transitions are smooth on low-end Android TV hardware.
**Requirements**: [none — no new v1 requirement IDs; this phase closes client-reported polish gaps against the existing Phase 1+2 implementation]
**Depends on:** Phase 2
**Success Criteria** (what must be TRUE):

1. Company view "Spotify Streams" total reflects only real-performer track play counts, with playlist tracks fully excluded (D-19, D-20, D-21)
2. Company metric cards render in the exact D-22 order: Streams → Ouvintes Mensais → Vídeos → Views → Seguidores → Top Cidades
3. A single BannerBackground instance renders behind both halves of the company view — no visible seam, no rounded outer corners (D-23)
4. All typography in presentation mode uses CSS container queries (`@container` + `cqi` in clamp preferred values) and is visibly smaller than the Phase 2 baseline (D-18)
5. In presentation mode, the floating menu fades out after 5s of no mousemove/click/keydown and reappears on any of those events (D-24, D-25)
6. Every MetricCard in both views shows icons that match the platforms actually contributing to that metric's value — Streams is Spotify-only in both views, Vídeos/Views are YouTube-only, Seguidores dynamically shows contributing platforms (D-26)
7. Entity transitions use opacity fade (not slide), backdrop-blur-md is removed from presentation-mode cards, and transitions no longer stutter on Android TV box (D-27)

**Plans:** 6 plans

Plans:

- [ ] 03-01-PLAN.md — Streams playlist exclusion (page.tsx whitelist filter)
- [ ] 03-02-PLAN.md — Company card order + background unification (company-display.tsx)
- [ ] 03-03-PLAN.md — Dynamic per-metric platform icons (both presentation components)
- [ ] 03-04-PLAN.md — Container-query font scaling (both presentation components)
- [ ] 03-05-PLAN.md — Auto-hide menu hook + PresentationControls wiring
- [ ] 03-06-PLAN.md — TV box transition smoothness (fade + backdrop-blur removal)
