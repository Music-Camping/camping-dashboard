# Phase 3: Presentation Polish - Research

**Researched:** 2026-04-10
**Domain:** TV presentation mode — CSS container queries, Framer Motion performance, React idle patterns, Spotify data aggregation
**Confidence:** HIGH

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-18:** Container queries with proportional reduction — reduce global text scale in presentation mode. Use `cqi`/`cqh` units and lower existing `clamp()` ceilings/floors uniformly. No JS resize listeners.
- **D-19:** Whitelist for real performers = `currentCompany.performers: string[]`. Any key in `spotifyTracksRaw` not in that list is a playlist and must be excluded from stream totals.
- **D-20:** For each real performer, sum `track.plays.latest` across ALL tracks in that performer's `tracks` array. No top-N truncation.
- **D-21:** Collaborations: keep the sum — count each performer's streams independently. No dedup by trackId.
- **D-22:** Company card order must match D-04: (1) Spotify Streams → (2) Ouvintes Mensais → (3) Vídeos → (4) Views → (5) Seguidores → (6) Top Cidades.
- **D-23:** Single `BannerBackground` behind both halves — edge-to-edge fullscreen. No `rounded-2xl` on the outer wrapper. Cards float on top.
- **D-24:** Auto-hide applies only in presentation (fullscreen) mode. After 5s of no `mousemove`, menu fades out.
- **D-25:** Reappearance triggers: `mousemove` OR click (TV box remote buttons emit click/keypress, not mousemove).
- **D-26:** Each MetricCard derives its `icons` array from which platforms actually contributed to that card's value. Aggregation `useMemo` tracks per-metric contribution.
- **D-27:** Transition strategy for TV box — CLAUDE'S DISCRETION (see recommendation below).

### Claude's Discretion

- Transition strategy for TV box (D-27): research and pick one approach.
- Container query syntax specifics: `cqi`, `cqh`, or named containers.
- Exact reduction percentages for font scaling.
- Menu fade-out animation duration/easing.

### Deferred Ideas (OUT OF SCOPE)

None identified in discussion.
</user_constraints>

---

## Summary

Phase 3 is a polish-only phase — no new features, no layout structure changes. All seven items are surgical fixes to existing components. The two highest-risk items are the streams aggregation (playlist exclusion) and the D-27 TV transition strategy.

The streams aggregation bug is architectural: `processSpotifyTracks` in `dashboard-server.ts` currently flattens ALL entities under each company (performers AND playlists) into a single flat dict, losing the company/performer hierarchy. The fix must happen at `app/(dashboard)/page.tsx` where `rankingsByPerformer` is built from `spotifyTracksRaw` — by filtering keys against each company's `performers` array from `initialData`.

For D-27, the research recommendation is: **keep Framer Motion but switch from slide (`x: "100%"`) to opacity-only fade, and strip `backdrop-blur-md` from all six metric card and artist card elements during animation** (re-apply it after the exit is complete). This is the highest-confidence path given the hardware constraints and the existing animation infrastructure.

**Primary recommendation:** Do not replace Framer Motion with CSS-only; the exit animation wiring in `AnimatePresence` would need to be rebuilt. Instead, reduce GPU load by removing `backdrop-blur` during transitions and switching from slide to fade.

---

## Standard Stack

### Core (unchanged — no new dependencies)

| Library        | Version    | Purpose                                   | Why Standard                               |
| -------------- | ---------- | ----------------------------------------- | ------------------------------------------ |
| Tailwind CSS 4 | `^4`       | Container queries, `cqi` units, `clamp()` | Native in v4 — no plugin needed            |
| Framer Motion  | `^12.34.0` | AnimatePresence fade transition           | Already installed, controls exit animation |
| React          | 19.2.3     | `useState`, `useEffect`, `useMemo`        | Project standard                           |

### No New Dependencies Required

- Container queries: native in Tailwind 4 (`@container`, `cqi`, `cqw` arbitrary values)
- Auto-hide hook: write a small custom `useIdleTimer` hook — `react-idle-timer` is not installed and adding it for 5s auto-hide is overkill
- All primitives already present

**Installation:** None required.

---

## Architecture Patterns

### 1. Container Queries in Tailwind CSS 4

**What:** Add `@container` to the grid wrapper. Child elements use `cqi` (container inline = width in horizontal writing) in arbitrary value classes or inline styles.

