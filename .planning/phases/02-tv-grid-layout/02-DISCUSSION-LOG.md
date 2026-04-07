# Phase 2: TV Grid Layout - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-06
**Phase:** 02-tv-grid-layout
**Areas discussed:** Card content, Company view, Header & controls, Edge cases

---

## Card Content

| Option                   | Description                                 | Selected |
| ------------------------ | ------------------------------------------- | -------- |
| Metrics only             | Name, photo, key metrics — clean data-dense |          |
| Metrics + top tracks     | Key metrics plus top 3 tracks               |          |
| Current layout condensed | Fit as much as possible                     |          |

**User's choice:** Custom — Same info as today. Left half = 2×3 metric cards grid, Right half = Top 10 Spotify tracks list. Both fill 100% of container height.
**Notes:** The "100vh" is actually 100% of the container (viewport minus header), not the full viewport.

---

## Company View

| Option              | Description                         | Selected |
| ------------------- | ----------------------------------- | -------- |
| Company is the grid | Grid IS the company view            |          |
| Company page + grid | Separate company page and grid page |          |

**User's choice:** Custom — Left: company aggregate metrics. Right: performer cards (1/3 height each, max 3 visible). If >3 performers, carousel with pages of 3, auto-rotating. Rotation time splits evenly per page.
**Notes:** No Top 10 tracks on company view. Carousel logic is key — time-based page rotation.

---

## Header & Controls

| Option     | Description          | Selected |
| ---------- | -------------------- | -------- |
| Keep as-is | Same header content  | ✓        |
| Simplify   | Just name + rotation |          |
| You decide | Claude picks         |          |

**User's choice:** Keep as-is
**Notes:** No changes to header

---

## Edge Cases

| Option              | Description                           | Selected |
| ------------------- | ------------------------------------- | -------- |
| Same carousel logic | Paginate in groups, time split evenly | ✓        |
| No carousel         | Only show what fits                   |          |

**User's choice:** Same carousel logic for both performer and company views
**Notes:** Cards always 1/3 height regardless of count (1, 2, or 3). Empty space is fine for consistency.

---

## Claude's Discretion

- Transition animations between carousel pages
- Gap/padding sizing (viewport units)
- How to adapt existing PerformerPresentation component

## Deferred Ideas

None
