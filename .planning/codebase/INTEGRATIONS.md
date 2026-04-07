# External Integrations

**Analysis Date:** 2026-04-02

## APIs & External Services

**Backend API (Primary):**

- Service: Custom camping/metrics backend API
  - Base URL: `process.env.API_URL` (defaults to `http://localhost:3001`)
  - Auth: Bearer token stored in `access_token` HTTP-only cookie
  - Endpoints:
    - `POST /auth/login` - User authentication
    - `POST /auth/tv/init` - TV device pairing initialization
    - `POST /auth/tv/authorize` - TV device authorization
    - `GET /auth/tv/status/{deviceId}` - TV device status polling
    - `GET /api/dashboard` - Metrics dashboard data (performers, companies)
    - `GET /api/spotify` - Spotify artist metrics
    - `GET /api/spotify/tracks` - Spotify track rankings
    - `GET /api/championships` - Competition/championship data
    - `GET /api/dashboard/songs` - Music catalog

**Spotify (Indirect):**

- Integration: Metrics and media served through backend API
  - Image CDN: `**.scdn.co`, `**.spotifycdn.com` (configured in `next.config.ts`)
  - Metrics tracked: followers, monthly listeners, top city listeners
  - Media: Playlist thumbnails, track artwork

**Campingviral (Internal):**

- Integration: Image asset CDN
  - URL pattern: `api.campingviral.com.br/*` (configured in `next.config.ts`)
  - Purpose: Company/performer profile images, banners

## Data Storage

**Databases:**

- Not applicable - This is a frontend/BFF dashboard
- Backend database location: Configured at `process.env.API_URL` (not exposed to frontend)

**File Storage:**

- Strategy: Remote image URLs from Spotify CDN and Campingviral API
- Local storage: `localStorage` via `use-local-storage.ts` hook for UI preferences (filters, etc.)
- No file uploads handled directly by frontend

**Caching:**

- Client-side: SWR (Stale-While-Revalidate) with configurable intervals
  - Dashboard data: 10 minute refresh interval
  - Deduplication: 60 second window
  - Focus/reconnect revalidation: Disabled
- Server-side: Next.js ISR (Incremental Static Regeneration)
  - Dashboard ISR interval: 3 hours (10800 seconds)
  - Revalidation trigger: POST `/api/revalidate` with `x-revalidate-secret` header

## Authentication & Identity

**Auth Provider:**

- Custom backend (email/password)
  - Implementation: `lib/auth/actions.ts` server action
  - Login endpoint: `POST {API_URL}/auth/login`
  - Payload: `{ email, password }`
  - Response: `{ access_token, expires_in }`

**TV Device Authorization:**

- Device pairing flow via backend:
  - Init: `POST {API_URL}/auth/tv/init` → Returns device code
  - Authorize: `POST {API_URL}/auth/tv/authorize` with authorization code
  - Status polling: `GET {API_URL}/auth/tv/status/{deviceId}`

**Token Management:**

- Storage: HTTP-only secure cookie `access_token`
  - Name: `access_token`
  - Secure: Only in production (`process.env.NODE_ENV === "production"`)
  - SameSite: Lax
  - Max-Age: From response (`expires_in` field)
- Expiration handling: Client-side redirect to `/login` on 401 response (in `lib/hooks/dashboard.ts`)

**API Key Auth (Championships):**

- Endpoint-specific key: `process.env.API_KEY`
- Usage: `X-API-Key` header in `app/api/championships/route.ts`
- Only used for championships endpoint

## Monitoring & Observability

**Error Tracking:**

- Not detected - Errors logged to console only
- Pattern: `console.error()` for API failures (see `lib/api/dashboard-server.ts`)

**Logs:**

- Client-side: Browser console via `useDashboard()` SWR hook
- Server-side: Node.js console output
- No structured logging framework detected

**Health Check:**

- Endpoint: `GET /api/health` (returns `{ status: "ok" }`)
- Purpose: Simple liveness probe for load balancers/containers

## CI/CD & Deployment

**Hosting:**

- Next.js standalone mode: `output: "standalone"` in `next.config.ts`
- Deployment target: Docker container or Node.js hosting
- Build output: `.next/` directory

**CI Pipeline:**

- Not detected - Validation via local npm scripts only:
  - `npm run type-check` - TypeScript strict checking
  - `npm run lint` - ESLint validation (max 10 warnings)
  - `npm run build` - Next.js production build

**Revalidation:**

