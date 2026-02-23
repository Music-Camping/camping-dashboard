# PRP: Spotify Playlist Section & Conditional Platform Rendering

---

## Goal

**Feature Goal**: Add a Spotify Playlists section to the dashboard (normal + TV mode) and make every platform section render conditionally — only when real data (`latest > 0`) exists for that platform/metric.

**Deliverable**:

1. New `PlaylistSection` component (`components/dashboard/spotify/playlist-section.tsx`)
2. Updated types in `lib/types/dashboard.ts` and `lib/types/spotify.ts`
3. Exported `buildChartPoints` utility from `hooks/use-chart-data.ts`
4. Updated `MetricCardWithBreakdown` to filter `value === 0` breakdown items
5. Updated `PlaylistComparison` to use new types
6. Updated `SpotifyHub` with conditional sub-sections (Artists + Playlists)
7. Updated `DashboardClient` with conditional YouTube/Instagram rendering + TV mode playlist block

**Success Definition**:

- If no performer has `spotify_playlists` in API response → Playlists sub-section is completely absent from DOM
- If no performer has YouTube data → `YouTubeSection` is not rendered
- If no performer has Instagram data → `InstagramSection` is not rendered
- `MetricCardWithBreakdown` never shows a performer with `value: 0` in the breakdown list
- Build passes: `npm run build` with zero TypeScript errors

---

## Why

- Dashboards currently show performers in breakdowns even when they have zero data, creating misleading UI
- Spotify now supports two profile types (artist + playlist); the dashboard only showed artist data
- Cleaner rendering avoids visual noise for sections with no real data

---

## What

### User-Visible Behavior

1. **Normal mode — Playlists sub-section** (inside SpotifyHub, after Artists sub-section):
   - Title "Playlists" with separator before it
   - Per performer with playlists: green performer tag → per playlist: name + thumbnail, two metric cards (followers + track count), followers evolution chart, scrollable track list
   - Completely absent if no performer has `spotify_playlists`

2. **TV mode — Playlist block** (compact, inline in Spotify card):
   - For each playlist of `currentPerformer`: playlist name, inline `Seguidores: X` and `Faixas: Y`
   - No chart and no track scroll in TV mode (space constraints)
   - Entire Spotify card hidden if performer has neither artist data nor playlists

3. **Conditional section rendering**:
   - `YouTubeSection` only renders if total YouTube followers `> 0`
   - `InstagramSection` only renders if total Instagram followers `> 0`
   - `Separator` before each section only renders alongside its section

4. **Breakdown cleanup**:
   - All `MetricCardWithBreakdown` usages automatically hide performers with `value === 0` in the breakdown list

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_

### Documentation & References

