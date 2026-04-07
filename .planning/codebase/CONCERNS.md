# Codebase Concerns

**Analysis Date:** 2026-04-02

## Tech Debt

### 1. Missing Zod Validation for Spotify API Endpoints

**Issue:** Several API endpoints lack Zod schema validation despite having established patterns.

**Files:**

- `lib/api/dashboard-server.ts` (lines 272-297, 272-327, 332-357, 393-425)

**Impact:**

- Unvalidated JSON responses from `/api/spotify`, `/api/championships`, `/api/dashboard/songs`, and `/api/dashboard/spotify/tracks`
- Type safety only at runtime through TypeScript, no schema validation
- Silent failures or unexpected data shapes could crash components downstream
- Server-side cached responses lack validation, spreading bad data through the system

**Fix approach:**

1. Create Zod schemas for `SpotifyMetrics`, `ChampionshipsData`, `MusicCatalogData` in `lib/api/schemas.ts`
2. Add `validateData()` call in each fetch function with appropriate context
3. Update return types to explicitly reflect validated data or null
4. Add logging for validation failures matching existing pattern at line 124

**Current pattern** (working correctly):

```typescript
// getDashboardData() does this correctly
const rawData = await res.json();
return processCompanyAndPerformers(rawData as Record<string, unknown>);
// But this should use: validateData(rawData, DashboardResponseSchema, 'GET /api/dashboard')
```

---

### 2. DST (Daylight Saving Time) Not Handled in Timezone Conversion

**Issue:** Fixed UTC-3 offset doesn't account for Brazil's DST transitions (October-February).

**Files:**

- `lib/chart-data-transformer.ts` (lines 9-23)

**Impact:**

- Incorrect date keys during DST periods (October-February) when São Paulo is UTC-2
- Can cause data grouping errors and inconsistent aggregations
- Most critical during DST transitions when one day has entries from both UTC-2 and UTC-3

**Current code:**

```typescript
// Fixed offset — doesn't handle DST
const brasiliDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
```

**Fix approach:**

1. Install `date-fns-tz` (already in memory notes as recommendation)
2. Replace `getDateKeyInBrasilia()` with: `formatInTimeZone(date, 'America/Sao_Paulo', 'yyyy-MM-dd')`
3. Update comment to note DST is now handled
4. Test during DST transitions (October-February)

---

## Performance Bottlenecks

### 1. Nested Entry Aggregation in `aggregatePerformerInto()` Creates Large Arrays

**Issue:** Spreads all entries from each performer into company totals, potentially creating massive arrays.

**Files:**

- `lib/api/dashboard-server.ts` (lines 130-159, specifically line 155)

**Current code:**

```typescript
platformTarget[metricKey].entries.push(
  ...md.entries.map((e) => ({ ...e, performer: performerName })),
);
```

**Impact:**

- If 50 performers each have 1000+ daily entries, company totals aggregate to 50K+ entries
- Each entry is cloned with `{ ...e, performer: performerName }`, adding memory overhead
- When displayed in charts, all 50K entries are processed in `consolidateMultiPerformerData()` via filtering and grouping
- Next.js caches this for 3 hours (REVALIDATE_TIME = 10800), keeping bloated data in memory

**Observed symptom:** Large components like `multi-performer-chart.tsx` process full dataset even when displaying subset of performers

**Fix approach:**

1. **Lazy aggregation:** Don't aggregate all entries at fetch time; instead aggregate on-demand in `extractMultiPerformerData()`
2. **Trim older entries:** Only keep last N days of entries in company totals (e.g., 90 days)
3. **Profile impact:** Run `npm run analyze` to check bundle size and memory usage
4. **Alternative:** Store performer names in entries map instead of denormalized rows if memory is critical

---

### 2. `consolidateMultiPerformerData()` Reprocesses Same Data Across Renders

**Issue:** Creates new Map/grouping on every extraction, even for same source data.

**Files:**

- `lib/chart-data-transformer.ts` (lines 50-99)
- Used by `extractMultiPerformerData()` (line 156) and `extractMultiPerformerPlaylistData()` (line 218)

**Impact:**

