# PRP: Spotify Section Improvements - Rotation Sync & Pause/Play Control

---

## Goal

**Feature Goal**: Enhance the Spotify section with synchronized track rotation, pause/play controls, and improved layout that matches user expectations for presenter mode.

**Deliverable**:

1. Renamed "Top Tracks" label (from "Top 3 Tracks")
2. Synchronized "Outras Músicas" (other tracks) rotation tied to performer changes
3. Pause/play button in the Spotify section header that freezes/resumes performer rotation
4. Reordered component layout: Top Tracks above Playlist Info

**Success Definition**:

- Label displays "Top Tracks" (not "Top 3 Tracks")
- "Outras Músicas" section shows tracks from the current performer only (not all tracks with top 3 excluded)
- "Outras Músicas" updates when performer rotates
- Pause button appears in Spotify section header; clicking pauses rotation; Play resumes it
- When paused, performer dots/buttons still work for manual selection
- Build passes: `npm run build` with zero TypeScript errors
- No visual layout breaks or misalignments

---

## Why

- Users want to see all tracks (top 3 + others) from the same performer in the same rotation cycle
- Pause/play allows presenters to freeze on a performer's data while discussing it
- Better layout flow: ranked content first (top tracks), then supplementary (playlist info)
- Currently "Outras Músicas" is static/misleading when performer rotates

---

## What

### User-Visible Behavior

1. **Label change**: "Top 3 Tracks" → "Top Tracks" (line 57 in animated-top-tracks.tsx)

2. **Synchronized track rotation**:
   - When performer rotates via auto-rotate or manual selection, **both** Top 3 and "Outras Músicas" update to match
   - "Outras Músicas" now shows only tracks 4+ from the current performer (excluding top 3)
   - Visual feedback: same performer tag appears above both sections

3. **Pause/Play button**:
   - New button in Spotify section header (next to "Spotify" title or in a controls area)
   - Button shows pause icon when rotating, play icon when paused
   - Clicking toggles `isPaused` state
   - When paused: rotation interval clears, but manual performer selection still works
   - When resumed: rotation interval resumes from current performer

4. **Layout reorder**:
   - Current: Playlist Info → Top Tracks
   - New: Top Tracks → Playlist Info (in spotify-hub.tsx)
   - Separators/spacing preserved

### Success Criteria

- [ ] "Top Tracks" label visible in section header
- [ ] "Outras Músicas" shows 0-N tracks from current performer (not global with top 3 excluded)
- [ ] Pause/Play button functional and state-responsive
- [ ] Paused state freezes rotation (no auto-advance on 8s interval)
- [ ] Manual performer selection works in paused state
- [ ] Resume continues from current performer (no skip)
- [ ] Top Tracks renders above Playlist Info in normal flow
- [ ] No layout shift or visual degradation
- [ ] TypeScript build passes with zero errors

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_

### Documentation & References