```yaml
- file: lib/types/dashboard.ts
  why: Base types that need extension — MetricData, MetricEntry, PerformerData, DashboardResponse
  pattern: |
    # Current PerformerData:
    export interface PerformerData {
      youtube?: PlatformMetrics;
      instagram?: PlatformMetrics;
      spotify?: PlatformMetrics;
    }
    # ADD spotify_playlists?: SpotifyPlaylistData[] to PerformerData
    # MetricData = { latest: number; entries: MetricEntry[] }
    # MetricEntry = { value: number; datetime: string; performer?: string }
    # ChartDataPoint = { date: string; value: number; previousValue?: number }
  gotcha: play_count in SpotifyPlaylistTrack is a STRING in the API — must parseInt() before displaying

- file: lib/types/spotify.ts
  why: Remove obsolete PlaylistData type and playlists field from SpotifyMetrics
  pattern: |
    # REMOVE: PlaylistData interface (has old monthlyListeners field)
    # REMOVE: playlists: PlaylistData[] from SpotifyMetrics
    # UPDATE: playlist-comparison.tsx imports PlaylistData from here
  gotcha: playlist-comparison.tsx imports PlaylistData — must update that import too

- file: hooks/use-chart-data.ts
  why: Extract buildChartPoints utility function from internal hook logic
  pattern: |
    # Internal functions to extract:
    # getBucketKey(datetime, period) — returns full datetime for 'today', date-only for 7d/30d
    # getDateThreshold(period) — returns Date threshold for filtering
    # The bucketing loop: last-value-per-(bucket, performer) → sum per bucket → sort → ChartDataPoint[]
    # EXPORT this as: export function buildChartPoints(entries: MetricEntry[], period: PeriodFilter): ChartDataPoint[]
  gotcha: |
    The 'today' period uses data-relative threshold (based on latest entry datetime), not wall-clock.
    Keep this behavior in buildChartPoints.
    The hook itself calls useChartData which reads from DashboardResponse — keep that behavior untouched.
    buildChartPoints is for raw MetricEntry[] arrays (e.g. playlist.followers.entries).

- file: components/dashboard/metric-card-breakdown.tsx
  why: Add filter to hide breakdown items with value === 0
  pattern: |
    # Current: const sortedBreakdown = [...breakdown].sort((a, b) => b.value - a.value);
    # Change to: const sortedBreakdown = [...breakdown].filter(item => item.value > 0).sort((a, b) => b.value - a.value);
    # This affects ALL callers (SpotifyHub, YouTubeSection, InstagramSection) globally

- file: components/dashboard/spotify/playlist-comparison.tsx
  why: Uses old PlaylistData type with monthlyListeners field
  pattern: |
    # UPDATE: import { PlaylistData } from "@/lib/types/spotify" → import { SpotifyPlaylistData } from "@/lib/types/dashboard"
    # UPDATE: interface PlaylistComparisonProps { playlists: SpotifyPlaylistData[] }
    # UPDATE: playlist.monthlyListeners → playlist.followers.latest (in chartData mapping)

- file: components/dashboard/spotify/animated-top-tracks.tsx
  why: Copy the green performer tag pattern for use in PlaylistSection
  pattern: |
    # Performer tag pattern (lines ~76-84):
    <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">
      <Music2Icon className="size-4" />
      {currentPerformer.performer}
    </div>

- file: components/dashboard/metric-card.tsx
  why: Use MetricCard (simpler, no breakdown) for playlist metrics
  pattern: |
    # Props: { title, value: number, entries: MetricEntry[], period: PeriodFilter, icon?, className? }
    # Uses calculateGrowth(entries, period) from lib/utils.ts for the growth badge
    # import { MetricCard } from "@/components/dashboard/metric-card"

- file: components/dashboard/metrics-chart.tsx
  why: Use MetricsChart for playlist followers chart — same as other platform charts
  pattern: |
    # Props: { data: ChartDataPoint[], title: string, icon?, className?, compact?, fillHeight? }
    # import { MetricsChart } from "@/components/dashboard/metrics-chart"

- file: components/dashboard/spotify/spotify-hub.tsx
  why: Add Playlists sub-section; add conditional sub-section logic
  pattern: |
    # Current props: spotifyData?, dashboardData?, fullDashboardData?: DashboardResponse, ...
    # fullDashboardData already contains all performer data including spotify_playlists after type update
    # hasArtistData = fullDashboardData exists && any performer has spotify?.followers?.latest > 0
    # hasPlaylistData = fullDashboardData exists && any performer has spotify_playlists?.length > 0
    # Render Artists section only if hasArtistData
    # Render Playlists section (after Separator) only if hasPlaylistData
    # Entire SpotifyHub only renders if hasArtistData OR hasPlaylistData

- file: components/dashboard/dashboard-client.tsx
  why: Add conditional YouTube/Instagram rendering + TV mode playlist block
  pattern: |
    # Normal mode — Current structure (lines ~415-430 approx):
    #   <SpotifyHub ... />
    #   <Separator />
    #   <YouTubeSection ... />
    #   <Separator />
    #   <InstagramSection ... />
    #   <Separator />
    #   <MusicTable ... />

    # Target structure:
    #   <SpotifyHub ... />
    #   {(youtubeData?.followers?.latest ?? 0) > 0 && (
    #     <>
    #       <Separator />
    #       <YouTubeSection ... />
    #     </>
    #   )}
    #   {(instagramData?.followers?.latest ?? 0) > 0 && (
    #     <>
    #       <Separator />
    #       <InstagramSection ... />
    #     </>
    #   )}
    #   <Separator />
    #   <MusicTable tracks={musicTracks} />

    # TV mode — current Spotify left column (in the grid-cols-[1fr_minmax(0,40%)] div):
    #   After tvSpotifyData metrics block, add:
    #   {initialData?.[presentation.currentPerformer ?? ""]?.spotify_playlists?.map((playlist, idx) => (
    #     <div key={idx}>
    #       <p className="font-medium">{playlist.name}</p>
    #       <div className="flex gap-4 text-sm text-muted-foreground">
    #         <span>Seguidores: {formatCompactNumber(playlist.followers.latest)}</span>
    #         <span>Faixas: {formatCompactNumber(playlist.track_count.latest)}</span>
    #       </div>
    #     </div>
    #   ))}

    # TV mode — conditionally hide Spotify block entirely:
    #   Only render the Spotify card if tvSpotifyData OR spotify_playlists?.length > 0

- file: components/ui/scroll-area.tsx
  why: Used in PlaylistSection for track list
  pattern: |
    # import { ScrollArea } from "@/components/ui/scroll-area"
    # <ScrollArea className="h-48 rounded-lg border">
    #   <div className="divide-y">...</div>
    # </ScrollArea>
    # (same pattern as spotify-hub.tsx "Outras Músicas" section)

- file: lib/utils.ts
  why: calculateGrowth and formatCompactNumber used throughout
  pattern: |
    # calculateGrowth(entries: MetricEntry[], period: PeriodFilter): { absolute: number; percent: number }
    # — handles entries with performer field (uses __single__ fallback)
    # — works correctly for playlist entries that don't have performer field
    # formatCompactNumber(num: number): string — K/M/B suffix formatting
    # import { calculateGrowth, formatCompactNumber } from "@/lib/utils"
```

