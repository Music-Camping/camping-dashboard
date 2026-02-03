# PRP: Charts Dashboard

---

## Goal

**Feature Goal**: Implement an interactive charts dashboard with AreaChart visualizations for YouTube and Instagram metrics, featuring a multi-select performer filter, optimized for TV display (no scroll, all information visible).

**Deliverable**:

- MetricsChart component with gradient AreaChart
- ChartTooltip component (dark style with percentage change)
- useChartData hook for data transformation and aggregation
- Multi-select performer filter in header
- TV-optimized dashboard layout with metric cards and charts

**Success Definition**:

- Charts render correctly with API data from `GET /api/dashboard`
- Performer multi-select filter works and updates chart aggregation
- Period filter (Hoje/7d/30d) affects displayed data
- Tooltip shows formatted values in pt-BR with percentage change
- Dark/light mode works correctly with CSS variables
- Layout fits on 1080p TV without scrolling

---

## User Persona

**Target User**: Music industry professionals viewing metrics on a TV display

**Use Case**: Monitor social media growth metrics (YouTube subscribers, Instagram followers) for multiple performers at a glance

**User Journey**:

1. User accesses dashboard on TV
2. Sees metric cards with current values and growth indicators
3. Views area charts showing evolution over selected period
4. Optionally filters by specific performers using header multi-select
5. Hovers over chart points to see detailed values (if interactive)

**Pain Points Addressed**:

- Need for at-a-glance visualization without scrolling
- Aggregated view of multiple performers' metrics
- Quick identification of growth trends

---

## Why

- **Business value**: Enables quick assessment of social media performance across multiple artists
- **User impact**: TV-optimized display allows passive monitoring in offices/studios
- **Integration**: Builds on existing dashboard API and filter infrastructure
- **Problems solved**: Currently only showing raw numbers; charts provide trend visualization

---

## What

### User-visible Behavior

- Two area charts displayed: YouTube Subscribers and Instagram Followers
- Charts show smooth gradient fill with hover tooltip
- Metric cards above charts show current values with growth badges
- Multi-select dropdown for performers (all selected by default)
- Charts always show aggregated (summed) data from selected performers

### Technical Requirements

- Use Recharts AreaChart with linear gradient fill
- Use date-fns for pt-BR date formatting
- Use CSS variables (chart-1 to chart-5) for theming
- Responsive height that fits in viewport
- Connect null values in data

### Success Criteria

- [ ] AreaCharts render with gradient fill using CSS variables
- [ ] Tooltip shows date, value (formatted), and % change from previous day
- [ ] Multi-select performer filter in header works correctly
- [ ] Period filter (today/7d/30d) updates chart data
- [ ] Metric cards show growth comparison with previous day
- [ ] Layout fits on 1080p TV (no vertical scroll)
- [ ] Dark/light mode switches correctly
- [ ] Empty states handled gracefully

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ **YES**

### Documentation & References