- Components calling `extractMultiPerformerData()` in render pass through this function
- No memoization of consolidated result
- Creates new arrays and objects on every render

**Fix approach:**

1. Add `useMemo()` wrapper in components that call `extractMultiPerformerData()` (e.g., `dashboard-client.tsx`)
2. Or: Move consolidation to server-side transformation to avoid runtime processing
3. Verify dependencies in `useMemo` are minimal (data, metricPath, period)

---

## Data Validation Gaps

### 1. Unvalidated SpotifyMetrics Shape

**Issue:** `getSpotifyData()` returns raw JSON without Zod validation.

**Files:**

- `lib/api/dashboard-server.ts` (line 293)
- Used by `spotify-hub.tsx` (line ~40) assuming `rankingsByPerformer`, `allTracks` exist

**Risk:**

- If API returns missing `rankingsByPerformer`, components crash with "Cannot read property 'map' of undefined"
- No logging of what shape actually arrived

**Fix approach:**

1. Create `SpotifyMetricsSchema` in `lib/api/schemas.ts`
2. Validate in `getSpotifyData()` before returning
3. Update `spotify-hub.tsx` to handle null case explicitly

---

### 2. No Validation for `getChampionshipsData()` and `getMusicCatalogData()`

**Issue:** Both return empty arrays on error without validation of successful responses.

**Files:**

- `lib/api/dashboard-server.ts` (lines 301-327, 332-357)

**Impact:**

- Silently accept malformed data structures
- Downstream components assume data shape without protection
- Hard to debug why data display is broken

**Fix approach:**

1. Add schemas: `ChampionshipsSchema` and `MusicCatalogSchema`
2. Validate all responses before returning
3. Return empty array only on actual error, not silently accept bad data

---

## Fragile Areas

### 1. Performer Name Extraction via `.pop()` Without Null Check

**Issue:** Extracts performer name from split string without fallback validation.

**Files:**

- `components/dashboard/multi-performer-chart.tsx` (line 128)
- `components/presentation-mode/company-display.tsx` (similar pattern)

**Current code:**

```typescript
const performerName = entry.name.includes(".")
  ? (entry.name.split(".").pop() ?? entry.name) // Safe: has fallback
  : entry.name;
```

**Status:** Actually safe with fallback, but pattern is fragile if data shape changes.

**Risk:** If chart data structure changes from `"performers.name"` format, extraction breaks silently.

**Fix approach:**

1. Document expected chart data format in a constant/comment
2. Add stricter validation of expected format
3. Consider using `last(entry.name.split('.'))` utility if repeating pattern

---

### 2. Missing Null Checks in `getMetricDelta()` (Two Implementations)

**Issue:** Same function duplicated in two files without consistent null handling.

**Files:**

- `lib/chart-data-transformer.ts` — Used by company display
- `components/dashboard/dashboard-client.tsx` (lines 32-66) — Used by main dashboard
- `components/presentation-mode/company-display.tsx` (lines 81-120) — Used by presenter

**Impact:**

- Three copies of same logic → maintenance burden
- If one is fixed, others might not be
- Each has slightly different threshold logic (thresholdMs calculations)

**Fix approach:**

1. Move single `getMetricDelta()` to `lib/chart-data-transformer.ts`
2. Export and use everywhere
3. Update all callers to import single version
4. Add tests for edge cases: empty entries, future dates, etc.

---

### 3. File Aggregation Lacks Type Safety

**Issue:** Performer files merged without checking structure or name conflicts.

**Files:**

- `lib/api/dashboard-server.ts` (lines 202-204, 215-217)

**Current code:**

```typescript
if (performer.files && typeof performer.files === "object") {
  transformedData.files = performer.files; // Direct assignment
}
```

**Risk:**

- If multiple performers have same file key (e.g., both have "logo"), last one wins silently
- No type checking that files object matches `PerformerFiles` interface
- Company files merge without collision detection

**Fix approach:**

1. Add logging when file keys conflict
2. Use namespaced keys if needed: `"performer_name.logo"` format
3. Validate against `PerformerFilesSchema` before assignment

---

## Security Considerations

### 1. Bearer Token Exposure in Error Logs

**Issue:** Authorization headers visible in potential error logs.

**Files:**

