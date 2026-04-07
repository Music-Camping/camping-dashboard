# Architecture Research: TV Grid Layout

**Researched:** 2026-04-02
**Domain:** CSS Grid architecture for 2x3 TV presentation layout

## Component Boundary Model

### 3-Component Structure

1. **`TVPresentationLayout`** — Grid shell
   - Location: `components/presentation-mode/`
   - Responsibility: `h-dvh grid grid-cols-2 grid-rows-3` container
   - Owns: gap, padding (viewport units), overflow hidden
   - Does NOT own: card content, animations

2. **`TVPerformerGrid`** — Grid orchestrator
   - Location: `components/presentation-mode/`
   - Responsibility: Maps performers to grid cells, handles <6 performer cases
   - Renders: Up to 6 `TVPerformerGridCard` components
   - Handles: Empty cell placeholders, performer ordering

3. **`TVPerformerGridCard`** — Grid cell wrapper
   - Location: `components/presentation-mode/`
   - Responsibility: `h-full overflow-hidden` cell that adapts existing performer card
   - Contains: Existing `PerformerPresentation` or condensed performer view
   - Owns: Card-level container queries (`@container`)

## Integration with Existing Architecture

### Current Flow (Single-Slide)

```
DashboardClient (presentation mode)
  → absolute inset-0 container
    → AnimatePresence (slide transition)
      → PerformerPresentation (h-full w-full, one at a time)
      → CompanyDisplay (h-full w-full, one at a time)
```

### New Flow (Grid)

```
DashboardClient (presentation mode)
  → TVPresentationLayout (h-dvh grid)
    → CompanyDisplay header (grid row span or separate section)
    → TVPerformerGrid
      → TVPerformerGridCard × 6
        → Condensed performer view (h-full)
```

### Key Integration Points

- **`DashboardClient`** (`components/dashboard/dashboard-client.tsx`): Already has `grid-rows-[auto_1fr]` shell for presentation mode. The TV grid replaces the `1fr` content area.
- **`PerformerPresentation`**: Currently designed for full-screen single display. For the grid, need a condensed variant that fits 1/3 height × 1/2 width.
- **`CompanyDisplay`**: Currently full-screen. Company header/banner may need to sit above or alongside the grid.

## CSS Grid Pattern

```html
<!-- Grid shell -->
<div
  class="grid h-dvh grid-cols-2 grid-rows-3 gap-[1vh] overflow-hidden p-[1vh]"
>
  <!-- Each cell -->
  <div class="@container h-full overflow-hidden rounded-lg">
    <!-- Performer card content, scales with container -->
  </div>
</div>
```

### Why This Works

- `h-dvh` = full viewport height (dynamic, accounts for browser chrome)
- `grid-rows-3` = `repeat(3, minmax(0, 1fr))` — equal thirds, content can't blow out
- `gap-[1vh]` = proportional gaps that scale with viewport
- `@container` on each cell = card internals can use `cqw`/`cqh` for proportional sizing

## Framer Motion Integration

- **Stagger-on-mount only**: Cards fade in with staggered delay on initial load
- **No `layout` prop**: Framer Motion's layout animations conflict with CSS Grid — don't use
- **Opacity/transform only**: Existing animation pattern is correct; no reflow-causing animations
- **Auto-rotation**: If the grid shows all performers at once, auto-rotation may shift to rotating companies rather than individual performers

## Build Order

1. **Grid shell** — Create `TVPresentationLayout` with `h-dvh grid grid-cols-2 grid-rows-3`
2. **Cell wrapper** — Create `TVPerformerGridCard` with `h-full overflow-hidden @container`
3. **Condensed performer view** — Adapt `PerformerPresentation` for 1/3-height cells
4. **Company integration** — Decide company header placement (above grid vs separate view)
5. **Polish** — Viewport-relative spacing, typography scaling, edge cases (<6 performers)

## Anti-Patterns to Avoid

| Anti-Pattern                       | Why                            | Do Instead                        |
| ---------------------------------- | ------------------------------ | --------------------------------- |
| `aspect-*` on grid children        | Fights grid row height         | Let grid control height via `1fr` |
| Double `h-screen` (parent + child) | Height overflow                | Single `h-dvh` on outermost only  |
| JS resize listeners                | PROJECT.md constraint          | Pure CSS viewport units           |
| Framer Motion `layout` prop        | Causes reflow, fights CSS Grid | Opacity/transform animations only |