```yaml
# MUST READ - Primary Documentation
- docfile: PRPs/ai_docs/recharts-date-fns.md
  why: Contains AreaChart implementation pattern with gradient, custom tooltip, and date-fns formatting
  section: "Recharts for AreaChart" and "Custom Tooltip Component"
  critical: Use defs/linearGradient inside chart, axisLine={false}, tickLine={false}

# CODEBASE PATTERNS - Follow These Exactly
- file: components/dashboard/growth-chart.tsx
  why: Existing Recharts pattern in codebase - ResponsiveContainer, date formatting, tooltip styling
  pattern: "use client", cn() for classnames, formatCompactNumber usage
  gotcha: Height must be numeric or Tailwind class (h-80), NOT "100%"

- file: components/dashboard/metric-card.tsx
  why: Existing metric display pattern with growth badges (TrendingUp/TrendingDown)
  pattern: Badge with conditional green/red styling, calculateGrowth function usage
  gotcha: calculateGrowth returns { absolute: number, percent: number }

- file: hooks/use-filters.tsx
  why: Current filter state management pattern - must extend for multi-select performers
  pattern: React Context + useCallback + useMemo for optimized updates
  gotcha: Currently uses profileId (single), need to change to selectedPerformers (array)

- file: lib/types/filters.ts
  why: Filter type definitions - must add SelectedPerformers type
  pattern: PeriodFilter type, PERIOD_OPTIONS constant, MOCK_PROFILES constant
  gotcha: Remove MOCK_PROFILES when implementing, use performers from API

- file: lib/types/dashboard.ts
  why: API response types - MetricEntry, MetricData, PlatformMetrics, DashboardResponse
  pattern: Interface structure for entries with value, datetime, performer fields
  critical: "total" key in response already has aggregated entries with performer field

- file: components/app-header.tsx
  why: Current header structure with period filter buttons and profile Select
  pattern: Button variant toggle (secondary/ghost), Select component usage
  gotcha: Must change Select to multi-select Combobox pattern

- file: lib/utils.ts
  why: Utility functions location - MISSING formatCompactNumber and calculateGrowth
  pattern: cn() function exists, formatNumber exists for pt-BR
  critical: Must add formatCompactNumber and calculateGrowth functions

- file: app/globals.css
  why: CSS variables for chart colors and theming
  pattern: --chart-1 through --chart-5 defined in both :root and .dark
  critical: Use hsl(var(--chart-1)) format in Recharts stroke/fill

# EXTERNAL DOCUMENTATION
- url: https://recharts.org/en-US/api/AreaChart
  why: AreaChart API reference - props, children components
  critical: type="monotone", connectNulls, fillOpacity={1}, fill="url(#gradient)"

- url: https://recharts.org/en-US/api/Area
  why: Area component props - gradient fill, activeDot, dot
  critical: dot={false} to hide points, activeDot for hover state

- url: https://recharts.org/en-US/api/Tooltip
  why: Custom tooltip implementation
  critical: content prop accepts React component, receives { active, payload, label }

- url: https://date-fns.org/docs/format
  why: Date formatting tokens and locale usage
  critical: "dd MMM" for "22 jan", always pass { locale: ptBR }

- url: https://date-fns.org/docs/parseISO
  why: Parse ISO 8601 datetime strings from API
  critical: Returns Date object, handles timezone info
```

### Current Codebase Tree

```bash
.
├── app
│   ├── page.tsx              # Main dashboard - MODIFY for chart layout
│   ├── globals.css           # CSS variables for chart colors
│   └── layout.tsx
├── components
│   ├── dashboard
│   │   ├── growth-chart.tsx  # Existing LineChart - REFERENCE pattern
│   │   ├── metric-card.tsx   # Existing metric card - USE as-is
│   │   └── platform-tabs.tsx
│   ├── ui
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── combobox.tsx      # USE for multi-select
│   │   └── ...
│   ├── app-header.tsx        # MODIFY for performer multi-select
│   └── ...
├── hooks
│   └── use-filters.tsx       # MODIFY for selectedPerformers array
├── lib
│   ├── hooks
│   │   └── dashboard.ts      # useDashboard hook - USE as-is
│   ├── types
│   │   ├── dashboard.ts      # API types - USE as-is
│   │   └── filters.ts        # MODIFY for performer filter types
│   └── utils.ts              # ADD formatCompactNumber, calculateGrowth
└── PRPs
    └── ai_docs
        └── recharts-date-fns.md  # Reference documentation
```

### Desired Codebase Tree (files to add/modify)