- `lib/api/dashboard-server.ts` (multiple `fetch()` calls with `Authorization` header)
- `lib/auth/actions.ts` (line 16)

**Current code:**

```typescript
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
}
```

**Risk:**

- If fetch fails with detailed error logging, token could be captured
- Network error logs might include request headers

**Mitigation in place:**

- Generic error logging (`"API error"` at line 256)
- No request introspection in catch blocks

**Recommended addition:**

1. Strip sensitive headers from error context before logging
2. Log only endpoint and status code, not full request
3. Add comment: `// Never log Authorization header`

---

### 2. Client-Side Presentation Mode Event Listener

**Issue:** Custom event `"start-presentation"` dispatched without validation.

**Files:**

- `components/dashboard/dashboard-client.tsx` (lines 110-119)

**Current code:**

```typescript
window.addEventListener("start-presentation", handleStartPresentation);
```

**Risk:**

- Any script on page can trigger presentation mode
- Low risk in single-tenant app, but not production-hardened
- No origin verification

**Fix approach:**

1. Add comment explaining this is internal navigation only
2. Consider using React context instead of window events (more type-safe)
3. If keeping events: validate source using `event.source` checking if available

---

## Testing Coverage Gaps

### 1. No Tests for Data Transformation Pipeline

**Issue:** `lib/chart-data-transformer.ts` and `lib/api/dashboard-server.ts` have no test coverage.

**Files:**

- `lib/chart-data-transformer.ts` (especially `consolidateMultiPerformerData()` at lines 50-99)
- `lib/api/dashboard-server.ts` (transformation functions at lines 71-106)

**Missing test scenarios:**

- Empty performer list → empty output
- Single performer with multiple dates
- Duplicate datetime entries → latest wins
- DST boundary crossing (October/February)
- Malformed entry objects

**Impact:**

- Regressions in data grouping go undetected
- Chart data corruption reported by users after changes
- No regression protection during refactoring

**Fix approach:**

1. Add vitest/jest setup (currently using `npm run build` and `npm run lint` for validation)
2. Create `lib/chart-data-transformer.test.ts` with edge cases
3. Create `lib/api/dashboard-server.test.ts` for aggregation logic
4. Add pre-commit hook: `npm run test` before allowing commits

---

### 2. No Validation Tests for Zod Schemas

**Issue:** Schemas exist but aren't tested for correct rejection of invalid data.

**Files:**

- `lib/api/schemas.ts` (schemas defined but untested)

**Risk:**

- Schema changes could silently break validation
- Invalid data might pass when it shouldn't
- Can't verify error message clarity

**Fix approach:**

1. Create `lib/api/schemas.test.ts`
2. Test each schema with:
   - Valid data → passes
   - Missing required fields → fails
   - Wrong types → fails
   - Extra fields → accepted or rejected as intended

---

### 3. No End-to-End Tests for Multi-Performer Charts

**Issue:** Complex components like `multi-performer-chart.tsx` untested.

**Files:**

- `components/dashboard/multi-performer-chart.tsx`
- `components/presentation-mode/company-display.tsx`

**Risks:**

- Color assignment changes silently break branding
- Performer filtering logic regresses
- Tooltip rendering bugs unfound until user reports

**Fix approach:**

1. Add Playwright E2E tests for presentation mode
2. Test performer rotation, filtering, color consistency
3. Test with realistic data volumes (50+ performers)

---

## Dependencies at Risk

### 1. Next.js 16 Stability

**Issue:** Using bleeding-edge Next.js 16.1.1 with React 19.2.3.

**Files:**

- `package.json` (line 34-38)

**Risk:**

- Minor version updates could introduce breaking changes
- Less community maturity than LTS versions
- Edge Runtime features may change

**Mitigation:**

- Memory note indicates active development
- Type-checking via `npm run type-check` catches most issues
- Branch `feat/presentation-mode-redesign` indicates active feature development

**Recommendation:**

1. Pin to `16.1.1` explicitly if not already
2. Test each minor upgrade before deploying
3. Monitor Next.js releases and React Canary updates

---

### 2. recharts Library Performance with Large Datasets

**Issue:** Multiple chart components use recharts without performance optimization.

