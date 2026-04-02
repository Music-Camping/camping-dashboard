# Camping Dashboard

## What This Is

A multi-platform metrics dashboard for music companies that aggregates social media data (Spotify, YouTube, Instagram) across performers. Features a presentation mode designed for TV displays with auto-rotation, fullscreen support, and company-level metric aggregation. Built with Next.js 16, React 19, Tailwind CSS 4, and shadcn/ui.

## Core Value

Company stakeholders can view aggregated performer metrics on TV screens at a glance — clear, proportional, always-on display.

## Requirements

### Validated

- ✓ Multi-platform metrics aggregation (Spotify, YouTube, Instagram) — existing
- ✓ Company-level metric aggregation across performers — existing
- ✓ Presentation mode with auto-rotation and fullscreen — existing
- ✓ Performer cards with social metrics (followers, streams, views) — existing
- ✓ Spotify top tracks/rankings display — existing
- ✓ City-level performance data with deduplication — existing
- ✓ Company branding (banner + profile images) — existing
- ✓ Zod-validated API data flow with type safety — existing
- ✓ Chart visualizations (multi-performer, growth trends) — existing
- ✓ Music catalog browsing — existing

### Active

- [ ] TV-responsive presentation mode: 2x3 grid filling 100vh, each card 1/3 height, proportional scaling across all TV sizes
- [ ] Streams metric fix: Remove YouTube views from total streams count, use Spotify streams only

### Out of Scope

- Mobile/tablet responsiveness — dashboard is for TV displays
- New platform integrations — current platforms sufficient
- User authentication changes — existing auth flow works
- New data visualizations — charts are complete

## Context

- **Deployment target**: TV screens of mixed sizes (32" to 65"+, 1080p and 4K)
- **Presentation mode**: 2 columns × 3 rows grid with up to 6 cards
- **Current issue**: Grid doesn't maintain 100vh with equal row heights across TV resolutions
- **Streams bug**: `company-display.tsx` lines 326 and 409 add YouTube views to Spotify streams total
- **Tech stack**: Next.js 16, React 19, Tailwind CSS 4, Framer Motion, Recharts, shadcn/ui
- **Existing codebase map**: `.planning/codebase/` (7 documents)

## Constraints

- **Tech stack**: Next.js 16 + Tailwind CSS 4 — established, no changes
- **CSS approach**: Pure CSS/Tailwind for TV scaling (no JS resize listeners) — CSS Grid with viewport units
- **API contract**: Backend response format is fixed — changes are frontend-only
- **Browser**: Modern Chromium on smart TVs / casting devices

## Key Decisions

| Decision                     | Rationale                                                            | Outcome   |
| ---------------------------- | -------------------------------------------------------------------- | --------- |
| CSS Grid 100vh for TV layout | Proportional scaling without JS, works across resolutions            | — Pending |
| Spotify-only streams         | YouTube views are a separate metric, shouldn't inflate stream counts | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-04-02 after initialization_