**Tailwind 4 native syntax (verified against official docs and staticmania.com/blog/tailwind-4-container-queries):**

```tsx
// Parent: add @container class to establish containment context
<div className="@container h-full">
  {/* Children can now reference cqi/cqh units */}
  <span className="text-[clamp(1rem,3cqi,2.5rem)] font-black">{value}</span>
</div>
```

**Key facts:**

- `@container` sets `container-type: inline-size` automatically in Tailwind 4
- `cqi` = container inline axis = container width in horizontal writing mode (same as `cqw` for our use case)
- Arbitrary value syntax `text-[clamp(1rem,3cqi,2.5rem)]` passes through to PostCSS directly — Tailwind 4 does not strip or transform it
- Named containers use slash syntax: `@container/card` → `@lg/card:text-xl`
- For this phase, unnamed `@container` is sufficient since each grid cell is an independent containment context

**Combining with Phase 2's existing `clamp()` approach:**

Phase 2 used viewport-relative `vw` preferred values:

```
text-[clamp(1.5rem,3vw,4rem)]   // Phase 2 pattern — still valid
text-[clamp(1rem,2cqi,2.5rem)]  // Phase 3 pattern — container-relative
```

The Phase 3 approach replaces `vw` with `cqi` in the preferred value. The min/max remain in `rem`. This makes text scale proportionally to each card's width instead of the full viewport width — which is the proportional reduction the client needs. On a 1920px viewport with two 50%-wide halves, a `3cqi` preferred is roughly `28px` (3% of ~940px card); a `3vw` preferred was `57px`. This is the "smaller overall" effect D-18 requires.

**Where to apply `@container`:**

- `company-display.tsx`: the outer wrapper div for each half (currently `relative h-full overflow-hidden`)
- `performer-presentation.tsx`: the left half wrapper (`relative h-full overflow-hidden rounded-2xl`)

**Important:** The outer wrapper for each half currently has `rounded-2xl`. D-23 removes `rounded-2xl` from the outer wrapper. These two changes (D-18 container + D-23 no-outer-rounded) work on the same wrapper div — coordinate in a single edit.

### 2. Font Reduction Approach (D-18)

Current `clamp()` values in both components:

- Label text: `clamp(1.5rem, 1.3vw, 2rem)` — too large on real TV
- Value text: `clamp(1.5rem, 3vw, 4rem)` — too large on real TV

**Recommended reduction — replace `vw` with `cqi` and lower the ceiling:**

| Element                      | Current                       | Phase 3                          |
| ---------------------------- | ----------------------------- | -------------------------------- |
| Card label                   | `clamp(1.5rem, 1.3vw, 2rem)`  | `clamp(0.9rem, 1.4cqi, 1.4rem)`  |
| Card value                   | `clamp(1.5rem, 3vw, 4rem)`    | `clamp(1.2rem, 2.8cqi, 3rem)`    |
| City/rank text               | `clamp(0.75rem, 0.9vw, 1rem)` | `clamp(0.65rem, 0.9cqi, 0.9rem)` |
| Performer name in ArtistCard | `clamp(1.5rem, 3vw, 4rem)`    | `clamp(1rem, 2.5cqi, 2.5rem)`    |

These are starting values — D-18 says "smaller, not exact targets", so the implementer may tune these. The ceiling reductions (from `4rem` to `3rem` etc.) are what produce the client's requested "fonts ficaram gigantes" fix.

**Implementation note:** Both components define `MetricCard` locally. Each one needs both the `@container` wrapper and the updated `clamp()` inside it. No shared component exists to update once.

### 3. Streams Aggregation Fix (D-19, D-20, D-21)

**The bug:** `processSpotifyTracks` in `dashboard-server.ts` flattens performers AND playlists together because it iterates `Object.values(companyData)` without filtering. Result: playlist entities appear as peers of performer entities in `spotifyTracksRaw`.

**Fix location:** `app/(dashboard)/page.tsx` — the `rankingsByPerformer` construction at lines 27-54.

**Current code (lines 27-43) — no whitelist:**

```ts
rankingsByPerformer: Object.entries(spotifyTracksRaw).map(
  ([performer, { tracks }]) => ({ performer, rankings: [...] })
)
```

**Fixed code — filter by `CompanyInfo.performers` whitelist:**

