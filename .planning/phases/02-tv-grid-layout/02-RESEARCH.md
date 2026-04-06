# Phase 2: TV Grid Layout - Research

**Researched:** 2026-04-06
**Domain:** CSS Grid TV layout, viewport-relative typography, Framer Motion integration
**Confidence:** HIGH

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Layout is: fixed header at top, remaining space split 50/50 left/right.
  Container = viewport height minus header height. Both halves fill 100% of this
  container.
- **D-02:** Header keeps current content: profile photo, performer/company name,
  period filter buttons, rotation indicator. No changes to header.
- **D-03:** Use CSS Grid with `h-dvh` on the outermost container. Grid:
  `grid-rows-[auto_1fr]` for header + content.
- **D-04:** Left half: 2x3 grid of metric cards (same metrics as today — Spotify
  Streams, Views, Followers, Listeners, Videos). Each card 1/3 height x 1/2 width
  of the left panel.
- **D-05:** Right half (performer page): Top 10 Spotify tracks list, filling 100%
  of the container height.
- **D-06:** Both halves use `h-full` to fill their parent container.
- **D-07:** Left half (company page): Company aggregate metrics (same as today —
  streams, followers, views, etc. with company banner).
- **D-08:** Right half (company page): Performer cards stacked vertically, each 1/3
  of the container height. Max 3 visible at once.
- **D-09:** If >3 performers in a company, use a carousel that auto-rotates through
  pages of 3 performers.
- **D-10:** Carousel rotation time splits evenly across pages. E.g., 30s rotation
  interval with 2 pages = 15s per page.
- **D-11:** No Top 10 tracks on the company page.
- **D-12:** Same carousel logic applies to both performer pages and company performer
  cards.
- **D-13:** Pages auto-rotate, time splits evenly per page within the rotation
  interval.
- **D-14:** Existing auto-rotation logic continues to rotate between company and
  performer views at the top level.
- **D-15:** Performer cards are always 1/3 of the container height, regardless of
  how many exist (1, 2, or 3). Empty space below is acceptable.
- **D-16:** Typography scales with clamp() for readability across 1080p to 4K TVs.
- **D-17:** No content overflow or scroll on any TV resolution — overflow-hidden on
  all containers.

### Claude's Discretion

- Transition animations between carousel pages (fade, slide, or instant)
- Gap/padding sizing (viewport units recommended from research: `gap-[1vh]`,
  `p-[1vh]`)
- How to handle the existing `PerformerPresentation` component — adapt or create
  condensed variant

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                        | Research Support                                                                              |
| ------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| GRID-01 | Presentation mode uses a 2x3 CSS Grid filling 100vh (h-dvh), each card exactly 1/3 viewport height | `grid-rows-3` = `repeat(3, minmax(0, 1fr))` in Tailwind 4 — verified                          |
| GRID-02 | Grid layout works consistently across 1080p and 4K TV resolutions without JS resize listeners      | `h-dvh` + viewport-unit gaps (`gap-[1vh]`) + `clamp()` typography cover the range CSS-only    |
| GRID-03 | No content overflow or scroll on any TV resolution — grid container has overflow-hidden            | `overflow-hidden` on all containers + `minmax(0, 1fr)` prevents row blowout                   |
| GRID-04 | Text scales proportionally across TV sizes using clamp() with vw-based preferred values            | `text-[clamp(...)]` arbitrary values in Tailwind 4 — pattern verified in STACK.md             |
| GRID-05 | Metric labels meet minimum 24px equivalent readability at TV viewing distance                      | `clamp(1.5rem, 1.3vw, 2rem)` — floor 24px at default 16px base; 1920px wide = 1.3vw = 24.96px |

</phase_requirements>

---

## Summary

Phase 2 restructures the presentation mode from a single-card full-screen slideshow
into a two-column viewport-filling layout. The core technique — `h-dvh` with
`grid-rows-[auto_1fr]` on the outer shell, then `grid-cols-2` on the content area —
is already partially scaffolded in `dashboard-client.tsx` (the `grid-rows-[auto_1fr]`
wrapper exists at line 362). The work is primarily adapting the three child components
(`PerformerPresentation`, `CompanyDisplay`, `PerformerCard`) to fill their constrained
grid cells rather than assume full-screen space.

