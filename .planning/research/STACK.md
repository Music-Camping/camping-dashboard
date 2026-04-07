# Stack Research: TV-Responsive Dashboard

**Researched:** 2026-04-02
**Domain:** CSS techniques for TV-responsive 2x3 grid layout
**Confidence:** HIGH

## Key Findings

### 1. CSS Grid `h-dvh grid-rows-3` — The Core Primitive

`grid-rows-3` emits `repeat(3, minmax(0, 1fr))` in Tailwind 4. The `minmax(0, ...)` form is critical so chart-heavy cards cannot push rows taller than 1/3 viewport.

```html
<div class="grid h-dvh grid-cols-2 grid-rows-3 gap-[1vh] p-[1vh]">
  <!-- 6 cards, each exactly 1/3 height × 1/2 width -->
</div>
```

**Confidence:** HIGH — verified against Tailwind 4 official docs.

### 2. `clamp()` for Typography Scaling (1080p → 4K)

Pattern: `text-[clamp(1rem,2.5vw,3.5rem)]`. The `vw` preferred arg doubles naturally at 4K (2×1920 = 3840px).

```html
<span class="text-[clamp(1.5rem,3vw,3rem)]">Metric Value</span>
<span class="text-[clamp(0.75rem,1.5vw,1.25rem)]">Label</span>
```

**Confidence:** HIGH — verified against MDN + Tailwind 4 v4.0 release.

### 3. Container Queries for Card-Internal Spacing

Tailwind 4 ships container queries natively — no plugin needed. `cqw` arbitrary values like `p-[2cqw]` scale padding proportionally to each card's own width.

```html
<div class="@container h-full">
  <div class="space-y-[1cqh] p-[2cqw]">
    <!-- Card content scales with card size -->
  </div>
</div>
```

**Confidence:** MEDIUM — `cqw` arbitrary values need `npm run build` smoke test to confirm PostCSS passthrough.

### 4. Zero New Dependencies Required

All primitives (`h-dvh`, `grid-rows-3`, `@container`, arbitrary value clamp, `cqw` units) are available in the existing Tailwind CSS 4 install.

## Decision Matrix

| Technique                 | Pros                           | Cons                                              | Verdict               |
| ------------------------- | ------------------------------ | ------------------------------------------------- | --------------------- |
| CSS Grid + `h-dvh`        | Native, zero JS, proportional  | `h-dvh` needs Chromium check on TV                | **Use**               |
| `clamp()` typography      | Smooth scaling, no breakpoints | Requires testing min/max values                   | **Use**               |
| Container queries (`cqw`) | Card-relative sizing           | Newer API, verify build                           | **Use with fallback** |
| Media queries alone       | Familiar                       | Breakpoints top out at 1536px (`2xl`), hard jumps | **Avoid**             |
| JS resize listeners       | Full control                   | PROJECT.md forbids it, complexity                 | **Avoid**             |
| `vw`/`vh` for everything  | Simple                         | Font scaling too aggressive at extremes           | **Use selectively**   |

## Implementation Layers

1. **Grid shell** (`h-dvh grid-rows-3`) — resolves the 100vh equal-rows bug
2. **Fluid typography** (`clamp()`) — resolves 4K readability
3. **Container-aware card internals** (`cqw`) — final polish for proportional spacing

## Fallbacks

- `h-dvh` → `h-screen` (`100vh`) fallback for older Chromium on smart TVs
- `cqw` → `vw`-based arbitrary values if container queries fail build

## Sources

- Tailwind CSS 4 docs: height, grid-template-rows, container queries
- MDN: clamp(), container query units
- Smashing Magazine "Designing For TV" (Sep 2025)