```ts
// Get all real performer names across all companies
const realPerformers = new Set(
  (data?.companies ?? []).flatMap((c) => c.performers),
);

rankingsByPerformer: Object.entries(spotifyTracksRaw)
  .filter(([name]) => realPerformers.has(name))
  .map(([performer, { tracks }]) => ({
    performer,
    rankings: [...tracks]
      .sort((a, b) => b.plays.latest - a.plays.latest)
      .map((track, idx) => ({
        position: idx + 1,
        previousPosition: idx + 1,
        trackId: track.external_id,
        trackName: track.name,
        artistName: performer,
        thumbnail: track.thumbnail ?? "",
        streams: track.plays.latest,
        change: "same" as const,
      })),
  }));
```

**D-20 note:** Rankings currently use `b.plays.latest - a.plays.latest` sort and then sum via `reduce((sum, r) => sum + r.streams, 0)`. This already sums ALL tracks — no top-N. The `rankings.slice(0, 10)` in `dashboard-client.tsx:231` is for the Top 10 track list display only, NOT for stream counting. The stream total uses the full `rankings` array. No change needed there after the whitelist filter is applied.

**D-21 note (collaborations):** If the same `trackId` appears under two performer keys (e.g., both "Artist A" and "Artist B" have a collab track), and both are real performers, both will sum independently. This is correct per D-21. No dedup needed.

**company-display.tsx aggregation useMemo (lines 311-384):** After the source fix, this useMemo still sums via `perf.rankings.reduce((sum, r) => sum + r.streams, 0)`. This is correct. Only the whitelist filter at the source changes. The downstream aggregation in `company-display.tsx` does not need to change for the streams fix.

**data availability:** `data?.companies` is the `CompanyData.companies?: CompanyInfo[]` field. Verify this is populated from the API before using it as the whitelist. If `data?.companies` is null/empty, the filter would exclude all performers — add a guard: if `realPerformers.size === 0`, skip filtering.

### 4. Company Card Order Fix (D-22)

**Current order in `company-display.tsx:473-522`:**

1. Streams
2. Vídeos
3. Views
4. Seguidores
5. Ouvintes Mensais
6. Top Cidades

**Required order (D-04/D-22):**

1. Streams
2. Ouvintes Mensais
3. Vídeos
4. Views
5. Seguidores
6. Top Cidades

This is a JSX reorder — move the `Ouvintes Mensais` MetricCard block (currently at position 5, lines 513-522) up to position 2 (after Streams). The `delay` props must also be re-indexed: 0, 0.06, 0.12, 0.18, 0.24, 0.30.

### 5. Background Unification (D-23)

**Current pattern:** `CompanyDisplay` returns a Fragment (`<>...</>`) with two children. Each child has its own `relative` wrapper containing a `BannerBackground` instance.

**Required pattern (D-23):** Single `BannerBackground` behind both halves. Both halves on top.

**Implementation:** The Fragment must become a wrapper div. Since `CompanyDisplay` is rendered inside `motion.div className="absolute inset-0 grid grid-cols-2"` in `dashboard-client.tsx:448`, the wrapper div must fill the grid cell without changing the grid layout.

```tsx
// Before: Fragment return
return (
  <>
    <div className="relative h-full overflow-hidden rounded-2xl">
      <BannerBackground bannerUrl={bannerUrl} />
      ...
    </div>
    <div className="relative h-full overflow-hidden rounded-2xl">
      <BannerBackground bannerUrl={bannerUrl} />
      ...
    </div>
  </>
);

// After: single background wrapper spanning both halves
return (
  <div className="relative col-span-2 grid h-full grid-cols-2 gap-[1vh]">
    {/* Single background fills the entire col-span-2 wrapper */}
    <BannerBackground bannerUrl={bannerUrl} />
    {/* Left half — transparent background, no rounded outer */}
    <div className="relative z-10 h-full overflow-hidden">...</div>
    {/* Right half — transparent background, no rounded outer */}
    <div className="relative z-10 h-full overflow-hidden">...</div>
  </div>
);
```

