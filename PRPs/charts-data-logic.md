## Goal

**Feature Goal**: Fix three interrelated bugs in the chart data pipeline so that (1) charts display the **last snapshot value per time-bucket** instead of summing all snapshots; (2) the growth badge on metric cards reflects the **active period filter** instead of always comparing today vs yesterday; and (3) dashboard data auto-refreshes every 10 minutes via SWR.

**Deliverable**: Corrected implementations in four primary files (`hooks/use-chart-data.ts`, `lib/utils.ts`, `lib/hooks/dashboard.ts`, `components/dashboard/metric-card.tsx`) plus cascading updates to the section components that thread `period` through the prop chain, and minor formatting fixes in `MetricsChart` / `ChartTooltip` for the `today` time-based X-axis labels.

**Success Definition**:

- Charts show: for `today` — each individual recorded snapshot in the last 24h (one point per recording); for `7d`/`30d` — last snapshot per calendar day — never a sum.
- Growth badge shows `latest − value_at_period_start` for whichever period is active.
- Dashboard data silently re-fetches every 10 minutes (SWR `refreshInterval: 600000`).
- `pnpm tsc --noEmit` and `pnpm lint` return zero errors after all changes.

---

## User Persona

**Target User**: Music industry professionals monitoring artist metrics on a dashboard (normal browser + TV presentation mode).

**Use Case**: Watching subscriber/follower counts evolve over a selected time window and understanding real growth within that window.

**Pain Points Addressed**:

- Charts showed inflated values because all intra-day snapshots were being summed instead of picking the last snapshot of each time bucket.
- Growth badge always showed day-over-day change regardless of whether 7d or 30d filter was selected — misleading for trend analysis.
- Stale data after long browser sessions since no automatic refresh was configured.

---

## Why

- **Data correctness**: Followers/subscribers are cumulative counters. Summing three snapshots taken throughout the day is mathematically wrong.
- **UX consistency**: The period filter pill in the header implies charts AND growth indicators reflect the same window.
- **Freshness**: Without `refreshInterval`, SSR-cached data served to a long-open tab never updates on the client side.

---

## What

### User-visible Behavior

- **today filter** — Chart: take the latest recorded timestamp in the dataset as the anchor, compute `threshold = anchor − 24h`, filter to entries within that window, group by exact datetime (summing performers), sort ascending, and show the **last 9 points** (slice the tail). X-axis labels show time (e.g., "09:30"). Growth badge: latest snapshot vs oldest snapshot in the 24h window.
- **7d filter** — Chart: up to 7 daily points, last snapshot per day per performer (summed). Growth badge: latest vs snapshot from 7 days ago.
- **30d filter** — Chart: up to 30 daily points. Growth badge: latest vs snapshot from 30 days ago.
- MetricCard always shows `metricData.latest` for the current value; only the badge changes.
- Dashboard data auto-refreshes in the background every 10 minutes.

### Success Criteria

- [ ] `useChartData` returns LAST value per bucket (not sum) for all three periods.
- [ ] `today` filter: threshold = `max(entry.datetime) − 24h`; yields at most 8 points (last 8 from the 24h window), one per unique recording datetime.
- [ ] `7d` / `30d` filters yield daily points (`YYYY-MM-DD` keys, last value per performer per day).
- [ ] `calculateGrowth(entries, period)` computes growth relative to the period start.
- [ ] `MetricCard` and `MetricCardWithBreakdown` receive and forward `period` prop.
- [ ] X-axis in `MetricsChart` shows `HH:mm` time labels when data keys are full datetime strings (today filter).
- [ ] `useDashboard` SWR config includes `refreshInterval: 600000`.
- [ ] Zero TypeScript / ESLint errors.

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ YES — all file paths, exact current code, data model, and desired logic are documented below.

### Documentation & References

