# Requirements: Camping Dashboard

**Defined:** 2026-04-02
**Core Value:** Company stakeholders can view aggregated performer metrics on TV screens at a glance

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### TV Grid Layout

- [ ] **GRID-01**: Presentation mode uses a 2×3 CSS Grid filling 100vh (h-dvh), each card exactly 1/3 viewport height
- [ ] **GRID-02**: Grid layout works consistently across 1080p and 4K TV resolutions without JS resize listeners
- [ ] **GRID-03**: No content overflow or scroll on any TV resolution — grid container has overflow-hidden
- [ ] **GRID-04**: Text scales proportionally across TV sizes using clamp() with vw-based preferred values
- [ ] **GRID-05**: Metric labels meet minimum 24px equivalent readability at TV viewing distance

### Streams Metric

- [ ] **STRM-01**: Total streams count includes only Spotify streams, not YouTube views
- [ ] **STRM-02**: Streams metric label clarifies it represents Spotify streams only

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Scaling

- **SCALE-01**: Viewport-relative gaps and padding (gap-[1vh], p-[1vh]) replace fixed pixel values
- **SCALE-02**: Container query-based card internal spacing using cqw/cqh units
- **SCALE-03**: Staggered entry animations per card on grid mount

## Out of Scope

| Feature                               | Reason                                    |
| ------------------------------------- | ----------------------------------------- |
| Mobile/tablet responsive breakpoints  | Dashboard is for TV displays only         |
| JS-based resize listeners             | CSS-only approach per project constraints |
| Custom scroll containers inside cards | TVs have no scroll UI                     |
| Per-performer font size JS fitting    | Fragile, use CSS clamp() instead          |
| New platform integrations             | Current platforms sufficient              |
| TV overscan compensation margins      | Modern smart TVs don't need it            |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase   | Status  |
| ----------- | ------- | ------- |
| GRID-01     | Pending | Pending |
| GRID-02     | Pending | Pending |
| GRID-03     | Pending | Pending |
| GRID-04     | Pending | Pending |
| GRID-05     | Pending | Pending |
| STRM-01     | Pending | Pending |
| STRM-02     | Pending | Pending |

**Coverage:**

- v1 requirements: 7 total
- Mapped to phases: 0
- Unmapped: 7

---

_Requirements defined: 2026-04-02_
_Last updated: 2026-04-02 after initial definition_