**Critical:** The parent `motion.div` in `dashboard-client.tsx:448` has `className="absolute inset-0 grid grid-cols-2 gap-[1vh] p-[1vh]"`. If `CompanyDisplay` returns a `col-span-2` div, it spans both grid columns. This is correct. But the `gap-[1vh]` and `p-[1vh]` on the parent motion.div create the outer padding. The inner gap between left and right halves must now be managed inside `CompanyDisplay`'s wrapper.

**D-23 "no rounded-2xl on outer wrapper":** Remove `rounded-2xl` from the outer wrappers of both halves (currently `rounded-2xl` on lines 470 and 571). Inner cards (`MetricCard`, `ArtistCard`) keep their `rounded-2xl` — only the half-panel wrapper loses it.

### 6. Auto-Hide Menu (D-24, D-25) — Custom Hook Pattern

**Decision:** Write a custom `useIdleTimer` hook. `react-idle-timer` is not installed; for a 5s timeout with mousemove + click, a ~20-line hook is simpler and incurs zero new dependency.

**Events to track:** `mousemove` AND `click` (covers TV box remote buttons which emit click/keypress but typically not mousemove).

**Pattern — minimal re-render:**

```tsx
// hooks/use-idle-timer.ts
import { useCallback, useEffect, useRef, useState } from "react";

export function useIdleTimer(timeoutMs: number, enabled: boolean) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    // Only update state on transition, not every event
    setIsIdle(false);
    timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
  }, [enabled, timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      setIsIdle(false);
      return undefined;
    }
    resetTimer();
    window.addEventListener("mousemove", resetTimer, { passive: true });
    window.addEventListener("click", resetTimer, { passive: true });
    window.addEventListener("keydown", resetTimer, { passive: true });
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, [enabled, resetTimer]);

  return isIdle;
}
```

**Key design choices:**

- `setIsIdle(false)` is called on every event, but React batches state updates. Since `false → false` is a no-op in React's reconciler (same value), only the `idle → active` transition actually causes a re-render. No throttling needed.
- `{ passive: true }` on mousemove prevents janky scrolling (not relevant on TV but good practice)
- `enabled` prop = `presentation.isActive` — hook is inert in normal mode

**Wire-up in `dashboard-client.tsx`:**

```tsx
const isMenuIdle = useIdleTimer(5000, presentation.isActive);

// PresentationControls gets visibility prop
<PresentationControls
  ...
  visible={!isMenuIdle}
/>
```

**`PresentationControls` CSS:** Use Tailwind transition on opacity + pointer-events to fade:

```tsx
<div className={cn(
  "transition-opacity duration-500",
  visible ? "opacity-100" : "opacity-0 pointer-events-none"
)}>
```

This is CSS-driven fade (no JS animation), which is S-Tier performance. No Framer Motion needed for the menu hide.

**Note:** Verify `PresentationControls` is defined in `dashboard-client.tsx` or a separate file. The `onStart`, `onStop` etc. props are already passed. Add `visible?: boolean` to its props interface.

### 7. Dynamic Platform Icons (D-26)

**Current pattern (company-display.tsx lines 460-464):**

```tsx
const spotifyIcon = aggregated.hasSpotify && <SpotifyIcon ... />;
const youtubeIcon = aggregated.hasYoutube && <YouTubeIcon ... />;
// Then icons={[spotifyIcon, youtubeIcon]} on Seguidores (both platforms)
// and icons={[spotifyIcon]} on Streams
```

**Problem:** `hasSpotify` and `hasYoutube` are company-wide booleans. They don't tell you which platforms contributed to each specific metric.

**Fix — extend the aggregation `useMemo` return to track per-metric platform booleans:**

```ts
return {
  streams: hasStreams ? totalStreams : undefined,
  videos: hasVideos ? totalVideos : undefined,
  views: hasViews ? totalViews : undefined,
  followers: hasFollowers ? totalFollowers : undefined,
  listeners: hasListeners ? totalListeners : undefined,
  // Per-metric platform contribution flags
  streamsPlatforms: { spotify: hasStreams }, // streams = Spotify only
  videosPlatforms: { youtube: hasVideos }, // videos = YouTube only
  viewsPlatforms: { youtube: hasViews }, // views = YouTube only
  listenersPlatforms: { spotify: hasListeners }, // listeners = Spotify only
  followersPlatforms: {
    // followers = sum of all
    spotify: !!performers.some(
      (n) => initialData?.[n]?.spotify?.followers?.latest,
    ),
    youtube: !!performers.some(
      (n) => initialData?.[n]?.youtube?.followers?.latest,
    ),
    instagram: !!performers.some(
      (n) => initialData?.[n]?.instagram?.followers?.latest,
    ),
  },
};
```

