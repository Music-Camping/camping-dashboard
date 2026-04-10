# Phase 3: Presentation Polish - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Polish the presentation mode (TV fullscreen) to fix visible problems reported by the client:

1. **Font scaling** — text is too large on the client TV, despite Phase 2's `clamp()` approach; needs container-aware proportional reduction
2. **Streams aggregation bug** — company-view "Spotify Streams" card shows ~29M, an inflated number caused by counting playlist tracks instead of real performer tracks
3. **Company card order** — currently diverges from performer order (D-04); must match exactly
4. **Background rendering** — two separate `BannerBackground` instances cause visible split; must be single edge-to-edge behind both halves
5. **Navigation menu UX** — stays visible at all times; should auto-hide after 5s inactivity (presentation mode only)
6. **Platform icons per metric** — hardcoded; must be derived from which platforms actually contributed to the displayed value
7. **Transition smoothness on TV box** — entity transitions stutter on low-end Android TV hardware

Out of scope: new platforms, new metrics, new card types, layout structure changes (D-01 through D-17 from Phase 2 remain).

</domain>

<decisions>
## Implementation Decisions

### Font Scaling (D-18)

- **D-18:** Use container queries with a **proportional reduction** approach — reduce the global scale of text elements in presentation mode without pinning absolute targets per element. The goal is "smaller than today" across the board, not "exactly Npx for labels and Mpx for numbers". Claude may use `cqi`/`cqh` units and may lower the existing `clamp()` ceilings/floors uniformly. No JS resize listeners.

### Streams Aggregation (D-19, D-20, D-21)

- **D-19:** Source of truth for "real performers" is the API hierarchy: **company is above performer** in the backend response. Use `currentCompany.performers: string[]` (already in `CompanyInfo` type) as the whitelist. Any key under a company in `spotifyTracksRaw` that is NOT in `currentCompany.performers` is a playlist and must be excluded from stream totals.
- **D-20:** For each real performer, sum `track.plays.latest` across ALL tracks in that performer's `tracks` array. No top-N truncation — all tracks contribute.
- **D-21:** If the same `trackId` appears under multiple performers (collaborations), **keep the sum** — count each performer's streams independently. Rationale: a collaboration is legitimately counted in both performers' totals; the company total reflects real contribution regardless of overlap.

### Company Card Order (D-22)

- **D-22:** Company-view metric cards must render in this exact order, matching Phase 2's D-04: **(1) Spotify Streams → (2) Ouvintes Mensais → (3) Vídeos → (4) Views → (5) Seguidores → (6) Top Cidades**. The current order in `company-display.tsx:473-522` is different (Streams → Vídeos → Views → Seguidores → Ouvintes → Cidades) and must be reordered.

### Background Unification (D-23)

- **D-23:** Render a single `BannerBackground` behind both left and right halves of `company-display.tsx`. The background must be **edge-to-edge fullscreen** — no rounded corners on the outer wrapper. Cards float on top of the unified background. The current two-instance pattern (`company-display.tsx:471` and `:572`) must be restructured into a parent wrapper with a single background layer and transparent child containers.

### Auto-Hide Menu (D-24, D-25)

- **D-24:** Auto-hide behavior applies **only in presentation (fullscreen) mode** — the normal dashboard keeps its menu always visible. After 5 seconds of no `mousemove` events, the floating controls / navigation menu fades out.
- **D-25:** Reappearance triggers: `mousemove` event OR a click on any TV-box remote control button. The TV box case matters because remote boxes usually don't generate mousemove — keypress/click events are the fallback.

### Dynamic Platform Icons (D-26)

- **D-26:** Each `MetricCard` in both `company-display.tsx` and `performer-presentation.tsx` must derive its `icons` array from **which platforms actually contributed data to that card's value**, not from hardcoded lists. The aggregation `useMemo` must track per-metric contribution (e.g., `followersPlatforms: { spotify: bool, youtube: bool, instagram: bool }`) and the JSX must map that to the icons array.

### Transition Smoothness (Claude's Discretion — see below)

- **D-27:** Claude has discretion to investigate and choose the best approach to smooth out entity transitions on low-end Android TV box hardware. Options to evaluate during research/planning: fade instead of slide, remove `backdrop-blur` during transition, replace Framer Motion with CSS-only `transition: transform`, banner image preload. The user explicitly deferred this choice ("não sei qual melhor estratégia pra tvbox").

### Claude's Discretion

- **Transition strategy for TV box** (D-27): research which of fade / no-blur / CSS-only / preload has the best perceived smoothness on mid-range Android TV hardware. Measure against existing Framer Motion `mode="sync"` baseline. Pick one and document rationale in the plan.
- **Container query syntax specifics**: whether to use `cqi`, `cqh`, or named containers. Claude picks.
- **Exact reduction percentages** for font scaling — target is "smaller overall," no absolute pixel targets.
- **Menu fade-out animation** — duration/easing for the 5s auto-hide is up to Claude.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Code (primary impact surface)