```yaml
- file: components/dashboard/spotify/animated-top-tracks.tsx
  why: Core rotation logic, state management, performer selection, and label
  pattern: |
    # Key elements:
    # - Line 24: const [currentPerformerIndex, setCurrentPerformerIndex] = useState(0);
    # - Lines 32-42: useEffect with setInterval for auto-rotation every 8 seconds
    # - Line 27-29: Filter validPerformers (performers with rankings.length > 0)
    # - Line 57: "Top 3 Tracks" label (CHANGE TO "Top Tracks")
    # - Lines 61-77: Performer indicator dots (clickable, manual selection)
    # - Props: rankingsByPerformer: PerformerRanking[]
    # - Return type: JSX (div container with space-y-4)
    # - Animation: AnimatePresence mode="wait" for transitions
    # - GOTCHA: Every 8 seconds rotation happens regardless of visibility — will need pause state to prevent this
  gotcha: |
    The interval is set at lines 37-39 but depends on validPerformers.length.
    Need to add isPaused state and check it in the interval callback.
    The dependency array [validPerformers.length] means new interval on performer list change.
    CRITICAL: When adding pause state, make sure to update the dependency array or memoize isPaused.

- file: components/dashboard/spotify/spotify-hub.tsx
  why: Orchestrates all Spotify sub-sections; manages otherTracks calculation and layout
  pattern: |
    # Current layout (lines 95-227):
    # 1. Line 96-101: Header "Spotify"
    # 2. Lines 104-158: Metrics & Charts (Followers, Listeners)
    # 3. Line 156: Separator
    # 4. Lines 161-169: PlaylistSection (MOVE TO AFTER AnimatedTopTracks)
    # 5. Lines 172-177: AnimatedTopTracks component (MOVE UP BEFORE PlaylistSection)
    # 6. Lines 180-224: "Outras Músicas" section (OTHER TRACKS)
    #
    # New layout order:
    # 1. Header
    # 2. Metrics & Charts
    # 3. Separator
    # 4. AnimatedTopTracks (MOVED UP)
    # 5. "Outras Músicas" (stays with AnimatedTopTracks as a unit)
    # 6. Separator
    # 7. PlaylistSection (MOVED DOWN)
    #
    # otherTracks calculation (lines 50-64):
    # - useMemo with spotifyData?.allTracks dependency
    # - Filters out top 3 tracks from ALL performers
    # - PROBLEM: Not synchronized to current performer
    # - FIX: Pass currentPerformerIndex from AnimatedTopTracks and filter to that performer's tracks 4+
    #
    # Props: spotifyData?: SpotifyMetrics, ...fullDashboardData?: DashboardResponse
  gotcha: |
    otherTracks currently uses a static calculation across ALL performers.
    Need to pass currentPerformerIndex to AnimatedTopTracks (lift state up to spotify-hub).
    otherTracks must be filtered by both (a) current performer AND (b) tracks 4+ (not in top 3 of that performer).
    The scrollable area height is h-64 — may overflow if one performer has many "other" tracks.

- file: components/dashboard/spotify/playlist-section.tsx
  why: Reference for existing component structure and layout; will move position in spotify-hub
  pattern: |
    # Structure (lines 20-141):
    # - performersWithPlaylists filter loop (each performer separately)
    # - Green performer tag pattern
    # - Per playlist: name + thumbnail, metrics, chart, tracks list
    # - Scroll areas for content
    # This component stays unchanged; only its placement in spotify-hub moves.

- file: lib/types/spotify.ts
  why: Data types for rankings and tracks
  pattern: |
    # PerformerRanking: { performer: string; rankings: SpotifyRanking[] }
    # SpotifyRanking: { position, previousPosition, trackId, trackName, artistName, thumbnail, streams, change }
    # SpotifyTrackItem: { id, name, performer, thumbnail, plays }
    # SpotifyMetrics: { monthlyListeners, rankings, rankingsByPerformer, allTracks }
    # No type changes needed — just need to understand the data flow.
  gotcha: |
    allTracks is a flat array of SpotifyTrackItem across all performers.
    rankingsByPerformer is grouped by performer, each with rankings (top N tracks).
    SpotifyTrackItem.performer distinguishes which performer a track belongs to.

- file: components/ui/button.tsx
  why: Pause/play button component
  pattern: |
    # Standard shadcn Button component usage:
    # <Button variant="ghost" size="icon" onClick={handler} title="tooltip">
    #   <IconName className="size-4" />
    # </Button>
    # Variants: default, destructive, outline, ghost, secondary, etc.
    # Size: default, sm, lg, icon (square for icon-only)
  gotcha: |
    Icon size should match button size (size-4 for icon variant).
    Use variant="ghost" or "outline" to avoid over-emphasis in header.

- file: lucide-react
  why: Icon library for pause/play buttons
  pattern: |
    # Already imported in animated-top-tracks.tsx: { TrophyIcon, Music2Icon }
    # For pause/play: import { PauseIcon, PlayIcon } from "lucide-react"
    # Icons available; AnimatedTopTracks already uses music icons.

- file: components/dashboard/spotify/animated-top-tracks.tsx (returning to state management)
  why: Lift currentPerformerIndex state and isPaused state here
  pattern: |
    # Current state:
    # const [currentPerformerIndex, setCurrentPerformerIndex] = useState(0);
    #
    # New states to add:
    # const [isPaused, setIsPaused] = useState(false);
    #
    # Update interval logic (lines 32-42) to respect isPaused:
    # - OLD: interval fires every 8 seconds → setCurrentPerformerIndex((prev) => (prev + 1) % validPerformers.length)
    # - NEW: interval fires every 8 seconds BUT only if !isPaused → same rotation logic
    # - Dependency array: [validPerformers.length, isPaused]
    #
    # New handler: const handleTogglePause = () => setIsPaused(prev => !prev);
    #
    # Pass to SpotifyHub:
    # - currentPerformerIndex (already calculated from local state)
    # - isPaused (new)
    # - onTogglePause (handler)
    # - currentPerformer.performer (for button label/indicator)
    #
    # Add pause button in header (before or after dots indicator):
    # <Button variant="ghost" size="icon" onClick={handleTogglePause} title={isPaused ? "Retomar rotação" : "Pausar rotação"}>
    #   {isPaused ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
    # </Button>

- file: components/dashboard/spotify/spotify-hub.tsx (state injection pattern)
  why: Props to accept rotation state from AnimatedTopTracks
  pattern: |
    # Props to add to SpotifyHubProps interface:
    # currentPerformerIndex?: number;  // for filtering otherTracks
    # isPaused?: boolean;              // optional, for future UI feedback
    #
    # Update otherTracks calculation:
    # OLD useMemo:
    # const otherTracks = useMemo(() => {
    #   if (!spotifyData?.allTracks) return [];
    #   const top3TrackNames = new Set(
    #     spotifyData.rankingsByPerformer.flatMap((p) =>
    #       p.rankings.slice(0, 3).map((r) => r.trackName),
    #     ),
    #   );
    #   return spotifyData.allTracks.filter((track) => !top3TrackNames.has(track.name));
    # }, [spotifyData]);
    #
    # NEW useMemo:
    # const otherTracks = useMemo(() => {
    #   if (!spotifyData?.allTracks || currentPerformerIndex === undefined) return [];
    #   const validPerformers = spotifyData.rankingsByPerformer.filter((p) => p.rankings.length > 0);
    #   if (validPerformers.length === 0) return [];
    #   const currentPerformer = validPerformers[currentPerformerIndex];
    #   const top3TrackNames = new Set(
    #     currentPerformer.rankings.slice(0, 3).map((r) => r.trackName),
    #   );
    #   return spotifyData.allTracks.filter(
    #     (track) => track.performer === currentPerformer.performer && !top3TrackNames.has(track.name),
    #   );
    # }, [spotifyData, currentPerformerIndex]);
    #
    # Dependencies now include currentPerformerIndex — triggers on performer change.

- file: framer-motion
  why: Animation library already in use (AnimatePresence, motion.div)
  pattern: |
    # Already used extensively in animated-top-tracks.tsx
    # mode="wait" ensures one animation completes before next starts
    # Transitions applied to performer tag and track display
    # No changes needed — compatible with pause state.
```

