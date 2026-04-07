# Architecture

**Analysis Date:** 2026-04-02

## Pattern Overview

**Overall:** Next.js App Router with server-side data fetching and client-side interactivity

**Key Characteristics:**

- Server Component pages with Suspense boundaries for data loading
- Client-side feature components with React hooks and context
- Shared Zod schemas for API validation (single source of truth)
- Multi-platform metrics aggregation (Spotify, YouTube, Instagram)
- Presentation mode with auto-rotation and fullscreen support

## Layers

**Server API Layer:**

- Purpose: Fetch and validate external data, serve as backend proxy
- Location: `app/api/` (Next.js route handlers) and `lib/api/` (data fetching functions)
- Contains: API routes, server actions, Zod schemas for validation
- Depends on: External APIs (backend at `BACKEND_URL`), Node.js cookies API
- Used by: Server Components and Client Components via props/fetch

**Data Access Layer:**

- Purpose: Transform raw API responses into frontend-typed structures
- Location: `lib/api/dashboard-server.ts` (server-side transformers), `lib/types/` (type definitions)
- Contains: Metric transformation, playlist data aggregation, company/performer data mapping
- Depends on: Zod schemas (`lib/api/schemas.ts`), TypeScript types
- Used by: Server Components to populate initial data

**State Management Layer:**

- Purpose: Manage presentation mode, filters, and local UI state
- Location: `contexts/presentation-context.tsx`, `hooks/` directory
- Contains: React Context Provider, custom hooks (useState/useEffect/useMemo)
- Depends on: React hooks, client-side storage (localStorage)
- Used by: Client Components for real-time state updates

**Component Layer:**

- Purpose: Render UI and orchestrate user interactions
- Location: `components/` directory (organized by feature)
- Contains: Page components, feature modules (spotify, social-platforms, music-catalog), shadcn/ui primitives
- Depends on: React hooks, Framer Motion for animations, Recharts for visualizations
- Used by: App Router pages

**Utility & Helper Layer:**

- Purpose: Shared functions for formatting, calculations, and data transformation
- Location: `lib/utils.ts` (formatting), `lib/chart-data-transformer.ts` (chart data aggregation)
- Contains: Number formatting, growth calculations, chart data extraction
- Depends on: TypeScript types, date utilities (date-fns)
- Used by: Throughout component and data layers

## Data Flow

**Server-to-Client Initial Load:**

1. `app/(dashboard)/page.tsx` (Server Component) calls `getDashboardData()` and `getSpotifyTracksData()` in parallel
2. Data is validated with Zod schemas in `lib/api/dashboard-server.ts`
3. Spotify tracks are transformed from raw API format to `SpotifyMetrics` structure
4. Dashboard data is wrapped in Suspense and passed to `DashboardClient` component
5. `DashboardClient` receives data as props and memoizes it via hooks
6. Client-side hooks extract sub-metrics (e.g., followers, monthly listeners) for multi-performer charts

**Client-Side State Updates:**

1. `usePresentationMode()` hook manages fullscreen presentation state with auto-rotation intervals
2. `useFilters()` provides period filter state (today/7d/30d) scoped to sidebar
3. Components memoize filtered chart data via `useMemo()` to avoid recalculations
4. Animations trigger via Framer Motion when data or presentation state changes
5. Local storage persists presentation preferences across sessions

**Metric Aggregation:**

1. Raw API returns metrics as `Record<string, MetricData>` (platform-prefixed keys: "youtube_subscribers")
2. `transformMetrics()` maps API names to frontend names ("followers")
3. `extractMultiPerformerData()` extracts nested performer metrics for comparison charts
4. Chart components group by performer and date, handle missing data gracefully

**State Management:**

- **Global:** `PresentationContext` (presentation mode on/off)
- **Component-scoped:** React hooks for filters, playback state, rotation indices
- **Memoized:** Chart data extraction cached via `useMemo()` with dependencies

## Key Abstractions

**MetricData:**

- Purpose: Represent a single metric with latest value and historical entries
- Examples: `followers`, `monthly_listeners`, `post_count` in `lib/types/dashboard.ts`
- Pattern: All metrics follow `{ latest: number, entries: MetricEntry[] }` shape for consistency

