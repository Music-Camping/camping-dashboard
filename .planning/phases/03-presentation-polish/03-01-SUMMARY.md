---
phase: 03-presentation-polish
plan: "01"
subsystem: SSR data transform
tags: [spotify, streams, whitelist, bugfix]
dependency_graph:
  requires: []
  provides: [filtered-spotify-data]
  affects: [company-display streams aggregation, allTracks carousel]
tech_stack:
  added: []
  patterns: [Set-based whitelist filter, hasWhitelist guard]
key_files:
  created: []
  modified:
    - app/(dashboard)/page.tsx
key_decisions:
  - "Filter playlist keys at SSR boundary (page.tsx) not inside processSpotifyTracks — keeps the utility pure and the fix at the data contract boundary (D-19)"
  - "hasWhitelist guard: empty companies short-circuits to keep all keys — zero regression when API returns no company data"
  - "No trackId dedup — collaboration tracks count independently per performer (D-21)"
  - "No top-N truncation — all tracks in rankings, full plays.latest sum (D-20)"
metrics:
  duration: "5 min"
  completed: "2026-04-10"
  tasks: 1
  files: 1
---

# Phase 03 Plan 01: SSR Playlist Whitelist Filter Summary

Real-performer whitelist filter added to `app/(dashboard)/page.tsx` SSR transform — `rankingsByPerformer` and `allTracks` now contain only keys present in `data.company.companies[].performers`, excluding playlist entities that inflated the company Streams total to ~29M.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Add real-performer whitelist filter to SSR spotifyData transform | 86f2fd4 | app/(dashboard)/page.tsx |

## What Was Built

The SSR `DashboardPage` in `app/(dashboard)/page.tsx` previously called `Object.entries(spotifyTracksRaw)` without any filtering, iterating all keys returned by `getSpotifyTracksData()`. The backend `processSpotifyTracks` function intentionally flattens company → (performer|playlist) → tracks into a flat Record, so playlist keys (e.g., "Camping Playlist") appear alongside real performer keys.

The fix adds two things before the `spotifyData` assignment:

1. A `realPerformers` Set built from `data?.company?.companies?.flatMap((c: CompanyInfo) => c.performers) ?? []` — the same `CompanyInfo.performers` string array already used in `dashboard-client.tsx:90-92`.
2. A `hasWhitelist` boolean guard (`realPerformers.size > 0`) — if companies are unavailable (null data, API change, cold start), the guard short-circuits and all keys are kept, preserving pre-fix behavior.

Both `rankingsByPerformer` and `allTracks` chains receive a `.filter(([name]) => !hasWhitelist || realPerformers.has(name))` before the `.map()`/`.flatMap()` calls. This is the only change — inner sort, map, and field shapes are untouched.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npm run type-check` — passed (strict mode, zero errors)
- `npm run lint` — passed (2 pre-existing warnings in other files, 0 errors)
- `npm run build` — passed (16 pages generated)
- `grep -n "realPerformers"` confirms Set construction and both filter chains
- `grep -n "data?.company?.companies"` confirms correct access path (not `data?.companies`)

## Self-Check: PASSED

- [x] `app/(dashboard)/page.tsx` modified with whitelist filter
- [x] Commit 86f2fd4 exists
- [x] Both `rankingsByPerformer` and `allTracks` filtered
- [x] `hasWhitelist` guard present
- [x] Correct access path `data?.company?.companies`