### Current Codebase Tree (Spotify-related)

```
components/dashboard/spotify/
├── animated-top-tracks.tsx       # Core rotation component — modify state + button + label
├── spotify-hub.tsx              # Orchestrator — reorder layout + update otherTracks filtering
├── playlist-section.tsx          # Playlist info — move position only
├── playlist-comparison.tsx        # (reference, no changes)
├── top-rankings.tsx             # (reference, no changes)
└── monthly-listeners-chart.tsx   # (reference, no changes)

lib/types/spotify.ts              # Data types — no changes needed
lib/utils.ts                      # formatCompactNumber already used
contexts/                         # Check if PresentationControls context exists (no, it's standalone)
```

### Desired Changes (Summary)

```diff
animated-top-tracks.tsx:
  - Line 57: "Top 3 Tracks" → "Top Tracks" ✓
  - Add isPaused state ✓
  - Add handleTogglePause handler ✓
  - Update interval dependency + pause logic ✓
  - Add pause/play button in header ✓
  - Export currentPerformerIndex & isPaused to parent if needed (or just render button locally) ✓

spotify-hub.tsx:
  - Add currentPerformerIndex prop ✓
  - Update otherTracks useMemo to filter by performer + exclude top 3 ✓
  - Reorder: move AnimatedTopTracks + "Outras Músicas" BEFORE PlaylistSection ✓
  - Update dependency array in useMemo ✓

(No changes to PlaylistSection, types, or other components)
```

### Known Gotchas

