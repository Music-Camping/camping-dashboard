name: "Dashboard v2 - Performance Hub & Music Catalog"
description: |

---

## Goal

**Feature Goal**: Transform the existing dashboard into a comprehensive Performance Hub with Spotify analytics, social media metrics organized by platform, animated ranking cards, music catalog CRUD with privacy mode, and championships integration.

**Deliverable**:

- Enhanced dashboard page with platform-organized sections (Spotify → Instagram → TikTok → YouTube → Championships → Music Registry)
- Spotify Hub with animated Top 3 rankings and Monthly Listeners charts
- Music catalog management table with inline editing and blur mode for sensitive data
- Championships section with Active/Upcoming/Historical views

**Success Definition**:

- Dashboard loads performer data and displays all sections in the correct visual hierarchy
- Spotify Top 3 cards animate with cascade effect on load/performer change
- Music table supports CRUD operations with privacy toggle
- All existing functionality (filters, charts, auth) continues working

## User Persona

**Target User**: Music label managers and artist representatives who need to monitor performer metrics across platforms and manage music catalogs with sensitive financial data.

**Use Case**: Daily monitoring of performer rankings, streaming metrics, and catalog management while protecting revenue data from onlookers.

**User Journey**:

1. Login → Dashboard loads with default "all performers" view
2. Select performer from header dropdown → All sections filter to that performer
3. View Spotify rankings with animated cards showing position changes
4. Review Monthly Listeners trends in charts
5. Scroll to music catalog → Toggle privacy mode → Edit/delete records
6. Check upcoming championships

**Pain Points Addressed**:

- Scattered metrics across platforms now unified
- Sensitive financial data now protectable with blur mode
- Manual catalog updates now inline-editable

## Why

- **Business Value**: Single view for all performer metrics reduces context switching and improves decision making
- **User Impact**: Privacy mode protects sensitive data in shared screen scenarios
- **Integration**: Builds on existing dashboard foundation, API proxy, and auth system
- **Problems Solved**: Fragmented analytics, exposed financial data, manual catalog management

## What

Enhanced dashboard with 6 ordered sections:

1. **Header**: Performer selector + thumbnail + period filters (existing)
2. **Spotify Hub**: Top 3 animated ranking cards + Monthly Listeners area chart + Playlist comparison bars
3. **Social Media Cards**: Instagram, TikTok, YouTube metric cards with followers/views/posts
4. **Championships**: Grid of Active/Upcoming cards with status badges
5. **Music Catalog**: CRUD table with blur mode, inline editing, column visibility

### Success Criteria

- [ ] Spotify Top 3 cards animate with 0.12s stagger delay on mount
- [ ] Monthly Listeners chart displays area chart with trend line
- [ ] Music table has working add/edit/delete with optimistic updates
- [ ] Privacy mode toggle blurs revenue/streams/royalty columns
- [ ] Performer selection filters all sections globally
- [ ] All existing dashboard tests continue passing

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ ✓

### Documentation & References

```yaml
# MUST READ - Core patterns to follow
- file: components/dashboard/metric-card.tsx
  why: Pattern for displaying metrics with growth indicators and icons
  pattern: Uses calculateGrowth(), formatCompactNumber(), Badge for trends
  gotcha: Expects entries array with datetime and value fields

- file: components/dashboard/metrics-chart.tsx
  why: Pattern for Recharts AreaChart with theme-aware colors
  pattern: Uses ResponsiveContainer, dynamic gradient IDs, ChartTooltip
  gotcha: Requires useMemo for chart data, handles empty state with "Dados insuficientes"

- file: hooks/use-filters.tsx
  why: Global filter context for performers and period
  pattern: FilterProvider wraps dashboard, useFilters() hook for access
  gotcha: setAvailablePerformers must be called when data loads

- file: lib/hooks/dashboard.ts
  why: SWR data fetching pattern for API calls
  pattern: useSWR with custom fetcher, auto-redirect on 401
  gotcha: Returns { data, isLoading, isError }

- file: lib/types/dashboard.ts
  why: TypeScript interfaces for API responses
  pattern: MetricEntry, MetricData, PlatformMetrics, DashboardResponse
  gotcha: "total" key contains aggregated data, performer keys are dynamic

- file: app/api/proxy/[...path]/route.ts
  why: API proxy pattern - all API calls go through this
  pattern: Reads access_token cookie, adds Bearer header, forwards to API_URL
  gotcha: Returns 401 if no token

- file: components/ui/card.tsx
  why: Card component structure with slots
  pattern: Card, CardHeader, CardTitle, CardContent, CardAction exports
  gotcha: Uses data-slot attributes, supports size variants

- file: components/ui/alert-dialog.tsx
  why: Confirmation dialog for delete actions
  pattern: AlertDialog with Trigger, Content, Action, Cancel
  gotcha: Use variant="destructive" for delete confirmation

# External Documentation
- url: https://motion.dev/docs/react-animate-presence
  why: AnimatePresence for mount/unmount animations on ranking cards
  critical: Use mode="wait" for sequential transitions, unique keys required

- url: https://motion.dev/docs/stagger
  why: Stagger animations for cascade effect
  critical: Use staggerChildren: 0.12 in container variants, delayChildren: 0.1

- url: https://recharts.org/en-US/api/AreaChart
  why: Area chart for Monthly Listeners trend
  critical: Use ResponsiveContainer, Gradient fill, XAxis with formatted dates

- url: https://recharts.org/en-US/api/BarChart
  why: Bar chart for playlist comparison
  critical: Use grouped bars for multiple playlists, Label component for values

- url: https://tanstack.com/table/v8/docs/guide/column-visibility
  why: Column visibility toggle for music table
  critical: Use getCanHide(), toggleVisibility() methods

- url: https://tanstack.com/table/v8/docs/api/features/column-filtering
  why: Search filtering for music table
  critical: Use getFilteredRowModel(), setFilterValue()
```