```bash
├── components
│   ├── dashboard
│   │   ├── metrics-chart.tsx     # NEW - AreaChart component
│   │   ├── chart-tooltip.tsx     # NEW - Custom dark tooltip
│   │   ├── metric-card.tsx       # KEEP - Already has growth badge
│   │   └── growth-chart.tsx      # KEEP - Reference only
│   └── app-header.tsx            # MODIFY - Add multi-select performers
├── hooks
│   ├── use-filters.tsx           # MODIFY - Add selectedPerformers state
│   └── use-chart-data.ts         # NEW - Data transformation hook
├── lib
│   ├── types
│   │   ├── dashboard.ts          # NEW - Add ChartDataPoint type
│   │   └── filters.ts            # MODIFY - Add performer filter types
│   └── utils.ts                  # MODIFY - Add formatCompactNumber, calculateGrowth
└── app
    └── page.tsx                  # MODIFY - New TV-optimized layout
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Recharts requires "use client" directive in Next.js
"use client";

// CRITICAL: ResponsiveContainer needs parent with defined height
// BAD: <ResponsiveContainer height="100%"> inside flex container
// GOOD: <div className="h-64"><ResponsiveContainer width="100%" height="100%">

// CRITICAL: Gradient must be defined INSIDE the chart component
<AreaChart>
  <defs>
    <linearGradient id="myGradient">...</linearGradient>
  </defs>
  <Area fill="url(#myGradient)" />
</AreaChart>

// CRITICAL: CSS variables in Recharts need hsl() wrapper
// BAD: stroke="var(--chart-1)"
// GOOD: stroke="hsl(var(--chart-1))"

// CRITICAL: formatCompactNumber is imported but NOT defined in utils.ts
// Must implement before using in charts

// CRITICAL: calculateGrowth is imported but NOT defined in utils.ts
// Must implement before using in metric-card

// GOTCHA: API "total" key entries have performer field, individual performers don't
// Use entries[].performer to identify source when filtering aggregated data

// GOTCHA: date-fns locale import path
import { ptBR } from 'date-fns/locale'; // CORRECT for v3+
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// lib/types/dashboard.ts - ADD these types
export interface ChartDataPoint {
  date: string; // ISO date string (date part only: "2026-01-30")
  value: number;
  previousValue?: number; // For percentage calculation in tooltip
}

// lib/types/filters.ts - ADD these types
export type SelectedPerformers = string[]; // Array of performer names

export interface FilterState {
  period: PeriodFilter;
  selectedPerformers: SelectedPerformers; // CHANGED from profileId
}

export interface FilterContextValue {
  filters: FilterState;
  setPeriod: (period: PeriodFilter) => void;
  setSelectedPerformers: (performers: SelectedPerformers) => void;
  availablePerformers: string[]; // From API data
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: ADD utility functions to lib/utils.ts
  - IMPLEMENT: formatCompactNumber(num: number): string
    - K for thousands (>= 1000), M for millions (>= 1_000_000), B for billions
    - Preserve 1 decimal for M/B, 0 for K
  - IMPLEMENT: calculateGrowth(entries: MetricEntry[]): { absolute: number; percent: number }
    - Compare latest value with previous day's value
    - Handle cases: no entries, single entry, multiple entries
  - FOLLOW pattern: formatNumber already uses Intl.NumberFormat("pt-BR")
  - VALIDATION: import and use in metric-card.tsx (already expects these)

Task 2: MODIFY lib/types/filters.ts
  - ADD: SelectedPerformers type alias
  - MODIFY: FilterState to use selectedPerformers array instead of profileId
  - MODIFY: FilterContextValue with setSelectedPerformers and availablePerformers
  - REMOVE: MOCK_PROFILES constant (will use API data instead)
  - KEEP: PERIOD_OPTIONS constant as-is

Task 3: MODIFY hooks/use-filters.tsx
  - CHANGE: profileId state to selectedPerformers (string[] default [])
  - ADD: availablePerformers state (populated from API)
  - ADD: setAvailablePerformers callback
  - IMPLEMENT: setSelectedPerformers with toggle logic
  - UPDATE: FilterContextValue memoization
  - FOLLOW pattern: existing useCallback/useMemo structure

Task 4: CREATE hooks/use-chart-data.ts
  - IMPLEMENT: useChartData hook that takes:
    - data: DashboardResponse (from useDashboard)
    - platform: 'youtube' | 'instagram'
    - metric: 'followers' | 'views' | 'video_count' | 'post_count'
    - selectedPerformers: string[]
  - RETURNS: ChartDataPoint[] sorted by date ascending
  - LOGIC:
    1. If selectedPerformers empty, use "total" entries
    2. If selectedPerformers has items, filter total.entries by performer field
    3. Aggregate values by date (sum)
    4. Calculate previousValue for each point
    5. Sort by date ascending
  - FOLLOW pattern: compareAsc from date-fns for sorting
  - GOTCHA: API entries datetime is ISO 8601, extract date part only

Task 5: CREATE components/dashboard/chart-tooltip.tsx
  - IMPLEMENT: ChartTooltip component matching reference design
  - PROPS: Extends TooltipProps from recharts
  - STYLE: Dark background (bg-foreground), light text (text-background)
  - CONTENT:
    - Date: "dd MMM yy" format with ptBR locale
    - Value: formatCompactNumber
    - Change: green/red percentage with arrow
  - FOLLOW pattern: Tooltip content in PRPs/ai_docs/recharts-date-fns.md

Task 6: CREATE components/dashboard/metrics-chart.tsx
  - IMPLEMENT: MetricsChart component with AreaChart
  - PROPS: { data: ChartDataPoint[], title: string, className?: string }
  - STRUCTURE:
    - Card wrapper with title
    - ResponsiveContainer (100% width, fixed height ~200px for TV)
    - AreaChart with gradient fill
  - FEATURES:
    - Gradient using CSS variable --chart-1
    - axisLine={false}, tickLine={false} on both axes
    - vertical={false} on CartesianGrid
    - Custom ChartTooltip
    - type="monotone", connectNulls, dot={false}
  - FOLLOW pattern: components/dashboard/growth-chart.tsx structure

Task 7: MODIFY components/app-header.tsx
  - CHANGE: Single Select to multi-select Popover with Checkboxes
  - USE: existing Combobox pattern or custom Popover + Command
  - DISPLAY: "Todos os Performers" when none/all selected, or "N selecionados"
  - BEHAVIOR:
    - "Todos" checkbox selects/deselects all
    - Individual checkboxes toggle selection
  - GET performers: from useFilters().availablePerformers
  - CALL: setSelectedPerformers on change
  - KEEP: Period filter buttons as-is

Task 8: MODIFY app/page.tsx for TV-optimized layout
  - IMPLEMENT: New layout structure
  - STRUCTURE (top to bottom, no scroll on 1080p):
    1. Section: YouTube metrics (row of MetricCards)
       - Inscritos, Views, Vídeos
    2. Section: Instagram metrics (row of MetricCards)
       - Seguidores, Posts
    3. Section: Charts (2-column grid)
       - YouTube Inscritos chart
       - Instagram Seguidores chart
  - INTEGRATION:
    - Use useDashboard() for data
    - Use useFilters() for selectedPerformers
    - Use useChartData() for chart data transformation
    - Populate availablePerformers from API data keys
  - STYLING:
    - Compact padding (p-4 instead of p-8)
    - Smaller text for TV readability at distance
    - Fixed heights to prevent scroll

Task 9: INTEGRATION - Wire up performer filter
  - IN app/page.tsx or layout:
    - Extract performer names from API data (exclude "total")
    - Call setAvailablePerformers on data load
  - ENSURE: Filter changes trigger chart re-render with new aggregation
```

