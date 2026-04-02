# Research Summary: TV Dashboard Responsiveness

**Synthesized:** 2026-04-02
**Scope:** TV-responsive 2x3 grid layout + Spotify-only streams fix

## Key Findings

### Stack

- **CSS Grid `h-dvh grid-rows-3`** is the correct primitive for equal-height rows filling 100vh
- **`clamp()` typography** scales smoothly from 1080p to 4K without breakpoints
- **Container queries (`@container` + `cqw`)** handle card-internal proportional spacing
- **Zero new dependencies** — all techniques available in existing Tailwind CSS 4
- **Media queries alone are wrong** — Tailwind's breakpoints top out at 1536px; 4K TVs are 3840px

### Features — Table Stakes

- 100vh containment with no scroll (TVs have no scroll UI)
- Equal-height grid rows (2×3 = 6 cards)
- Proportional text scaling (minimum 24px body text for TV viewing distance)
- Correct streams metric (Spotify only, not YouTube + Spotify)
- Viewport-relative gaps and padding

### Architecture

- 3-component model: `TVPresentationLayout` → `TVPerformerGrid` → `TVPerformerGridCard`
- Replaces current single-slide auto-rotation with simultaneous multi-card grid
- Existing `PerformerPresentation` needs a condensed variant for 1/3-height cells
- Framer Motion: stagger-on-mount only, no `layout` prop (conflicts with CSS Grid)

### Watch Out For

1. **Grid blowout** — `1fr` implicit `auto` minimum; Tailwind 4's `grid-rows-3` already uses `minmax(0, 1fr)` ✓
2. **App-shell margin budget** — ancestor padding/margin can exceed 100vh; lock `overflow: hidden` on body
3. **Framer Motion transition conflicts** — absolute positioned elements during AnimatePresence need `h-full` parent
4. **Fixed font sizes at 4K** — `text-sm` (14px) illegible on large TVs; use `clamp()`
5. **Tailwind JIT** — viewport-unit arbitrary classes must be complete string literals

## Implementation Order

1. **Streams fix** (independent, zero-risk) — remove YouTube views from `totalStreams` in `company-display.tsx`
2. **Grid shell** — `h-dvh grid grid-cols-2 grid-rows-3` container
3. **Card adaptation** — condensed performer view for 1/3-height cells
4. **Viewport-relative spacing** — `gap-[1vh]`, `p-[1vh]`, `clamp()` typography

## Decisions for Roadmap

| Decision              | Recommendation                           | Confidence |
| --------------------- | ---------------------------------------- | ---------- |
| Grid technique        | CSS Grid + `h-dvh` + `grid-rows-3`       | HIGH       |
| Typography scaling    | `clamp()` with `vw` preferred value      | HIGH       |
| Card-internal sizing  | Container queries (`@container` + `cqw`) | MEDIUM     |
| `h-dvh` vs `h-screen` | `h-dvh` preferred, `h-screen` fallback   | HIGH       |
| Framer Motion in grid | Opacity/transform only, no `layout` prop | HIGH       |

## Files

- `STACK.md` — CSS techniques and decision matrix
- `FEATURES.md` — Feature landscape with table stakes/differentiators/anti-features
- `ARCHITECTURE.md` — Component boundaries, integration points, build order
- `PITFALLS.md` — 11 documented pitfalls with prevention strategies
