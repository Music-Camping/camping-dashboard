# Phase 1: Streams Fix - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove YouTube views from the total streams metric in both presentation mode views (single-performer and company aggregate). Update label to clarify the metric is Spotify-specific. YouTube views remain as a separate visible metric.

</domain>

<decisions>
## Implementation Decisions

### Metric Calculation

- **D-01:** Remove YouTube views from `totalStreams` — streams should only include Spotify track streams from rankings
- **D-02:** Remove YouTube views delta from `streamsDelta` — delta must be consistent with the total (Spotify-only)
- **D-03:** YouTube views remain visible as their own separate `views` metric — do not remove YouTube data, just stop adding it to streams

### Metric Labeling

- **D-04:** Change streams label from "Streams" to "Spotify Streams" in both `company-display.tsx` and `performer-presentation.tsx`

### Claude's Discretion

- Comment cleanup: Update the comment on `dashboard-client.tsx:237` that says "Spotify track streams + YouTube views" to reflect Spotify-only

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

### Affected Files

- `components/presentation-mode/company-display.tsx` — Lines 324-329 (aggregated streams adds YouTube views), Lines 408-409 (delta adds YouTube views)
- `components/dashboard/dashboard-client.tsx` — Lines 237-265 (`tvTotalStreams` useMemo adds YouTube views at lines 256-262)
- `components/presentation-mode/performer-presentation.tsx` — Lines 210 (label rendering, receives streams as prop)

</canonical_refs>

<code_context>

## Existing Code Insights

### Bug Locations (3 files, 3 fixes)

1. **`company-display.tsx:325-326`** — `totalStreams += data.youtube.views.latest` and `hasStreams = true` inside the YouTube block. Remove both lines.
2. **`company-display.tsx:409`** — `streamsDelta += getMetricDelta(data.youtube?.views, period) ?? 0`. Remove this line.
3. **`dashboard-client.tsx:255-262`** — Entire YouTube views block inside `tvTotalStreams` useMemo. Remove the block (lines 255-262).

### Label Locations (2 files)

1. **`company-display.tsx:469`** — `label="Streams"` → `label="Spotify Streams"`
2. **`performer-presentation.tsx:210`** — `label="Streams"` → `label="Spotify Streams"`

### Established Patterns

- Metrics use `MetricCard` component with `label`, `value`, `delta` props
- YouTube views already has its own separate `MetricCard` with `label="Views"` and YouTube icon
- Spotify icon is already associated with the streams metric card

### Integration Points

- `performer-presentation.tsx` receives `totalStreams` as a prop — no calculation logic to change there, just the label
- `dashboard-client.tsx` feeds `tvTotalStreams` to `PerformerPresentation` component

</code_context>

<specifics>
## Specific Ideas

No specific requirements — straightforward bug fix with clear line-level targets.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 01-streams-fix_
_Context gathered: 2026-04-02_