### Implementation Patterns & Key Details

```typescript
// lib/utils.ts - formatCompactNumber implementation
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K`;
  }
  return num.toString();
}

// lib/utils.ts - calculateGrowth implementation
export function calculateGrowth(entries: MetricEntry[]): { absolute: number; percent: number } {
  if (entries.length < 2) {
    return { absolute: 0, percent: 0 };
  }

  // Sort by datetime descending to get latest first
  const sorted = [...entries].sort((a, b) =>
    new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  );

  const latest = sorted[0].value;
  const previous = sorted[1].value;
  const absolute = latest - previous;
  const percent = previous === 0 ? 0 : (absolute / previous) * 100;

  return { absolute, percent };
}

// hooks/use-chart-data.ts - Core transformation logic
export function useChartData(
  data: DashboardResponse | undefined,
  platform: 'youtube' | 'instagram',
  metric: string,
  selectedPerformers: string[]
): ChartDataPoint[] {
  return useMemo(() => {
    if (!data?.total?.[platform]?.[metric]?.entries) return [];

    const entries = data.total[platform][metric].entries;

    // Filter by selected performers if any
    const filteredEntries = selectedPerformers.length === 0
      ? entries
      : entries.filter(e => e.performer && selectedPerformers.includes(e.performer));

    // Group by date and sum values
    const byDate = new Map<string, number>();
    filteredEntries.forEach(entry => {
      const dateKey = entry.datetime.split('T')[0];
      byDate.set(dateKey, (byDate.get(dateKey) || 0) + entry.value);
    });

    // Convert to array and sort
    const points = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value], index, arr) => ({
        date,
        value,
        previousValue: index > 0 ? arr[index - 1][1] : undefined,
      }));

    return points;
  }, [data, platform, metric, selectedPerformers]);
}

// components/dashboard/metrics-chart.tsx - AreaChart pattern
<AreaChart data={data}>
  <defs>
    <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
    </linearGradient>
  </defs>
  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
  <XAxis
    dataKey="date"
    tickFormatter={(v) => format(parseISO(v), "dd MMM", { locale: ptBR })}
    axisLine={false}
    tickLine={false}
    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
  />
  <YAxis
    tickFormatter={formatCompactNumber}
    axisLine={false}
    tickLine={false}
    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
    width={50}
  />
  <Tooltip content={<ChartTooltip />} />
  <Area
    type="monotone"
    dataKey="value"
    stroke="hsl(var(--chart-1))"
    strokeWidth={2}
    fill={`url(#gradient-${title})`}
    fillOpacity={1}
    connectNulls
    dot={false}
    activeDot={{ r: 6, fill: "hsl(var(--chart-1))" }}
  />