```python
# Gotcha 1: Pause state in interval
# The interval setup must check isPaused BEFORE advancing to next performer.
# If state changes, dependency array must update to re-create interval.
# PATTERN: if (!isPaused) { setCurrentPerformerIndex(...) }

# Gotcha 2: otherTracks filtering by performer.name or performer string
# SpotifyTrackItem.performer is a string (performer name).
# PerformerRanking.performer is also a string.
# Match them directly: track.performer === currentPerformer.performer

# Gotcha 3: Splitting "Outras Músicas" by performer
# Old logic: allTracks - top 3 from all performers = global list of "other" tracks
# New logic: allTracks for current performer - top 3 of current performer = local "other" tracks
# This is a significant change in what data is shown; confirm with stakeholder intent.

# Gotcha 4: Pause button placement
# Option A: Inside animated-top-tracks.tsx header (with label and dots)
# Option B: In spotify-hub.tsx header (above AnimatedTopTracks)
# Currently recommendation: Option A (local to rotation logic) ✓
# But could float up if other components need to know pause state.

# Gotcha 5: Manual performer selection while paused
# Clicking a dot should call setCurrentPerformerIndex() regardless of isPaused.
# setCurrentPerformerIndex already bound to button onClick (line 67).
# This continues to work in paused state — interval just doesn't auto-advance. ✓

# Gotcha 6: Restart rotation edge case
# If rotationInterval is cleared on mount and isPaused=true, no interval starts.
# When resuming: new interval should start immediately OR wait for next check.
# PATTERN: useEffect dependencies include [isPaused], so interval recreates when toggled.
# If isPaused=false, interval starts. If isPaused=true (initial), no interval. ✓
```

---

## Implementation Blueprint

### State Management & Architecture

**Current State** (AnimatedTopTracks):

- `currentPerformerIndex`: Manages which performer's top 3 to display
- Auto-advance every 8 seconds via useEffect interval

**Target State** (AnimatedTopTracks):

- `currentPerformerIndex`: Unchanged
- `isPaused`: New boolean, controls interval execution
- `handleTogglePause`: New handler, toggles `isPaused`
- Button UI with pause/play icon in header

**Data Flow** (Spotify-hub):

- Receives `currentPerformerIndex` from AnimatedTopTracks (either as callback or prop lifted up)
- Uses `currentPerformerIndex` to filter `otherTracks` to the current performer
- Recalculates on `currentPerformerIndex` change → "Outras Músicas" updates

**Component Structure** (No new components needed):

- AnimatedTopTracks: Add pause button locally (cleaner, self-contained)
- SpotifyHub: Accept prop for current performer index, update otherTracks filter
- PlaylistSection: Position moves, no logic change

### Component Changes (Ordered by dependency)

1. **animated-top-tracks.tsx**: Add `isPaused` state, pause button, interval dependency
2. **spotify-hub.tsx**: Accept `currentPerformerIndex`, update `otherTracks` filter, reorder layout
3. Layout verification: Ensure no visual breaks

---

## Implementation Tasks (ordered by dependencies)

