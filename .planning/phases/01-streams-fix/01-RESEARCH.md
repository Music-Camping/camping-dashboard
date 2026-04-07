# Phase 1: Streams Fix - Research

**Researched:** 2026-04-02
**Domain:** React component data flow — metric calculation and display labels
**Confidence:** HIGH

## Summary

This phase is a surgical bug fix across three files. The root cause is that YouTube views were
added to both the `totalStreams` aggregate and `streamsDelta` aggregate in two separate
rendering paths: the company-aggregate view (`company-display.tsx`) and the per-performer
view (`dashboard-client.tsx` feeding `performer-presentation.tsx`).

The fix is purely additive-removal: delete the lines that add YouTube data to streams
variables, and rename two labels. No new abstractions, no schema changes, no API changes.
YouTube views data is preserved and rendered separately in its own `MetricCard` with
`label="Views"` — the only change is that YouTube views stop contributing to the streams sum.

There is one discovery beyond what CONTEXT.md documented: `dashboard-client.tsx:492` passes
`streamsDelta={tvViewsDelta}` to `PerformerPresentation`. This wires the streams delta to
YouTube views delta. After the fix removes YouTube from the streams total, this prop must also
be corrected. The current code has no separate Spotify-only streams delta computed for the
performer path. The plan must include creating or deriving a Spotify-only `tvStreamsDelta`.

**Primary recommendation:** Make all five targeted edits in sequence; verify with
`npm run type-check && npm run lint && npm run build` after each file.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Remove YouTube views from `totalStreams` — streams should only include Spotify
  track streams from rankings
- **D-02:** Remove YouTube views delta from `streamsDelta` — delta must be consistent with
  the total (Spotify-only)
- **D-03:** YouTube views remain visible as their own separate `views` metric — do not remove
  YouTube data, just stop adding it to streams
- **D-04:** Change streams label from "Streams" to "Spotify Streams" in both
  `company-display.tsx` and `performer-presentation.tsx`

### Claude's Discretion

- Comment cleanup: Update the comment on `dashboard-client.tsx:237` that says
  "Spotify track streams + YouTube views" to reflect Spotify-only

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID      | Description                                                          | Research Support                                                                             |
| ------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| STRM-01 | Total streams count includes only Spotify streams, not YouTube views | Three removal targets identified in code; see Bug Locations below                            |
| STRM-02 | Streams metric label clarifies it represents Spotify streams only    | Two label targets identified: `company-display.tsx:469` and `performer-presentation.tsx:210` |

</phase_requirements>

---

## Standard Stack

No new libraries required. All changes are within existing React/TypeScript patterns.

| Library         | Version | Purpose                            | Why Standard                                          |
| --------------- | ------- | ---------------------------------- | ----------------------------------------------------- |
| React (useMemo) | 19.2.3  | Memoized metric calculation        | Already used for all metric computations in this file |
| TypeScript      | 5       | Type safety for new delta variable | Strict mode enforced project-wide                     |

**Installation:** None required.

---

## Architecture Patterns

### Data Flow for Metric Totals

The project uses two separate rendering paths for the TV presentation view:

**Path A — Company aggregate view** (`company-display.tsx`)

```
performers[]
  → useMemo (lines 280–350): builds `aggregated` object with totalStreams
  → useMemo (lines 398–425): builds `deltas` object with streamsDelta
  → JSX renders <MetricCard label="Streams" value={aggregated.streams} delta={deltas.streams} />
```

**Path B — Per-performer view** (`dashboard-client.tsx` → `performer-presentation.tsx`)

```
spotifyData.rankingsByPerformer
  → useMemo (lines 238–265): builds `tvTotalStreams`
  → useMemo (lines 321–328): builds `tvViewsDelta` (YouTube-only, used as streamsDelta)
  → JSX (line 482–503): <PerformerPresentation totalStreams={tvTotalStreams} streamsDelta={tvViewsDelta} />
```

Both paths must be fixed independently.

### Pattern: Removing Lines vs Restructuring

Given the narrow scope of this fix, the correct pattern is **line removal + new variable**, not
refactoring. The existing `useMemo` hooks keep their structure; only the YouTube additions are
deleted and a missing Spotify-streams delta is added.

### Anti-Patterns to Avoid

- **Do not zero-out YouTube views** — D-03 says YouTube views remain visible in their own
  MetricCard. Only the streaming into streams totals is removed.
- **Do not change the MetricCard icons** — the Spotify icon is already on the streams card;
  the YouTube icon is there conditionally. After this fix, the YouTube icon on the streams
  card in `company-display.tsx:473` (`icons={[spotifyIcon, youtubeIcon]}`) becomes
  misleading since views no longer contribute to streams. The CONTEXT.md does not address
  this — treat as out of scope unless the planner notes it.