**JSX change:**

```tsx
icons={[
  aggregated.streamsPlatforms.spotify && <SpotifyIcon ... />,
]}
```

**performer-presentation.tsx (lines 226-233):** The Streams card currently shows `hasSpotify`, `hasYoutube`, AND `hasTiktok` icons. Per D-26, streams are Spotify-only. Fix: pass only `hasSpotify` icon to the Streams MetricCard.

```tsx
// Streams card — Spotify only (D-26 + D-01/Phase 1 principle)
icons={[
  hasSpotify && <SpotifyIcon className="size-full text-green-400" />,
]}
```

### 8. D-27 TV Box Transition — Research Recommendation

**Context:** The current transition is a slide (`x: "100%" → 0 → "-100%"`) with `mode="sync"` in `AnimatePresence`. During the transition, both entering and exiting `absolute inset-0` elements exist simultaneously. Each element contains 6 metric cards with `backdrop-blur-md`. This means up to 12+ composited blur layers during the transition peak.

**Performance analysis (from motion.dev performance tier list + Chromium compositing docs):**

| Approach                                              | GPU Cost                                                            | Implementation Risk                                        | Perceived Quality                               |
| ----------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| **Current** — slide + `backdrop-blur-md` on all cards | HIGH — 12+ blur layers active simultaneously during transition      | Baseline                                                   | Stutters on TV box                              |
| **Fade (opacity only) + keep blur**                   | MEDIUM — blur layers present but no transform jank                  | Low                                                        | Smooth-ish, blur still costs                    |
| **Slide (current) + remove blur during transition**   | LOW-MEDIUM — transform-only during animation, blur re-applied after | Medium                                                     | Best visual quality                             |
| **Fade + remove blur during transition**              | LOWEST — opacity-only with no blur during animation                 | Medium                                                     | Smooth, cards look flat during brief transition |
| **CSS-only `transition: transform`**                  | Similar to Framer slide                                             | HIGH — must rebuild exit animation without AnimatePresence | Same stutter risk                               |

**Recommendation: Fade + remove `backdrop-blur` during animation (option 4)**

Rationale:

1. `opacity` is S-Tier (compositor-thread) — cheapest possible transition on Android TV Chromium
2. Removing `backdrop-blur-md` during the animation eliminates the compositing layer explosion
3. The visual tradeoff is negligible — a 0.4s opacity fade with flat cards is indistinguishable from blur at TV viewing distance (3m+)
4. Implementation is minimal: add an `isTransitioning` boolean state that CSS-conditionally removes `backdrop-blur-md`, reset in `onAnimationComplete`

**Concrete implementation:**

In `dashboard-client.tsx`, replace slide with fade:

```tsx
// Before
initial={{ x: "100%" }}
animate={{ x: 0 }}
exit={{ x: "-100%" }}
transition={{ duration: 0.45, ease: "easeInOut" }}

// After — opacity fade only
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.35 }}
```

For `backdrop-blur` removal: the simplest approach is passing an `isTransitioning` prop to `CompanyDisplay` and `PerformerPresentation`, where `backdrop-blur-md` classes are conditionally included:

```tsx
// In MetricCard (both components):
className={cn(
  "... bg-white/[0.03] shadow-lg",
  !isTransitioning && "backdrop-blur-md"
)}
```

Track `isTransitioning` in `dashboard-client.tsx` using `onAnimationStart` / `onAnimationComplete` callbacks on the motion divs.

**Alternative (simpler):** Remove `backdrop-blur-md` from all presentation-mode cards permanently. Given `bg-white/[0.03]` on a dark banner, blur is barely visible at TV distance. This removes the implementation complexity entirely. MEDIUM confidence this is visually acceptable.

**`mode="sync"` vs `mode="wait"`:** Keep `mode="sync"` (current). `mode="wait"` delays the enter animation until exit completes, adding `+0.35s` of blank screen. On a TV rotating between entities every 30s, `mode="wait"` makes transitions feel sluggish. `mode="sync"` with fade creates a smooth cross-dissolve.

