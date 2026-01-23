name: "Header Component with Filters - PRP"
description: |

---

## Goal

**Feature Goal**: Create a fixed header component inside `SidebarInset` that adjusts width dynamically when sidebar collapses/expands, containing period filters (Hoje, 7d, 30d) and a profile selector dropdown.

**Deliverable**:

1. `components/app-header.tsx` - Header component with filters
2. `hooks/use-filters.tsx` - Filter state context and hook
3. `lib/types/filters.ts` - TypeScript type definitions
4. Modified `components/sidebar.tsx` - Integrate AppHeader

**Success Definition**:

- Header is visible at the top of every page inside SidebarInset
- Header width adjusts smoothly (200ms transition) when sidebar toggles
- Period filters (Hoje, 7d, 30d) are clickable with visual active state
- Profile dropdown filter is functional with placeholder data
- Filter state is accessible to other components via `useFilters` hook
- Mobile responsive (stacks filters or uses dropdown)

## User Persona

**Target User**: Marketing analyst monitoring social media metrics across multiple profiles

**Use Case**: Filtering dashboard data by time period and profile

**User Journey**:

1. User lands on dashboard and sees header with filters at top
2. User clicks "7d" button to filter data to last 7 days - button shows active state
3. User opens profile dropdown and selects a specific profile
4. Dashboard data updates based on active filters
5. When user collapses sidebar (Ctrl/Cmd+B), header expands to fill the space
6. Filters persist during navigation between pages

**Pain Points Addressed**: Quick access to common time filters without navigating to a separate settings page

## Why

- Provides consistent filtering UI across all dashboard pages
- Integrates seamlessly with existing shadcn/ui sidebar layout using `SidebarInset`
- Enables quick data filtering without page reloads
- Follows established dashboard UI patterns with filter state context

## What

### Functional Requirements (Must Have)

- Header fixed at top inside `SidebarInset` (NOT outside - this is critical)
- Automatically adjusts width when sidebar collapses/expands via CSS flexbox
- Period filter buttons: Hoje (Today), 7d, 30d - toggle group behavior with active state
- Profile filter: dropdown select for user profiles
- Visual indication of active filter (highlighted button)
- SidebarTrigger button for toggling sidebar
- Sticky positioning with `sticky top-0 z-40`

### Nice to Have (Future)

- Animação suave ao ajustar largura (already handled by SidebarInset)
- Filtro de período customizado (date picker)
- Multi-seleção de perfis
- Indicador visual de filtros ativos count

### Success Criteria

- [ ] Header renders inside SidebarInset component (line 75-79 of sidebar.tsx)
- [ ] Header has `sticky top-0 z-40` positioning
- [ ] Width transitions smoothly with sidebar (automatic via SidebarInset)
- [ ] Period filter buttons show active state with `variant="secondary"`
- [ ] Profile dropdown is functional using shadcn Select component
- [ ] Filter state is shared via React Context (`useFilters` hook)
- [ ] Mobile responsive (filters remain usable)
- [ ] Passes TypeScript type checking: `pnpm exec tsc --noEmit`
- [ ] No ESLint errors: `pnpm lint`

## All Needed Context

### Context Completeness Check

_This PRP provides: exact file paths, component patterns to follow, shadcn/ui documentation, implementation code examples, and validation commands specific to this Next.js/pnpm project._

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- docfile: PRPs/ai_docs/shadcn-sidebar.md
  why: Complete shadcn/ui sidebar API reference including useSidebar hook, SidebarInset, and header layout pattern
  section: "Layout Pattern (with Header)" and "Sticky Header Pattern"
  critical: Header MUST be inside SidebarInset for width adjustment to work

- file: components/sidebar.tsx
  why: Current AppSidebar implementation showing existing header placement (lines 75-79)
  pattern: Header inside SidebarInset, uses SidebarTrigger, flex layout
  gotcha: Header must remain inside SidebarInset - do NOT move it outside

- file: components/ui/sidebar.tsx
  why: Full sidebar component implementation with useSidebar hook export
  pattern: useSidebar hook provides {state, open, toggleSidebar, isMobile}
  gotcha: useSidebar must be called within SidebarProvider context

- file: components/ui/button.tsx
  why: Button component with CVA variants and sizes
  pattern: Use variant="ghost" for inactive, variant="secondary" for active filter
  gotcha: Use size="sm" (h-8) for header buttons to fit h-16 header