### Current Codebase Tree

```bash
camping-dashboard/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   ├── page.tsx             # MODIFY: Main dashboard (add sections)
│   │   ├── relatorios/page.tsx
│   │   └── configuracoes/page.tsx
│   ├── api/proxy/[...path]/route.ts  # API proxy (existing)
│   └── globals.css
├── components/
│   ├── dashboard/
│   │   ├── metric-card.tsx      # REUSE: Metric display
│   │   ├── metrics-chart.tsx    # REUSE: Area charts
│   │   ├── chart-tooltip.tsx    # REUSE: Chart tooltips
│   │   └── growth-chart.tsx     # REUSE: Line charts
│   ├── ui/                      # shadcn components (17 total)
│   ├── app-header.tsx           # MODIFY: Add performer thumbnail
│   └── sidebar.tsx
├── hooks/
│   ├── use-filters.tsx          # REUSE: Filter context
│   ├── use-chart-data.ts        # REUSE: Chart transformations
│   └── use-mobile.ts
├── lib/
│   ├── hooks/dashboard.ts       # REUSE: SWR fetching
│   ├── types/dashboard.ts       # EXTEND: Add Spotify/TikTok types
│   └── utils.ts                 # REUSE: formatCompactNumber, calculateGrowth
└── package.json                 # ADD: framer-motion, @tanstack/react-table
```

### Desired Codebase Tree with New Files