The UI-SPEC (02-UI-SPEC.md) was approved before this research was initiated and
contains the canonical visual contract. The component inventory in the UI-SPEC
(four components to adapt) and the type scale (four tiers with clamp() values) are
authoritative. This research validates those decisions against the live code and
surfaces integration details the planner must handle.

The single highest-risk item is the `presentation-mode` CSS class in `globals.css`
(lines 163-207). It sets a blanket `transition: opacity 0.5s ease-in-out` on ALL
children and overrides `text-sm`/`text-xs` with fixed px values. Both of these
conflict with the new clamp() typography approach and can cause unexpected Framer
Motion animation jank. This class must be audited as part of the implementation.

**Primary recommendation:** Adapt existing components in-place rather than creating
new components. The three presentation-mode files are already structured with
`h-full overflow-hidden` roots — the changes are replacing fixed gaps/typography
with viewport-relative values and ensuring the height chain is unbroken from `h-dvh`
down to each leaf container.

---

## Standard Stack

### Core

| Library        | Version | Purpose                                 | Why Standard                                                    |
| -------------- | ------- | --------------------------------------- | --------------------------------------------------------------- |
| Tailwind CSS 4 | 4.x     | Utility classes including grid layout   | Already installed; `grid-rows-3` emits `minmax(0,1fr)` in v4    |
| Framer Motion  | 12.34.0 | Card entry animations, page transitions | Already used; `AnimatePresence mode="wait"` pattern established |
| Next.js 16     | 16.1.1  | App Router, Image component             | Fixed — project constraint                                      |

### No New Dependencies

All CSS primitives required (`h-dvh`, `grid-rows-3`, `@container`, arbitrary
`clamp()` values, `gap-[1vh]`) are available in the existing Tailwind CSS 4
installation. Zero new packages needed for this phase.

---

## Architecture Patterns

### Layout Structure (locked by D-01 through D-06)

```
dashboard-client.tsx (presentation active)
  div.h-dvh.overflow-hidden.grid.grid-rows-[auto_1fr]   ← outermost
    div (header — unchanged, D-02)
    div.grid.grid-cols-2.h-full.overflow-hidden.gap-[1vh].p-[1vh]   ← content area
      ├── LEFT: grid.grid-cols-2.grid-rows-3.h-full.gap-[1vh].overflow-hidden
      │     └── MetricCard × up to 6 (each h-full)
      └── RIGHT (performer page): div.h-full.overflow-hidden.flex.flex-col
            └── Top 10 tracks list
          RIGHT (company page): div.relative.h-full.overflow-hidden.flex.flex-col.gap-[1vh]
            └── ArtistCard × 3 (each flex-1.min-h-0) — carousel if >3 performers
```

### Pattern 1: Height Chain Integrity

Every element in the tree from `h-dvh` down must propagate height. If any ancestor
lacks an explicit height, `absolute inset-0` children and `h-full` children collapse
to zero.

```typescript
// Source: PITFALLS.md pitfall #7 + ARCHITECTURE.md CSS Grid Pattern
// CORRECT: explicit height at every level
<div className="h-dvh grid grid-rows-[auto_1fr] overflow-hidden">
  <header>...</header>
  <div className="grid grid-cols-2 h-full gap-[1vh] overflow-hidden">
    <div className="grid grid-cols-2 grid-rows-3 h-full gap-[1vh] overflow-hidden">
      {/* Each cell — h-full propagates down */}
      <div className="h-full overflow-hidden rounded-2xl">
        {/* card content */}
      </div>
    </div>
  </div>
</div>

// WRONG: min-h instead of h
<div className="min-h-dvh ...">  // absolute children collapse to 0
```

### Pattern 2: `minmax(0, 1fr)` for Safe Grid Rows

`grid-rows-3` in Tailwind 4 emits `repeat(3, minmax(0, 1fr))`. The `minmax(0, ...)`
clamps each row so chart-heavy or text-heavy cards cannot push the row past 1/3 of
the available height.

```css
/* What Tailwind 4 grid-rows-3 emits (verified in STACK.md) */
grid-template-rows: repeat(3, minmax(0, 1fr));
```

**Add `min-h-0` on any flex children** inside grid cells to prevent implicit minimum
sizing from overriding the grid constraint.

### Pattern 3: Performer Artist Cards as Flex Thirds