---

## Don't Hand-Roll

| Problem                    | Don't Build             | Use Instead                                       | Why                                                                                     |
| -------------------------- | ----------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Spotify-only streams delta | Custom delta calculator | Pattern already established in `getMetricDelta()` | Rankings-based streams have no `MetricEntry[]` shape; derive from useMemo over rankings |

**Key insight:** Spotify track rankings do not carry a `MetricEntry` with historical entries —
they only carry a current `streams` number. There is no `getMetricDelta()` call possible for
the Spotify streams total in the performer path. The delta either stays `undefined` or must be
derived from comparing rankings across time periods (which is a larger scope change). For this
fix, the safe approach per D-02 is: remove YouTube from `streamsDelta`, meaning the performer
path `streamsDelta` prop becomes `undefined` (no delta shown). This is honest — we have no
Spotify-only delta data in the current data model.

---

## Detailed Bug Locations

### Bug 1: `company-display.tsx` — Streams total (lines 324–328)

```typescript
// BEFORE (lines 324-328)
if (data.youtube.views?.latest) {
  totalViews += data.youtube.views.latest;
  totalStreams += data.youtube.views.latest; // <-- REMOVE this line
  hasViews = true;
  hasStreams = true; // <-- REMOVE this line
}
```

```typescript
// AFTER
if (data.youtube.views?.latest) {
  totalViews += data.youtube.views.latest;
  hasViews = true;
}
```

Note: `hasStreams` stays `true` only when Spotify rankings contribute. If a performer has no
Spotify data, streams will correctly be `undefined` and the streams MetricCard won't render.

### Bug 2: `company-display.tsx` — Streams delta (line 409)

```typescript
// BEFORE (deltas useMemo, lines 408-409)
viewsDelta += getMetricDelta(data.youtube?.views, period) ?? 0;
streamsDelta += getMetricDelta(data.youtube?.views, period) ?? 0; // <-- REMOVE
```

```typescript
// AFTER
viewsDelta += getMetricDelta(data.youtube?.views, period) ?? 0;
// streamsDelta line removed — streams delta is Spotify-only
// NOTE: There is no per-period delta source for Spotify rankings in company-display.tsx.
// After removal, streamsDelta will be 0, which maps to `undefined` via `streamsDelta || undefined`.
// This is correct — no streams delta is shown rather than a wrong delta.
```

### Bug 3: `dashboard-client.tsx` — Streams total (lines 255–262)

```typescript
// BEFORE (tvTotalStreams useMemo, lines 255-262)
// YouTube views
const ytViews = presentation.currentPerformer
  ? initialData?.[presentation.currentPerformer]?.youtube?.views?.latest
  : undefined;
if (ytViews) {
  total += ytViews;
  hasData = true;
}
```

```typescript
// AFTER — entire YouTube views block removed
// tvTotalStreams now contains only Spotify ranking streams
```

### Fix 4: `dashboard-client.tsx` — Streams delta for performer path (line 492)

This is a discovery not explicitly enumerated in CONTEXT.md but required by D-02.

```typescript
// BEFORE (JSX, line 492)
streamsDelta = { tvViewsDelta };
```

```typescript
// AFTER
streamsDelta = { undefined };
```

There is no Spotify-only streams delta computable from current data. Passing `undefined`
removes the delta badge rather than showing a YouTube-sourced delta — consistent with D-02.

### Label 1: `company-display.tsx` — line 469

```tsx
// BEFORE
label = "Streams";

// AFTER
label = "Spotify Streams";
```

### Label 2: `performer-presentation.tsx` — line 210

```tsx
// BEFORE
label = "Streams";

// AFTER
label = "Spotify Streams";
```

### Comment: `dashboard-client.tsx` — line 237

```typescript
// BEFORE
// Total streams (Spotify track streams + YouTube views)

// AFTER
// Total streams (Spotify track streams only)
```

---

## Common Pitfalls

### Pitfall 1: `hasStreams = true` orphan inside YouTube block

**What goes wrong:** If only `totalStreams += ...` is removed but `hasStreams = true` is left
inside the YouTube block in `company-display.tsx`, then a performer with YouTube data but no
Spotify data will still show a streams MetricCard — with value 0.

**Why it happens:** `hasStreams` is the gate for rendering the MetricCard at all. It must only
be set from the Spotify block above.

**How to avoid:** Remove both lines 326 (`totalStreams += ...`) and 328 (`hasStreams = true`)
from the YouTube block. The Spotify block (line 296) already sets `hasStreams = true`.

**Warning signs:** If a performer with no Spotify data shows a "Spotify Streams: 0" card.