**PlatformMetrics:**

- Purpose: Bundle platform-specific metrics (YouTube has views, Instagram has post_count)
- Examples: `spotify: { followers, monthly_listeners }`, `youtube: { followers, views, video_count }`
- Pattern: Optional fields allow adding platform-specific metrics without schema duplication

**PerformerData & CompanyData:**

- Purpose: Structure multi-platform data for a single performer or company
- Examples: Single performer has `spotify/youtube/instagram` platforms; Company has `performers` array
- Pattern: Company extends performer data with performers list and nested performer data

**SpotifyMetrics:**

- Purpose: Orchestrate Spotify-specific data (rankings, tracks, performers)
- Examples: `rankingsByPerformer` for top tracks per performer, `allTracks` for carousel rotation
- Pattern: Separated from general metrics to support Spotify's ranking + playlist features

**ChartDataPoint:**

- Purpose: Normalize metric entries into date-value pairs for Recharts visualization
- Examples: `{ date: "2026-01-30", value: 1000, previousValue: 950 }`
- Pattern: Aggregates multiple metric entries per day (handles multiple performers)

## Entry Points

**Unauthenticated Routes:**

- Location: `app/(auth)/login/page.tsx`, `app/(auth)/forgot-password/page.tsx`
- Triggers: User navigates to /login before authentication
- Responsibilities: Email/password validation, session creation via server action, TV device authorization

**Main Dashboard:**

- Location: `app/(dashboard)/page.tsx` (Server Component)
- Triggers: User navigates to / after login
- Responsibilities: Fetch dashboard + Spotify data, transform to frontend types, pass to DashboardClient

**Dashboard Subpages:**

- Location: `app/(dashboard)/musicas/page.tsx` (music catalog), `configuracoes/page.tsx` (settings), `relatorios/page.tsx` (reports)
- Triggers: Sidebar navigation
- Responsibilities: Display feature-specific UI (music registration, configuration, reports)

**TV Display:**

- Location: `app/tv/page.tsx`
- Triggers: TV device polls for display updates
- Responsibilities: Render fullscreen presentation without dashboard UI

**API Routes:**

- `app/api/health/route.ts`: Health check endpoint
- `app/api/championships/route.ts`: Fetch championship data
- `app/api/auth/tv/*`: TV device authentication flow (init, authorize, status)
- `app/api/proxy/[...path]/route.ts`: Proxy requests to backend API with auth headers

## Error Handling

**Strategy:** Graceful degradation with user-facing toast notifications

**Patterns:**

- **API Validation:** Zod `safeParse()` in `lib/api/dashboard-server.ts`; logs validation errors with context, returns null on failure
- **Form Validation:** Client-side regex + server action result checking (success/error fields) in `app/(auth)/login/page.tsx`
- **Network Errors:** Try/catch in Login form and TV auth flow; `sonner` toast notifications
- **Missing Data:** Components filter performers by empty rankings, fallback to undefined gracefully
- **Type Safety:** TypeScript strict mode prevents runtime type errors; Zod inferred types eliminate `any`

## Cross-Cutting Concerns

**Logging:**

- No centralized logger; console.error used for validation failures
- Example: `console.error('Dashboard validation failed:', result.error)` in `lib/api/dashboard-server.ts`

**Validation:**

- Zod schemas in `lib/api/schemas.ts` (single source of truth)
- Applied at API response boundary in `lib/api/dashboard-server.ts`
- Client-side form validation in login page via custom validators

**Authentication:**

- Server action `login(email, password)` in `lib/auth/actions.ts`
- Sets session cookie via `cookies().set()`
- Checked on protected routes via middleware (implied by route structure)
- TV device auth flow: init device → poll status → authorize on login

**Authorization:**

- Route-based via layout structure: `(auth)` and `(dashboard)` groups
- Dashboard layout wraps with `PresentationProvider` context
- No explicit permission checks; assumes authenticated users can view all data

---

_Architecture analysis: 2026-04-02_
