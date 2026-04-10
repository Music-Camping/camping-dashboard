---
quick: 260410-mp9
date: 2026-04-10
files_modified:
  - components/presentation-mode/performer-presentation.tsx
---

# Quick Task 260410-mp9: Unify BannerBackground in Performer Presentation

**Follow-up to Phase 3 — closes the same D-23 bug in the performer view that was already fixed in company-display.tsx (commit 73d4285).**

## What changed

Mirrored the exact pattern from `company-display.tsx:495-500`:

1. Fragment `<>` return replaced with `<div className="relative col-span-2 grid h-full grid-cols-2 gap-[1vh]">` wrapper
2. Lifted exactly one `BannerBackground` to the top of the wrapper (was 2, one per half)
3. Lifted exactly one noise-texture overlay to the top of the wrapper (was 2, one per half) — added `pointer-events-none` since it now sits above both halves
4. Dropped `rounded-2xl` from both outer half-panel wrappers so the background reaches edge-to-edge
5. Added `z-10` to both half-panel wrappers so content stacks above the background layer
6. Preserved `@container` on both halves (D-18 font scaling)
7. Preserved `overflow-hidden` on both halves (D-17)
8. All inner content (metric cards, Top Cidades, track list, empty state) untouched

## Why

User report during PR prep: "performer ta com 2 bg ainda, era pra ser so 1". Phase 3 plan 03-02 fixed this in company-display but didn't touch performer-presentation. This closes the gap.

## Verification

- `BannerBackground bannerUrl` JSX usage: **1** (exactly one instance)
- `col-span-2 grid h-full grid-cols-2`: **1** (single wrapper)
- `opacity-[0.03]` noise texture: **1** (single overlay)
- `@container` on half-panel wrappers: **2** (preserved)
- `rounded-2xl` on outer wrappers: **0** (dropped, edge-to-edge)
- `rounded-2xl` on inner cards: preserved (MetricCard, ArtistCard, empty state)
- `npm run type-check`: ✓ clean
- `npm run build`: ✓ passes

## Invariants preserved

- D-17 `overflow-hidden` on half-panel wrappers and inner grids
- D-18 `@container` scaling contexts on both halves
- D-22 card order unchanged
- D-26 dynamic platform icons unchanged
- D-27 no `backdrop-blur-md` reintroduced

## Gap contract

Parent grid in `dashboard-client.tsx:466` uses `grid-cols-2 gap-[1vh]` for the performer branch. Since this return is now a single `col-span-2` child, the parent gap no longer applies between halves — added `gap-[1vh]` on the new inner `grid-cols-2` wrapper to preserve the visual gap. Same approach as 73d4285.