### Current Codebase Tree (relevant files)

```bash
camping-dashboard/
├── app/
│   └── (dashboard)/
│       └── page.tsx                          # Server component — fetches initialData + spotifyData
├── components/dashboard/
│   ├── spotify/
│   │   ├── spotify-hub.tsx                   # MODIFY — add playlist sub-section
│   │   ├── animated-top-tracks.tsx           # READ ONLY — copy performer tag pattern
│   │   ├── playlist-comparison.tsx           # MODIFY — update PlaylistData → SpotifyPlaylistData
│   │   ├── monthly-listeners-chart.tsx       # READ ONLY
│   │   └── top-rankings.tsx                  # READ ONLY
│   ├── social-platforms/
│   │   ├── youtube-section.tsx               # READ ONLY — visibility controlled by dashboard-client
│   │   └── instagram-section.tsx             # READ ONLY — visibility controlled by dashboard-client
│   ├── metric-card-breakdown.tsx             # MODIFY — filter value === 0
│   ├── metric-card.tsx                       # READ ONLY — use as-is for playlist metrics
│   ├── metrics-chart.tsx                     # READ ONLY — use as-is for playlist chart
│   └── dashboard-client.tsx                  # MODIFY — conditional sections + TV playlist block
├── hooks/
│   └── use-chart-data.ts                     # MODIFY — export buildChartPoints
├── lib/
│   ├── types/
│   │   ├── dashboard.ts                      # MODIFY — add SpotifyPlaylistTrack, SpotifyPlaylistData, spotify_playlists
│   │   └── spotify.ts                        # MODIFY — remove PlaylistData, remove playlists field
│   └── utils.ts                              # READ ONLY
└── components/ui/
    └── scroll-area.tsx                       # READ ONLY — use as-is
```

### Desired Codebase Tree (new files)

```bash
camping-dashboard/
└── components/dashboard/
    └── spotify/
        └── playlist-section.tsx              # NEW — PlaylistSection component
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: play_count in SpotifyPlaylistTrack is a STRING in the API payload
// ALWAYS convert with parseInt() before passing to formatCompactNumber():
// formatCompactNumber(parseInt(track.play_count, 10))
// NOT: formatCompactNumber(track.play_count) — will fail TypeScript

// CRITICAL: spotify_playlists is a ROOT-LEVEL field on PerformerData, NOT nested inside spotify
// CORRECT: initialData["PerformerA"].spotify_playlists
// WRONG: initialData["PerformerA"].spotify?.playlists

// CRITICAL: In TV mode, currentPerformer can be null on initial render
// GUARD: initialData?.[presentation.currentPerformer ?? ""]?.spotify_playlists
// Or: presentation.currentPerformer ? initialData?.[presentation.currentPerformer]?.spotify_playlists : undefined

// CRITICAL: Next.js Image requires domains in next.config — Spotify CDN already configured
// (f.scdn.co and similar already allowlisted in the project)

// CRITICAL: buildChartPoints 'today' period threshold is DATA-RELATIVE (not wall clock)
// Must replicate this from useChartData:
// const latestDatetime = entries.reduce((max, e) => (e.datetime > max ? e.datetime : max), entries[0]?.datetime ?? "");
// threshold = new Date(new Date(latestDatetime).getTime() - 24 * 60 * 60 * 1000);

// IMPORTANT: MetricEntry.performer is optional — playlist entries won't have it
// calculateGrowth handles this correctly with ?? "__single__" fallback — safe to use directly

// IMPORTANT: DashboardResponse index signature is { [performerName: string]: PerformerData }
// TypeScript will complain if you try to access .total as PerformerData — use type assertion or filter key !== "total"
// Pattern: Object.entries(fullDashboardData).filter(([key]) => key !== "total")

// IMPORTANT: SpotifyHub receives fullDashboardData?: DashboardResponse (optional)
// Guard all accesses: fullDashboardData ? Object.entries(...) : []
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// ─── lib/types/dashboard.ts ADDITIONS ───────────────────────────────────────

export interface SpotifyPlaylistTrack {
  name: string;
  thumbnail_url?: string;
  play_count: string; // STRING in API — convert with parseInt() before display
}

export interface SpotifyPlaylistData {
  name: string;
  thumbnail_url?: string;
  followers: MetricData; // MetricData = { latest: number; entries: MetricEntry[] }
  track_count: MetricData;
  tracks: SpotifyPlaylistTrack[];
}

// MODIFY PerformerData — add spotify_playlists field:
export interface PerformerData {
  youtube?: PlatformMetrics;
  instagram?: PlatformMetrics;
  spotify?: PlatformMetrics;
  spotify_playlists?: SpotifyPlaylistData[]; // ← ADD THIS
}

// ─── lib/types/spotify.ts REMOVALS ──────────────────────────────────────────

// REMOVE: PlaylistData interface entirely
// REMOVE: playlists: PlaylistData[] from SpotifyMetrics
// SpotifyMetrics after removal:
export interface SpotifyMetrics {
  monthlyListeners: MetricData;
  rankings: SpotifyRanking[];
  rankingsByPerformer: PerformerRanking[];
  allTracks: SpotifyTrackItem[];
  // playlists field is GONE
}
```