```bash
components/
├── dashboard/
│   ├── spotify/
│   │   ├── spotify-hub.tsx           # Container for Spotify section
│   │   ├── top-rankings.tsx          # Animated Top 3 cards
│   │   ├── monthly-listeners-chart.tsx  # Area chart
│   │   └── playlist-comparison.tsx   # Bar chart
│   ├── social/
│   │   ├── platform-section.tsx      # Generic platform card grid
│   │   └── platform-card.tsx         # Reusable platform metric card
│   ├── championships/
│   │   ├── championships-section.tsx # Container for championships
│   │   └── championship-card.tsx     # Individual championship card
│   └── music-catalog/
│       ├── music-table.tsx           # Main CRUD table
│       ├── columns.tsx               # TanStack column definitions
│       ├── editable-cell.tsx         # Inline edit cell
│       ├── blurred-cell.tsx          # Privacy blur cell
│       └── delete-confirmation.tsx   # Delete dialog
├── ui/
│   └── table.tsx                     # ADD: shadcn table primitives
hooks/
├── use-privacy-mode.ts               # Privacy mode state (localStorage)
├── use-table-visibility.ts           # Column visibility persistence
└── use-spotify-data.ts               # Spotify-specific data hook
lib/
├── types/
│   ├── spotify.ts                    # Spotify API types
│   ├── championships.ts              # Championships types
│   └── music-catalog.ts              # Music track types
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Framer Motion requires unique keys for AnimatePresence
// BAD - will break exit animations
<AnimatePresence>
  <>{items.map(...)}</>  // Fragment breaks key tracking
</AnimatePresence>

// GOOD - direct children with keys
<AnimatePresence mode="wait">
  {items.map(item => <motion.div key={item.id} />)}
</AnimatePresence>

// CRITICAL: TanStack Table column visibility needs memoized columns
const columns = useMemo(() => createColumns(options), [deps]);

// CRITICAL: CSS blur must use filter, not backdrop-filter for text
// blur-[6px] class = filter: blur(6px)
// Add select-none to prevent text selection of blurred content

// CRITICAL: SWR fetcher must handle 401 before throwing
if (res.status === 401) {
  window.location.href = "/login";
  throw new Error("Unauthorized");
}

// CRITICAL: useLocalStorage hook already exists at lib/hooks/use-local-storage.ts
// Use it for privacy mode and column visibility persistence

// CRITICAL: Recharts responsive container must have explicit height
// Parent must have defined height, or use aspect ratio
<ResponsiveContainer width="100%" height={300}>

// CRITICAL: date-fns uses Portuguese locale (ptBR) in this project
import { ptBR } from "date-fns/locale";
format(date, "dd MMM", { locale: ptBR });
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// lib/types/spotify.ts
interface SpotifyRanking {
  position: number;
  previousPosition: number;
  trackId: string;
  trackName: string;
  artistName: string;
  thumbnail: string;
  streams: number;
  change: "up" | "down" | "same" | "new";
}

interface SpotifyMetrics {
  monthlyListeners: MetricData;
  rankings: SpotifyRanking[];
  playlists: PlaylistData[];
}

interface PlaylistData {
  id: string;
  name: string;
  monthlyListeners: number;
  thumbnail: string;
}

// lib/types/championships.ts
interface Championship {
  id: string;
  name: string;
  status: "active" | "upcoming" | "completed";
  startDate: string;
  endDate?: string;
  currentRank?: number;
  totalParticipants?: number;
  prize?: string;
  thumbnail?: string;
}

// lib/types/music-catalog.ts
interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  releaseDate: string;
  isrc: string;
  label: string;
  duration: number;
  // Sensitive fields (blur in privacy mode)
  streams: number;
  revenue: number;
  royaltyRate: number;
}

type SensitiveColumn = "streams" | "revenue" | "royaltyRate";
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: INSTALL dependencies
  - RUN: pnpm add framer-motion @tanstack/react-table
  - RUN: pnpm dlx shadcn@latest add table
  - VERIFY: package.json updated, no conflicts

Task 2: CREATE lib/types/spotify.ts
  - IMPLEMENT: SpotifyRanking, SpotifyMetrics, PlaylistData interfaces
  - FOLLOW pattern: lib/types/dashboard.ts (MetricData reuse)
  - PLACEMENT: lib/types/spotify.ts

Task 3: CREATE lib/types/championships.ts
  - IMPLEMENT: Championship interface with status union type
  - PLACEMENT: lib/types/championships.ts

Task 4: CREATE lib/types/music-catalog.ts
  - IMPLEMENT: MusicTrack interface, SensitiveColumn type
  - PLACEMENT: lib/types/music-catalog.ts

Task 5: CREATE hooks/use-privacy-mode.ts
  - IMPLEMENT: usePrivacyMode hook with localStorage persistence
  - USE: lib/hooks/use-local-storage.ts (existing hook)
  - RETURN: { privacyEnabled, togglePrivacyMode, isColumnBlurred }
  - PLACEMENT: hooks/use-privacy-mode.ts

Task 6: CREATE components/ui/table.tsx
  - RUN: pnpm dlx shadcn@latest add table (if not done)
  - VERIFY: Table, TableHeader, TableBody, TableRow, TableHead, TableCell exports
  - FOLLOW pattern: components/ui/card.tsx (data-slot attributes)

Task 7: CREATE components/dashboard/spotify/top-rankings.tsx
  - IMPLEMENT: Animated ranking cards with framer-motion
  - USE: motion.div with containerVariants (staggerChildren: 0.12)
  - USE: AnimatePresence mode="wait" for performer changes
  - PROPS: rankings: SpotifyRanking[], performerId: string
  - FOLLOW pattern: components/dashboard/metric-card.tsx (card styling)
  - GOTCHA: Memoize variants object, use useReducedMotion for accessibility

Task 8: CREATE components/dashboard/spotify/monthly-listeners-chart.tsx
  - IMPLEMENT: AreaChart for monthly listeners trend
  - REUSE: components/dashboard/metrics-chart.tsx pattern exactly
  - REUSE: components/dashboard/chart-tooltip.tsx
  - PROPS: data: ChartDataPoint[], title: string

Task 9: CREATE components/dashboard/spotify/playlist-comparison.tsx
  - IMPLEMENT: BarChart comparing playlist monthly listeners
  - USE: Recharts BarChart, Bar, XAxis, YAxis, Tooltip
  - PROPS: playlists: PlaylistData[]
  - FOLLOW pattern: metrics-chart.tsx (ResponsiveContainer, theme colors)

Task 10: CREATE components/dashboard/spotify/spotify-hub.tsx
  - IMPLEMENT: Container combining Top3, MonthlyListeners, PlaylistComparison
  - LAYOUT: 2-column grid - rankings left, charts right
  - USE: Tabs or toggle for Profile vs Playlist views
  - PROPS: spotifyData: SpotifyMetrics, performerId: string

Task 11: CREATE components/dashboard/championships/championship-card.tsx
  - IMPLEMENT: Card with status badge, dates, rank info
  - USE: components/ui/card.tsx, components/ui/badge.tsx
  - PROPS: championship: Championship
  - STYLING: "Live" badge for active, countdown for upcoming

Task 12: CREATE components/dashboard/championships/championships-section.tsx
  - IMPLEMENT: Grid of championship cards grouped by status
  - LAYOUT: 3-column grid with section headers
  - PROPS: championships: Championship[]

Task 13: CREATE components/dashboard/music-catalog/blurred-cell.tsx
  - IMPLEMENT: Cell with conditional blur and reveal button
  - PROPS: value, isBlurred, formatValue?, allowTemporaryReveal?
  - STYLING: blur-[6px] transition-all select-none when blurred
  - USE: Eye/EyeOff icons from lucide-react

Task 14: CREATE components/dashboard/music-catalog/editable-cell.tsx
  - IMPLEMENT: Click-to-edit cell with Enter/Escape handlers
  - PROPS: value, onSave, type ("text" | "number"), isBlurred
  - USE: components/ui/input.tsx
  - GOTCHA: Disable editing when blurred

Task 15: CREATE components/dashboard/music-catalog/delete-confirmation.tsx
  - IMPLEMENT: AlertDialog for delete confirmation
  - FOLLOW pattern: components/ui/alert-dialog.tsx exactly
  - PROPS: itemName, onConfirm, isLoading
  - USE: variant="destructive" for confirm button

Task 16: CREATE components/dashboard/music-catalog/columns.tsx
  - IMPLEMENT: TanStack Table column definitions
  - USE: ColumnDef<MusicTrack> type
  - INCLUDE: select checkbox, sortable headers, editable cells, blurred cells, actions
  - PROPS factory: createColumns({ isColumnBlurred, onUpdate, onDelete })

Task 17: CREATE components/dashboard/music-catalog/music-table.tsx
  - IMPLEMENT: Full CRUD table with TanStack Table
  - USE: useReactTable with sorting, filtering, visibility, pagination
  - USE: hooks/use-privacy-mode.ts for blur toggle
  - INCLUDE: Search input, privacy toggle button, column visibility dropdown
  - FOLLOW pattern: shadcn data-table example structure

Task 18: MODIFY app/(dashboard)/page.tsx
  - ADD: Spotify Hub section after header
  - ADD: Platform sections (Instagram, TikTok, YouTube) using existing MetricCard
  - ADD: Championships section
  - ADD: Music Catalog table
  - REORDER: Follow visual hierarchy from spec
  - PRESERVE: Existing filter logic, loading states, error handling

Task 19: MODIFY components/app-header.tsx
  - ADD: Large performer thumbnail next to selector when performer selected
  - USE: Image from next/image for optimization
  - PRESERVE: All existing functionality

Task 20: CREATE hooks/use-spotify-data.ts (optional - if API exists)
  - IMPLEMENT: SWR hook for /api/proxy/api/spotify
  - FOLLOW pattern: lib/hooks/dashboard.ts exactly
  - RETURN: { spotifyData, isLoading, isError }
```