```yaml
# CODEBASE FILES — read before modifying

- file: hooks/use-chart-data.ts
  why: Primary file to fix. Contains the sum-based grouping that must become last-value-per-bucket.
  pattern: |
    Current broken line:
      byDate.set(dateKey, (byDate.get(dateKey) || 0) + entry.value)  // ← SUM, wrong
    Required:
      'today'  → bucket key = full datetime string (entry.datetime). For each unique recording
                 moment, keep only the last entry per performer, then sum performers.
                 This gives one chart point per recorded snapshot in the last 24h.
      '7d'/'30d' → bucket key = date part only (entry.datetime.split('T')[0]).
                 Keep only the last entry per performer per calendar day, then sum performers.
  gotcha: |
    'today' anchor = max(entry.datetime) across ALL entries (not new Date()).
    threshold = anchor - 24h. This is more accurate because data may be hours old.
    Because the threshold depends on the data, 'today' CANNOT use the static getDateThreshold()
    helper for its threshold — compute it inline BEFORE filtering inside useChartData.
    After filtering + grouping + sorting, slice the last 9 points: points.slice(-9).
    Current bug: now.setHours(0,0,0,0) — remove this approach entirely for 'today'.
    Bucket key for 'today': full datetime string from entry.datetime (e.g., "2026-02-23T09:15:00").
    Bucket key for 7d/30d: date part only "YYYY-MM-DD".
    The presence of ':' after 'T' in the key is how MetricsChart/ChartTooltip
    detect a time-based (today) point vs a date-only (7d/30d) point.

- file: lib/utils.ts
  why: calculateGrowth must accept period and pick the reference value accordingly.
  pattern: |
    Current signature: calculateGrowth(entries: MetricEntry[])
    New signature:     calculateGrowth(entries: MetricEntry[], period: PeriodFilter = '7d')
    Reference logic:
      1. Build daily aggregated values (last value per performer per day, then sum performers)
      2. today  → reference = oldest daily aggregate within last 24 h
      3. 7d     → reference = daily aggregate closest to (now - 7d), searching backwards
      4. 30d    → reference = daily aggregate closest to (now - 30d), searching backwards
  gotcha: |
    Entries may have multiple performers each with multiple timestamps per day.
    MUST first get "last value per performer per day" then SUM them — same logic as use-chart-data.ts.
    If no reference date found (insufficient history), return {absolute:0, percent:0}.

- file: lib/hooks/dashboard.ts
  why: Add SWR auto-refresh every 10 minutes.
  pattern: |
    Add to useSWR options: refreshInterval: 600000
  gotcha: |
    dashboard-client.tsx currently uses server-side 'initialData' prop rather than useDashboard().
    Adding refreshInterval is still correct: useDashboard() is the hook for client-side usage
    (e.g., presentation mode needing fresh data) and the feature doc explicitly requires this change.

- file: components/dashboard/metric-card.tsx
  why: Must pass period to calculateGrowth so growth badge reflects active filter.
  pattern: |
    Add period: PeriodFilter to MetricCardProps interface.
    Pass period as second arg to calculateGrowth(entries, period).
  gotcha: |
    Callers are in youtube-section.tsx and instagram-section.tsx — both must be updated too.
    Default to '7d' if period is omitted to avoid breaking callers that haven't been updated yet.

- file: components/dashboard/metric-card-breakdown.tsx
  why: Same bug as metric-card.tsx — calculateGrowth(entries) ignores period.
  pattern: Same as metric-card.tsx — add period prop, pass to calculateGrowth.
  gotcha: Not mentioned in feature doc but has identical bug. Fix for consistency.

- file: components/dashboard/social-platforms/youtube-section.tsx
  why: Needs to accept and forward period prop to MetricCard / MetricCardWithBreakdown.
  pattern: Add period: PeriodFilter to YouTubeSectionProps. Pass to every MetricCard/MetricCardWithBreakdown call.

- file: components/dashboard/social-platforms/instagram-section.tsx
  why: Same as youtube-section.tsx.
  pattern: Same change.

- file: components/dashboard/dashboard-client.tsx
  why: Has period from useFilters(). Must forward it to YouTubeSection and InstagramSection.
  pattern: |
    Already: const { selectedPerformers, period } = filters;
    Add period to YouTubeSection and InstagramSection JSX props.

- file: components/dashboard/metrics-chart.tsx
  why: X-axis tickFormatter currently always uses "dd MMM" format. For 'today' filter,
       date keys are "YYYY-MM-DDTHH" and should display as "09h" etc.
  pattern: |
    tickFormatter={(value) => {
      if (value.includes('T')) {
        // today filter — show window start hour
        const hour = value.split('T')[1];
        return `${hour}h`;
      }
      return format(parseISO(value), "dd MMM", { locale: ptBR });
    }}
  gotcha: xAxisTicks (first+last) will still work since we just detect 'T' in the key.

- file: components/dashboard/chart-tooltip.tsx
  why: Tooltip label is the date key. For 'today', it will be "YYYY-MM-DDTHH".
       Should show time range like "09h – 12h" rather than a malformed date string.
  pattern: |
    const isTimeLabel = (label as string).includes('T');
    const formattedLabel = isTimeLabel
      ? (() => {
          const hour = parseInt((label as string).split('T')[1]);
          return `${String(hour).padStart(2,'0')}h – ${String(hour + 3).padStart(2,'0')}h`;
        })()
      : format(parseISO(label as string), "dd MMM yy", { locale: ptBR });
  gotcha: parseISO("YYYY-MM-DDTHH") works but the result would be "23 fev 26" — misleading for today.

- docfile: PRPs/ai_docs/recharts-date-fns.md
  why: Reference for existing Recharts + date-fns patterns in this codebase.
  section: Custom Tooltip Component, XAxis tickFormatter

- file: lib/types/dashboard.ts
  why: MetricEntry, MetricData, DashboardResponse, ChartDataPoint type definitions.
  pattern: |
    MetricEntry = { value: number; datetime: string; performer?: string; }
    MetricData  = { latest: number; entries: MetricEntry[]; }
    ChartDataPoint = { date: string; value: number; previousValue?: number; }
    DashboardResponse = { [performerName: string]: PerformerData; }
    — 'total' key contains aggregated entries with performer field.
    — individual performer keys have entries WITHOUT performer field.

- file: lib/types/filters.ts
  why: PeriodFilter type = "today" | "7d" | "30d". Import from here.
  pattern: import type { PeriodFilter } from "@/lib/types/filters";
```

