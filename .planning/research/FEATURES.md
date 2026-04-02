# Feature Landscape: TV Dashboard Responsiveness

**Domain:** TV-optimized presentation dashboard (metrics wallboard)
**Researched:** 2026-04-02
**Milestone scope:** TV-responsive 2x3 grid layout + streams metric fix

## Context: What Already Exists

The current presentation mode is a single full-screen slide showing one performer or company at a time with auto-rotation and horizontal slide transitions. The `PerformerPresentation` and `CompanyDisplay` components fill `h-full w-full` and are rendered inside an `absolute inset-0` container.

The PROJECT.md requirement for "2x3 grid filling 100vh, each card 1/3 height" describes a redesign of the outer container — not the internal card layout.

The streams bug is isolated: `company-display.tsx` lines 324–327 add `youtube.views.latest` to `totalStreams`, which should only accumulate Spotify data.

## Table Stakes

| Feature                                        | Why Expected                                                                     | Complexity | Notes                                                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| Exact 100vh containment (no scroll)            | TV browsers have no scroll UI; overflow causes content clipping                  | Low        | Use `h-dvh` on outermost container                                                                   |
| Equal-height grid rows filling full height     | 2x3 grid must divide viewport evenly; unequal rows mean wasted space or overflow | Low        | `grid-rows-3` with `h-dvh` on container                                                              |
| No content overflow at any TV resolution       | Content that overflows at 4K or 32" breaks the layout silently                   | Low-Med    | All child components already use `overflow-hidden`; container also needs it                          |
| Proportional text scaling across TV sizes      | Text sized for 1080p may be unreadably small on 4K or too large on 32"           | Medium     | TV design guidance mandates minimum 24px body text; current `text-sm` (14px) on labels is borderline |
| Correct metric values (streams = Spotify only) | Wrong data erodes stakeholder trust instantly                                    | Low        | Remove `totalStreams += data.youtube.views.latest` in `company-display.tsx`                          |
| Stable layout across 1080p and 4K              | Dashboard target is "32" to 65+", 1080p and 4K"                                  | Low        | CSS Grid with viewport units handles this natively                                                   |
| Consistent gap/padding in viewport units       | Fixed-pixel gaps that look right at 1080p become tiny at 4K                      | Low        | Use `gap-[1vh]` or `p-[1vh]`                                                                         |

## Differentiators

| Feature                                   | Value Proposition                                   | Complexity | Notes                                     |
| ----------------------------------------- | --------------------------------------------------- | ---------- | ----------------------------------------- |
| Smooth entry animations per card          | Cards that fade in feel professional                | Low        | Framer Motion already integrated          |
| Viewport-relative typography scaling      | Text remains readable at any TV size without tuning | Medium     | CSS `clamp()` on font sizes               |
| Company banner extending behind full grid | Immersive context for the metrics display           | Low        | Already implemented inside CompanyDisplay |
| Progress indicator for auto-rotation      | Stakeholders know when the view changes             | Low        | Already partially exists                  |

## Anti-Features

| Anti-Feature                          | Why Avoid                                          | What to Do Instead                           |
| ------------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| JS-based resize listener for scaling  | PROJECT.md explicitly forbids it                   | CSS Grid with `dvh`/`vw` units               |
| Mobile/tablet responsive breakpoints  | Out of scope per PROJECT.md                        | Focus on 1080p/4K landscape TV only          |
| Custom scroll containers inside cards | No scroll UI on TV                                 | `overflow-hidden` + fixed row heights        |
| Per-performer font size adjustments   | JS-based text fitting is fragile                   | `truncate` / `line-clamp-1` Tailwind classes |
| Overscan compensation margins         | Legacy CRT concept; modern smart TVs don't need it | Standard viewport-filling layout             |
| Animations that cause reflow          | Defeats CSS-only scaling purpose                   | Opacity/transform only (already the pattern) |

## Feature Dependencies

```
Streams fix (company-display.tsx)
  → Independent: no other features depend on it

2x3 grid container (h-dvh, grid-cols-2, grid-rows-3)
  → Requires: Cards have h-full to fill their grid cell (they already do)
  → Enables: Equal-height proportional display on all TV sizes

Viewport-relative gaps/padding
  → Depends on: grid container established first

Typography scaling (optional differentiator)
  → Depends on: grid container established
  → Independent from streams fix
```

## MVP Recommendation

1. **Streams metric fix** — isolated, zero-risk, high stakeholder trust value
2. **2x3 grid container with `h-dvh`** — core layout requirement
3. **Viewport-relative padding/gaps** — swap fixed pixels for viewport units

Defer:

- Typography scaling with `clamp()` — requires cross-device testing
- Company banner grid extension — visual polish, separate PR

## Sources

- Smashing Magazine, "Designing For TV" (Sep 2025)
- Tailwind CSS height/grid docs
- Klipfolio large screen best practices
- Samsung Smart TV development guides