- file: components/ui/select.tsx
  why: Select dropdown component for profile filter
  pattern: Select, SelectTrigger, SelectContent, SelectItem exports
  gotcha: SelectTrigger has size prop ("sm" | "default"), use size="sm"

- file: components/ui/separator.tsx
  why: Vertical separator between filter groups
  pattern: <Separator orientation="vertical" className="h-4" />

- file: hooks/use-mobile.ts
  why: Pattern for custom hooks in this codebase
  pattern: Simple hook with React.useState and React.useEffect
```

### Current Codebase Tree

```bash
├── app/
│   ├── layout.tsx              # Root layout - wraps with AppSidebar
│   ├── page.tsx                # Dashboard home
│   ├── globals.css             # Tailwind + CSS variables (oklch colors)
│   ├── configuracoes/page.tsx
│   └── relatorios/page.tsx
├── components/
│   ├── sidebar.tsx             # AppSidebar - MODIFY: integrate AppHeader
│   └── ui/
│       ├── button.tsx          # Button with variants (ghost, secondary, outline)
│       ├── select.tsx          # Select dropdown - USE for profile filter
│       ├── separator.tsx       # Separator component
│       ├── sidebar.tsx         # Sidebar primitives + useSidebar hook
│       └── tooltip.tsx
├── hooks/
│   └── use-mobile.ts           # Mobile detection hook - FOLLOW pattern
├── lib/
│   ├── utils.ts                # cn() utility function
│   └── hooks/
│       └── use-local-storage.ts
└── PRPs/
    └── ai_docs/
        └── shadcn-sidebar.md   # Sidebar reference docs
```

### Desired Codebase Tree (files to add/modify)

```bash
├── components/
│   ├── app-header.tsx          # NEW - Header component with filters
│   └── sidebar.tsx             # MODIFY - Import and use AppHeader
├── hooks/
│   └── use-filters.tsx         # NEW - Filter state context and hook
└── lib/
    └── types/
        └── filters.ts          # NEW - Filter type definitions
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Header MUST be inside SidebarInset for width adjustment
// The flexbox layout handles width automatically - do NOT set explicit widths
// WRONG: <SidebarProvider><header>...</header><Sidebar/></SidebarProvider>
// RIGHT: <SidebarProvider><Sidebar/><SidebarInset><header>...</header></SidebarInset></SidebarProvider>

// CRITICAL: useSidebar() must be called inside SidebarProvider
// The hook will throw if called outside context

// GOTCHA: This project uses "use client" for interactive components
// Filter context provider needs "use client" directive

// GOTCHA: Button sizes - use size="sm" (h-8) for header buttons
// Default size h-9 may be too large for h-16 header

// GOTCHA: SelectTrigger has size prop - use size="sm" for consistency

// PATTERN: Active state for period filters
// Use variant="secondary" for active, variant="ghost" for inactive

// PATTERN: cn() utility for conditional classNames
// import { cn } from "@/lib/utils"
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// lib/types/filters.ts

export type PeriodFilter = "today" | "7d" | "30d";

export interface Profile {
  id: string;
  name: string;
  // Future: socialNetworks: SocialNetwork[];
}

export interface FilterState {
  period: PeriodFilter;
  profileId: string | null; // null = all profiles
}

export interface FilterContextValue {
  filters: FilterState;
  setPeriod: (period: PeriodFilter) => void;
  setProfileId: (profileId: string | null) => void;
}

// Period filter labels (Portuguese)
export const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

// Mock profiles for initial implementation
export const MOCK_PROFILES: Profile[] = [
  { id: "1", name: "Perfil Principal" },
  { id: "2", name: "Perfil Secundário" },
  { id: "3", name: "Perfil Marketing" },
];
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE lib/types/filters.ts
  - IMPLEMENT: PeriodFilter type, Profile interface, FilterState interface, FilterContextValue interface
  - IMPLEMENT: PERIOD_OPTIONS and MOCK_PROFILES constants
  - NAMING: PascalCase for types/interfaces, SCREAMING_SNAKE for constants
  - PLACEMENT: lib/types/filters.ts (create lib/types/ directory if needed)

Task 2: CREATE hooks/use-filters.tsx
  - IMPLEMENT: FilterContext, FilterProvider, useFilters hook
  - FOLLOW pattern: hooks/use-mobile.ts (hook structure)
  - INCLUDE: "use client" directive at top
  - STATE: Use React.useState for filter state with default { period: "7d", profileId: null }
  - CALLBACKS: Use React.useCallback for setPeriod and setProfileId
  - MEMOIZE: Use React.useMemo for context value
  - NAMING: useFilters hook, FilterProvider component
  - PLACEMENT: hooks/use-filters.tsx

