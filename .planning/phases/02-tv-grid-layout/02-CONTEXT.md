# Phase 2: TV Grid Layout - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the presentation mode layout so all content fills the viewport without scroll. Two distinct page layouts auto-rotate:

1. **Performer page**: Left half = 2×3 metric cards grid, Right half = Top 10 Spotify tracks. Both fill 100% of the container height (container = viewport minus header).
2. **Company page**: Left half = company aggregate metrics, Right half = performer cards (each 1/3 container height, max 3 visible). If >3 performers, carousel with auto-rotation.

All sizing must be responsive across TV resolutions (1080p to 4K) using CSS-only techniques (clamp(), viewport units, CSS Grid). No JS resize listeners.

</domain>

<decisions>
## Implementation Decisions

### Overall Layout Structure

- **D-01:** Layout is: fixed header at top → remaining space split 50/50 left/right. Container = viewport height minus header height. Both halves fill 100% of this container.
- **D-02:** Header keeps current content: profile photo, performer/company name, period filter buttons, rotation indicator. No changes to header.
- **D-03:** Use CSS Grid with `h-dvh` on the outermost container. Grid: `grid-rows-[auto_1fr]` for header + content.

### Performer Page Layout

- **D-04:** Left half: 2×3 grid of metric cards in this exact order (left-to-right, top-to-bottom): 1) Streams, 2) Ouvintes Mensais (Monthly Listeners), 3) Vídeos, 4) Views, 5) Seguidores (Followers), 6) Top Cidades (Top Cities). Each card 1/3 height × 1/2 width of the left panel.
- **D-05:** Right half: Top 10 Spotify tracks list, filling 100% of the container height.
- **D-06:** Both halves use `h-full` to fill their parent container.

### Company Page Layout

- **D-07:** Left half: Company aggregate metrics (same as today — streams, followers, views, etc. with company banner).
- **D-08:** Right half: Performer cards stacked vertically, each 1/3 of the container height. Max 3 visible at once.
- **D-09:** If >3 performers in a company, use a carousel that auto-rotates through pages of 3 performers.
- **D-10:** Carousel rotation time splits evenly across pages. E.g., 30s rotation interval with 2 pages = 15s per page.
- **D-11:** No Top 10 tracks on the company page.

### Carousel Behavior

- **D-12:** Same carousel logic applies to both performer pages (if many performers exist across companies) and company performer cards (if >3 performers in a company).
- **D-13:** Pages auto-rotate, time splits evenly per page within the rotation interval.
- **D-14:** Existing auto-rotation logic continues to rotate between company and performer views at the top level.

### Card Sizing

- **D-15:** Performer cards are always 1/3 of the container height, regardless of how many exist (1, 2, or 3). Empty space below is acceptable for consistency.
- **D-16:** Typography scales with clamp() for readability across 1080p to 4K TVs.
- **D-17:** No content overflow or scroll on any TV resolution — overflow-hidden on all containers.

### Claude's Discretion

- Transition animations between carousel pages (fade, slide, or instant)
- Gap/padding sizing (viewport units recommended from research: `gap-[1vh]`, `p-[1vh]`)
- How to handle the existing `PerformerPresentation` component — adapt or create condensed variant

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current Layout

- `components/dashboard/dashboard-client.tsx` — Lines 350-518: Current presentation mode layout (header + animated content area)
- `components/presentation-mode/company-display.tsx` — Company aggregate view with performer pagination
- `components/presentation-mode/performer-presentation.tsx` — Individual performer full-screen view
- `components/presentation-mode/performer-card.tsx` — Existing performer card component

### Presentation Logic

- `hooks/use-presentation-mode.ts` — Auto-rotation, fullscreen, performer cycling logic
- `contexts/presentation-context.tsx` — Presentation state management

### Research

- `.planning/research/STACK.md` — CSS Grid + clamp() + container queries techniques
- `.planning/research/ARCHITECTURE.md` — Component boundary model, build order
- `.planning/research/PITFALLS.md` — 11 pitfalls to avoid (grid blowout, margin budget, Framer Motion conflicts)

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `MetricCard` component — used in both performer and company views for displaying metrics with labels, values, deltas, and icons
- `PerformerPresentation` — full-screen performer view, can be adapted or condensed for the metric cards grid portion
- `CompanyDisplay` — company aggregate view with performer pagination already built in (has carousel logic for performer pages)
- `performer-card.tsx` — existing card component for performers within company view
- `use-presentation-mode` hook — auto-rotation, cycling, fullscreen logic all reusable

### Established Patterns

- CSS Grid with Tailwind: `grid-rows-[auto_1fr]` already used in presentation mode
- Framer Motion `AnimatePresence` with `mode="sync"` for page transitions
- `absolute inset-0` pattern for animated content areas
- `h-full` / `overflow-hidden` on content containers

### Integration Points

- `dashboard-client.tsx` lines 350-518: Main presentation mode render — this is where the layout restructure happens
- `company-display.tsx` already has performer pagination with `pages` and `currentPage` state — carousel logic is partially built
- `presentation-context.tsx` manages rotation interval — carousel page timing can derive from this

</code_context>

<specifics>
## Specific Ideas

- Container height = viewport minus header, NOT 100vh directly. Use `grid-rows-[auto_1fr]` where `auto` is the header and `1fr` is the content area.
- Carousel pages split the rotation interval evenly (30s / 2 pages = 15s each)
- Cards are always 1/3 container height even with fewer than 3 performers — consistent layout over space efficiency
- Company view: left=metrics, right=performer cards (carousel if >3). Performer view: left=metric cards grid, right=top 10 tracks.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 02-tv-grid-layout_
_Context gathered: 2026-04-06_