### Current Codebase Tree (relevant files)

```bash
.
├── app
│   └── (dashboard)
│       └── page.tsx                     # Server-side fetch, passes initialData to DashboardClient
├── components
│   ├── dashboard
│   │   ├── chart-tooltip.tsx            # MODIFY — handle time-based labels for 'today'
│   │   ├── dashboard-client.tsx         # MODIFY — pass period to YouTubeSection, InstagramSection
│   │   ├── metric-card.tsx              # MODIFY — add period prop, pass to calculateGrowth
│   │   ├── metric-card-breakdown.tsx    # MODIFY — same as metric-card.tsx
│   │   ├── metrics-chart.tsx            # MODIFY — time-aware X-axis formatter
│   │   └── social-platforms
│   │       ├── instagram-section.tsx    # MODIFY — add period prop, forward to cards
│   │       └── youtube-section.tsx      # MODIFY — add period prop, forward to cards
├── hooks
│   └── use-chart-data.ts                # MODIFY — fix to last-value-per-bucket
├── lib
│   ├── api
│   │   └── dashboard-server.ts          # DO NOT MODIFY — server-side 3h cache unchanged
│   ├── hooks
│   │   └── dashboard.ts                 # MODIFY — add refreshInterval: 600000
│   ├── types
│   │   ├── dashboard.ts                 # DO NOT MODIFY — types already correct
│   │   └── filters.ts                   # DO NOT MODIFY — PeriodFilter already defined
│   └── utils.ts                         # MODIFY — add period param to calculateGrowth
```

### Desired Codebase Tree (no new files — all changes are modifications)

Same tree as above. No new files needed.

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Data structure
// data.total[platform][metric].entries contains ALL performers' snapshots.
// Each entry has a `performer` field when accessed via the 'total' key.
// Individual performer keys (data['ArtistName']) do NOT have performer field.
// useChartData always reads from data.total, so entries always have performer field.

// CRITICAL: Snapshot data semantics
// values are CUMULATIVE COUNTERS (followers/subscribers), not events.
// Correct: take LAST snapshot per performer per bucket, then SUM performers.
// Wrong (current): sum ALL snapshots regardless of timestamp order.

// CRITICAL: 'today' period means LAST 24 HOURS, not "since midnight".
// Current bug: getDateThreshold uses now.setHours(0,0,0,0) for 'today'.
// Fix: return new Date(now.getTime() - 24 * 60 * 60 * 1000);

// CRITICAL: Bucket key format
// today  → full datetime string from entry.datetime, e.g. "2026-02-23T09:15:00"
//          (each unique recording moment = one chart point)
// 7d/30d → "2026-02-23"  (date only, one point per calendar day)
// Detection in MetricsChart/ChartTooltip: check if key contains ':' after the 'T',
// which distinguishes a full datetime from a date-only string.

// CRITICAL: calculateGrowth reference-finding algorithm
// 1. Build sorted daily aggregates (Map<dateStr, number>) same logic as above but by DAY always.
// 2. For 'today': reference = value of the oldest date within last 24h of sorted aggregates.
// 3. For '7d':  reference = value of date closest to (today - 7 days).
//    — Iterate sorted dates from oldest to newest, find last date <= threshold7d.
// 4. For '30d': same but threshold = today - 30 days.
// Edge case: if no reference date found, return { absolute: 0, percent: 0 }.