Task 3: CREATE components/app-header.tsx
  - IMPLEMENT: Header component with SidebarTrigger, period filters, profile select
  - FOLLOW pattern: components/sidebar.tsx (existing header section lines 75-79)
  - USE: useFilters from @/hooks/use-filters for filter state
  - INCLUDE: "use client" directive
  - STYLING: sticky top-0 z-40, flex h-16 shrink-0 items-center gap-2 border-b px-4
  - LAYOUT: SidebarTrigger | Separator | flex-1 spacer | filters on right
  - PERIOD FILTERS: Button group with variant="ghost" (inactive) / variant="secondary" (active)
  - PROFILE SELECT: Select component with size="sm", placeholder "Todos os Perfis"
  - NAMING: AppHeader component (default export)
  - PLACEMENT: components/app-header.tsx

Task 4: MODIFY components/sidebar.tsx
  - IMPORT: AppHeader from @/components/app-header
  - IMPORT: FilterProvider from @/hooks/use-filters
  - WRAP: Entire SidebarProvider content with FilterProvider (inside SidebarProvider)
  - REPLACE: Lines 75-78 header element with <AppHeader />
  - PRESERVE: SidebarInset structure, existing sidebar content, children wrapper
  - CRITICAL: Keep AppHeader inside SidebarInset for width adjustment
```

### Implementation Patterns & Key Details

```tsx
// hooks/use-filters.tsx
"use client";

import * as React from "react";
import type {
  FilterState,
  PeriodFilter,
  FilterContextValue,
} from "@/lib/types/filters";

