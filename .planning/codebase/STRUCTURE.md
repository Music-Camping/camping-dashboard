# Codebase Structure

**Analysis Date:** 2026-04-02

## Directory Layout

```
camping-dashboard/
├── app/                           # Next.js App Router (pages + API routes)
│   ├── (auth)/                    # Authentication routes (grouped, no layout prefix)
│   │   ├── login/
│   │   │   └── page.tsx           # Email/password login form
│   │   └── forgot-password/
│   │       └── page.tsx           # Password recovery
│   ├── (dashboard)/               # Protected dashboard routes (grouped with layout)
│   │   ├── layout.tsx             # Wraps with PresentationProvider
│   │   ├── page.tsx               # Main dashboard (server component, data fetching)
│   │   ├── musicas/
│   │   │   └── page.tsx           # Music catalog/registration
│   │   ├── relatorios/
│   │   │   └── page.tsx           # Reports view
│   │   └── configuracoes/
│   │       └── page.tsx           # Settings page
│   ├── api/                       # API routes (Next.js route handlers)
│   │   ├── health/
│   │   │   └── route.ts           # Health check endpoint
│   │   ├── auth/
│   │   │   ├── set-cookie/
│   │   │   │   └── route.ts       # Set session cookie
│   │   │   └── tv/                # TV device authentication flow
│   │   │       ├── init/
│   │   │       ├── authorize/
│   │   │       └── status/[deviceId]/
│   │   ├── championships/
│   │   │   └── route.ts           # Fetch championship data
│   │   ├── proxy/[...path]/
│   │   │   └── route.ts           # Proxy to backend API
│   │   └── revalidate/
│   │       └── route.ts           # ISR revalidation trigger
│   ├── tv/
│   │   └── page.tsx               # TV fullscreen display
│   ├── layout.tsx                 # Root layout (fonts, theme provider)
│   └── globals.css                # Global Tailwind styles
│
├── components/                    # React components (organized by feature)
│   ├── ui/                        # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── checkbox.tsx
│   │   ├── label.tsx
│   │   ├── field.tsx
│   │   └── ... (other UI components)
│   ├── dashboard/                 # Dashboard feature components
│   │   ├── dashboard-client.tsx   # Main client wrapper, routes presentation mode
│   │   ├── presentation-controls.tsx # Presentation mode controls (play, pause, rotation)
│   │   ├── metric-card.tsx        # Single metric display card
│   │   ├── metric-card-breakdown.tsx # Metric card with breakdown by performer
│   │   ├── metrics-chart.tsx      # Single-performer metric chart
│   │   ├── growth-chart.tsx       # Growth trend chart
│   │   ├── multi-performer-chart.tsx # Compare metrics across performers
│   │   ├── multi-performer-chart-wrapper.tsx # Wrapper for multi-performer chart
│   │   ├── chart-tooltip.tsx      # Recharts tooltip component
│   │   ├── spotify/               # Spotify-specific components
│   │   │   ├── spotify-hub.tsx    # Orchestrates all Spotify sections
│   │   │   ├── animated-top-tracks.tsx # Rotating top tracks carousel
│   │   │   ├── playlist-section.tsx # Display playlist info per performer
│   │   │   ├── playlist-comparison.tsx # Compare playlists
│   │   │   ├── top-rankings.tsx   # Top tracks ranking display
│   │   │   ├── top-rankings-presentation.tsx # Presentation mode ranking view
│   │   │   ├── top-cities-list.tsx # Top listening cities
│   │   │   └── monthly-listeners-chart.tsx # Monthly listeners trend
│   │   ├── social-platforms/      # YouTube and Instagram sections
│   │   │   ├── youtube-section.tsx # YouTube metrics and charts
│   │   │   └── instagram-section.tsx # Instagram metrics and charts
│   │   ├── championships/         # Championship/competition features
│   │   │   ├── championship-card.tsx
│   │   │   └── championships-section.tsx
│   │   └── music-catalog/         # Music registration table
│   │       ├── music-table.tsx    # Main table component
│   │       ├── columns.tsx        # React Table column definitions
│   │       ├── editable-cell.tsx  # Inline cell editing
│   │       ├── blurred-cell.tsx   # Blurred cell for privacy mode
│   │       └── delete-confirmation.tsx # Delete confirmation dialog
│   ├── presentation-mode/         # Fullscreen presentation components
│   │   ├── performer-presentation.tsx # Single performer fullscreen view
│   │   ├── performer-card.tsx    # Performer card (metrics summary)
│   │   ├── company-display.tsx   # Company/group view
│   │   └── social-metrics-card.tsx # Social platform metrics card
│   ├── musicas/
│   │   └── register-music-form.tsx # Music registration form
│   ├── sidebar.tsx                # Navigation sidebar with logout
│   ├── app-header.tsx             # Header with company/performer info
│   ├── theme-provider.tsx         # ThemeProvider wrapper (next-themes)
│   ├── theme-toggle.tsx           # Dark/light mode toggle button
│   └── example.tsx                # Example component (reference)
│
├── lib/                           # Utilities and shared logic
│   ├── api/
│   │   ├── dashboard-server.ts    # Server-side data fetching and transformation
│   │   └── schemas.ts             # Zod validation schemas (single source of truth)
│   ├── auth/
│   │   └── actions.ts             # Server actions (login, logout)
│   ├── types/
│   │   ├── dashboard.ts           # MetricData, PlatformMetrics, PerformerData, CompanyData
│   │   ├── spotify.ts             # SpotifyRanking, SpotifyMetrics, PerformerRanking
│   │   ├── filters.ts             # PeriodFilter type ("today" | "7d" | "30d")
│   │   ├── championships.ts       # Championship types
│   │   ├── music-catalog.ts       # Music track types
│   │   ├── spotify-tracks.ts      # Spotify-specific types
│   │   └── song-registration.ts   # Song registration form types
│   ├── hooks/
│   │   ├── use-presentation-mode.ts # Manage fullscreen presentation + auto-rotation
│   │   ├── use-filters.tsx        # FilterProvider + useFilters hook for period selection
│   │   ├── use-chart-data.ts      # Extract chart data from dashboard metrics
│   │   ├── use-spotify-data.ts    # Extract Spotify-specific data
│   │   ├── use-music-catalog.ts   # Music catalog CRUD operations
│   │   ├── use-championships.ts   # Fetch championship data
│   │   ├── use-mobile.ts          # Mobile device detection
│   │   ├── use-privacy-mode.ts    # Privacy/obfuscation mode toggle
│   │   └── use-local-storage.ts   # Persistent local storage hook
│   ├── chart-data-transformer.ts  # Transform API metrics into chart formats
│   ├── utils.ts                   # Formatting (numbers, dates), cn() helper
│   └── constants/                 # (if used; currently not visible)
│
├── contexts/
│   └── presentation-context.tsx   # PresentationProvider for global presentation mode state
│
├── hooks/                         # Deprecated? (see lib/hooks/ instead)
│   ├── use-presentation-mode.ts   # (likely moved to lib/hooks/)
│   └── ... (others)
│
├── .github/
│   └── workflows/                 # GitHub Actions CI/CD
│
├── mocks/                         # Mock data for development/testing
│
├── docker/                        # Docker configuration files
│   └── ... (Dockerfile, docker-compose.yml)
│
├── docs/                          # Documentation
│   └── ... (guides, PRPs)
│
├── PRPs/                          # Product Requirements/Planning documents
│   ├── templates/
│   │   └── prp_base.md            # Template for new PRPs
│   └── ... (specific feature PRPs)
│
├── package.json                   # Dependencies, scripts
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── .eslintrc.cjs                  # ESLint configuration
├── .prettierrc                    # Prettier formatting rules
├── .env                           # Environment variables (git-ignored)
├── .env.example                   # Template for required env vars
├── commitlint.config.js           # Commit message linting
├── .lintstagedrc.js               # Pre-commit hooks configuration
├── .husky/                        # Git hooks
└── .mcp.json                      # MCP configuration
```