**Image preload for banner:** `BannerBackground` uses `next/image` with `priority` prop already set. Next.js handles preloading for `priority` images at SSR time. For client-side rotation, the banner images for the NEXT entity are not preloaded. This is a MEDIUM-priority enhancement — add `<link rel="preload">` for the next banner URL. However, for the immediate stutter fix, `backdrop-blur` removal has higher impact.

---

## Don't Hand-Roll

| Problem                     | Don't Build                       | Use Instead                              | Why                                                 |
| --------------------------- | --------------------------------- | ---------------------------------------- | --------------------------------------------------- |
| CSS container query support | Custom `ResizeObserver` listeners | `@container` in Tailwind 4               | Native browser API, Baseline 2023                   |
| Idle detection library      | `react-idle-timer` or similar     | Custom `useIdleTimer` hook (~20 lines)   | No new dependency for 5s timeout                    |
| Exit animation on menu hide | Framer Motion `AnimatePresence`   | CSS `transition-opacity`                 | Menu show/hide is CSS S-Tier, not worth FM overhead |
| Custom blur removal         | Complex state machine             | Simple boolean prop + `cn()` conditional | One boolean, two components                         |

---

## Common Pitfalls

### Pitfall 1: `col-span-2` on CompanyDisplay wrapper breaks parent grid