### Implementation Patterns & Key Details

```typescript
// Pattern: Animated Top 3 Rankings
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 }
  },
};

// Usage in component
<AnimatePresence mode="wait">
  <motion.div
    key={performerId}  // Re-animate on performer change
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    {rankings.map((rank, i) => (
      <motion.div key={rank.trackId} variants={cardVariants}>
        <RankingCard rank={rank} position={i + 1} />
      </motion.div>
    ))}
  </motion.div>
</AnimatePresence>

// Pattern: Privacy Mode Hook
export function usePrivacyMode() {
  const [state, setState] = useLocalStorage("privacy-mode", {
    enabled: false,
    blurredColumns: ["revenue", "streams", "royaltyRate"],
  });

  const isColumnBlurred = (col: string) =>
    state.enabled && state.blurredColumns.includes(col);

  return { ...state, togglePrivacyMode: () => setState(s => ({...s, enabled: !s.enabled})), isColumnBlurred };
}

// Pattern: TanStack Table with Blur
const columns = useMemo(() => createColumns({
  isColumnBlurred,
  onUpdate: async (id, field, value) => {
    // Optimistic update + API call
  },
  onDelete: async (id) => {
    // Confirm + API call
  },
}), [isColumnBlurred]);
```

### Integration Points

```yaml
DEPENDENCIES:
  - ADD to package.json: "framer-motion": "^11.x", "@tanstack/react-table": "^8.x"

API ENDPOINTS (if backend supports):
  - GET /api/proxy/api/spotify/{performerId} - Spotify metrics
  - GET /api/proxy/api/championships - Championships list
  - GET /api/proxy/api/music-catalog - Music tracks
  - PUT /api/proxy/api/music-catalog/{id} - Update track
  - DELETE /api/proxy/api/music-catalog/{id} - Delete track

FILTER CONTEXT:
  - All new sections must consume useFilters() context
  - Filter by selectedPerformers and period
  - Reuse existing useChartData() for data transformation

STATE PERSISTENCE:
  - Privacy mode: localStorage key "privacy-mode"
  - Column visibility: localStorage key "table-visibility-music-catalog"
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation
pnpm lint --fix
pnpm tsc --noEmit

# Expected: Zero errors before proceeding to next task
```