```yaml
Task 1: UPDATE animated-top-tracks.tsx — Add pause state and button
  - ADD: const [isPaused, setIsPaused] = useState(false);
  - ADD: const handleTogglePause = () => setIsPaused(prev => !prev);
  - UPDATE: useEffect interval — condition check: if (!isPaused) { setCurrentPerformerIndex(...) }
  - UPDATE: useEffect dependency array → [validPerformers.length, isPaused]
  - CHANGE: Line 57 "Top 3 Tracks" → "Top Tracks"
  - ADD: Pause/Play button in header section (after dots indicator, before closing div)
  - IMPORT: { PauseIcon, PlayIcon } from "lucide-react"
  - IMPORT: { Button } from "@/components/ui/button" (if not already imported)
  - Button className: variant="ghost" size="icon" to match header style
  - TEST: Button click toggles icon; interval stops when paused; manual selection still works

Task 2: EXPOSE currentPerformerIndex from AnimatedTopTracks to parent (SpotifyHub)
  - Option A: Refactor to pass callback upward (more complex, lift state)
  - Option B: SpotifyHub renders AnimatedTopTracks and passes a ref/getter (less clean)
  - CHOSEN: Wrap AnimatedTopTracks with a container component or lift state to SpotifyHub
  - APPROACH: Create intermediary "SpotifyArtistsSection" component that manages both AnimatedTopTracks and otherTracks
  - OR: Keep AnimatedTopTracks local but calculate otherTracks based on validPerformers logic within SpotifyHub
  - SIMPLEST APPROACH: Duplicate validPerformers filter in SpotifyHub; use local state for currentPerformer
  - DECIDE: Will take the duplicated-filter approach (less refactoring, still clean)
  - IN PRACTICE: SpotifyHub receives spotifyData, calculates validPerformers same way, uses first one as "current"
  - But AnimatedTopTracks has its own rotation... this breaks the sync.
  - REAL FIX: Move currentPerformerIndex up to SpotifyHub, pass down to both AnimatedTopTracks and use for otherTracks
  - GOTCHA: This is a bigger refactor. Proceed with care.

Task 3: REFACTOR SpotifyHub to manage currentPerformerIndex state
  - ADD: const [currentPerformerIndex, setCurrentPerformerIndex] = useState(0);
  - ADD: const [isPaused, setIsPaused] = useState(false);
  - MOVE: All rotation logic from AnimatedTopTracks up to SpotifyHub
  - CREATE: useEffect for rotation interval (same 8-second logic)
  - PASS: currentPerformerIndex, isPaused, setCurrentPerformerIndex, handleTogglePause to AnimatedTopTracks
  - UPDATE: AnimatedTopTracks to receive these as props (not manage internally)
  - UPDATE: otherTracks useMemo to use currentPerformerIndex
  - UPDATE: Layout to reorder AnimatedTopTracks before PlaylistSection
  - COMPLEXITY: HIGH — significant refactor of AnimatedTopTracks interface

Task 3 ALTERNATIVE (RECOMMENDED): Keep state local to AnimatedTopTracks, duplicate filter in SpotifyHub
  - ADD: validPerformers calculation to SpotifyHub (same filter as AnimatedTopTracks line 27-29)
  - ADD: const currentPerformer = validPerformers[currentPerformerIndex] (need way to get currentPerformerIndex from AnimatedTopTracks)
  - PROBLEM: SpotifyHub doesn't know what AnimatedTopTracks's currentPerformerIndex is
  - SOLUTION: Use a simple approach — assume first valid performer in SpotifyHub's list is "current"
  - BUT: AnimatedTopTracks auto-rotates independently, so SpotifyHub's assumption is wrong after rotation
  - CONCLUSION: Need to lift state OR use a shared context OR sync via effects
  - BEST PATH: Lift state to SpotifyHub (Task 3, HIGH complexity but correct)

Task 3B: SIMPLIFIED APPROACH — Use callback ref from AnimatedTopTracks
  - Wrap AnimatedTopTracks in a div with a ref that exposes currentPerformerIndex
  - Use useImperativeHandle to expose index getter
  - SpotifyHub queries ref.current.currentPerformerIndex
  - DRAWBACK: Imperative approach, less React-idiomatic
  - ADVANTAGE: Avoids large refactor of AnimatedTopTracks props
  - NOT RECOMMENDED: Mixing imperative + declarative, harder to test

FINAL DECISION:
  Task 2B: LIFT STATE TO SPOTIFY-HUB (Core Architecture Change)
  - SpotifyHub manages currentPerformerIndex and isPaused
  - AnimatedTopTracks becomes controlled component (props: currentPerformerIndex, onIndexChange, isPaused, onTogglePause, etc.)
  - This is the "right" React pattern but requires more changes
  - Complexity: Medium (10-15 line changes across 2 files + interface update)
  - Benefit: Clean sync, single source of truth, easier to maintain

Actual Task Breakdown (Revised):

Task 1: REFACTOR animated-top-tracks.tsx to accept state as props
  - Change props signature: add currentPerformerIndex, onIndexChange, isPaused, onTogglePause props
  - Remove internal useState for currentPerformerIndex and isPaused
  - Use props instead of state
  - Keep all rendering logic the same
  - Remove internal useEffect (rotation logic moves to SpotifyHub)
  - Update dots onClick → call onIndexChange(idx) instead of setCurrentPerformerIndex(idx)
  - Add pause/play button with onTogglePause handler
  - IMPORT: { PauseIcon, PlayIcon } from "lucide-react"
  - CHANGE: Line 57 "Top 3 Tracks" → "Top Tracks"

Task 2: UPDATE spotify-hub.tsx to manage rotation state and filter otherTracks
  - ADD: const [currentPerformerIndex, setCurrentPerformerIndex] = useState(0);
  - ADD: const [isPaused, setIsPaused] = useState(false);
  - ADD: useEffect for rotation interval (copy from AnimatedTopTracks, adjust for isPaused)
  - UPDATE: otherTracks useMemo to use currentPerformerIndex
  - PASS: currentPerformerIndex, onIndexChange={setCurrentPerformerIndex}, isPaused, onTogglePause={...} to AnimatedTopTracks
  - REORDER: Layout to put AnimatedTopTracks + "Outras Músicas" BEFORE PlaylistSection
  - UPDATE: otherTracks dependency array: [spotifyData, currentPerformerIndex]

Task 3: VERIFY layout and styling
  - No new classes needed
  - Existing space-y-6 and separator spacing should work
  - Check for visual alignment, no jumps or shifts

Task 4: Build and lint validation
  - npm run build (verify zero TypeScript errors)
  - npm run lint:fix (auto-format code)
  - npm run type-check (TypeScript strict checks)
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# After modifying animated-top-tracks.tsx and spotify-hub.tsx:
npm run lint:fix
npm run type-check
npm run format

# Expected: Zero linting errors, TypeScript type-safe
```