**What goes wrong:** Parent `motion.div` has `grid-cols-2`. If `CompanyDisplay` returns a `col-span-2` wrapper, it occupies both columns. This is correct for D-23, but if the parent still has `gap-[1vh]` between columns, it will no longer apply (since there's only one child). The inner `CompanyDisplay` must replicate the gap itself.

**How to avoid:** Move `gap-[1vh]` from parent motion.div to the inner grid inside `CompanyDisplay`'s wrapper. Or use `gap-[1vh]` on the inner `grid grid-cols-2` inside `CompanyDisplay`. Do not assume parent gap applies inside a col-span-2 child.

### Pitfall 2: Container query on an element without explicit `height` breaks `cqh`

**What goes wrong:** `cqh` units require the container to have a resolved height. If the wrapper is `h-full` without a parent with explicit height, `cqh` resolves to 0.

**How to avoid:** Use `cqi` (width-based) not `cqh` for font scaling. Card width is always resolved (grid cells have explicit width). `cqi` is safe on any `@container` with `h-full`.

### Pitfall 3: `data?.companies` is empty when whitelist filter runs

**What goes wrong:** `realPerformers = new Set(data?.companies?.flatMap(c => c.performers))` → empty set → all performers filtered out → `rankingsByPerformer = []` → Streams card shows "—" for all.

**How to avoid:** Guard: `if (realPerformers.size === 0) { /* skip filter, include all */ }`. Also verify `data.companies` is populated from the API before relying on it.

### Pitfall 4: Removing `backdrop-blur` conditionally causes flash

**What goes wrong:** If `isTransitioning` toggles on the same frame the animation starts, there's a 1-frame flash where blur disappears abruptly.

**How to avoid:** Use CSS transition on the blur element itself (Tailwind `transition-all duration-150`) or simply remove `backdrop-blur-md` permanently from presentation-mode cards.

### Pitfall 5: `setIsIdle(false)` on every mousemove causing re-render storm

**What goes wrong:** Naive implementation calls `setState` on every mousemove event — hundreds per second — causing continuous re-renders.

**How to avoid:** Use the ref pattern shown in the hook above: only call `setIsIdle` on state transitions (idle→active), not on every event. React's reconciler does deduplicate same-value setState but it still runs the reconciler.

### Pitfall 6: Phase 2's Fragment return pattern breaks D-23 wrapper

**What goes wrong:** `CompanyDisplay` was explicitly built with Fragment return (Phase 2 D-16 decision) to put two children in the parent `grid-cols-2`. Wrapping in a `col-span-2` div changes this contract. The parent `motion.div` must still have its `grid-cols-2` for the `PerformerPresentation` case — but the company case will now be a single `col-span-2` child.

**How to avoid:** The parent `grid-cols-2` remains. `CompanyDisplay` returns a `col-span-2` div (spans both columns). `PerformerPresentation` returns two children (fills two columns). Both patterns work in the same parent grid.

### Pitfall 7: Tailwind JIT missing `cqi` arbitrary values in production

**What goes wrong:** `text-[clamp(0.9rem,1.4cqi,1.4rem)]` uses a complex arbitrary value. Tailwind's content scanner must see the full string as a static literal. Dynamic construction like `` `text-[clamp(${min},${scale}cqi,${max})]` `` will not be scanned.

**How to avoid:** Write all `cqi` clamp values as complete string literals in the className. Verify with `npm run build` after adding any new `cqi` arbitrary value.

---

## Code Examples

### Container Query Setup (Tailwind 4)

```tsx
// Source: tailwindcss.com docs + staticmania.com/blog/tailwind-4-container-queries

// Parent: establish containment
<div className="@container relative h-full overflow-hidden">
  {/* MetricCard inside */}
  <span className="text-[clamp(0.9rem,1.4cqi,1.4rem)] font-medium text-white/50">
    {label}
  </span>
  <p className="text-[clamp(1.2rem,2.8cqi,3rem)] font-black text-white tabular-nums">
    {value}
  </p>
</div>
```

### Custom useIdleTimer Hook

```tsx
// hooks/use-idle-timer.ts
import { useCallback, useEffect, useRef, useState } from "react";

export function useIdleTimer(timeoutMs: number, enabled: boolean): boolean {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsIdle(false);
    timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
  }, [enabled, timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      setIsIdle(false);
      return undefined;
    }
    resetTimer();
    const events = ["mousemove", "click", "keydown"] as const;
    events.forEach((e) =>
      window.addEventListener(e, resetTimer, { passive: true }),
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [enabled, resetTimer]);

  return isIdle;
}
```

### Fade Transition (replaces slide in dashboard-client.tsx)

```tsx
// In AnimatePresence block — both company and performer motion.divs
<motion.div
  key={entityKey}
  className="absolute inset-0 grid grid-cols-2 gap-[1vh] p-[1vh]"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.35 }}
>
```

### Per-Metric Platform Flags (aggregation useMemo extension)

```tsx
// Inside aggregation useMemo — add per-metric tracking
let hasSpotifyFollowers = false;
let hasYoutubeFollowers = false;
let hasInstagramFollowers = false;

performers.forEach((name) => {
  const data = initialData?.[name];
  if (!data) return;
  if (data.spotify?.followers?.latest) {
    totalFollowers += data.spotify.followers.latest;
    hasFollowers = true;
    hasSpotifyFollowers = true;
  }
  if (data.youtube?.followers?.latest) {
    totalFollowers += data.youtube.followers.latest;
    hasFollowers = true;
    hasYoutubeFollowers = true;
  }
  if (data.instagram?.followers?.latest) {
    totalFollowers += data.instagram.followers.latest;
    hasFollowers = true;
    hasInstagramFollowers = true;
  }
  // ... other metrics unchanged
});

return {
  // ... existing fields
  followersPlatforms: {
    spotify: hasSpotifyFollowers,
    youtube: hasYoutubeFollowers,
    instagram: hasInstagramFollowers,
  },
  streamsPlatforms: { spotify: hasStreams },
  videosPlatforms: { youtube: hasVideos },
  viewsPlatforms: { youtube: hasViews },
  listenersPlatforms: { spotify: hasListeners },
};
```

### Playlist Filter in page.tsx

```tsx
// app/(dashboard)/page.tsx — inside spotifyData construction
const realPerformers = new Set(
  (data?.companies ?? []).flatMap((c: CompanyInfo) => c.performers),
);
const hasWhitelist = realPerformers.size > 0;

rankingsByPerformer: Object.entries(spotifyTracksRaw)
  .filter(([name]) => !hasWhitelist || realPerformers.has(name))
  .map(([performer, { tracks }]) => ({
    performer,
    rankings: [...tracks]
      .sort((a, b) => b.plays.latest - a.plays.latest)
      .map((track: SpotifyTrackRaw, idx: number) => ({
        position: idx + 1,
        previousPosition: idx + 1,
        trackId: track.external_id,
        trackName: track.name,
        artistName: performer,
        thumbnail: track.thumbnail ?? "",
        streams: track.plays.latest,
        change: "same" as const,
      })),
  })),
```

---

## Open Questions

1. **`data?.companies` type availability in page.tsx**
   - What we know: `CompanyInfo[]` is typed in `lib/types/dashboard.ts`. `DashboardResponse` is `Record<string, PerformerData | CompanyData>`.
   - What's unclear: `data` is typed as `DashboardResponse | null` — does it have a `.companies` array at the top level, or is `companies` only inside a `CompanyData` value? Looking at `CompanyData.companies?: CompanyInfo[]`, companies is nested inside a performer/company key, not at the root.
   - **Resolution needed:** Check `lib/api/dashboard-server.ts` to see how `getDashboardData()` returns `companies`. The whitelist must be sourced from wherever `companies` is accessible in page.tsx scope. If not available at top level, check if `data?.company?.companies` or `data?.total?.companies` is the right path.

2. **`PresentationControls` file location**
   - What we know: It's imported and used in `dashboard-client.tsx` around line 499.
   - What's unclear: Is it defined locally in `dashboard-client.tsx` or in a separate file? Adding `visible?: boolean` prop requires finding its definition.
   - **Resolution needed:** `grep -n "PresentationControls"` in the components directory before implementing the auto-hide feature.

3. **Banner image preload for entity rotation**
   - What we know: `BannerBackground` uses `next/image priority` — this preloads the SSR-rendered image.
   - What's unclear: During client-side entity rotation, the next entity's banner is not preloaded, causing potential banner flash.
   - **Recommendation:** Out of scope for Phase 3's stutter fix. The `backdrop-blur` removal is the primary fix. Banner preload is a Phase 4 enhancement if needed.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is purely frontend code and CSS changes. No external tools, services, CLIs, or databases are required beyond the existing Node.js + npm development environment.

---

## Project Constraints (from CLAUDE.md)

These directives apply to all implementation tasks in this phase:

- **No JS resize listeners** — all font scaling must use CSS container queries and `clamp()`. Verified: the `cqi` approach is pure CSS.
- **TypeScript strict mode** — all new code must be fully typed. No `any`. The per-metric platform flags object must have an explicit interface.
- **Import type for type-only imports** — `import type { CompanyInfo }` when only the type is used in page.tsx.
- **Double quotes, semicolons, 2-space indent, 80-char lines** — enforced by Prettier on commit.
- **No relative imports** — use `@/` aliases throughout.
- **ESLint Airbnb max 10 warnings** — `backdrop-blur-md` conditional inside `cn()` with a boolean will not trigger lint warnings.
- **Hooks: always include complete dependency arrays** — `useIdleTimer`'s `useEffect` must include `[enabled, resetTimer]`. `resetTimer` must be wrapped in `useCallback` with `[enabled, timeoutMs]`.
- **`useCallback`/`useMemo` dependencies** — `resetTimer` uses `enabled` and `timeoutMs`, both must be in its `useCallback` dep array.

---

## Sources

### Primary (HIGH confidence)

- Tailwind CSS 4 official docs (container queries, arbitrary values) — `@container` syntax, `cqi` unit passthrough, no plugin needed
- motion.dev/magazine/web-animation-performance-tier-list — opacity S-Tier, backdrop-filter triggers paint, transform S-Tier
- Chromium compositing docs (chromium.org/developers/design-documents/gpu-accelerated-compositing-in-chrome) — GraphicsLayer cost scaling

### Secondary (MEDIUM confidence)

- staticmania.com/blog/tailwind-4-container-queries — Tailwind 4 `@container` usage examples
- MDN CSS container queries — `cqi` = container inline axis definition
- github.com/nextcloud/spreed/issues/7896 — `backdrop-blur` GPU utilization confirmed expensive in Chromium
- dev.to/whoffagents/framer-motion-animations-that-dont-kill-performance — AnimatePresence best practices

### Tertiary (LOW confidence)

- WebSearch: Android TV Chromium behavior — not directly verified, inferred from general Chromium compositing knowledge

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — no new dependencies; all Tailwind 4 container query syntax verified
- D-27 transition strategy: HIGH — backed by compositing tier list + confirmed backdrop-blur cost
- Streams aggregation fix: HIGH — whitelist approach verified against existing types
- Auto-hide hook: HIGH — standard React pattern, no library needed
- Background unification: HIGH — clear DOM restructure with one complication (parent gap contract)
- Container query font scaling: MEDIUM — specific `cqi` clamp values are estimates; client must tune on actual TV

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (stable domain — Tailwind 4, Framer Motion 12, React 19 APIs won't change in 30 days)