- Webhook endpoint: `POST /api/revalidate`
- Authentication: `x-revalidate-secret` header must match `process.env.REVALIDATE_SECRET`
- Effect: Triggers `revalidatePath("/")` to refresh ISR cache
- Use case: Invalidate dashboard cache after backend data updates

## Environment Configuration

**Required env vars:**

- `API_URL` - Backend API base URL (required for all data endpoints)
- `REVALIDATE_SECRET` - Secret for cache invalidation webhook (required for `/api/revalidate`)
- `API_KEY` - API key for championships endpoint (required for championships API)
- `NODE_ENV` - Controls secure cookie behavior (defaults to development)

**Secrets location:**

- `.env.local` (git-ignored) - Local development secrets
- Environment variables in hosting platform - Production secrets
- Cookie storage: HTTP-only secure cookies (server-side only)

## Webhooks & Callbacks

**Incoming:**

- `POST /api/revalidate` - Cache invalidation webhook from backend
  - Triggered after: Company/performer data updates, championship changes
  - Authentication: `x-revalidate-secret` header

**Outgoing:**

- Not detected - Frontend does not send webhooks to external services
- Backend handles all outbound integrations with Spotify and other platforms

## API Response Validation

**Zod Schemas:**

- Location: `lib/api/schemas.ts` - Single source of truth for all response shapes
- Validation function: `validateData<T>(data, schema, context)`
- Schemas defined:
  - `MetricDataSchema` - Latest value + historical entries
  - `PlatformMetricsSchema` - Platform-specific metric structures
  - `PerformerDataSchema` - Individual performer aggregates
  - `CompanyDataSchema` - Company-wide totals and metadata
  - `RawApiResponseSchema` - Nested API response validation
  - `SpotifyPlaylistDataSchema` - Playlist structure validation

**Data Transformation:**

- Location: `lib/api/dashboard-server.ts` functions:
  - `transformMetrics()` - Maps API metric names to frontend names
  - `transformPerformerMetrics()` - Flattens platform metrics
  - `processCompanyAndPerformers()` - Normalizes nested API response to flat structure
  - `aggregatePerformerInto()` - Aggregates performer metrics to company totals

**Metric Name Mappings:**

```typescript
YouTube:  youtube_subscribers → followers
          youtube_total_views → views
          youtube_video_count → video_count
Instagram: instagram_followers → followers
           instagram_posts_count → post_count
Spotify:  spotify_monthly_listeners → monthly_listeners
          spotify_followers → followers
          spotify_playlist_followers → followers
          spotify_playlist_total_tracks → track_count
```

## Client-Side Data Fetching

**SWR Hooks:**

- `useDashboard()` - Fetches dashboard data
  - Endpoint: `/api/proxy/api/dashboard`
  - Refresh interval: 10 minutes
  - Dedup window: 60 seconds
  - No auto-revalidate on focus/reconnect

- Custom hook pattern (in `lib/hooks/`):
  - `useSpotify()` - Spotify metrics
  - `useChampionships()` - Championship data
  - `useMusicCatalog()` - Music catalog
  - `useSongRegistration()` - Song registration status

**Proxy Pattern:**

- All client-side requests route through `/api/proxy/[...path]` (in `app/api/proxy/[...path]/route.ts`)
- Proxy automatically:
  - Attaches `access_token` cookie to backend request
  - Adds `Authorization: Bearer {token}` header
  - Handles 401 redirects to `/login`
  - Forwards query parameters and request body

## Data Flow Summary

1. **Authentication:**
   - User logs in via `/login` page → calls `login(email, password)` server action
   - Backend validates, returns `access_token` + `expires_in`
   - Token stored in HTTP-only cookie with max-age from server

2. **Dashboard Load:**
   - Server-side: `getDashboardData()` fetches from `{API_URL}/api/dashboard` with bearer token
   - Response validated against `RawApiResponseSchema`
   - Data transformed via `processCompanyAndPerformers()` → flat structure
   - Rendered as React component

3. **Client-Side Data Updates:**
   - Components use `useDashboard()` hook
   - SWR fetches from `/api/proxy/api/dashboard` (10 min refresh)
   - Proxy adds auth header, frontend receives validated data

4. **Cache Invalidation:**
   - Backend updates trigger webhook to `/api/revalidate?secret=...`
   - Next.js invalidates ISR cache for `/`
   - Next page load fetches fresh data from backend

---

_Integration audit: 2026-04-02_