// GOTCHA: parseISO("2026-02-23T09:15:00") works fine.
// For 'today', the tooltip should show the time ("09:15"), not the date ("23 fev 26").
// Detection: check if the key has a time component (contains ':' after the 'T').
// Use format(parseISO(label), "HH:mm") for today points, "dd MMM yy" for date-only points.

// GOTCHA: MetricsChart shows only first + last ticks on X-axis.
// For 'today' with 8 points: first="00h", last="21h" — correct and readable.

// GOTCHA: calculateGrowth is also called in metric-card-breakdown.tsx (line 34).
// Feature doc only mentions metric-card.tsx, but breakdown has the same bug.
// Fix both to avoid inconsistency between the two card variants.

// GOTCHA: 'use client' is already on all modified component files — no new directives needed.

// GOTCHA: PeriodFilter import path
// import type { PeriodFilter } from "@/lib/types/filters";  // CORRECT

// GOTCHA: date-fns locale import
// import { ptBR } from 'date-fns/locale';  // CORRECT for v3+
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// No new types needed. Existing types are sufficient.

// ChartDataPoint.date field usage:
//   today  → "2026-02-23T09"  (window start, 2-digit hour, no colon)
//   7d/30d → "2026-02-23"     (ISO date)

// calculateGrowth new signature:
export function calculateGrowth(
  entries: MetricEntry[],
  period: PeriodFilter = "7d",
): { absolute: number; percent: number };

// MetricCard new props:
interface MetricCardProps {
  title: string;
  value: number;
  entries: MetricEntry[];
  period: PeriodFilter; // NEW — required
  icon?: React.ReactNode;
  className?: string;
}

// MetricCardWithBreakdown new props:
interface MetricCardWithBreakdownProps {
  title: string;
  totalValue: number;
  entries: MetricEntry[];
  breakdown: PerformerBreakdown[];
  period: PeriodFilter; // NEW — required
  icon?: React.ReactNode;
  className?: string;
}

// YouTubeSectionProps new prop:
interface YouTubeSectionProps {
  data?: PlatformMetrics;
  fullDashboardData?: DashboardResponse;
  chartData: Array<{ date: string; value: number }>;
  period: PeriodFilter; // NEW
  tvMode?: boolean;
}

