<!-- GSD:project-start source:PROJECT.md -->

## Project

**Camping Dashboard**

A multi-platform metrics dashboard for music companies that aggregates social media data (Spotify, YouTube, Instagram) across performers. Features a presentation mode designed for TV displays with auto-rotation, fullscreen support, and company-level metric aggregation. Built with Next.js 16, React 19, Tailwind CSS 4, and shadcn/ui.

**Core Value:** Company stakeholders can view aggregated performer metrics on TV screens at a glance — clear, proportional, always-on display.

### Constraints

- **Tech stack**: Next.js 16 + Tailwind CSS 4 — established, no changes
- **CSS approach**: Pure CSS/Tailwind for TV scaling (no JS resize listeners) — CSS Grid with viewport units
- **API contract**: Backend response format is fixed — changes are frontend-only
- **Browser**: Modern Chromium on smart TVs / casting devices
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 5 - Full codebase with strict mode enabled (`strict: true` in `tsconfig.json`)
- JavaScript (ES2017 target) - Bundled through Next.js
- JSX/TSX - React component files and App Router layouts

## Runtime

- Node.js (version specified in `.nvmrc` as "node")
- npm (primary) - Scripts defined in `package.json`
- Lock file: `package-lock.json` (inferred from npm usage)

## Frameworks

- Next.js 16.1.1 - Full-stack React framework with App Router, server/client components
- React 19.2.3 - UI library with concurrent rendering
- Tailwind CSS 4 - Utility-first CSS framework
- Tailwind CSS PostCSS 4 - Next generation Tailwind with CSS bundling
- shadcn/ui 3.6.2 - Component library built on Radix UI
- Framer Motion 12.34.0 - Animation library for transitions and motion effects
- Radix UI 1.4.3 - Headless UI primitives (base layer for shadcn)
- class-variance-authority 0.7.1 - Component variant management
- Recharts 3.7.0 - React charting library for dashboards
- React Hook Form 7.71.2 - Form state management and validation
- @hookform/resolvers 5.2.2 - Schema validation integrations
- @tanstack/react-table 8.21.3 - Headless table library for data grids
- react-simple-maps 3.0.0 - SVG maps component
- lucide-react 0.562.0 - Icon library
- sonner 2.0.7 - Toast notifications
- qrcode.react 4.2.0 - QR code generation
- next-themes 0.4.6 - Theme switching (light/dark)
- @base-ui/react 1.0.0 - Low-level UI component library

## Key Dependencies

- zod 3.25.76 - TypeScript-first schema validation (validates API responses)
- swr 2.3.8 - Data fetching client library with caching
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.0 - Merges Tailwind classes without conflicts
- date-fns 4.1.0 - Date/time utilities
- git-cz 4.9.0 - Commitizen adapter for conventional commits
- tw-animate-css 1.4.0 - Additional Tailwind animation utilities

## Testing

## Linting & Code Quality

- ESLint 8.57.1 - JavaScript/TypeScript linter
- @typescript-eslint/eslint-plugin 7.18.0 - TypeScript rules
- @typescript-eslint/parser 7.18.0 - TypeScript parser
- eslint-config-airbnb 19.0.4 - Airbnb style guide (extended for TypeScript)
- eslint-config-airbnb-typescript 18.0.0 - Airbnb rules for TypeScript
- eslint-plugin-react 7.37.5 - React linting rules
- eslint-plugin-react-hooks 4.6.0 - React hooks rules
- eslint-plugin-jsx-a11y 6.10.2 - Accessibility rules
- eslint-plugin-import 2.32.0 - Import/export linting
- eslint-plugin-simple-import-sort 12.1.1 - Import sorting
- eslint-plugin-unused-imports 4.3.0 - Unused import detection
- eslint-config-prettier 10.1.8 - Prettier integration
- eslint-import-resolver-typescript 3.7.0 - TypeScript module resolution
- Prettier 3.7.4 - Code formatter
- prettier-plugin-tailwindcss 0.7.2 - Tailwind class sorting
- Husky 9.1.7 - Git hook framework
- lint-staged 16.2.7 - Pre-commit linting
- @commitlint/cli 20.3.1 - Commit message linting
- @commitlint/config-conventional 20.3.1 - Conventional commits config