## Directory Purposes

**app/**

- Purpose: Next.js App Router application structure (pages and API routes)
- Contains: Server Components, async pages, API handlers
- Key files: Root layout, page layouts, route handlers

**app/(auth)/**

- Purpose: Authentication pages (no layout prefix means no shared layout)
- Contains: Login and password recovery forms
- Key files: `login/page.tsx`, `forgot-password/page.tsx`

**app/(dashboard)/**

- Purpose: Protected dashboard pages (grouped with shared layout)
- Contains: Main dashboard, music catalog, settings, reports
- Key files: `layout.tsx` (wraps with PresentationProvider), `page.tsx` (main dashboard)

**app/api/**

- Purpose: API routes and handlers (Next.js route handlers)
- Contains: Health checks, authentication flows, proxy to backend, data revalidation
- Key files: Authentication routes, proxy handler, ISR revalidation trigger

**components/ui/**

- Purpose: Reusable shadcn/ui primitive components
- Contains: Button, Card, Input, Select, Dropdown, Dialog, Badge, etc.
- Key files: All follow shadcn pattern with className composition and CVA variants

**components/dashboard/**

- Purpose: Dashboard-specific feature components
- Contains: Metric cards, charts (single/multi-performer), platform-specific sections
- Key files: `dashboard-client.tsx` (main orchestrator), `spotify/spotify-hub.tsx`, social platform sections

**components/presentation-mode/**

- Purpose: Fullscreen presentation mode views
- Contains: Performer/company display cards, metrics summary for presentation
- Key files: `performer-presentation.tsx`, `company-display.tsx`

**lib/api/**

- Purpose: Server-side API interaction and data transformation
- Contains: Data fetching functions, Zod schemas for validation
- Key files: `dashboard-server.ts` (transforms API responses), `schemas.ts` (validation rules)

**lib/types/**

- Purpose: TypeScript type definitions (all exported, imported across codebase)
- Contains: Domain types (MetricData, PlatformMetrics, PerformerData, SpotifyMetrics)
- Key files: `dashboard.ts` (core types), `spotify.ts` (Spotify-specific)

**lib/hooks/**

- Purpose: Custom React hooks for state management and data extraction
- Contains: Presentation mode logic, filter state, chart data extraction, API calls
- Key files: `use-presentation-mode.ts` (auto-rotation), `use-filters.tsx` (period selection)

**contexts/**

- Purpose: React Context providers for global state
- Contains: Only PresentationContext (presentation mode on/off)
- Key files: `presentation-context.tsx`

## Key File Locations

**Entry Points:**

- `app/layout.tsx`: Root layout with fonts, theme provider, toaster
- `app/(dashboard)/layout.tsx`: Dashboard layout with sidebar and PresentationProvider
- `app/(dashboard)/page.tsx`: Main dashboard (server component, data fetching)
- `app/(auth)/login/page.tsx`: Login page (server component wraps Suspense boundary)
- `app/tv/page.tsx`: TV fullscreen display

**Configuration:**

- `next.config.ts`: Image remote patterns (Spotify, Instagram, backend)
- `tsconfig.json`: TypeScript strict mode, path aliases (@/)
- `tailwind.config.ts`: Tailwind CSS configuration
- `.eslintrc.cjs`: ESLint with Airbnb + TypeScript config
- `.prettierrc`: Prettier auto-formatting rules
- `package.json`: Dependencies and scripts (dev, build, lint, type-check)

**Core Logic:**

- `lib/api/dashboard-server.ts`: Fetch and transform dashboard + Spotify data
- `lib/api/schemas.ts`: Zod validation schemas for all API responses
- `lib/auth/actions.ts`: Server actions for login/logout
- `lib/chart-data-transformer.ts`: Extract metric data for chart visualization
- `lib/utils.ts`: Formatting (numbers) and styling (cn helper)

**Hooks:**

- `lib/hooks/use-presentation-mode.ts`: Fullscreen presentation + auto-rotation
- `lib/hooks/use-filters.tsx`: Period filter state (today/7d/30d)
- `lib/hooks/use-chart-data.ts`: Extract chart data from dashboard metrics
- `lib/hooks/use-spotify-data.ts`: Extract Spotify-specific metrics

**Testing:**

- No unit/integration tests; validation via `npm run build`, `npm run lint`, `npm run type-check`
- Manual testing in dev server (`npm run dev`)

## Naming Conventions

**Files:**

- React Components: PascalCase, `.tsx` extension (e.g., `SpotifyHub.tsx`, `MetricCard.tsx`)
- Server files: lowercase, `.ts` extension (e.g., `dashboard-server.ts`, `schemas.ts`)
- Config files: lowercase (e.g., `tsconfig.json`, `.eslintrc.cjs`)
- API routes: route handler pattern (e.g., `app/api/health/route.ts`)

**Directories:**

- Feature directories: kebab-case (e.g., `social-platforms/`, `music-catalog/`)
- Type directories: `types/`
- Utility directories: `lib/`, `hooks/`, `contexts/`
- Route group directories: parentheses (e.g., `(auth)`, `(dashboard)`)

**Components:**

- PascalCase in files and exports (e.g., `DashboardClient`, `SpotifyHub`)
- Interfaces with compound names: `SpotifyHubProps`, `PresentationModeState`

**Types:**

- `Type` suffix for exported interfaces (e.g., `DashboardResponse`, `MetricEntry`)
- `Schema` suffix for Zod schemas (e.g., `MetricDataSchema`, `PlatformMetricsSchema`)

## Where to Add New Code

**New Feature (e.g., new social platform or metric):**

- Primary code: `components/dashboard/<feature>/` (new subdirectory)
- Types: Add to `lib/types/<feature>.ts` or extend existing type file
- Hooks: Add to `lib/hooks/use-<feature>.ts` if complex state
- Tests: No test infrastructure; rely on build/lint validation
- Example: Adding TikTok platform → `components/dashboard/tiktok-section.tsx`, extend `PlatformMetrics` type

**New Chart Visualization:**

- Implementation: `components/dashboard/<chart-name>.tsx`
- Data extraction: Add function to `lib/chart-data-transformer.ts`
- Hook: Use existing `use-chart-data()` or create specialized hook if needed
- Example: New ranking chart → `TopPerformersChart.tsx` using data from `extractMultiPerformerData()`

**New API Endpoint:**

- Route handler: `app/api/<feature>/route.ts`
- Validation: Add schema to `lib/api/schemas.ts`
- Data fetching: If server-side transform needed, add function to `lib/api/dashboard-server.ts`
- Example: New metrics endpoint → `app/api/metrics/route.ts`, add `MetricsSchema` to schemas

**New Server Action:**

- Location: `lib/auth/actions.ts` (for auth) or create new `lib/actions/<feature>.ts`
- Validation: Use Zod schema from `lib/api/schemas.ts`
- Error handling: Return `{ success: boolean, error?: string }` result object
- Example: Music registration → `registerMusic(formData)` in `lib/actions/music.ts`

**Utilities & Helpers:**

- Number formatting, string manipulation: Add to `lib/utils.ts`
- Chart data transformation: Add to `lib/chart-data-transformer.ts`
- Shared constants: Create `lib/constants.ts` if needed
- Custom hooks: Create in `lib/hooks/use-<name>.ts` (always co-located with usage)

**Shared Components:**

- Reusable across features: `components/<name>.tsx` (top-level in components/)
- Feature-specific: `components/<feature>/<name>.tsx`
- UI primitives: Already in `components/ui/` (shadcn/ui); only extend if custom behavior needed

## Special Directories

**node_modules/:**

- Purpose: Installed dependencies (npm packages)
- Generated: Yes (via `pnpm install`)
- Committed: No (in .gitignore)

**.next/:**

- Purpose: Next.js build output and cache
- Generated: Yes (via `npm run build` or dev server)
- Committed: No (in .gitignore)

**docs/ & PRPs/:**

- Purpose: Project documentation and planning documents
- Generated: No (manually created)
- Committed: Yes (reference materials for future work)

---

_Structure analysis: 2026-04-02_