// InstagramSectionProps new prop:
interface InstagramSectionProps {
  data?: PlatformMetrics;
  fullDashboardData?: DashboardResponse;
  chartData: Array<{ date: string; value: number }>;
  period: PeriodFilter; // NEW
  tvMode?: boolean;
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: MODIFY hooks/use-chart-data.ts
  - REWORK: 'today' threshold logic — must be data-driven, not clock-based:
    // Compute anchor from entries (max datetime), NOT new Date()
    const latestDatetime = entries.reduce(
      (max, e) => (e.datetime > max ? e.datetime : max),
      entries[0].datetime,
    );
    const anchorMs = new Date(latestDatetime).getTime();
    const threshold24h = new Date(anchorMs - 24 * 60 * 60 * 1000);
    // For 7d/30d: keep using getDateThreshold() as-is (clock-based is fine for multi-day)
    const threshold = period === 'today' ? threshold24h : getDateThreshold(period);
  - FIX: getDateThreshold — remove the 'today' case entirely (it is now handled inline above).
    Keep 'default' fallback or remove the 'today' switch branch.
  - ADD: getBucketKey(datetime: string, period: PeriodFilter): string helper
    - 'today':    return datetime           // full datetime string = one point per recording
    - '7d'/'30d': return datetime.split('T')[0]  // date only
  - REPLACE: the "group by date and sum" block with "last-value-per-performer-per-bucket then sum":
    // Step 1: bucketKey → performer → {value, datetime} — keep latest datetime only
    const bucketPerformer = new Map<string, Map<string, {value: number; datetime: string}>>();
    periodFiltered.forEach(entry => {
      const bucketKey = getBucketKey(entry.datetime, period);
      const performer = entry.performer ?? '__single__';
      if (!bucketPerformer.has(bucketKey)) bucketPerformer.set(bucketKey, new Map());
      const pm = bucketPerformer.get(bucketKey)!;
      const existing = pm.get(performer);
      if (!existing || entry.datetime > existing.datetime) {
        pm.set(performer, { value: entry.value, datetime: entry.datetime });
      }
    });
    // Step 2: sum performer last-values per bucket
    const byBucket = new Map<string, number>();
    bucketPerformer.forEach((performerMap, bucketKey) => {
      let total = 0;
      performerMap.forEach(({ value }) => { total += value; });
      byBucket.set(bucketKey, total);
    });
  - KEEP: sort ascending, build ChartDataPoint[] with previousValue as-is.
  - ADD: after building points[], for 'today' slice to last 8: `period === 'today' ? points.slice(-9) : points`
  - NOTE: ISO 8601 strings sort correctly as plain strings (lexicographic = chronological).
  - NAMING: rename variable 'byDate' → 'byBucket' throughout for clarity.
  - FOLLOW: existing hook structure — useMemo, same return type ChartDataPoint[].

Task 2: MODIFY lib/utils.ts — period-aware calculateGrowth
  - CHANGE: function signature to accept period: PeriodFilter = '7d'
  - ADD: import type { PeriodFilter } from "@/lib/types/filters"; at top of file
  - IMPLEMENT: buildDailyAggregates(entries: MetricEntry[]): Map<string, number>
    (inline helper within calculateGrowth — NOT exported)
    - Same as Task 1 Step 1/2 but always by calendar day (not 3-hour windows)
    - Group by day, per performer take latest entry, sum performers per day
  - IMPLEMENT: reference finding logic
    const now = new Date();
    const nowStr = now.toISOString().split('T')[0];
    const sortedDates = [...dailyAggregates.keys()].sort();
    // latest = last date's aggregate value
    const latestDate = sortedDates[sortedDates.length - 1];
    const latestValue = dailyAggregates.get(latestDate) ?? 0;
    // reference = value at start of period
    let referenceDate: string | undefined;
    if (period === 'today') {
      // oldest date within last 24h
      const threshold24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const thresh = threshold24h.toISOString().split('T')[0];
      referenceDate = sortedDates.find(d => d >= thresh);
    } else {
      const daysBack = period === '7d' ? 7 : 30;
      const threshold = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      const threshStr = threshold.toISOString().split('T')[0];
      // find last date that is <= threshold (i.e., at or before period start)
      for (let i = sortedDates.length - 1; i >= 0; i--) {
        if (sortedDates[i] <= threshStr) { referenceDate = sortedDates[i]; break; }
      }
      // fallback: use oldest available date
      if (!referenceDate) referenceDate = sortedDates[0];
    }
    if (!referenceDate || referenceDate === latestDate) return { absolute: 0, percent: 0 };
    const referenceValue = dailyAggregates.get(referenceDate) ?? 0;
    const absolute = latestValue - referenceValue;
    const percent = referenceValue === 0 ? 0 : (absolute / referenceValue) * 100;
    return { absolute, percent };
  - REMOVE: old implementation (byDate map, sortedDates[0], sortedDates[1] logic).
  - KEEP: all other functions (cn, formatNumber, formatCompactNumber) unchanged.
  - FOLLOW: existing code style — no try/catch, keep it functional.

Task 3: MODIFY lib/hooks/dashboard.ts
  - ADD: refreshInterval: 600000 to the SWR options object
  - KEEP: revalidateOnFocus: false, revalidateOnReconnect: false, dedupingInterval: 60000
  - RESULT:
    useSWR("/api/proxy/api/dashboard", fetcher, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      refreshInterval: 600000,    // ← ADD THIS LINE
    });

Task 4: MODIFY components/dashboard/metric-card.tsx
  - ADD: period: PeriodFilter to MetricCardProps (required field)
  - ADD: import type { PeriodFilter } from "@/lib/types/filters";
  - CHANGE: calculateGrowth(entries) → calculateGrowth(entries, period)
  - KEEP: all JSX and styling unchanged.

Task 5: MODIFY components/dashboard/metric-card-breakdown.tsx
  - ADD: period: PeriodFilter to MetricCardWithBreakdownProps (required field)
  - ADD: import type { PeriodFilter } from "@/lib/types/filters";
  - CHANGE: calculateGrowth(entries) → calculateGrowth(entries, period)
  - KEEP: all JSX and styling unchanged.

Task 6: MODIFY components/dashboard/social-platforms/youtube-section.tsx
  - ADD: period: PeriodFilter to YouTubeSectionProps
  - ADD: import type { PeriodFilter } from "@/lib/types/filters";
  - PASS: period={period} to every <MetricCard> and <MetricCardWithBreakdown> in this file.
  - KEEP: all other props and JSX unchanged.

Task 7: MODIFY components/dashboard/social-platforms/instagram-section.tsx
  - Same changes as Task 6 but for InstagramSection.

Task 8: MODIFY components/dashboard/dashboard-client.tsx
  - PASS: period={period} to <YouTubeSection> (both normal and the normal layout call)
  - PASS: period={period} to <InstagramSection>
  - period is already destructured from filters on line 38: const { selectedPerformers, period } = filters;
  - FIND: YouTubeSection usage at line ~553 and InstagramSection at line ~562.
  - KEEP: all other props unchanged. No new imports needed.