## Build & Dev Tools

- cross-env 7.0.3 - Cross-platform environment variables
- rimraf 6.0.1 - Cross-platform rm -rf utility
- npm-run-all2 6.1.1 - Run multiple npm scripts
- TypeScript 5 - Type checking and compilation
- @types/node 20 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions
- @types/qrcode.react 3.0.0 - QR code library types

## Configuration

- `.env` file pattern (not committed) - Contains `API_URL`, `API_KEY`, `REVALIDATE_SECRET`
- Default `API_URL`: `http://localhost:3001` (fallback in `lib/api/dashboard-server.ts`)
- `NODE_ENV`: Controls secure cookie settings (`production` enables `secure: true`)
- `tsconfig.json`: Strict mode enabled, ES2017 target, JSX react-jsx, path alias `@/*`
- 80 character print width
- 2 space indentation
- Semicolons enabled
- Single quotes disabled
- Trailing commas all
- Tailwind class sorting enabled
- Extends Airbnb + Airbnb TypeScript + Prettier
- Max warnings: 10 per lint run
- Custom rules: Consistent type imports, no unused imports
- Warnings for accessibility rules (click events, img redundant alt)
- Output mode: `standalone` (self-contained build)
- Remote image patterns (Spotify, Campingviral APIs)
- Allows images from:
- Scans content from `app/`, `components/`, `lib/` directories

## Platform Requirements