**Files:**

- `components/dashboard/multi-performer-chart.tsx` (renders 50+ line series)
- `components/dashboard/metrics-chart.tsx`

**Risk:**

- recharts re-renders entire chart on data update
- 50 performers × 365 days = 18,250 points per chart
- Multiple charts on page = hundreds of thousands of data points

**Current mitigation:**

- `useMemo()` on data extraction (should verify all components do this)
- `period` filter reduces data points

**Fix approach:**

1. Profile with React DevTools Profiler on dashboard with many performers
2. If slow: implement virtual scrolling for chart legend
3. Consider alternative: canvas-based charts (visx, nivo) if performance critical
4. Document performance limits (e.g., "Dashboard tested with up to 30 performers")

---

## Scaling Limits

### 1. Company Data Aggregation Not Bounded

**Issue:** `processCompanyAndPerformers()` aggregates unlimited entries from unlimited performers.

**Files:**

- `lib/api/dashboard-server.ts` (lines 161-232)

**Current behavior:**

- 50 performers × 1000+ entries = 50K+ aggregated entries
- Cached for 3 hours in Next.js ISR
- Sent to client for every request during cache period

**Scaling limits:**

- At 200 performers: 200K+ entries
- Memory footprint grows with each revalidate cycle
- Client-side processing becomes unusable above 50 performers

**Path forward:**

1. Add company-level entry limit: keep only last 90-180 days
2. Implement server-side filtering before aggregation
3. Add metric: log aggregated entry count per company on fetch
4. Document supported performer count in README (e.g., "Tested with up to 30 performers")

---

### 2. ISR Cache Invalidation Strategy Missing

**Issue:** 3-hour revalidate interval is fixed; no on-demand cache busting.

**Files:**

- `lib/api/dashboard-server.ts` (line 27: `REVALIDATE_TIME = 10800`)

**Impact:**

- Data can be stale by up to 3 hours
- No way to refresh data without waiting
- Backend updates not immediately visible

**Fix approach:**

1. Add on-demand revalidation endpoint (Next.js `revalidateTag`)
2. Webhook from backend to trigger cache invalidation
3. Or: Reduce REVALIDATE_TIME to 30min for more freshness
4. Document cache strategy in comments

---

## Missing Critical Features

### 1. Error Boundary for Presentation Mode

**Issue:** No error boundary wraps presentation mode components.

**Files:**

- `components/dashboard/dashboard-client.tsx` (lines 160-200+ where presentation components render)
- `components/presentation-mode/company-display.tsx`
- `components/presentation-mode/performer-presentation.tsx`

**Risk:**

- Single rendering error crashes entire presentation mode
- Presenter can't recover without page reload
- No fallback UI for live presentation

**Fix approach:**

1. Create `ErrorBoundary` component wrapping presentation components
2. Add recovery button: "Return to Dashboard"
3. Log error with context for debugging

---

### 2. No Loading Skeleton for Presentation Mode

**Issue:** Presentation starts immediately without content loaded.

**Files:**

- `components/presentation-mode/company-display.tsx` (no loading state check visible)

**Risk:**

- Blank screen during data load
- Presenter can't tell if app is working
- Data might not arrive before rotation starts

**Fix approach:**

1. Add loading state check in `DashboardClient`
2. Show presentation skeleton with company name, placeholder cards
3. Only start rotation after data fully loaded

---

## Summary by Priority

**Critical (Security/Data Loss):**

- Bearer token exposure in error logs (mitigation in place)
- Missing Zod validation for Spotify endpoints

**High (Production Impact):**

- DST timezone not handled (data grouping errors during DST)
- Missing null checks for `getMetricDelta()` (three implementations)
- Entry aggregation unbounded (scaling limit above 100 performers)

**Medium (Tech Debt/Maintenance):**

- Nested aggregation performance (50K+ entries per company)
- Missing test coverage for data transformation
- Duplicate `getMetricDelta()` implementations
- File aggregation lacks collision detection

**Low (Enhancement/Polish):**

- Error boundary for presentation mode
- Loading skeleton for presentation mode
- On-demand cache invalidation
- Recharts performance with 50+ series

---

_Concerns audit: 2026-04-02_