### Implementation Tasks (ordered by dependencies)

````yaml
Task 1: MODIFY lib/types/dashboard.ts
  - ADD: SpotifyPlaylistTrack interface (before PerformerData)
  - ADD: SpotifyPlaylistData interface (after SpotifyPlaylistTrack)
  - MODIFY: PerformerData — add spotify_playlists?: SpotifyPlaylistData[]
  - PRESERVE: All existing interfaces unchanged (MetricEntry, MetricData, PlatformMetrics, DashboardResponse, ChartDataPoint)
  - PLACEMENT: SpotifyPlaylistTrack and SpotifyPlaylistData go between PlatformMetrics and PerformerData

Task 2: MODIFY lib/types/spotify.ts
  - REMOVE: PlaylistData interface (export interface PlaylistData { ... })
  - REMOVE: playlists: PlaylistData[] from SpotifyMetrics interface
  - PRESERVE: SpotifyRanking, SpotifyTrackItem, PerformerRanking, SpotifyMetrics (minus playlists)
  - NOTE: playlist-comparison.tsx imports PlaylistData here — will break until Task 5

Task 3: MODIFY hooks/use-chart-data.ts
  - EXTRACT from useChartData's useMemo body the bucketing logic into a new standalone function
  - ADD export: export function buildChartPoints(entries: MetricEntry[], period: PeriodFilter): ChartDataPoint[]
  - IMPLEMENT: Filter by period threshold, last-value-per-(bucket, performer), sum per bucket, sort ascending, return ChartDataPoint[]
  - REPLICATE getDateThreshold and getBucketKey behavior (can be shared helpers or inlined)
  - PRESERVE: useChartData hook signature and behavior unchanged
  - ADD IMPORTS: import type { MetricEntry, ChartDataPoint } from "@/lib/types/dashboard" (likely already imported)
  - PLACEMENT: Export function BEFORE useChartData hook in the file

  Implementation of buildChartPoints:
  ```typescript
  export function buildChartPoints(
    entries: MetricEntry[],
    period: PeriodFilter,
  ): ChartDataPoint[] {
    if (!entries || entries.length === 0) return [];

    // Compute threshold (same logic as useChartData)
    let threshold: Date;
    if (period === "today") {
      const latestDatetime = entries.reduce(
        (max, e) => (e.datetime > max ? e.datetime : max),
        entries[0]?.datetime ?? "",
      );
      threshold = new Date(new Date(latestDatetime).getTime() - 24 * 60 * 60 * 1000);
    } else {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const daysBack = period === "7d" ? 7 : 30;
      threshold = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    }

    // Filter by period
    const periodFiltered = entries.filter((e) => new Date(e.datetime) >= threshold);

    // Last-value-per-(bucket, performer) — same as useChartData
    const bucketPerformer = new Map<string, Map<string, { value: number; datetime: string }>>();
    periodFiltered.forEach((entry) => {
      const bucketKey = period === "today" ? entry.datetime : entry.datetime.split("T")[0];
      const performer = entry.performer ?? "__single__";
      if (!bucketPerformer.has(bucketKey)) bucketPerformer.set(bucketKey, new Map());
      const pm = bucketPerformer.get(bucketKey)!;
      const existing = pm.get(performer);
      if (!existing || entry.datetime > existing.datetime) {
        pm.set(performer, { value: entry.value, datetime: entry.datetime });
      }
    });

    // Sum per bucket
    const byBucket = new Map<string, number>();
    bucketPerformer.forEach((performerMap, bucketKey) => {
      let total = 0;
      performerMap.forEach(({ value }) => { total += value; });
      byBucket.set(bucketKey, total);
    });

    // Sort ascending and build ChartDataPoint[]
    const sortedBuckets = Array.from(byBucket.entries()).sort(([a], [b]) => a.localeCompare(b));
    const points: ChartDataPoint[] = sortedBuckets.map(([date, value], index, arr) => ({
      date,
      value,
      previousValue: index > 0 ? arr[index - 1][1] : undefined,
    }));

    return period === "today" ? points.slice(-9) : points;
  }
````

Task 4: MODIFY components/dashboard/metric-card-breakdown.tsx

- FIND: const sortedBreakdown = [...breakdown].sort((a, b) => b.value - a.value);
- REPLACE: const sortedBreakdown = [...breakdown].filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
- PRESERVE: Everything else unchanged — no other modifications needed

Task 5: MODIFY components/dashboard/spotify/playlist-comparison.tsx

- FIND: import type { PlaylistData } from "@/lib/types/spotify";
- REPLACE: import type { SpotifyPlaylistData } from "@/lib/types/dashboard";
- FIND: playlists: PlaylistData[];
- REPLACE: playlists: SpotifyPlaylistData[];
- FIND: playlist.monthlyListeners (in chartData mapping)
- REPLACE: playlist.followers.latest
- PRESERVE: All other logic unchanged (bar chart rendering, tooltip, colors, etc.)

Task 6: CREATE components/dashboard/spotify/playlist-section.tsx

- IMPLEMENT: PlaylistSection component
- IMPORTS:
  - "use client" directive
  - Image from "next/image"
  - { ListMusicIcon, Music2Icon, UsersIcon } from "lucide-react"
  - { MetricCard } from "@/components/dashboard/metric-card"
  - { MetricsChart } from "@/components/dashboard/metrics-chart"
  - { ScrollArea } from "@/components/ui/scroll-area"
  - type { DashboardResponse } from "@/lib/types/dashboard"
  - type { PeriodFilter } from "@/lib/types/filters"
  - { buildChartPoints } from "@/hooks/use-chart-data"
  - { formatCompactNumber } from "@/lib/utils"

- PROPS interface:
  interface PlaylistSectionProps {
  fullDashboardData: DashboardResponse;
  period: PeriodFilter;
  }

- LOGIC:
  1. Filter performers: Object.entries(fullDashboardData)
     .filter(([key, data]) => key !== "total" && data.spotify_playlists && data.spotify_playlists.length > 0)
     .map(([performer, data]) => ({ performer, playlists: data.spotify_playlists! }))
  2. If no performers with playlists: return null

- RENDER STRUCTURE:
  <div className="space-y-6">
    <h3 className="text-lg font-semibold">Playlists</h3>
    {performersWithPlaylists.map(({ performer, playlists }) => (
      <div key={performer} className="space-y-4">
        {/* Green performer tag — same as AnimatedTopTracks */}
        <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">
          <Music2Icon className="size-4" />
          {performer}
        </div>

        {playlists.map((playlist, idx) => (
          <div key={idx} className="space-y-4">
            {/* Playlist name + thumbnail */}
            <div className="flex items-center gap-3">
              {playlist.thumbnail_url && (
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                  <Image src={playlist.thumbnail_url} alt={playlist.name} fill className="object-cover" sizes="48px" />
                </div>
              )}
              <h4 className="font-semibold">{playlist.name}</h4>
            </div>

            {/* Two MetricCards side by side */}
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard
                title="Seguidores da Playlist"
                value={playlist.followers.latest}
                entries={playlist.followers.entries}
                period={period}
                icon={<UsersIcon className="size-4 text-green-500" />}
              />
              <MetricCard
                title="Faixas na Playlist"
                value={playlist.track_count.latest}
                entries={playlist.track_count.entries}
                period={period}
                icon={<ListMusicIcon className="size-4 text-green-500" />}
              />
            </div>

            {/* Followers evolution chart */}
            <MetricsChart
              title="Evolução de Seguidores"
              data={buildChartPoints(playlist.followers.entries, period)}
              icon={<Music2Icon className="size-4 text-green-500" />}
            />

            {/* Tracks scroll area */}
            {playlist.tracks.length > 0 && (
              <div>
                <h5 className="mb-3 text-sm font-medium text-muted-foreground">Músicas</h5>
                <ScrollArea className="h-48 rounded-lg border">
                  <div className="divide-y">
                    {playlist.tracks.map((track, trackIdx) => (
                      <div key={trackIdx} className="flex items-center gap-3 p-3 hover:bg-muted/50">
                        <span className="w-6 text-center text-sm text-muted-foreground">{trackIdx + 1}</span>
                        {track.thumbnail_url && (
                          <div className="relative size-10 shrink-0 overflow-hidden rounded">
                            <Image src={track.thumbnail_url} alt={track.name} fill className="object-cover" sizes="40px" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{track.name}</p>
                        </div>
                        {/* CRITICAL: parseInt() because play_count is a string */}
                        <span className="text-sm font-medium">
                          {formatCompactNumber(parseInt(track.play_count, 10))}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        ))}
      </div>

  ))}
  </div>

Task 7: MODIFY components/dashboard/spotify/spotify-hub.tsx

- ADD IMPORT: { PlaylistSection } from "./playlist-section"
- ADD computed values (outside JSX, inside component body):
  const hasArtistData = dashboardData !== undefined || (
  fullDashboardData
  ? Object.entries(fullDashboardData).some(
  ([k, d]) => k !== "total" && (d.spotify?.followers?.latest ?? 0) > 0,
  )
  : false
  );
  const hasPlaylistData = fullDashboardData
  ? Object.entries(fullDashboardData).some(
  ([k, d]) => k !== "total" && (d.spotify_playlists?.length ?? 0) > 0,
  )
  : false;

- MODIFY the main return JSX (after the loading/empty checks):
  - Wrap the existing dashboardData block with: {hasArtistData && dashboardData && fullDashboardData && (...)}
  - Add after the artists block (inside the space-y-6 div), but only if hasPlaylistData:
    {hasPlaylistData && fullDashboardData && (
    <>
    <Separator className="my-6" />
    <PlaylistSection fullDashboardData={fullDashboardData} period={period} />
    </>
    )}
  - Update the guard at component top: show empty state only if !hasArtistData && !hasPlaylistData

- PRESERVE: spotifyData rankings section (AnimatedTopTracks + otherTracks) unchanged

Task 8: MODIFY components/dashboard/dashboard-client.tsx

- SECTION A — Normal mode conditional rendering:
  FIND in normal layout (the `<> ... </>` after `presentation.isActive ? ... :`):

  ```tsx
  <Separator />

  {/* Section 2: YouTube */}
  <YouTubeSection ... />

  <Separator />

  {/* Section 3: Instagram */}
  <InstagramSection ... />
  ```

  REPLACE with:

  ```tsx
  {
    (youtubeData?.followers?.latest ?? 0) > 0 && (
      <>
        <Separator />
        <YouTubeSection
          data={youtubeData}
          fullDashboardData={initialData || undefined}
          chartData={youtubeChartData}
          period={period}
        />
      </>
    );
  }

  {
    (instagramData?.followers?.latest ?? 0) > 0 && (
      <>
        <Separator />
        <InstagramSection
          data={instagramData}
          fullDashboardData={initialData || undefined}
          chartData={instagramChartData}
          period={period}
        />
      </>
    );
  }
  ```

- SECTION B — TV mode Spotify card: add playlist block
  FIND (inside the left column div, after the charts block):

  ```tsx
  </div>   {/* end flex flex-col gap-4 (left column) */}
  ```

  Before that closing div, ADD:

  ```tsx
  {
    /* Playlists in TV mode (compact) */
  }
  {
    presentation.currentPerformer &&
      (initialData?.[presentation.currentPerformer]?.spotify_playlists
        ?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Playlists</p>
          {initialData![presentation.currentPerformer].spotify_playlists!.map(
            (playlist, idx) => (
              <div key={idx} className="rounded-lg bg-muted/50 px-4 py-2">
                <p className="text-sm font-medium">{playlist.name}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    Seguidores: {formatCompactNumber(playlist.followers.latest)}
                  </span>
                  <span>
                    Faixas: {formatCompactNumber(playlist.track_count.latest)}
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      );
  }
  ```

- SECTION C — TV mode: conditionally hide Spotify block
  FIND: `<div className="rounded-xl border bg-card p-6">` (the Spotify block in TV mode)
  WRAP it with:
  ```tsx
  {
    (tvSpotifyData ||
      (presentation.currentPerformer &&
        (initialData?.[presentation.currentPerformer]?.spotify_playlists
          ?.length ?? 0) > 0)) && (
      <div className="rounded-xl border bg-card p-6">...</div>
    );
  }
  ```
  PRESERVE: YouTube and Instagram TV blocks unchanged (they already show "—" when no data)

````

### Implementation Patterns & Key Details

```typescript
// ─── PATTERN: How to access spotify_playlists safely ──────────────────────
// data.spotify_playlists?.length > 0  — works since it's optional
// data.spotify?.followers?.latest ?? 0  — nested optional chain

// ─── PATTERN: Performer iteration in SpotifyHub/PlaylistSection ──────────
Object.entries(fullDashboardData)
  .filter(([key]) => key !== "total")  // ALWAYS exclude 'total'
  .map(([performer, data]) => ({ performer, playlists: data.spotify_playlists! }))

// ─── PATTERN: formatCompactNumber + parseInt for play_count ──────────────
{formatCompactNumber(parseInt(track.play_count, 10))}
// NOT: formatCompactNumber(Number(track.play_count)) — use parseInt with radix 10

// ─── PATTERN: Conditional Separator in normal layout ────────────────────
// Wrap Separator+Section together so Separator only shows when section shows:
{condition && (
  <>
    <Separator />
    <Section ... />
  </>
)}

// ─── PATTERN: TV mode currentPerformer guard ─────────────────────────────
// presentation.currentPerformer can be null — always guard:
presentation.currentPerformer && initialData?.[presentation.currentPerformer]?.spotify_playlists

// ─── PATTERN: MetricCard vs MetricCardWithBreakdown ─────────────────────
// MetricCard — no breakdown list, for individual playlist metrics
// MetricCardWithBreakdown — with performer breakdown, for platform totals
// For PlaylistSection: use MetricCard (no breakdown needed per playlist)

// ─── GOTCHA: SpotifyHub empty state guard update ─────────────────────────
// Current guard: if (!spotifyData && !dashboardData) → show empty state
// New guard: if (!spotifyData && !dashboardData && !hasPlaylistData) → show empty state
// A performer with only playlists (no artist data) should still render SpotifyHub

// ─── GOTCHA: playlist-comparison.tsx uses playlists: SpotifyPlaylistData[] ──
// After the type update, the bar chart maps: playlist.followers.latest (was monthlyListeners)
// The Recharts tooltip still reads data.listeners which comes from chartData mapping
// Only the source field changes: monthlyListeners → followers.latest
````

### Integration Points

```yaml
TYPES:
  - lib/types/dashboard.ts exports SpotifyPlaylistTrack and SpotifyPlaylistData
  - lib/types/spotify.ts no longer exports PlaylistData
  - PerformerData.spotify_playlists?: SpotifyPlaylistData[] is the bridge from API to components

DATA FLOW:
  - API /api/dashboard → getDashboardData() → initialData (DashboardResponse)
  - initialData["PerformerA"].spotify_playlists → PlaylistSection
  - No new API routes needed — playlists come in the existing dashboard response

CHART UTILITY:
  - buildChartPoints exported from hooks/use-chart-data.ts
  - Used by PlaylistSection for playlist.followers.entries
  - Not used by useChartData itself — that hook stays unchanged

COMPONENT HIERARCHY (after changes):
  DashboardClient
  └── SpotifyHub (fullDashboardData passed down)
      ├── MetricCardWithBreakdown (artists — now filters value === 0)
      ├── MetricsChart (artist followers + listeners charts)
      ├── AnimatedTopTracks (rankings — unchanged)
      └── PlaylistSection (NEW — conditionally rendered)
          ├── MetricCard (per playlist: followers)
          ├── MetricCard (per playlist: track_count)
          ├── MetricsChart (per playlist: followers evolution)
          └── ScrollArea → tracks list
```

---

## Validation Loop

### Level 1: TypeScript & Build Check (run after EVERY task)

```bash
# From /home/wicarpessoa/personal/camping/camping-dashboard/
npx tsc --noEmit
# Expected: Zero errors. If errors exist, fix before proceeding to next task.

# After all tasks complete:
npm run build
# Expected: Successful build, zero type errors
```

### Level 2: Lint Check

```bash
# From project root
npx eslint components/dashboard/spotify/playlist-section.tsx
npx eslint hooks/use-chart-data.ts
npx eslint lib/types/dashboard.ts lib/types/spotify.ts
# Expected: Zero lint errors
```

### Level 3: Visual Inspection (manual)

```bash
# Start dev server
npm run dev

# Verify in browser at localhost:3000:
# 1. No Spotify playlists in prod data → Playlists sub-section absent from DOM (inspect element)
# 2. MetricCardWithBreakdown hides performers with 0 values
# 3. YouTube section hidden if no YouTube data (check with a test user that has no YouTube)
# 4. Instagram section hidden if no Instagram data
# 5. TV mode: Spotify block hidden for performer with no spotify data at all
# 6. TypeScript: npx tsc --noEmit passes
```

### Level 4: Data Shape Simulation

```typescript
// To test PlaylistSection locally without real data, temporarily add test data in page.tsx:
// (ONLY for testing — revert before commit)
const testPerformerData: PerformerData = {
  spotify_playlists: [
    {
      name: "Test Playlist",
      thumbnail_url: "https://i.scdn.co/image/test",
      followers: {
        latest: 5000,
        entries: [
          { value: 4800, datetime: "2026-02-20T12:00:00Z" },
          { value: 5000, datetime: "2026-02-21T12:00:00Z" },
        ],
      },
      track_count: {
        latest: 12,
        entries: [
          { value: 11, datetime: "2026-02-20T12:00:00Z" },
          { value: 12, datetime: "2026-02-21T12:00:00Z" },
        ],
      },
      tracks: [
        {
          name: "Track 1",
          thumbnail_url: "https://i.scdn.co/image/test",
          play_count: "1234",
        },
      ],
    },
  ],
};
```

---

## Final Validation Checklist

### TypeScript Validation

- [ ] `npx tsc --noEmit` passes with zero errors after all tasks
- [ ] `npm run build` succeeds
- [ ] No `any` types introduced
- [ ] `play_count` field typed as `string` and `parseInt()` applied before display

### Feature Validation

- [ ] `PlaylistSection` returns `null` when no performer has `spotify_playlists`
- [ ] `PlaylistSection` renders correctly when a performer has playlist data
- [ ] `buildChartPoints([])` returns `[]` (empty guard)
- [ ] `buildChartPoints(entries, "7d")` returns correct ChartDataPoint[] for 7d period
- [ ] `MetricCardWithBreakdown` hides items with `value === 0` from breakdown list
- [ ] `PlaylistComparison` compiles without TypeScript errors (PlaylistData removed)
- [ ] `SpotifyHub` shows Artistas sub-section only if hasArtistData
- [ ] `SpotifyHub` shows Playlists sub-section only if hasPlaylistData
- [ ] `DashboardClient` normal mode: YouTubeSection absent if followers.latest === 0
- [ ] `DashboardClient` normal mode: InstagramSection absent if followers.latest === 0
- [ ] `DashboardClient` normal mode: Separators only appear before visible sections
- [ ] `DashboardClient` TV mode: playlist block renders for performers with playlist data
- [ ] `DashboardClient` TV mode: Spotify card hidden for performer with neither artist nor playlist data

### Code Quality Validation

- [ ] `"use client"` directive at top of `playlist-section.tsx`
- [ ] All imports are path-alias based (`@/components/...` not relative `../../`)
- [ ] Green performer tag in PlaylistSection matches AnimatedTopTracks exactly
- [ ] `parseInt(track.play_count, 10)` used — NOT `Number()` or implicit coercion
- [ ] All Image components have `sizes` prop for optimization
- [ ] No `any` type casts in playlist-section.tsx

---

## Anti-Patterns to Avoid

- ❌ Don't use `data.spotify.playlists` — `spotify_playlists` is a ROOT field on `PerformerData`, not nested inside `spotify`
- ❌ Don't forget `parseInt()` for `play_count` — it's a string in the API, TypeScript will catch this
- ❌ Don't use `MetricCardWithBreakdown` for playlist metrics — use `MetricCard` (no performer breakdown needed)
- ❌ Don't render `<Separator />` and `<YouTubeSection />` independently — wrap them together in one conditional so the separator never appears without its section
- ❌ Don't access `presentation.currentPerformer` without null guard — it can be `null` on initial render
- ❌ Don't skip the `filter(([key]) => key !== "total")` when iterating `fullDashboardData` — `total` is not a performer
- ❌ Don't create new chart components — reuse `MetricsChart` with `buildChartPoints()` output
- ❌ Don't use relative imports (`../../`) — use path aliases (`@/components/...`)

---

## Confidence Score

**8/10** — The feature spec is precise and complete. All relevant codebase files have been read. The implementation is straightforward composition of existing patterns with no external APIs. The only uncertainty is the exact structure of the TV mode Spotify block JSX (complex nesting), but the pattern is clearly documented above.

**The main risk is the TV mode block modification in `dashboard-client.tsx`** — it has complex nested JSX with a `grid-cols-[1fr_minmax(0,40%)]` layout. Read the full TV mode block carefully before editing to find the exact insertion point.