### Level 2: Unit Tests (Component Validation)

```bash
# Verify new components render without errors
pnpm dev
# Navigate to http://localhost:3000
# Check browser console for React errors

# Test privacy mode toggle
# Test table inline editing
# Test animation performance
```

### Level 3: Integration Testing (System Validation)

```bash
# Start dev server
pnpm dev

# Manual validation checklist:
# 1. Login with test credentials (admin@camping.com / admin123)
# 2. Dashboard loads without errors
# 3. Select performer from dropdown - all sections filter
# 4. Spotify Top 3 cards animate on load
# 5. Toggle privacy mode - blur appears on sensitive columns
# 6. Edit a music table cell - value updates
# 7. Delete a row - confirmation dialog appears
# 8. Change period filter - charts update
```

### Level 4: Visual & Performance Validation

```bash
# Check animation performance
# Open DevTools > Performance tab
# Record page load
# Verify animations run at 60fps

# Check responsive design
# Resize viewport to mobile widths
# Verify table scrolls horizontally
# Verify cards stack vertically

# Check dark mode
# Toggle theme
# Verify all new components support dark theme
```

## Final Validation Checklist

### Technical Validation

- [ ] pnpm lint passes with zero errors
- [ ] pnpm tsc --noEmit passes with zero type errors
- [ ] Dev server starts without warnings
- [ ] No React hydration errors in console
- [ ] Framer Motion animations run at 60fps

### Feature Validation

- [ ] Spotify Top 3 cards animate with cascade effect
- [ ] Monthly Listeners chart displays correctly
- [ ] Privacy mode toggles blur on/off
- [ ] Music table inline edit works (Enter saves, Escape cancels)
- [ ] Delete confirmation dialog prevents accidental deletion
- [ ] Performer filter affects all sections
- [ ] Period filter affects charts
- [ ] Column visibility persists across page reloads

### Code Quality Validation

- [ ] New components follow existing file naming (kebab-case)
- [ ] TypeScript strict mode satisfied
- [ ] No "any" types used
- [ ] Hooks properly memoize expensive operations
- [ ] Components use existing UI primitives from components/ui/

### Accessibility Validation

- [ ] useReducedMotion respected in animations
- [ ] Tables have proper ARIA labels
- [ ] Blur mode has reveal button for accessibility
- [ ] Keyboard navigation works in table

---

## Anti-Patterns to Avoid

- ❌ Don't create new styling patterns - use existing Tailwind classes from other components
- ❌ Don't fetch data directly - always use SWR hooks through /api/proxy
- ❌ Don't store auth tokens in state - middleware handles auth
- ❌ Don't use inline styles - use Tailwind classes
- ❌ Don't skip AnimatePresence keys - will break exit animations
- ❌ Don't use backdrop-filter for text blur - use filter: blur()
- ❌ Don't create duplicate types - extend existing dashboard.ts types

---

## Confidence Score: 8/10

**Rationale**:

- Strong foundation with existing dashboard, components, and patterns
- Framer Motion and TanStack Table are well-documented
- Main uncertainty: API endpoints for Spotify/Championships may not exist yet (mock data fallback needed)
- All critical patterns documented with specific file references