- Node.js (version from `.nvmrc`)
- npm 6+
- Git (for Husky hooks)
- Node.js 18+ (Next.js 16 requirement)
- Deployment: Standalone Docker or Node.js hosting
- Memory: Moderate (Next.js SSR + in-memory caching via SWR)
- Environment variables: `API_URL`, `API_KEY`, `REVALIDATE_SECRET` required
- Backend API at `process.env.API_URL`
- Spotify CDN for image assets
- Campingviral API for image assets
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Components: `PascalCase.tsx` (e.g., `SpotifyHub.tsx`, `MetricCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `chart-data-transformer.ts`, `use-local-storage.ts`)
- Hooks: `kebab-case.ts` with `use-` prefix (e.g., `use-local-storage.ts`)
- Types: `kebab-case.ts` (e.g., `dashboard.ts`, `spotify.ts`)
- Server files: `kebab-case-server.ts` (e.g., `dashboard-server.ts`)
- Exported functions: `camelCase` (e.g., `calculateGrowth`, `formatCompactNumber`, `extractMultiPerformerData`)
- React components: `PascalCase` (e.g., `SpotifyHub`, `MetricCard`, `AnimatedTopTracks`)
- Private/internal functions: `camelCase` with comments indicating scope (e.g., `transformMetrics`, `consolidateMultiPerformerData`)
- Constants: `UPPER_SNAKE_CASE` for module-level constants (e.g., `PERFORMER_COLORS`, `REVALIDATE_TIME`)
- Variables and parameters: `camelCase` (e.g., `currentPerformerIndex`, `validPerformers`, `totalValue`)
- Boolean variables: `is-` or `has-` prefix (e.g., `isPositive`, `isPaused`, `hasPlaylistData`)
- Type definitions: `PascalCase` (e.g., `MetricEntry`, `SpotifyMetrics`, `PerformerRanking`)
- Interface names: `PascalCase` suffix with `Props` for component props (e.g., `SpotifyHubProps`, `MetricCardProps`)
- Zod schemas: `PascalCase` suffix with `Schema` (e.g., `MetricEntrySchema`, `DashboardResponseSchema`)

## Code Style

- Tool: Prettier 3.7.4
- Line width: 80 characters
- Indentation: 2 spaces (spaces, not tabs)
- Semicolons: Always required
- Trailing commas: All (trailing commas in arrays and objects)
- Quotes: Double quotes for strings (`"text"`, not `'text'`)
- Arrow parens: Always required (e.g., `(arg) => expr`, not `arg => expr`)
- Tool: ESLint 8.57.1 with Airbnb config
- Max warnings: 10 per lint run (configured in `npm run lint`)
- Auto-fix enabled in git hooks via `eslint --fix`
- TypeScript strict mode: Enabled
- Configuration file: `.eslintrc.cjs`
- `@typescript-eslint/consistent-type-imports`: Error - Use `import type` for types
- `unused-imports/no-unused-imports`: Error - No unused imports allowed
- `eqeqeq`: Error with null override - Use `===` except for null checks (`== null`)
- `react/react-in-jsx-scope`: Off - Not needed with React 19
- `react/jsx-props-no-spreading`: Off - Allowed for flexibility
- `react/prop-types`: Off - TypeScript handles prop validation
- `react/no-array-index-key`: Warn - Index keys allowed but discouraged

## Import Organization

- `@/*` → Root directory (configured in `tsconfig.json`)
- All internal imports use absolute path aliases (e.g., `@/components/ui/button`, `@/lib/types/dashboard`)
- No relative imports (`../../../components/...`) in codebase
- Always use `import type` for type-only imports: `import type { MetricEntry } from "@/lib/types/dashboard"`
- Mixed imports use `import type { TypeA } from "..."; import { functionA } from "...";` on separate lines
- Enforced by ESLint rule `@typescript-eslint/consistent-type-imports`

## Error Handling

- **API errors**: Log with context tag `[API Error]` or `[API Validation Error]`, include endpoint and preview of response
- **Try-catch blocks**: Always catch errors; return sensible defaults (`null`, `[]`, `{}`) instead of throwing
- **Silent failures**: Acceptable for localStorage operations, graceful fallback to initial value
- **Validation errors**: Use Zod schemas; log validation failures with `console.error` (disabled in prod via linting)
- **Console logging**: Prefix with context (e.g., `[API Error]`) for filtering; prefix errors with module context

## Logging

- **Error logging**: Always include context tag in square brackets: `console.error("[API Error] ...", error);`
- **Validation logging**: Use dedicated `validateData()` helper in `lib/api/schemas.ts`
- **Disabled in CI/linting**: All `console.*` calls must be disabled via `// eslint-disable-next-line no-console` comment
- **When to log**: Errors in API calls, validation failures, missing tokens/auth
- **What to log**: Context string, error object or preview of problematic data (truncate large responses to 200 chars)
- **What NOT to log**: Secrets, auth tokens, sensitive user data

## Comments

- Complex logic: Explain the "why" not the "what" (code shows what, comments explain decision)
- Non-obvious behavior: Timezone conversions, edge cases, workarounds
- API transformations: Document format changes from external APIs
- TODO/FIXME: Use sparingly; prefer creating issues
- Never comment obvious code: `const x = 5; // Set x to 5` ❌
- Used for exported functions, especially server-side functions
- Format: `/** Multi-line comment describing what function does */`
- Include parameter descriptions for complex parameters
- Required for: Public API functions, data transformation functions, server actions
- Use sparingly; prefer self-documenting code
- Explain non-obvious datetime/timezone logic, browser compatibility quirks
- Use `//` for single-line comments within functions

## Function Design

- Prefer functions under 50 lines (excluding comments)
- Extract complex logic into separate named functions
- Use utility functions in `lib/utils.ts` or `lib/api/schemas.ts` for reusable logic
- Prefer object destructuring for >2 parameters
- Use typed interfaces for component props
- Provide default values for optional parameters
- **Components**: Return JSX.Element
- **Data fetching**: Return `null` on error, typed data on success
- **Utilities**: Return typed values; use generics for reusable utilities like `validateData<T>`
- **Hooks**: Return tuples `[state, setter]` for state hooks; destructure on use

## Module Design

- Use named exports for functions and components: `export function MyComponent() { ... }`
- Types are exported alongside implementations: `export interface Props { ... }`
- Barrel files: Not used in this codebase; import directly from specific files
- Props interface defined at top of file: `interface ComponentNameProps { ... }`
- Component function defined after interfaces
- Helper functions defined before main component (private functions)
- Export statement at end of file
- Props include data and callbacks; avoid importing singleton state
- Callbacks passed as props: `onTogglePause?: () => void; onIndexChange?: (index: number) => void`

## React Patterns

- Always include dependency arrays in hooks
- Keep separate state atoms for independent concerns
- Initialize with sensible defaults
- Use for expensive calculations or creating new objects/arrays
- Include all external variables in dependency array
- Validate with ESLint hook rules
- Always return cleanup function for intervals/listeners
- Include complete dependency array (no empty arrays unless intentional SSR)
- Mark with `"use client"` at top of file
- Use only in `components/` directory for interactive features
- Server components at `app/` level for data fetching

## Tailwind CSS & Styling

- Use Tailwind's utility classes in logical order
- Prettier plugin `prettier-plugin-tailwindcss` auto-sorts classes
- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Use Tailwind utilities whenever possible
- Dark mode: Use `dark:` prefix for dark theme classes (e.g., `dark:bg-green-900`)
- Colors: Standard Tailwind palette; avoid hardcoded hex values
- Icons: lucide-react icons with `size-` utility (e.g., `size-4`, `size-6`)
- Import from `@/components/ui/` (not npm packages)
- Use component props for styling when possible
- Extend with Tailwind classes when needed
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## Pattern Overview

- Server Component pages with Suspense boundaries for data loading
- Client-side feature components with React hooks and context
- Shared Zod schemas for API validation (single source of truth)
- Multi-platform metrics aggregation (Spotify, YouTube, Instagram)
- Presentation mode with auto-rotation and fullscreen support

## Layers

- Purpose: Fetch and validate external data, serve as backend proxy
- Location: `app/api/` (Next.js route handlers) and `lib/api/` (data fetching functions)
- Contains: API routes, server actions, Zod schemas for validation
- Depends on: External APIs (backend at `BACKEND_URL`), Node.js cookies API
- Used by: Server Components and Client Components via props/fetch
- Purpose: Transform raw API responses into frontend-typed structures
- Location: `lib/api/dashboard-server.ts` (server-side transformers), `lib/types/` (type definitions)
- Contains: Metric transformation, playlist data aggregation, company/performer data mapping
- Depends on: Zod schemas (`lib/api/schemas.ts`), TypeScript types
- Used by: Server Components to populate initial data
- Purpose: Manage presentation mode, filters, and local UI state
- Location: `contexts/presentation-context.tsx`, `hooks/` directory
- Contains: React Context Provider, custom hooks (useState/useEffect/useMemo)
- Depends on: React hooks, client-side storage (localStorage)
- Used by: Client Components for real-time state updates
- Purpose: Render UI and orchestrate user interactions
- Location: `components/` directory (organized by feature)
- Contains: Page components, feature modules (spotify, social-platforms, music-catalog), shadcn/ui primitives
- Depends on: React hooks, Framer Motion for animations, Recharts for visualizations
- Used by: App Router pages
- Purpose: Shared functions for formatting, calculations, and data transformation
- Location: `lib/utils.ts` (formatting), `lib/chart-data-transformer.ts` (chart data aggregation)
- Contains: Number formatting, growth calculations, chart data extraction
- Depends on: TypeScript types, date utilities (date-fns)
- Used by: Throughout component and data layers

## Data Flow

- **Global:** `PresentationContext` (presentation mode on/off)
- **Component-scoped:** React hooks for filters, playback state, rotation indices
- **Memoized:** Chart data extraction cached via `useMemo()` with dependencies

## Key Abstractions

- Purpose: Represent a single metric with latest value and historical entries
- Examples: `followers`, `monthly_listeners`, `post_count` in `lib/types/dashboard.ts`
- Pattern: All metrics follow `{ latest: number, entries: MetricEntry[] }` shape for consistency
- Purpose: Bundle platform-specific metrics (YouTube has views, Instagram has post_count)
- Examples: `spotify: { followers, monthly_listeners }`, `youtube: { followers, views, video_count }`
- Pattern: Optional fields allow adding platform-specific metrics without schema duplication
- Purpose: Structure multi-platform data for a single performer or company
- Examples: Single performer has `spotify/youtube/instagram` platforms; Company has `performers` array
- Pattern: Company extends performer data with performers list and nested performer data
- Purpose: Orchestrate Spotify-specific data (rankings, tracks, performers)
- Examples: `rankingsByPerformer` for top tracks per performer, `allTracks` for carousel rotation
- Pattern: Separated from general metrics to support Spotify's ranking + playlist features
- Purpose: Normalize metric entries into date-value pairs for Recharts visualization
- Examples: `{ date: "2026-01-30", value: 1000, previousValue: 950 }`
- Pattern: Aggregates multiple metric entries per day (handles multiple performers)

## Entry Points

- Location: `app/(auth)/login/page.tsx`, `app/(auth)/forgot-password/page.tsx`
- Triggers: User navigates to /login before authentication
- Responsibilities: Email/password validation, session creation via server action, TV device authorization
- Location: `app/(dashboard)/page.tsx` (Server Component)
- Triggers: User navigates to / after login
- Responsibilities: Fetch dashboard + Spotify data, transform to frontend types, pass to DashboardClient
- Location: `app/(dashboard)/musicas/page.tsx` (music catalog), `configuracoes/page.tsx` (settings), `relatorios/page.tsx` (reports)
- Triggers: Sidebar navigation
- Responsibilities: Display feature-specific UI (music registration, configuration, reports)
- Location: `app/tv/page.tsx`
- Triggers: TV device polls for display updates
- Responsibilities: Render fullscreen presentation without dashboard UI
- `app/api/health/route.ts`: Health check endpoint
- `app/api/championships/route.ts`: Fetch championship data
- `app/api/auth/tv/*`: TV device authentication flow (init, authorize, status)
- `app/api/proxy/[...path]/route.ts`: Proxy requests to backend API with auth headers

## Error Handling

- **API Validation:** Zod `safeParse()` in `lib/api/dashboard-server.ts`; logs validation errors with context, returns null on failure
- **Form Validation:** Client-side regex + server action result checking (success/error fields) in `app/(auth)/login/page.tsx`
- **Network Errors:** Try/catch in Login form and TV auth flow; `sonner` toast notifications
- **Missing Data:** Components filter performers by empty rankings, fallback to undefined gracefully
- **Type Safety:** TypeScript strict mode prevents runtime type errors; Zod inferred types eliminate `any`

## Cross-Cutting Concerns

- No centralized logger; console.error used for validation failures
- Example: `console.error('Dashboard validation failed:', result.error)` in `lib/api/dashboard-server.ts`
- Zod schemas in `lib/api/schemas.ts` (single source of truth)
- Applied at API response boundary in `lib/api/dashboard-server.ts`
- Client-side form validation in login page via custom validators
- Server action `login(email, password)` in `lib/auth/actions.ts`
- Sets session cookie via `cookies().set()`
- Checked on protected routes via middleware (implied by route structure)
- TV device auth flow: init device → poll status → authorize on login
- Route-based via layout structure: `(auth)` and `(dashboard)` groups
- Dashboard layout wraps with `PresentationProvider` context
- No explicit permission checks; assumes authenticated users can view all data
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.

<!-- GSD:profile-end -->