Task 9: MODIFY components/dashboard/metrics-chart.tsx
  - FIND: the XAxis tickFormatter callback (line ~144)
  - CHANGE: detect if the date key is a full datetime (contains ':' after 'T') → show time
    tickFormatter={(value) => {
      // Full datetime key (today filter) — e.g. "2026-02-23T09:15:00"
      if (value.includes('T') && value.includes(':')) {
        return format(parseISO(value), "HH:mm");
      }
      // Date-only key (7d/30d filter) — e.g. "2026-02-23"
      return format(parseISO(value), "dd MMM", { locale: ptBR });
    }}
  - KEEP: xAxisTicks (first + last), all other chart props and styling unchanged.

Task 10: MODIFY components/dashboard/chart-tooltip.tsx
  - FIND: the date formatting line using format(parseISO(label), "dd MMM yy", ...)
  - CHANGE: detect full datetime vs date-only and format accordingly
    const labelStr = label as string;
    const isDateTime = labelStr.includes('T') && labelStr.includes(':');
    const formattedDate = isDateTime
      ? format(parseISO(labelStr), "HH:mm", { locale: ptBR })
      : format(parseISO(labelStr), "dd MMM yy", { locale: ptBR });
    // replace the inline format() call in JSX with {formattedDate}
  - KEEP: value display, change percentage, all styling unchanged.
```

### Implementation Patterns & Key Details

```typescript
// ─── hooks/use-chart-data.ts — complete new grouping block ─────────────────

function getBucketKey(datetime: string, period: PeriodFilter): string {
  if (period === "today") {
    return datetime; // full datetime = one point per recording moment
  }
  return datetime.split("T")[0]; // date only for 7d/30d
}

// Inside useChartData useMemo, REPLACE threshold computation for 'today':
// --- old (broken) ---
// const threshold = getDateThreshold(period);  // used midnight for 'today'
// --- new ---
let threshold: Date;
if (period === "today") {
  // anchor on the latest recorded timestamp, not on wall-clock time
  const latestDatetime = entries.reduce(
    (max, e) => (e.datetime > max ? e.datetime : max),
    entries[0]?.datetime ?? "",
  );
  threshold = new Date(
    new Date(latestDatetime).getTime() - 24 * 60 * 60 * 1000,
  );
} else {
  threshold = getDateThreshold(period);
}

// Inside useChartData, replace the byDate block:
// Step 1 — last value per (bucket, performer)
const bucketPerformer = new Map<
  string,
  Map<string, { value: number; datetime: string }>
>();
periodFiltered.forEach((entry) => {
  const bucketKey = getBucketKey(entry.datetime, period);
  const performer = entry.performer ?? "__single__";
  if (!bucketPerformer.has(bucketKey))
    bucketPerformer.set(bucketKey, new Map());
  const pm = bucketPerformer.get(bucketKey)!;
  const existing = pm.get(performer);
  if (!existing || entry.datetime > existing.datetime) {
    pm.set(performer, { value: entry.value, datetime: entry.datetime });
  }
});

// Step 2 — sum per bucket
const byBucket = new Map<string, number>();
bucketPerformer.forEach((performerMap, bucketKey) => {
  let total = 0;
  performerMap.forEach(({ value }) => {
    total += value;
  });
  byBucket.set(bucketKey, total);
});

// Step 3 — sort and build ChartDataPoint[] (unchanged logic, just rename byDate → byBucket)
const sortedBuckets = Array.from(byBucket.entries()).sort(([a], [b]) =>
  a.localeCompare(b),
);
const points: ChartDataPoint[] = sortedBuckets.map(
  ([date, value], index, arr) => ({
    date,
    value,
    previousValue: index > 0 ? arr[index - 1][1] : undefined,
  }),
);

// ─── lib/utils.ts — new calculateGrowth ────────────────────────────────────