const FilterContext = React.createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = React.useState<FilterState>({
    period: "7d",
    profileId: null,
  });

  const setPeriod = React.useCallback((period: PeriodFilter) => {
    setFilters((prev) => ({ ...prev, period }));
  }, []);

  const setProfileId = React.useCallback((profileId: string | null) => {
    setFilters((prev) => ({ ...prev, profileId }));
  }, []);

  const value = React.useMemo<FilterContextValue>(
    () => ({ filters, setPeriod, setProfileId }),
    [filters, setPeriod, setProfileId],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters() {
  const context = React.useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
```

```tsx
// components/app-header.tsx
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilters } from "@/hooks/use-filters";
import { PERIOD_OPTIONS, MOCK_PROFILES } from "@/lib/types/filters";

export function AppHeader() {
  const { filters, setPeriod, setProfileId } = useFilters();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />

      {/* Spacer pushes filters to the right */}
      <div className="flex-1" />

      {/* Period Filters */}
      <div className="flex items-center gap-1">
        {PERIOD_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={filters.period === option.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPeriod(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-4" />

      {/* Profile Filter */}
      <Select
        value={filters.profileId ?? "all"}
        onValueChange={(value) => setProfileId(value === "all" ? null : value)}
      >
        <SelectTrigger size="sm" className="w-[180px]">
          <SelectValue placeholder="Todos os Perfis" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Perfis</SelectItem>
          {MOCK_PROFILES.map((profile) => (
            <SelectItem key={profile.id} value={profile.id}>
              {profile.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </header>
  );
}
```

```tsx
// Modified components/sidebar.tsx (key changes only)
"use client";

import * as React from "react";
// ... existing imports ...
import { AppHeader } from "@/components/app-header";
import { FilterProvider } from "@/hooks/use-filters";

// ... navItems stays the same ...

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <FilterProvider>
        <Sidebar collapsible="icon">
          {/* ... existing sidebar content stays the same ... */}
        </Sidebar>
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </FilterProvider>
    </SidebarProvider>
  );
}
```

### Integration Points

```yaml
CONTEXT_PROVIDER:
  - location: components/sidebar.tsx (inside SidebarProvider)
  - pattern: <SidebarProvider><FilterProvider>...</FilterProvider></SidebarProvider>
  - reason: FilterProvider needs to be inside SidebarProvider but wrap both Sidebar and SidebarInset

HEADER_PLACEMENT:
  - location: Inside SidebarInset (components/sidebar.tsx)
  - replace: Current <header> element (lines 75-78) with <AppHeader />
  - preserve: SidebarInset wrapper for proper width behavior

FILTER_CONSUMPTION:
  - pattern: Any component inside FilterProvider can call useFilters()
  - example: Dashboard page can use filters.period to filter displayed data
  - future: Connect to real API/data fetching
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
pnpm exec tsc --noEmit                    # TypeScript check

# Lint specific files
pnpm lint

# Format check (if needed)
pnpm exec prettier --check "components/app-header.tsx" "hooks/use-filters.tsx" "lib/types/filters.ts"

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Build Validation

```bash
# Ensure build passes
pnpm build

# Expected: Build completes without errors
```

### Level 3: Integration Testing (Manual)

```bash
# Start development server
pnpm dev

# Manual testing checklist:
# 1. Open http://localhost:3000
# 2. Verify header appears at top with SidebarTrigger, period filters, profile dropdown
# 3. Click sidebar toggle (or Ctrl/Cmd+B) - header should expand/contract smoothly
# 4. Click period filter buttons - active state should change (secondary variant)
# 5. Open profile dropdown - should show "Todos os Perfis" and mock profiles
# 6. Select different profile - dropdown should update
# 7. Navigate between pages (Dashboard, Relatórios, Configurações) - filters should persist
# 8. Resize to mobile width (<768px) - verify header remains usable
```

### Level 4: Visual & UX Validation

```bash
# Browser DevTools checks:
# 1. Inspect header element - verify sticky top-0 z-40 classes
# 2. Verify header is INSIDE main[data-slot="sidebar-inset"]
# 3. Check transition on sidebar toggle (should be smooth 200ms)
# 4. Verify no horizontal scrollbar appears
# 5. Test keyboard: Tab through filters, Enter to select

# Mobile testing:
# 1. Use Chrome DevTools mobile emulator (iPhone, Pixel)
# 2. Test sidebar sheet behavior on mobile
# 3. Verify header remains visible when sidebar opens as sheet
# 4. Test touch interactions on filters
```

## Final Validation Checklist

### Technical Validation

- [ ] `pnpm exec tsc --noEmit` passes with zero errors
- [ ] `pnpm lint` passes with zero errors/warnings
- [ ] `pnpm build` completes successfully
- [ ] `pnpm dev` starts without errors
- [ ] No console errors in browser

### Feature Validation

- [ ] Header renders inside SidebarInset (inspect DOM: main[data-slot="sidebar-inset"] > header)
- [ ] Header has sticky top-0 z-40 positioning
- [ ] SidebarTrigger toggles sidebar
- [ ] Width adjusts smoothly when sidebar toggles
- [ ] Period filter buttons show active state (secondary variant highlighted)
- [ ] Profile dropdown opens, shows options, and closes
- [ ] Filter selections update state (visible via active button/dropdown value)
- [ ] Filter state accessible via useFilters hook
- [ ] Filters persist during page navigation

### Code Quality Validation

- [ ] "use client" directive on client components (app-header.tsx, use-filters.tsx)
- [ ] Types defined in lib/types/filters.ts
- [ ] useFilters hook exports { filters, setPeriod, setProfileId }
- [ ] FilterProvider wraps content correctly in sidebar.tsx
- [ ] Components use cn() for className merging where needed
- [ ] Button variants match existing patterns (ghost, secondary)
- [ ] No hardcoded colors - uses Tailwind/CSS variables

### Responsive Validation

- [ ] Desktop (>768px): Full header with all elements visible
- [ ] Mobile (<768px): Sidebar becomes sheet, header stays visible and usable
- [ ] Touch interactions work on mobile

---

## Anti-Patterns to Avoid

- ❌ Don't set explicit width on header - let flexbox handle it via SidebarInset
- ❌ Don't place header outside SidebarInset - breaks automatic width adjustment
- ❌ Don't place FilterProvider outside SidebarProvider - components need both contexts
- ❌ Don't use inline styles for colors - use Tailwind classes
- ❌ Don't forget "use client" on components using React hooks
- ❌ Don't call useFilters() outside FilterProvider context
- ❌ Don't use default Button size (h-9) - use size="sm" (h-8) for header

---

## Confidence Score: 9/10

**Rationale**:

- Existing sidebar implementation provides clear, working pattern to follow
- All shadcn/ui components needed are already installed (Button, Select, Separator)
- Filter state management is straightforward React Context pattern
- File paths and component patterns verified from actual codebase
- ai_docs/shadcn-sidebar.md provides complete reference

**Risk Factors**:

- Figma design details not fully extracted (API rate limit) - styling may need minor adjustment
- Mock profiles used - real profile data integration is future work
- Filter persistence across sessions (localStorage) not implemented - enhancement for later
