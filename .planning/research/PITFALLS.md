# Pitfalls Research: TV Dashboard CSS Scaling

**Researched:** 2026-04-02
**Domain:** Common mistakes in TV-optimized CSS Grid layouts

## Critical Pitfalls (Cause Broken Layout)

### 1. Grid Blowout — `1fr` Implicit Minimum

**What goes wrong:** `1fr` rows have an implicit minimum of `auto`, not `0`. Children with tall content (charts, long text) expand the row past the 100vh budget, breaking the equal-thirds layout.

**Prevention:** Use `minmax(0, 1fr)` everywhere. Tailwind's `grid-rows-3` already emits this in v4. Add `min-h-0` on flex children inside grid items.

**Warning signs:** Grid total height exceeds viewport; scroll appears on TV.

**Phase mapping:** Phase 1 (grid shell setup).

### 2. App-Shell Margin Budget

**What goes wrong:** `h-screen` on the presentation wrapper does not account for padding/margin on ancestor elements (sidebar layout, Next.js body defaults). The total height silently exceeds 100vh.

**Prevention:** Lock `overflow: hidden` and zero padding on the body when presentation mode activates. Use `h-dvh` which accounts for dynamic browser chrome.

**Warning signs:** Slight scroll on some TV resolutions but not others.

**Phase mapping:** Phase 1 (grid shell setup).

### 3. Framer Motion Transition Blowout

**What goes wrong:** During slide transitions between performers, both entering and exiting `absolute inset-0` elements exist simultaneously. If the parent uses `min-h-0` instead of `h-full`, the absolute children resolve to 0-height.

**Prevention:** Use `relative h-full overflow-hidden` on the motion container parent. Test with AnimatePresence `mode="wait"` to ensure single element at a time.

**Warning signs:** Cards flash to 0-height during transitions.

**Phase mapping:** Phase 1 (grid integration with existing animations).

### 4. Fixed Font Sizes at 4K

**What goes wrong:** `text-2xl` is 24px at both 1080p and 4K. On a 65" 4K TV at 3m viewing distance, this is illegible. Labels using `text-sm` (14px) are even worse.

**Prevention:** Use `clamp()` for metric values: `clamp(1.5rem, 3vw, 3rem)`. For labels: `clamp(0.75rem, 1.5vw, 1.25rem)`.

**Warning signs:** Text looks fine on dev machine but complaints from TV viewers.

**Phase mapping:** Phase 1 (typography scaling, can be done alongside grid).

## Moderate Pitfalls

### 5. TV Overscan

**What goes wrong:** Some TVs physically crop 3–10% of the edges. Fixed `p-6` (24px) may not be enough.

**Prevention:** Use `px-[5vw] py-[5vh]` minimum on the grid container, or test on actual TVs.

**Warning signs:** Edge content cut off on some TVs but fine on others.

**Phase mapping:** Phase 1 (grid padding).

### 6. `overflow-hidden` Silent Truncation

**What goes wrong:** Clips content without visual indicator on dev machines but silently cuts off long performer names on TV.

**Prevention:** Pair with `text-ellipsis whitespace-nowrap` on single-line text. Test with real data (long performer names).

**Warning signs:** Missing text on TV that's visible in dev tools.

**Phase mapping:** Phase 1 (card content adaptation).

### 7. Absolute Children Height Chain

**What goes wrong:** `absolute inset-0` for banner images requires every ancestor to have a resolved height. `min-height` does not count — only explicit `height`.

**Prevention:** Use `height: 100vh` (not `min-height`) on the grid container. Ensure every parent in the chain has `h-full`.

**Warning signs:** Banner images collapse to 0 height.

**Phase mapping:** Phase 1 (company banner integration).

### 8. Tailwind JIT Missing Production Classes

**What goes wrong:** Viewport-unit arbitrary classes (`p-[5vw]`, `h-[100svh]`) must appear as complete string literals or the JIT scanner misses them. Dynamic class construction like `p-[${value}vw]` fails silently.

**Prevention:** Always write full class strings. Put custom viewport utilities in `global.css` if reused.

**Warning signs:** Classes work in dev but disappear in production build.

**Phase mapping:** All phases — verify with `npm run build` after each change.

## Minor Pitfalls

### 9. `aspect-ratio` Fighting Grid Height

**What goes wrong:** `performer-card.tsx` uses `aspect-[3/2]` which competes with the grid's row height, causing cards to overflow or underflow.

**Prevention:** Remove `aspect-*` from grid-constrained cards. Let the grid control height via `1fr`.

**Phase mapping:** Phase 1 (card adaptation).

### 10. Gap Values at Scale

**What goes wrong:** Fixed `gap-3.5` (14px) looks fine at 1080p but tiny at 4K (14px on 3840px width).

**Prevention:** Use `gap-[1vh]` for viewport-proportional gaps.

**Phase mapping:** Phase 1 (grid spacing).

### 11. `backdrop-blur` Jank on TV Hardware

**What goes wrong:** 6 composited cards with `backdrop-blur` during Framer Motion animation can cause stutter on lower-end TV chips (especially Chromecast, Fire Stick).

**Prevention:** Have a `bg-black/40` fallback ready. Consider removing blur in presentation mode.

**Warning signs:** Smooth on desktop, stuttery on actual TV hardware.

**Phase mapping:** Phase 1 (performance polish).

## Summary

Most pitfalls center on **height chain integrity** (ensuring 100vh flows down to every child without leaking) and **viewport-relative sizing** (replacing fixed pixels with proportional units). The streams fix has zero pitfall risk — it's a 2-line removal.