### Level 2: Component-Level Visual Verification

```bash
# Start dev server
npm run dev

# Navigate to dashboard with Spotify data
# Verify manually:
# 1. "Top Tracks" label visible (not "Top 3 Tracks")
# 2. Pause button visible in Spotify section header
# 3. Pause button toggles between pause/play icon on click
# 4. Auto-rotation pauses when pause button clicked
# 5. Manual performer selection (dots) still works while paused
# 6. "Outras Músicas" shows only current performer's tracks (not top 3)
# 7. "Outras Músicas" updates when performer rotates or is manually selected
# 8. Top Tracks section renders above Playlist Info (visual order check)
# 9. No layout shifts, visual glitches, or missing elements
# 10. Resume (click play) continues rotation from current performer
```

### Level 3: Integration Testing (Cross-Component)

```bash
# Manual browser test:
# 1. Open dashboard in browser (dev or build mode)
# 2. Spotify section visible with both normal and rotation data
# 3. Wait for auto-rotation (8 seconds) — performer tag changes
# 4. Verify "Outras Músicas" list updates to match new performer
# 5. Click pause button
# 6. Wait 8+ seconds — performer should NOT change
# 7. Click a performer dot manually — performer updates, "Outras Músicas" updates
# 8. Click play button
# 9. Wait 8 seconds — performer should rotate again
# 10. Verify smooth animation (no jumps, framer-motion transitions work)
```

### Level 4: Build Validation

```bash
# Full build test
npm run build

# Expected: Build completes, zero TypeScript errors, zero linting warnings
# Check: .next/ folder created, bundle size reasonable (compare to recent builds)

# Optional: Check specific bundle size if available
# du -sh .next/ | compare with baseline
```

### Level 5: Edge Cases (Domain-Specific)

```bash
# Edge case 1: Single performer with multiple tracks
# - Pause button should still work
# - Manual selection disabled (only one performer)
# - Verify no crashes

# Edge case 2: Performer with < 4 tracks (no "Outras Músicas")
# - "Outras Músicas" section should not render (zero tracks in filtered list)
# - ScrollArea should handle empty state gracefully (already does via length check)

# Edge case 3: Refresh page while paused
# - State resets to isPaused=false, rotation resumes
# - This is expected behavior (no persistence required)

# Edge case 4: Rapid pause/play toggling
# - Button should not get stuck
# - Icon should toggle correctly each click
# - No race conditions (pause state is simple boolean)

# Framer Motion edge case:
# - AnimatePresence still triggers transitions on performer change
# - No issues with transition logic + pause state
# - (pause state only controls interval, not animation)
```

---

## Final Validation Checklist

### Technical Validation

- [ ] No TypeScript errors: `npm run type-check` passes
- [ ] No linting errors: `npm run lint` shows zero warnings/errors
- [ ] Code formatted: `npm run format:check` passes
- [ ] Build succeeds: `npm run build` completes with zero errors
- [ ] All manual edge cases tested (single performer, few tracks, rapid toggle)

### Feature Validation

