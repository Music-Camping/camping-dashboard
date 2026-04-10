# Phase 3: Presentation Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-10
**Phase:** 03-presentation-polish
**Areas discussed:** Auto-hide menu scope, Transition strategy, Playlist vs performer detection, Track dedup, Font scaling target, Background corner handling

---

## Auto-hide Menu Scope

| Option                            | Description                                                       | Selected |
| --------------------------------- | ----------------------------------------------------------------- | -------- |
| Presentation mode only            | Fade menu after 5s in fullscreen only; normal dashboard untouched | ✓        |
| Global (dashboard + presentation) | Hide menu everywhere after inactivity                             |          |

**User's choice:** Presentation mode only.
**Reappearance triggers:** mousemove OR click on any TV-box remote control button (keypress/click fallback for remote boxes that don't emit mousemove).

---

## Transition Strategy for TV Box

| Option                                             | Description                                    | Selected |
| -------------------------------------------------- | ---------------------------------------------- | -------- |
| (a) Fade instead of slide                          | Replace slide with simpler opacity fade        |          |
| (b) Slide + remove backdrop-blur during transition | Keep motion, remove GPU-heavy blur             |          |
| (c) CSS-only transform transition                  | Replace Framer Motion with pure CSS transition |          |
| (d) Claude's discretion                            | Claude investigates and picks                  | ✓        |

**User's choice:** "nao sei qual melhor estrategia pra tvbox" → deferred to Claude. Research should test approaches on target hardware (Android TV box, mid-range) and pick the smoothest.
**Notes:** Combined strategy allowed (e.g., fade + no blur + preload).

---

## Playlist vs Performer Detection

| Option                                    | Description                                   | Selected |
| ----------------------------------------- | --------------------------------------------- | -------- |
| (a) Whitelist via initialData keys        | Use `initialData` keys as source of truth     |          |
| (b) Whitelist via company.performers list | Use API's company→performer hierarchy         | ✓        |
| (c) Heuristic (prefix/pattern)            | Infer from key naming                         |          |
| (d) New backend field                     | Require backend to flag playlist vs performer |          |

**User's choice:** "o retorno da api, company ta acima de perforemer" — use the existing API hierarchy. `CompanyInfo.performers` (already typed) is the authoritative list of real performer names. Any other keys under a company in `spotifyTracksRaw` are playlists and excluded.
**Notes:** No backend changes needed; fix is pure frontend filter at data transformation layer.

---

## Track Dedup Across Performers

| Option                    | Description                                                                | Selected |
| ------------------------- | -------------------------------------------------------------------------- | -------- |
| (a) First occurrence wins | Drop duplicate trackIds after first                                        |          |
| (b) Sum across performers | Keep counting even if same trackId appears multiple times (collaborations) | ✓        |
| (c) Claude's discretion   |                                                                            |          |

**User's choice:** "b mantem contagem mesmo se tiver colaboracoes"
**Notes:** User's reasoning — collaborations are legitimately part of each performer's stream count, so the company total should reflect the real contribution regardless of overlap.

---

## Font Scaling Target

| Option                                               | Description                                    | Selected |
| ---------------------------------------------------- | ---------------------------------------------- | -------- |
| (a) Container queries with fixed per-element targets | Labels 1-2cqi, numbers 6-8cqi, etc.            |          |
| (b) Proportional reduction                           | Shrink globally without absolute pixel targets | ✓        |
| (c) Claude's discretion                              |                                                |          |

**User's choice:** "5 b"
**Notes:** User trusts Claude to pick the exact reduction amounts; the directive is "smaller overall" not "exactly Npx".

---

## Background Corner Handling

| Option                                                | Description               | Selected |
| ----------------------------------------------------- | ------------------------- | -------- |
| (a) Fullscreen bg, no rounded corners, cards float    | Edge-to-edge single image | ✓        |
| (b) Fullscreen bg + keep rounded-2xl on outer wrapper | Rounded outer shell       |          |
| (c) Claude's discretion                               |                           |          |

**User's choice:** "6 a"
**Notes:** Cards sit on top of the unified background; outer wrapper drops `rounded-2xl`.

---

## Claude's Discretion

- Transition strategy for TV box (D-27)
- Container query syntax specifics (`cqi` vs `cqh` vs named containers)
- Exact font reduction percentages
- Menu fade-out duration/easing for the auto-hide
- Whether to filter playlists in `app/(dashboard)/page.tsx` (at source) or in `company-display.tsx` (downstream) — recommendation is at source

## Deferred Ideas

None. Discussion stayed within phase scope.