### Pitfall 2: Stale `streamsDelta` showing 0 instead of `undefined`

**What goes wrong:** In `company-display.tsx`, after removing the YouTube delta line, the
`streamsDelta` variable starts at 0 and stays 0 for all performers (no Spotify rankings delta
source). The return is `streamsDelta || undefined`. Zero is falsy, so this correctly returns
`undefined` — no delta badge shown. This is the desired behavior. No code change needed to
the return statement.

**Why it matters:** Do not add a Spotify rankings delta calculation here. That would be
out-of-scope and risks data errors without clear data availability.

### Pitfall 3: `streamsDelta={tvViewsDelta}` in JSX not updated

**What goes wrong:** Even after removing YouTube from `tvTotalStreams`, the performer
presentation will still show a YouTube-derived streams delta if `streamsDelta={tvViewsDelta}`
is left unchanged at line 492 of `dashboard-client.tsx`.

**How to avoid:** Change `streamsDelta={tvViewsDelta}` to `streamsDelta={undefined}`.

---

## Runtime State Inventory

Step 2.5: SKIPPED — This is not a rename/refactor/migration phase.

---

## Environment Availability

Step 2.6: SKIPPED — This phase has no external tool dependencies. All changes are TypeScript
source edits validated by the project's existing build pipeline (`npm run type-check`,
`npm run lint`, `npm run build`).

---

## Validation Architecture

### Test Framework

| Property           | Value                                                 |
| ------------------ | ----------------------------------------------------- |
| Framework          | None (no Jest/Vitest configured)                      |
| Config file        | None                                                  |
| Quick run command  | `npm run type-check`                                  |
| Full suite command | `npm run type-check && npm run lint && npm run build` |

### Phase Requirements → Test Map

| Req ID  | Behavior                                         | Test Type | Automated Command    | File Exists? |
| ------- | ------------------------------------------------ | --------- | -------------------- | ------------ |
| STRM-01 | YouTube views not included in streams total      | manual    | `npm run type-check` | N/A          |
| STRM-02 | Streams MetricCard shows "Spotify Streams" label | manual    | `npm run build`      | N/A          |

Manual verification: start dev server, activate presentation mode, confirm streams card shows
"Spotify Streams" and the value no longer includes YouTube view counts.

### Sampling Rate

- **Per file edit:** `npm run type-check`
- **After all edits:** `npm run type-check && npm run lint && npm run build`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

None — no test infrastructure additions needed. Existing build pipeline covers type safety.
This phase's correctness is verified manually in the browser.

---

## State of the Art

No library changes or API changes. This section is not applicable — all patterns in use are
current project conventions.

---

## Open Questions

1. **YouTube icon on company streams MetricCard**
   - What we know: `company-display.tsx:473` passes `icons={[spotifyIcon, youtubeIcon]}` to
     the streams MetricCard. After this fix, YouTube no longer contributes to streams.
   - What's unclear: Should the YouTube icon be removed from the streams card to avoid
     misleading UI?
   - Recommendation: CONTEXT.md and requirements are silent on this. Treat as out of scope
     for this phase. If desired, it's a one-line change to `icons={[spotifyIcon]}`. Planner
     may add as optional sub-task under Claude's discretion.

2. **Spotify-only streams delta for company path**
   - What we know: After the fix, `streamsDelta` in `company-display.tsx` will be 0
     (no Spotify delta source exists), which maps to `undefined` in the return, so no delta
     badge is shown.
   - What's unclear: Is showing no delta acceptable to stakeholders?
   - Recommendation: Per D-02, delta must be consistent with the total. No delta is more
     honest than a YouTube-sourced delta. Accept `undefined` for now.

---

## Sources

### Primary (HIGH confidence)

- Direct code inspection of:
  - `components/presentation-mode/company-display.tsx` (lines 280–480)
  - `components/dashboard/dashboard-client.tsx` (lines 237–503)
  - `components/presentation-mode/performer-presentation.tsx` (lines 1–230)
  - `.planning/phases/01-streams-fix/01-CONTEXT.md`
  - `CLAUDE.md` (project constraints, conventions, validation workflow)

All findings are from the live codebase, not from training data or external sources.

---

## Metadata

**Confidence breakdown:**

- Bug locations: HIGH — verified by direct code read at exact line numbers
- Fix approach: HIGH — pattern established by surrounding code; line-removal is the minimal correct change
- Label locations: HIGH — verified by direct code read
- Undocumented `streamsDelta={tvViewsDelta}` issue: HIGH — confirmed at line 492

**Research date:** 2026-04-02
**Valid until:** Until any of the three affected files are modified outside this phase