- `components/presentation-mode/company-display.tsx` — lines 311-384 aggregation useMemo (streams fix + per-metric platform tracking); lines 467-568 render block (card order + background unification); lines 460-465 static icon setup (replace with per-metric)
- `components/presentation-mode/performer-presentation.tsx` — lines 217-290 card rendering (dynamic icon fix); lines 226-233 hardcoded Spotify+YouTube+TikTok on streams card (should be Spotify-only)
- `components/dashboard/dashboard-client.tsx` — lines 237-256 `tvTotalStreams` useMemo; lines 444-497 `AnimatePresence` transition wrapper (smoothness target)
- `app/(dashboard)/page.tsx` — lines 22-55 SSR `spotifyData` construction; currently iterates ALL `Object.entries(spotifyTracksRaw)` without filtering to real performers
- `lib/api/dashboard-server.ts` — lines 359-388 `processSpotifyTracks`; comment at line 362 explicitly documents `{ "<Company>": { "<PlaylistOrPerformer>": { "tracks": [...] } } }` hierarchy
- `lib/types/dashboard.ts` — `CompanyInfo.performers: string[]` (whitelist source for D-19)
- `lib/types/spotify.ts` — `PerformerRanking.rankings[]` shape
- `components/dashboard/metric-card.tsx` (or wherever `MetricCard` is defined) — the `icons` prop contract

### Prior Phase Context (must carry forward)

- `.planning/phases/02-tv-grid-layout/02-CONTEXT.md` — D-04 card order (performer); D-17 overflow-hidden; D-16 clamp() typography (this phase extends clamp to container queries)
- `.planning/phases/01-streams-fix/01-CONTEXT.md` — Spotify-only streams principle (carried forward and reinforced with playlist exclusion)
- `.planning/phases/02-tv-grid-layout/02-01-PLAN.md` — `h-dvh` grid shell (unchanged, this phase works inside it)

### Project-Level

- `.planning/PROJECT.md` — TV display constraint, no JS resize listeners
- `.planning/REQUIREMENTS.md` — TV-responsive presentation, streams accuracy

### Research (Phase 2 — still relevant)

- `.planning/research/STACK.md` — CSS Grid, clamp(), container queries techniques
- `.planning/research/PITFALLS.md` — grid blowout, Framer Motion conflicts (relevant for D-27 transition work)

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `BannerBackground` helper in `company-display.tsx:243` — already extracted, just needs to be lifted one level up and rendered once
- Aggregation `useMemo` pattern in `company-display.tsx:311` — add per-metric platform tracking without rewriting
- `CompanyInfo.performers` list — whitelist is already typed and passed as prop, zero new data plumbing needed
- Framer Motion `AnimatePresence` in `dashboard-client.tsx:444` — can be replaced or re-tuned; `mode="sync"` already in place

### Established Patterns

- `clamp()` typography via inline style strings (Phase 2 pattern) — container queries will add to this, not replace
- `useMemo` with explicit dependency arrays for derived aggregation data
- Fragment return pattern in `CompanyDisplay` (Phase 2 D-16) — making the single-background refactor requires moving to a wrapper div + two transparent children

### Integration Points

- `processSpotifyTracks` output is consumed in `app/(dashboard)/page.tsx:27` where `rankingsByPerformer` is built. The playlist filter can happen there (filter keys by `companies[].performers`) OR downstream in `company-display.tsx` aggregation. Phase should pick one — preference: at source in `page.tsx` to keep the data contract clean.
- Menu auto-hide needs a hook (`useIdleTimer` or similar) wired to the presentation-mode container; the menu component must accept a `visible` prop or CSS class.

</code_context>

<specifics>
## Specific Ideas

- **"as fontes ficaram gigantes"** — client reports fonts too big on actual TV despite Phase 2's clamp()-based scaling. Client photo confirms labels and numbers both oversized.
- **"as streams de spotify ainda estao somando com as views de youtube"** — user's initial framing. Investigation revealed the real bug is different: it's not a literal Views-into-Streams sum (Phase 1 fixed that), it's playlist-track inclusion inflating the total. Company view shows 29M streams for "Camping" company, which is not mathematically explained by real performer data.
- **"nao some nada de playlist a streams"** — zero playlist tracks in the streams total (D-19).
- **"deveria somar de cada performer, cada performer deveria somar de todas as musicas disponiveis so o latest"** — explicit aggregation formula (D-20).
- **"o bg tbm ta errado na apresentacao, ficou usando duas imagens"** — background bug confirmed by second client photo.
- **"na troca de entidade no modo apresentacao ta ficando um pouco travado no tv box"** — TV box is a low-power Android TV device, not desktop Chrome.
- **Client photo reference:** `~/Downloads/WhatsApp Image 2026-04-10 at 11.57.27.jpeg` (company view, 29M streams, 33M views, double background visible) and `~/Downloads/WhatsApp Image 2026-04-10 at 11.57.28.jpeg` (performer view, correct 271K streams).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. Scope creep was avoided (user stayed focused on presentation mode polish, no suggestions to add new features).

</deferred>

---

_Phase: 03-presentation-polish_
_Context gathered: 2026-04-10_