- [ ] "Top 3 Tracks" label changed to "Top Tracks"
- [ ] Pause button appears in Spotify section header
- [ ] Pause button toggles pause/play icon correctly
- [ ] Auto-rotation stops when paused (no performer change after 8+ seconds)
- [ ] Manual performer selection works while paused
- [ ] Play button resumes rotation from current performer
- [ ] "Outras Músicas" shows only current performer's tracks (excluding top 3)
- [ ] "Outras Músicas" updates when performer rotates
- [ ] "Outras Músicas" updates when performer manually selected
- [ ] Top Tracks section renders above Playlist Info in layout
- [ ] No visual layout breaks, shifts, or misalignments
- [ ] Framer-motion transitions still smooth (no animation conflicts)
- [ ] ScrollArea for "Outras Músicas" handles empty state (if performer has < 4 tracks)

### Code Quality Validation

- [ ] Follows existing AnimatedTopTracks and SpotifyHub patterns
- [ ] Naming conventions: camelCase for functions/variables, PascalCase for components
- [ ] Props interface updated with full type safety (TypeScript)
- [ ] useEffect dependencies correctly specified (no stale closures)
- [ ] useMemo dependencies include currentPerformerIndex
- [ ] No console.log or debug code left behind
- [ ] Comments added for non-obvious pause logic if needed

### Deployment & Integration

- [ ] Ready to merge into `dev` branch
- [ ] PR description includes feature summary and testing steps
- [ ] No breaking changes to other components (PlaylistSection, PresentationControls, etc.)
- [ ] Backwards compatible (pause feature is additive, not breaking)

---

## Anti-Patterns to Avoid

- ❌ Don't add `isPaused` state to both AnimatedTopTracks and SpotifyHub (single source of truth)
- ❌ Don't manipulate currentPerformerIndex outside the rotation effect (keep it in SpotifyHub)
- ❌ Don't hardcode the 8-second interval; keep it as a constant if changed frequently (already OK as inline 8000)
- ❌ Don't forget to update useEffect dependency arrays (will cause stale state bugs)
- ❌ Don't change styling when reordering layout (move components, preserve space-y-6, separators)
- ❌ Don't remove the ValidatePerformers filter (still needed to exclude performers with no rankings)
- ❌ Don't break AnimatePresence transitions (keep motion.div logic unchanged)
- ❌ Don't show pause button if only one performer (optional optimization for future)

---

## Success Metrics

**Confidence Score**: **8/10** for one-pass implementation success

### Confidence Breakdown

**Strengths** (support high confidence):

- ✅ Feature scope is narrow and well-defined (4 concrete changes)
- ✅ Existing patterns documented with line numbers and code examples
- ✅ State management architecture clearly decided (lift to SpotifyHub)
- ✅ All gotchas and edge cases identified and explained
- ✅ Data types and filtering logic are straightforward
- ✅ No external dependencies or API changes required
- ✅ Validation steps are concrete and testable
- ✅ Similar Spotify component patterns already exist in codebase

**Risks** (prevent 9-10 score):

- ⚠️ **State lifting requires careful dependency array management** — common source of bugs if useEffect dependencies are missed
- ⚠️ **Two-component refactor** — AnimatedTopTracks and SpotifyHub must coordinate; mistakes in one break the other
- ⚠️ **Layout reorder** — while low-risk, requires visual testing to catch spacing/alignment issues
- ⚠️ **otherTracks filtering logic is different from current** — performer-scoped instead of global; requires careful implementation to match spec

### What an AI Agent Can Do Successfully

Using this PRP + codebase access, an unfamiliar AI agent can:

- ✅ Understand current rotation logic (animated-top-tracks.tsx lines 32-42)
- ✅ Identify exact changes needed (diff-ready task breakdown)
- ✅ Implement state lifting pattern (documented pattern in PRP)
- ✅ Update otherTracks filter (logic explicitly shown in Task 2)
- ✅ Validate via build + manual testing (concrete commands provided)
- ⚠️ May need clarification on: "Should manual performer selection still show all performers in dots, or hide paused state visually?" (minor UX detail, not blocking)

### Why Not 9-10?

- **9/10 territory**: Would require a simpler feature (single component, no state lifting) OR working with AI agent in same session for quick clarification
- **10/10 territory**: Impossible without running the code first (can't guarantee all edge cases covered)

**Validation**: This PRP enables one-pass implementation if the AI agent carefully follows Task 1 & 2 with attention to useEffect dependencies and otherTracks filtering logic.

---