export function calculateGrowth(
  entries: MetricEntry[],
  period: PeriodFilter = "7d",
): { absolute: number; percent: number } {
  if (entries.length === 0) return { absolute: 0, percent: 0 };

  // Build daily aggregates: date → sum of last-values per performer
  const dailyPerformer = new Map<
    string,
    Map<string, { value: number; datetime: string }>
  >();
  entries.forEach((entry) => {
    const dateKey = entry.datetime.split("T")[0];
    const performer = entry.performer ?? "__single__";
    if (!dailyPerformer.has(dateKey)) dailyPerformer.set(dateKey, new Map());
    const pm = dailyPerformer.get(dateKey)!;
    const existing = pm.get(performer);
    if (!existing || entry.datetime > existing.datetime) {
      pm.set(performer, { value: entry.value, datetime: entry.datetime });
    }
  });

  const dailyAggregates = new Map<string, number>();
  dailyPerformer.forEach((performerMap, dateKey) => {
    let total = 0;
    performerMap.forEach(({ value }) => {
      total += value;
    });
    dailyAggregates.set(dateKey, total);
  });

  if (dailyAggregates.size < 2) return { absolute: 0, percent: 0 };

  const sortedDates = [...dailyAggregates.keys()].sort();
  const latestValue =
    dailyAggregates.get(sortedDates[sortedDates.length - 1]) ?? 0;

  const now = new Date();
  let referenceDate: string | undefined;

  if (period === "today") {
    const thresh24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    referenceDate = sortedDates.find((d) => d >= thresh24h);
  } else {
    const daysBack = period === "7d" ? 7 : 30;
    const threshStr = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    // last date at or before threshold
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      if (sortedDates[i] <= threshStr) {
        referenceDate = sortedDates[i];
        break;
      }
    }
    if (!referenceDate) referenceDate = sortedDates[0]; // fallback: oldest available
  }

  const latestDate = sortedDates[sortedDates.length - 1];
  if (!referenceDate || referenceDate === latestDate)
    return { absolute: 0, percent: 0 };

  const referenceValue = dailyAggregates.get(referenceDate) ?? 0;
  const absolute = latestValue - referenceValue;
  const percent = referenceValue === 0 ? 0 : (absolute / referenceValue) * 100;

  return { absolute, percent };
}
```

### Integration Points

```yaml
PERIOD_FLOW:
  - Source: useFilters() in dashboard-client.tsx (already destructured as `period`)
  - Flow: dashboard-client → YouTubeSection/InstagramSection → MetricCard/MetricCardWithBreakdown → calculateGrowth
  - No new context needed; period already exists in FilterState.

CHART_DATE_KEY:
  - today:   "2026-02-23T09"  → MetricsChart XAxis shows "09h",  tooltip shows "09h – 12h"
  - 7d/30d:  "2026-02-23"     → MetricsChart XAxis shows "23 fev", tooltip shows "23 fev 26"
  - Detection: label.includes('T') is the branch predicate in both MetricsChart and ChartTooltip.

SWR_REFRESH:
  - useDashboard() in lib/hooks/dashboard.ts: add refreshInterval: 600000 (10 min)
  - Server-side cache (lib/api/dashboard-server.ts) remains at 3h via Next.js fetch cache.
  - These two caches are independent; the SWR refresh updates client-side data.

NO_NEW_FILES:
  - All changes are modifications to existing files.
  - No new types, no new components, no new hooks.
```

---

## Validation Loop

### Level 1: Syntax & Style (run after each file)

```bash
# Run after every file modification
pnpm tsc --noEmit          # Zero TypeScript errors expected
pnpm lint                  # Zero ESLint errors expected

# Quick check for import consistency
grep -n "calculateGrowth" components/dashboard/metric-card.tsx
grep -n "calculateGrowth" components/dashboard/metric-card-breakdown.tsx
grep -n "period" components/dashboard/social-platforms/youtube-section.tsx
grep -n "period" components/dashboard/social-platforms/instagram-section.tsx
```

### Level 2: Logic Validation (manual unit-test scenarios)

```typescript
// Test calculateGrowth with period:
// Scenario: entries spanning 10 days, latest = 5000 followers
// 7d period → reference = value 7 days ago = 4500 → growth = +500 (+11.1%)
// 30d period → reference = value 30 days ago = 3000 → growth = +2000 (+66.7%)
// today period → reference = oldest entry in last 24h

// Test useChartData with 'today' period:
// Input: 10 entries for performer A recorded over last 28h
//   — anchor = max(entry.datetime), threshold = anchor - 24h
//   — entries within 24h window: say 12 entries
//   — after sort + slice(-9): returns last 8 of the 9 entries
// Input: 3 entries for performers A and B at identical datetime "2026-02-23T09:15:00"
//   — bucket "2026-02-23T09:15:00": A.value + B.value summed into one point
//   — returns 1 point (not 2)

// Test useChartData with '7d' period:
// Input: 3 entries same day (performer A at 08:00, 14:00, 22:00)
// Expected: 1 point for that day with value from 22:00 entry (latest).
// NOT sum of all 3.
```

### Level 3: Integration Testing (visual)

```bash
# Start dev server
pnpm dev