For the company right half, three artist cards must each occupy exactly 1/3 of the
container without using the grid (they're vertical stacks, not a 2D grid).

```typescript
// Source: UI-SPEC.md Company Page Right Half section
<div className="relative h-full overflow-hidden flex flex-col gap-[1vh]">
  <AnimatePresence mode="wait">
    <motion.div className="flex flex-1 flex-col gap-[1vh]">
      {currentPerformers.map((performer, idx) => (
        // flex-1 + min-h-0: each card gets equal height, cannot overflow
        <div className="flex-1 min-h-0 overflow-hidden rounded-2xl">
          <ArtistCard ... />
        </div>
      ))}
    </motion.div>
  </AnimatePresence>
</div>
```

D-15 requires cards always be 1/3 height even with fewer than 3. With `flex-1`
each card only fills the space divided by the number of cards rendered. To lock
cards at 1/3 regardless of count, use `h-1/3 shrink-0` instead of `flex-1`.

### Pattern 4: clamp() Typography

```typescript
// Source: UI-SPEC.md Typography section (4 tiers)
// display tier — metric values, delta badges, performer names
className = "text-[clamp(1.5rem,3vw,4rem)] font-black tabular-nums";

// heading tier — metric card labels
className = "text-[clamp(1.5rem,1.3vw,2rem)] font-medium";

// body tier — track names
className = "text-[clamp(0.875rem,1vw,1.125rem)] font-medium";

// caption tier — artist names, city entries, page indicator
className = "text-[clamp(0.75rem,0.9vw,1rem)] font-medium";
```

The `1.5rem` floor on the heading tier guarantees GRID-05: at 1920px wide,
`1.3vw = 24.96px`, and the floor catches narrower viewports.

### Pattern 5: Carousel Page Timing

The `CompanyDisplay` component already implements this pattern. The planner must
verify the formula passes the correct milliseconds:

```typescript
// Source: company-display.tsx lines 263-269 (existing, already correct)
const timePerPage = (rotationInterval * 1000) / totalPages;
// rotationInterval is in seconds (from usePresentationMode state)
// interval fires every timePerPage milliseconds
```

### Anti-Patterns to Avoid

- **`aspect-[3/2]` on grid-constrained children**: `performer-card.tsx` line 22
  uses this — it fights the grid row height. Remove it and use `h-full` instead.
- **Double `h-screen`**: Only the outermost container gets `h-dvh`. Children use
  `h-full` to inherit.
- **Framer Motion `layout` prop inside CSS Grid**: Causes reflow that fights the
  grid. Use `opacity`/`transform` animations only (already the established pattern).
- **`transition: all` in globals.css**: The `.presentation-mode *` rule at line 205
  sets `transition: opacity 0.5s ease-in-out` on ALL children. This conflicts with
  Framer Motion's own transition control. Consider scoping it to avoid touching
  elements Framer Motion manages.

---

## Don't Hand-Roll

| Problem                          | Don't Build               | Use Instead                                   | Why                                                              |
| -------------------------------- | ------------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| Equal-height grid rows           | JS height calculator      | `grid-rows-3` (Tailwind 4 = `minmax(0, 1fr)`) | Native CSS; handles content blowout; works on 4K without JS      |
| TV-to-4K font scaling            | ResizeObserver + setState | `clamp()` arbitrary Tailwind values           | Zero JS; scales continuously; project constraint forbids JS      |
| Carousel page timing             | Custom timer abstraction  | `setInterval` inside `useEffect` with cleanup | Already implemented in `company-display.tsx` — reuse the pattern |
| Card-internal proportional space | Fixed px padding          | `p-[1.5vh]` viewport-relative                 | Self-scales on any TV resolution                                 |

---

## Runtime State Inventory

Step 2.5: SKIPPED — This is a UI layout redesign phase, not a rename or migration
phase. No stored data, live service config, OS-registered state, secrets, or build
artifacts reference any string being changed.

---

## Environment Availability Audit

Step 2.6: SKIPPED — This phase has no external dependencies beyond the project's
own code. All libraries are already installed. No databases, CLIs, or external
services are introduced.

---

## Common Pitfalls

### Pitfall 1: Grid Blowout (`1fr` implicit minimum)

**What goes wrong:** A metric card with a tall Recharts chart or long city name
expands its row past 1/3 of the available height, causing the grid to exceed the
viewport.

**Why it happens:** `1fr` has an implicit minimum of `auto` unless wrapped in
`minmax(0, 1fr)`. Tailwind 4 `grid-rows-3` emits the correct form, but any
manually specified `grid-rows-[...]` must use `minmax(0,1fr)` explicitly.

**How to avoid:** Use `grid-rows-3` (not custom arbitrary grid-rows). Add `min-h-0`
to any flex children inside grid cells.

**Warning signs:** The grid scrolls on one TV resolution but not another. Total
rendered height exceeds viewport in DevTools.

### Pitfall 2: `presentation-mode` CSS Blanket Transition

**What goes wrong:** `app/globals.css` line 205 adds `transition: opacity 0.5s
ease-in-out` to every element inside `.presentation-mode`. This overrides Framer
Motion's `transition` prop on animated elements, causing animations to mix CSS
transitions and JS-driven transforms simultaneously.

**Why it happens:** The class was written for simpler pre-Framer-Motion animations.

**How to avoid:** Either scope the transition rule to non-Framer elements, or add
`transition-none` on Framer Motion wrappers, or replace with a more targeted CSS
rule. Verify animations look correct after this rule interacts with the new grid.

**Warning signs:** Card entry animations appear sluggish or run twice (CSS + JS
transition fighting each other).

### Pitfall 3: `performer-card.tsx` Aspect Ratio Conflict

**What goes wrong:** `performer-card.tsx` uses `aspect-[3/2]` on its root element
(line 22). When this card is placed inside a grid cell or flex container with a
fixed height, `aspect-ratio` fights the parent height constraint. The card either
overflows or collapses depending on which constraint wins.

**Why it happens:** The card was designed for the non-presentation sidebar view
where width drives layout.

**How to avoid:** For the company right-half artist cards, the UI-SPEC specifies
replacing this pattern with `h-full`. The existing `ArtistCard` in `company-display.tsx`
already uses the correct pattern (`flex-1 overflow-hidden rounded-2xl` with
`absolute inset-0` for the banner image). The standalone `performer-card.tsx` should
either be refactored for the new layout or not used in presentation mode.

**Warning signs:** Artist cards have inconsistent heights or overflow their containers.

### Pitfall 4: `h-1/3` vs `flex-1` for Fixed-Height Performer Cards

**What goes wrong:** Using `flex-1` for artist cards produces equal splits of
whatever height the flex container has. With 1 card, the card fills 100% (not 1/3).
With 2 cards, each fills 50% (not 1/3). D-15 requires cards always be 1/3 height.

**Why it happens:** `flex-1` distributes space equally among all children, not at
a fixed fraction.

**How to avoid:** Use `h-1/3 shrink-0 min-h-0 overflow-hidden` on each card
wrapper, not `flex-1`. The parent container height is fully resolved (it's in the
height chain from `h-dvh`), so percentage heights work correctly.

**Warning signs:** Single-performer company view shows the card stretching full
height; two-performer view shows cards at 50% height.

### Pitfall 5: Tailwind JIT Missing Arbitrary Viewport Classes

**What goes wrong:** `gap-[1vh]`, `p-[1.5vh]`, `text-[clamp(...)]` must appear as
complete literal strings in source files. Dynamic class construction like
`` `gap-[${gapValue}vh]` `` is not scanned by the JIT compiler and disappears in
production builds.

**Why it happens:** Tailwind scans for class strings statically; template literals
with dynamic segments are not recognized.

**How to avoid:** Write full class strings as literals. If a viewport-relative value
is needed in multiple places, add a CSS custom property in `globals.css` and
reference via arbitrary value. Always run `npm run build` after adding new arbitrary
classes to verify they appear in the output.

**Warning signs:** Viewport-relative gaps or clamp typography works in `npm run dev`
but reverts to default sizes in `npm run build` output.

---

## Code Examples

### 1. Outermost presentation container (dashboard-client.tsx)

```typescript
// Source: CONTEXT.md D-03; UI-SPEC.md Layout Architecture
// Replace current lines 351-358 wrapper when presentation.isActive
<div className="h-dvh overflow-hidden grid grid-rows-[auto_1fr]">
  {/* Row 1: header — unchanged content */}
  <header className="flex items-center gap-4 rounded-xl border bg-card/80 px-5 py-2.5 shadow-sm backdrop-blur">
    {/* ...existing header content unchanged... */}
  </header>

  {/* Row 2: content area */}
  <div className="grid grid-cols-2 h-full overflow-hidden gap-[1vh] p-[1vh]">
    {/* LEFT and RIGHT halves here */}
  </div>
</div>
```

### 2. Performer page — left metric grid

```typescript
// Source: UI-SPEC.md Performer Page Left Half; STACK.md Section 1
// Adapts performer-presentation.tsx line 207 internal grid
<div className="grid grid-cols-2 grid-rows-3 h-full gap-[1vh] overflow-hidden">
  {totalStreams != null && (
    <MetricCard
      label="Spotify Streams"
      value={totalStreams}
      // ...other props unchanged
    />
  )}
  {/* up to 6 metric cards — empty slots render nothing */}
</div>
```

### 3. Company page — right artist cards (fixed 1/3 height)

```typescript
// Source: CONTEXT.md D-15; UI-SPEC.md Company Page Right Half
// Each card is exactly 1/3 height regardless of count
<div className="relative h-full overflow-hidden flex flex-col gap-[1vh]">
  {totalPages > 1 && (
    <div className="absolute top-2 right-2 z-20 rounded-md bg-black/40 px-2 py-1 text-[clamp(0.75rem,0.9vw,1rem)] font-medium text-white/60 backdrop-blur-sm">
      {currentPage + 1}/{totalPages}
    </div>
  )}
  <AnimatePresence mode="wait">
    <motion.div
      key={currentPage}
      className="flex-1 flex flex-col gap-[1vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {currentPerformers.map((performer) => (
        // h-1/3 locks card at 1/3 of container height regardless of sibling count
        <div key={performer} className="h-1/3 shrink-0 min-h-0 overflow-hidden rounded-2xl">
          <ArtistCard ... />
        </div>
      ))}
    </motion.div>
  </AnimatePresence>
</div>
```

### 4. clamp() typography — heading tier (metric card labels)

```typescript
// Source: UI-SPEC.md Typography; REQUIREMENTS.md GRID-04, GRID-05
// Floor 1.5rem (24px) guarantees GRID-05 compliance
<span className="text-[clamp(1.5rem,1.3vw,2rem)] font-medium text-white/50">
  {label}
</span>

// display tier — metric values
<p className="text-[clamp(1.5rem,3vw,4rem)] font-black text-white tabular-nums">
  {formatCompactNumber(value)}
</p>
```

---

## State of the Art

| Old Approach                                     | Current Approach               | When Changed         | Impact                                                                  |
| ------------------------------------------------ | ------------------------------ | -------------------- | ----------------------------------------------------------------------- |
| Fixed `text-sm`/`text-xs` boosted by globals.css | `clamp()` per element          | Phase 2 (this phase) | Typography self-scales to any TV resolution without CSS class overrides |
| `aspect-[3/2]` performer card (non-presentation) | `h-1/3 shrink-0` in TV mode    | Phase 2 (this phase) | Height is grid/flex controlled, no aspect ratio fighting parent         |
| Single fullscreen card with slide transition     | Two-column always-visible grid | Phase 2 (this phase) | All content visible simultaneously, no rotation for performers          |

**Deprecated/outdated (to clean up or scope):**

- `globals.css` `.presentation-mode .text-sm` and `.text-xs` overrides: redundant
  once clamp() is applied directly. Can be removed or kept as a safety net.
- `globals.css` `.presentation-mode *` transition rule: too broad; conflicts with
  Framer Motion. Should be removed or narrowed.

---

## Open Questions

1. **`performer-card.tsx` usage in production**
   - What we know: It has `aspect-[3/2]` which is incompatible with constrained
     height containers. UI-SPEC says to replace.
   - What's unclear: Is `performer-card.tsx` used anywhere outside of presentation
     mode? A grep would confirm. If it's shared, the replacement must be a new
     variant, not a modification of the existing component.
   - Recommendation: The planner should include a grep task to confirm usage scope
     before deciding to modify in-place vs. create a new component.

2. **`h-1/3` vs `flex-1` for artist cards with D-15**
   - What we know: D-15 says "always 1/3 height". `flex-1` produces equal splits
     that vary with card count. `h-1/3` is percentage of parent and requires
     resolved parent height.
   - What's unclear: Whether the flex parent's height resolves correctly via
     `h-full` chain from `h-dvh`. It should, given the height chain is intact.
   - Recommendation: Use `h-1/3 shrink-0` on card wrappers. If the parent is
     `flex flex-col h-full`, percentage heights work. Verify in browser at step
     where company right half is assembled.

3. **`presentation-mode` class global transition rule**
   - What we know: Lines 204-207 of globals.css add `transition: opacity 0.5s
ease-in-out` to ALL `.presentation-mode *` descendants. Framer Motion also
     controls opacity transitions on animated elements.
   - What's unclear: Whether mixing CSS and JS transitions on the same property
     causes visual artifacts in practice with Framer Motion 12.
   - Recommendation: Remove the `* { transition }` rule from globals.css as part
     of this phase. The individual animated elements in the existing components
     already have explicit Framer Motion transitions that are more precise.

---

## Project Constraints (from CLAUDE.md)

Directives the planner must verify compliance with:

- **No JS resize listeners**: All scaling via CSS only (`clamp()`, `vh`, `vw`,
  `grid-rows-3`). Zero `ResizeObserver`, `window.addEventListener("resize")`, or
  `useWindowSize` hooks.
- **Tailwind CSS 4 only**: No new CSS frameworks or styling libraries.
- **`"use client"` marker**: All presentation mode components are client components
  (they use hooks). Ensure marker is present.
- **Double-quote strings**: All string literals use double quotes, not single.
- **`import type`**: Type-only imports must use `import type { ... }`.
- **`cn()` for conditional classes**: Use `cn()` from `@/lib/utils` for conditional
  class application.
- **No `any`**: TypeScript strict mode — replace any `as any` casts with explicit types.
- **80-char line width**: Prettier will enforce, but avoid writing lines that will
  wrap unexpectedly.
- **Named exports**: All components use named exports (`export function Foo`), not
  default exports.
- **Absolute path aliases**: All internal imports use `@/` prefix, never relative
  `../`.
- **`npm run build` + `npm run lint` + `npm run type-check`**: All must pass before
  phase is marked complete. No test suite exists (nyquist_validation: false).

---

## Sources

### Primary (HIGH confidence)

- `.planning/research/STACK.md` — CSS Grid `h-dvh`, `grid-rows-3`, `clamp()`,
  container queries verified against Tailwind 4 docs and MDN
- `.planning/research/PITFALLS.md` — 11 pitfalls documented with prevention
  strategies and phase mapping
- `.planning/research/ARCHITECTURE.md` — Component boundary model, build order,
  Framer Motion integration rules
- `.planning/phases/02-tv-grid-layout/02-CONTEXT.md` — 17 locked decisions (D-01
  through D-17), carousel behavior, card sizing
- `.planning/phases/02-tv-grid-layout/02-UI-SPEC.md` — Visual contract: typography
  scale (4 tiers), spacing tokens, color palette, component inventory
- `components/presentation-mode/performer-presentation.tsx` — Existing full-screen
  performer view, source of MetricCard and track list patterns
- `components/presentation-mode/company-display.tsx` — Existing company view with
  working carousel (lines 249-271), ArtistCard pattern
- `components/presentation-mode/performer-card.tsx` — Identifies `aspect-[3/2]`
  anti-pattern to remove
- `components/dashboard/dashboard-client.tsx` lines 350-518 — Current presentation
  mode shell; `grid-rows-[auto_1fr]` already scaffolded at line 362
- `hooks/use-presentation-mode.ts` — Auto-rotation hook; carousel timing formula
  confirmed at line 264-265
- `app/globals.css` lines 163-207 — `.presentation-mode` class with blanket
  transition rule (pitfall risk)
- `.planning/config.json` — `nyquist_validation: false` (validation section skipped)

### Secondary (MEDIUM confidence)

- CLAUDE.md project instructions — Coding conventions, import rules, TypeScript
  requirements

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — zero new libraries; all techniques verified in phase-1 research artifacts and live codebase
- Architecture: HIGH — build order and component boundaries established in ARCHITECTURE.md, confirmed against current code
- Pitfalls: HIGH — grounded in live code (globals.css transition rule, performer-card.tsx aspect-ratio) not hypothetical

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable CSS + React ecosystem; no fast-moving dependencies)