</AreaChart>
```

### Integration Points

```yaml
FILTER_CONTEXT:
  - location: hooks/use-filters.tsx
  - pattern: Add selectedPerformers state and setter
  - preserve: period filter functionality

API_DATA:
  - endpoint: GET http://localhost:8000/api/dashboard
  - hook: lib/hooks/dashboard.ts (useDashboard)
  - action: Extract performer names, populate availablePerformers

THEME_VARIABLES:
  - location: app/globals.css
  - use: --chart-1 for primary chart color
  - pattern: hsl(var(--chart-1)) in Recharts components

LAYOUT:
  - location: app/page.tsx
  - constraint: Must fit 1080p TV without scroll
  - pattern: Compact padding, fixed chart heights (~200px)
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation
pnpm lint --fix
pnpm tsc --noEmit

# Expected: Zero errors
```

### Level 2: Unit Tests (Component Validation)

```bash
# Test utility functions
pnpm test lib/utils.test.ts

# Test hook logic
pnpm test hooks/use-chart-data.test.ts

# Note: If no test runner configured, validate manually
```

### Level 3: Integration Testing (Visual Validation)

```bash
# Start development server
pnpm dev

# Manual verification steps:
1. Open http://localhost:3000
2. Verify charts render with gradient fill
3. Toggle dark/light mode - colors should adapt
4. Hover over chart - tooltip appears with formatted values
5. Change period filter - charts update
6. Open performer multi-select - list shows API performers
7. Toggle performers - charts update aggregation
8. Resize to 1920x1080 - no scroll should be needed
```

### Level 4: TV Display Validation

```bash
# Connect to TV or use browser dev tools
# Set viewport to 1920x1080 (Full HD)

# Verify:
1. All content visible without scroll
2. Text readable from 3+ meters
3. Charts have sufficient contrast
4. Hover states work (if TV supports mouse)
```

---

## Final Validation Checklist

### Technical Validation

- [ ] All TypeScript errors resolved (`pnpm tsc --noEmit`)
- [ ] All ESLint errors resolved (`pnpm lint`)
- [ ] No console errors in browser dev tools
- [ ] Charts render on initial page load

### Feature Validation

- [ ] AreaCharts render with gradient fill
- [ ] Tooltip shows date (dd MMM yy), value, and % change
- [ ] Metric cards show current value and growth badge
- [ ] Period filter (Hoje/7d/30d) updates charts
- [ ] Performer multi-select filters chart data
- [ ] Dark mode: charts use appropriate colors
- [ ] Light mode: charts use appropriate colors

### Layout Validation (TV)

- [ ] Full dashboard visible on 1920x1080 without scroll
- [ ] Text size appropriate for distance viewing
- [ ] Sufficient contrast between elements
- [ ] Cards and charts proportionally sized

### Code Quality Validation

- [ ] "use client" directive on all chart components
- [ ] No hardcoded colors (using CSS variables)
- [ ] formatCompactNumber and calculateGrowth implemented in utils.ts
- [ ] useChartData hook properly memoized
- [ ] Filter state properly typed

---

## Anti-Patterns to Avoid

- ❌ Don't use percentage height on ResponsiveContainer without parent height
- ❌ Don't use CSS variables directly in Recharts (wrap with hsl())
- ❌ Don't define gradients outside the AreaChart component
- ❌ Don't forget "use client" directive on chart components
- ❌ Don't hardcode performer names (use API data)
- ❌ Don't use type="linear" for smooth curves (use "monotone")
- ❌ Don't skip connectNulls when data may have gaps
- ❌ Don't create vertical scroll on TV layout

---

## Confidence Score: 9/10

**Rationale**:

- Comprehensive codebase analysis completed
- Existing patterns well-documented (growth-chart.tsx, metric-card.tsx)
- Library documentation (Recharts, date-fns) thoroughly researched
- Reference design image analyzed
- All file paths verified
- Missing utilities (formatCompactNumber, calculateGrowth) identified
- Clear implementation order with dependencies

**Risk Areas**:

- Multi-select combobox pattern may need UI adjustment
- TV layout height constraints may require iteration
- API response structure assumed based on types (verify with real data)