# Manual checks at http://localhost:3000:
# 1. Switch to 'Hoje' filter → chart should show ≤9 points with hour labels (e.g. "00h", "03h")
# 2. Switch to '7d' filter → chart should show ≤7 points with date labels (e.g. "16 fev", "23 fev")
# 3. Switch to '30d' filter → chart should show ≤30 daily points
# 4. Metric card growth badge with 'Hoje': should show growth vs earliest intraday snapshot
# 5. Metric card growth badge with '7d': should show growth vs 7-day-old value
# 6. Metric card growth badge with '30d': should show growth vs 30-day-old value
# 7. Hover over a 'Hoje' chart point → tooltip shows "09h – 12h" format
# 8. Hover over a '7d'/'30d' point → tooltip shows "23 fev 26" format
```

### Level 4: Edge Cases

```bash
# Verify behavior with insufficient data:
# - Only 1 day of data → growth badge shows "Sem variação" (absolute: 0)
# - No entries for period → chart shows "Dados insuficientes para gerar gráfico"
# - Only data from today filter with single snapshot → 1 point, no previousValue
```

---

## Final Validation Checklist

### Technical Validation

- [ ] `pnpm tsc --noEmit` — zero errors
- [ ] `pnpm lint` — zero ESLint errors
- [ ] No console errors in browser devtools
- [ ] `pnpm build` completes without errors

### Feature Validation

- [ ] `today` chart: ≤9 points (last 8 from 24h window anchored on max recorded timestamp), X-axis shows "HH:mm" time labels, tooltip shows "HH:mm"
- [ ] `7d` chart: ≤7 points, X-axis shows "dd MMM", tooltip shows "dd MMM yy"
- [ ] `30d` chart: ≤30 points with correct date labels
- [ ] Growth badge with `today` filter: compares latest vs oldest intraday snapshot
- [ ] Growth badge with `7d` filter: compares latest vs value from ~7 days ago
- [ ] Growth badge with `30d` filter: compares latest vs value from ~30 days ago
- [ ] `MetricCard` value display unchanged (always shows `metricData.latest`)
- [ ] `useDashboard` SWR options include `refreshInterval: 600000`

### Code Quality Validation

- [ ] `calculateGrowth` signature is `(entries: MetricEntry[], period: PeriodFilter = '7d')`
- [ ] `getBucketKey` helper properly differentiates 'today' vs other periods
- [ ] `metric-card.tsx` and `metric-card-breakdown.tsx` both pass `period` to `calculateGrowth`
- [ ] `youtube-section.tsx` and `instagram-section.tsx` both accept and forward `period` prop
- [ ] `dashboard-client.tsx` passes `period` to both section components
- [ ] No hardcoded "today" comparisons anywhere in grouping logic
- [ ] Existing tests (if any) still pass

---

## Anti-Patterns to Avoid

- ❌ Don't SUM snapshot values for the same bucket — always take LAST per performer, THEN sum performers.
- ❌ Don't use `new Date()` as the anchor for 'today' — anchor on `max(entry.datetime)` so the window is always data-relative.
- ❌ Don't return more than 8 points for 'today' — always slice(-9) after sorting.
- ❌ Don't use `parseISO("YYYY-MM-DDTHH")` in tooltip label without checking for 'T' first.
- ❌ Don't cascade `period` deeper than necessary — only MetricCard/MetricCardWithBreakdown need it (they call calculateGrowth).
- ❌ Don't create a new `usePeriod()` hook or context — period is already in FilterContext.
- ❌ Don't modify `lib/api/dashboard-server.ts` — server-side cache (3h) is independent and correct.
- ❌ Don't export `buildDailyAggregates` — it's an internal helper, keep it inline in `calculateGrowth`.
- ❌ Don't skip the `metric-card-breakdown.tsx` fix even though it's not in the feature doc — same bug, same fix.

---

## Confidence Score: 9/10

**Rationale**:

- All affected files read and understood in full.
- Exact current broken code identified; exact replacement code specified.
- The cascade (metric-card → section → dashboard-client) is fully mapped.
- Edge cases (no data, single entry, insufficient history) handled in both `calculateGrowth` and `useChartData`.
- No new files required — all changes are surgical modifications.
- TypeScript types already accommodate the new logic (no type additions needed).

**Risk Areas**:

- The `T`-in-label detection heuristic for `today` format is a convention, not a formal type. If bucket keys ever contain `T` for non-today reasons, it would mislabel them. Mitigation: the format `"YYYY-MM-DDTHH"` (no colon after hour) is unique to this implementation.
- `dashboard-client.tsx` is a large file; verify that `period` is being passed to BOTH `<YouTubeSection>` and `<InstagramSection>` in the **normal layout** section (not presentation mode, which has its own period selector).
