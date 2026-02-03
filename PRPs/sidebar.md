name: "Sidebar Navigation PRP"
description: |
Implement a collapsible sidebar navigation component using shadcn/ui sidebar component
with Next.js App Router navigation, active route highlighting, and localStorage persistence.

---

## Goal

**Feature Goal**: Create a collapsible sidebar navigation component that provides main application navigation with expand/collapse functionality, active route highlighting, and persistent state across sessions.

**Deliverable**:

- `components/sidebar.tsx` - Main sidebar component with collapsible functionality
- `lib/hooks/use-local-storage.ts` - Custom hook for SSR-safe localStorage persistence
- Modified `app/layout.tsx` - Integration of sidebar into root layout
- Route pages: `app/dashboard/page.tsx`, `app/relatorios/page.tsx`, `app/configuracoes/page.tsx`

**Success Definition**:

- Sidebar displays project logo and brand name "CAMPING" with 3 menu items (Dashboard, Relatórios, Configurações)
- Toggle button collapses/expands sidebar (icon-only vs icon+text)
- Active route is visually highlighted
- Sidebar state (expanded/collapsed) persists in localStorage across page reloads
- Smooth animations for collapse/expand transitions
- Responsive mobile behavior using shadcn/ui sidebar mobile patterns
- Tooltips appear on icons when sidebar is collapsed

## Branding Implementation

### Logo & Typography

- **Logo**: `camping.png` (32x32px / size-8) displayed in sidebar header
- **Brand Name**: "CAMPING" in uppercase
- **Font**: Montserrat ExtraBold (800 weight) via `--font-montserrat` CSS variable
- **Color**: `#E8DED2` for brand text

### Responsive Behavior

- **Expanded State**: Logo + "CAMPING" text aligned left with `gap-2` spacing
- **Collapsed State**: Logo centered, text hidden via `group-data-[collapsible=icon]:hidden`
- **Header Height**: Fixed `h-16` to align with main AppHeader border

### Font Setup (layout.tsx)

```typescript
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["800"],
});
// Added to body className: ${montserrat.variable}
```

### Sidebar Header Structure

```tsx
<SidebarHeader className="h-16 border-b p-0">
  <div className="flex h-full items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
    <img
      src="/camping.png"
      alt="Camping"
      className="size-8 shrink-0 rounded-md"
    />
    <h2 className="font-[family-name:var(--font-montserrat)] text-lg font-extrabold tracking-wide text-[#E8DED2] group-data-[collapsible=icon]:hidden">
      CAMPING
    </h2>
  </div>
</SidebarHeader>
```

## User Persona

**Target User**: Application users navigating between different sections of the camping dashboard

**Use Case**: Users need quick access to main application sections (Dashboard, Reports, Settings) with the ability to collapse the sidebar to maximize content area while maintaining navigation access.

**User Journey**:

1. User sees sidebar expanded with project title and full menu items
2. User clicks toggle button to collapse sidebar
3. Sidebar collapses showing only icons with tooltips
4. User clicks menu item to navigate to route
5. Active route is highlighted
6. User refreshes page - sidebar state persists (expanded/collapsed)
7. On mobile, sidebar uses drawer/overlay pattern

**Pain Points Addressed**:

- Limited screen space for content when sidebar is always expanded
- Need for persistent navigation state across sessions
- Clear visual indication of current location in application

## Why

- **User Experience**: Collapsible sidebar maximizes content area while maintaining navigation accessibility
- **State Persistence**: localStorage persistence ensures user preferences are maintained across sessions
- **Navigation Clarity**: Active route highlighting provides clear visual feedback of current location
- **Mobile Support**: Responsive sidebar ensures usability across all device sizes
- **Integration**: Uses existing shadcn/ui component library for consistency with design system

## What

### Must Have Features

1. **Project Title Display**: Project title shown at top of sidebar when expanded
2. **Menu Items**: Three navigation items:
   - Dashboard (route: `/dashboard`)
   - Relatórios (route: `/relatorios`)
   - Configurações (route: `/configuracoes`)
3. **Collapse/Expand Toggle**: Button to toggle between expanded (icon+text) and collapsed (icon-only) states
4. **Active Route Highlighting**: Current route item is visually distinguished
5. **State Persistence**: Expanded/collapsed state saved to localStorage and restored on page load
6. **shadcn/ui Sidebar**: Use official shadcn/ui sidebar component

### Nice to Have Features

1. **Smooth Animations**: CSS transitions for collapse/expand state changes
2. **Mobile Responsive**: Mobile drawer/overlay pattern using shadcn/ui sidebar mobile features
3. **Icon Tooltips**: Tooltips appear on hover when sidebar is collapsed

### Success Criteria

- [ ] Sidebar renders with project title and 3 menu items
- [ ] Toggle button changes sidebar between expanded and collapsed states
- [ ] Active route is highlighted with distinct styling
- [ ] Sidebar state persists in localStorage across page reloads
- [ ] Animations are smooth (no janky transitions)
- [ ] Mobile view uses appropriate drawer pattern
- [ ] Tooltips work when sidebar is collapsed
- [ ] Navigation works correctly with Next.js App Router
- [ ] No hydration errors (SSR-safe localStorage usage)

## All Needed Context

### Context Completeness Check

_Before writing this PRP, validate: "If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_

### Documentation & References

```yaml
# MUST READ - Include these in your context window

- url: https://ui.shadcn.com/docs/components/sidebar
  why: Official shadcn/ui sidebar component documentation - installation command, API reference, and usage patterns
  critical: Must use `npx shadcn@latest add sidebar` to install. Component uses SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem patterns

- url: https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#using-the-link-component
  why: Next.js Link component for client-side navigation in App Router
  critical: Use `next/link` Link component with `href` prop. Must be client component for navigation.

- url: https://nextjs.org/docs/app/api-reference/functions/use-pathname
  why: usePathname hook for detecting current route in App Router
  critical: Import from `next/navigation`. Only works in client components. Returns current pathname string.

- file: components/ui/button.tsx
  why: Button component pattern to follow for toggle button - uses CVA variants, asChild prop, cn utility
  pattern: Button component structure with variant props, className merging using cn(), data-slot attributes
  gotcha: Button uses Slot.Root from radix-ui when asChild=true. Follow existing variant patterns (ghost, icon sizes)

- file: components/component-example.tsx
  why: Example of client component structure, lucide-react icon imports, component composition patterns
  pattern: "use client" directive at top, named icon imports from lucide-react, component organization
  gotcha: Icons imported as named exports (e.g., `SettingsIcon` not `Settings`). Use Icon suffix pattern.

- file: app/layout.tsx
  why: Root layout structure - where sidebar should be integrated
  pattern: Server Component by default, children prop structure, className patterns
  gotcha: Layout is Server Component - sidebar must be separate client component. Wrap children with sidebar layout.

- file: app/globals.css
  why: CSS variables for sidebar theming already defined (--sidebar, --sidebar-foreground, etc.)
  pattern: CSS custom properties for theming, dark mode support
  gotcha: Sidebar CSS variables already exist in :root and .dark. Use these for consistent theming.

- file: lib/utils.ts
  why: cn() utility function for className merging - used throughout codebase
  pattern: Import from "@/lib/utils", use with clsx and tailwind-merge
  gotcha: Always use cn() for className composition, never manual string concatenation

- file: components.json
  why: shadcn/ui configuration - shows style (radix-vega), aliases (@/components, @/lib), icon library (lucide)
  pattern: Component aliases, path resolution
  gotcha: Use @/ aliases for imports. Icon library is lucide-react. Style is radix-vega.

- docfile: docs/libs/LUCIDE-REACT.md
  why: Lucide React icon usage patterns - import syntax, props, sizing
  section: Uso Básico, Props Disponíveis
  critical: Icons imported as named exports. Use size prop or className for sizing. Icons accept standard SVG props.

- docfile: docs/libs/NEXTJS.md
  why: Next.js App Router patterns - Server vs Client Components, routing, Link usage
  section: Client Components, Routing
  critical: Use "use client" for interactive components. Use Link from next/link for navigation. usePathname for active route detection.

- docfile: docs/guidelines.md
  why: Project conventions - component structure, file naming, "use client" usage
  section: Components, File Conventions, Routing
  critical: Server Components by default. Only add "use client" for interactivity. Follow App Router file conventions.
```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase

```bash
camping-dashboard/
├── app/
│   ├── favicon.ico
│   ├── globals.css          # Sidebar CSS variables already defined
│   ├── layout.tsx           # Root layout - needs sidebar integration
│   └── page.tsx             # Home page
├── components/
│   ├── component-example.tsx # Example client component
│   ├── example.tsx
│   └── ui/                  # shadcn/ui components
│       ├── alert-dialog.tsx
│       ├── badge.tsx
│       ├── button.tsx        # Button component pattern
│       ├── card.tsx
│       └── ... (other UI components)
├── lib/
│   └── utils.ts             # cn() utility function
├── docs/
│   ├── features/
│   │   └── sidebar.md       # Feature requirements
│   └── libs/                # Library documentation
├── PRPs/
│   ├── templates/
│   │   └── prp_base.md      # PRP template
│   └── ai_docs/             # Additional documentation
└── package.json             # Dependencies: next@16.1.1, react@19.2.3, lucide-react@^0.562.0
```

### Desired Codebase tree with files to be added and responsibility of file

```bash
camping-dashboard/
├── app/
│   ├── layout.tsx           # MODIFY: Add SidebarProvider and Sidebar wrapper
│   ├── dashboard/
│   │   └── page.tsx         # CREATE: Dashboard route page
│   ├── relatorios/
│   │   └── page.tsx         # CREATE: Relatórios route page
│   └── configuracoes/
│       └── page.tsx         # CREATE: Configurações route page
├── components/
│   ├── sidebar.tsx          # CREATE: Main sidebar component (client component)
│   └── ui/
│       └── sidebar.tsx      # CREATE: shadcn/ui sidebar component (install via CLI)
├── lib/
│   └── hooks/
│       └── use-local-storage.ts  # CREATE: SSR-safe localStorage hook
└── (no other changes)
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Next.js App Router - Server Components by default
// Sidebar must be "use client" because it uses useState, useEffect, usePathname
// Layout can remain Server Component, but must wrap SidebarProvider

// CRITICAL: localStorage is not available during SSR
// Must check typeof window !== 'undefined' before accessing localStorage
// Use useEffect to read from localStorage after hydration
// Custom hook must handle SSR safely to avoid hydration mismatches

// CRITICAL: shadcn/ui sidebar requires SidebarProvider at root
// SidebarProvider must wrap the entire layout
// Sidebar component uses context from SidebarProvider

// CRITICAL: usePathname only works in client components
// Must be used inside "use client" component
// Returns current pathname (e.g., "/dashboard", "/relatorios")

// CRITICAL: Next.js Link component requires client component
// Cannot use Link in Server Components
// Use <Link href="/dashboard"> for navigation

// CRITICAL: Lucide React icons use Icon suffix in this codebase
// Import as: import { LayoutDashboardIcon, FileTextIcon, SettingsIcon } from "lucide-react"
// Not: import { LayoutDashboard, FileText, Settings }
// Check components/component-example.tsx for pattern

// CRITICAL: CSS variables for sidebar already exist in app/globals.css
// Use --sidebar, --sidebar-foreground, --sidebar-accent, etc.
// These are already defined for light and dark modes

// GOTCHA: Button component uses asChild prop with Slot.Root
// When asChild=true, Button renders as child element (e.g., Link)
// Use asChild when wrapping Link components

// GOTCHA: cn() utility must be used for all className composition
// Never use template literals or string concatenation for classes
// Follow pattern: className={cn("base-classes", conditionalClasses, className)}
```

## Implementation Blueprint

### Data models and structure

No data models needed - this is a UI component with client-side state only.

State structure:

```typescript
// Sidebar state (persisted in localStorage)
type SidebarState = {
  isOpen: boolean; // true = expanded, false = collapsed
};

// Navigation item structure
type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: INSTALL shadcn/ui sidebar component
  - COMMAND: npx shadcn@latest add sidebar
  - VERIFY: components/ui/sidebar.tsx is created
  - CHECK: components.json is updated with sidebar entry
  - PLACEMENT: Component installed in components/ui/

Task 2: CREATE lib/hooks/use-local-storage.ts
  - IMPLEMENT: SSR-safe localStorage hook with useState and useEffect
  - FOLLOW pattern: Check typeof window !== 'undefined' before localStorage access
  - NAMING: useLocalStorage<T>(key: string, initialValue: T) hook
  - FEATURES:
    * Read from localStorage on mount (useEffect)
    * Write to localStorage on value change (useEffect)
    * Return [value, setValue] tuple like useState
    * Handle SSR by returning initialValue during server render
  - PLACEMENT: lib/hooks/use-local-storage.ts
  - DEPENDENCIES: React hooks only

Task 3: CREATE components/sidebar.tsx
  - IMPLEMENT: Main sidebar component with navigation items and toggle
  - MARK: "use client" directive at top
  - IMPORTS:
    * Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger from "@/components/ui/sidebar"
    * Link from "next/link"
    * usePathname from "next/navigation"
    * useLocalStorage from "@/lib/hooks/use-local-storage"
    * Icons: LayoutDashboardIcon, FileTextIcon, SettingsIcon, ChevronLeftIcon, ChevronRightIcon from "lucide-react"
    * cn from "@/lib/utils"
  - FEATURES:
    * Use SidebarProvider to wrap content
    * Use Sidebar component with controlled open state from localStorage
    * Display project title when expanded
    * Three menu items: Dashboard (/dashboard), Relatórios (/relatorios), Configurações (/configuracoes)
    * Use usePathname to detect active route
    * Highlight active route with distinct styling
    * SidebarTrigger button to toggle collapse/expand
    * Use useLocalStorage("sidebar-open", true) for state persistence
    * Smooth transitions using CSS (shadcn/ui sidebar includes these)
    * Tooltips on icons when collapsed (shadcn/ui sidebar handles this)
  - NAMING: Sidebar component, NavItem type, navItems array
  - PLACEMENT: components/sidebar.tsx
  - DEPENDENCIES: Task 1 (sidebar component), Task 2 (localStorage hook)

Task 4: CREATE app/dashboard/page.tsx
  - IMPLEMENT: Dashboard route page
  - PATTERN: Simple page component returning JSX
  - CONTENT: Placeholder content "Dashboard" or actual dashboard content
  - PLACEMENT: app/dashboard/page.tsx
  - DEPENDENCIES: None (independent route)

Task 5: CREATE app/relatorios/page.tsx
  - IMPLEMENT: Relatórios (Reports) route page
  - PATTERN: Simple page component returning JSX
  - CONTENT: Placeholder content "Relatórios" or actual reports content
  - PLACEMENT: app/relatorios/page.tsx
  - DEPENDENCIES: None (independent route)

Task 6: CREATE app/configuracoes/page.tsx
  - IMPLEMENT: Configurações (Settings) route page
  - PATTERN: Simple page component returning JSX
  - CONTENT: Placeholder content "Configurações" or actual settings content
  - PLACEMENT: app/configuracoes/page.tsx
  - DEPENDENCIES: None (independent route)

Task 7: MODIFY app/layout.tsx
  - INTEGRATE: Wrap children with SidebarProvider and Sidebar component
  - IMPORT: Sidebar from "@/components/sidebar"
  - PATTERN:
    * Keep layout as Server Component (no "use client")
    * Import Sidebar (which is client component)
    * Wrap body content: <SidebarProvider><Sidebar />{children}</SidebarProvider>
  - PRESERVE: Existing layout structure, fonts, metadata
  - PLACEMENT: app/layout.tsx
  - DEPENDENCIES: Task 3 (Sidebar component)
```

### Implementation Patterns & Key Details

```typescript
// Pattern: SSR-safe localStorage hook
"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Return initialValue during SSR (when window is undefined)
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // Update localStorage when value changes (after hydration)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error saving to localStorage:`, error);
      }
    }
  }, [key, storedValue]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage value:`, error);
    }
  };

  return [storedValue, setValue];
}

// Pattern: Sidebar component structure
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Relatórios", href: "/relatorios", icon: FileTextIcon },
  { label: "Configurações", href: "/configuracoes", icon: SettingsIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useLocalStorage("sidebar-open", true);

  return (
    <SidebarProvider>
      <Sidebar open={isOpen} onOpenChange={setIsOpen}>
        <SidebarContent>
          {/* Project Title - only show when expanded */}
          {isOpen && (
            <div className="px-4 py-4 border-b">
              <h2 className="text-lg font-semibold">Camping Dashboard</h2>
            </div>
          )}

          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarTrigger />
      </Sidebar>
    </SidebarProvider>
  );
}

// Pattern: Layout integration
import { AppSidebar } from "@/components/sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppSidebar />
        <main>{children}</main>
      </body>
    </html>
  );
}

// GOTCHA: SidebarProvider must wrap both Sidebar and main content
// shadcn/ui sidebar handles the layout automatically when used correctly
// Check shadcn/ui sidebar docs for exact SidebarProvider usage pattern
```

### Integration Points

```yaml
LAYOUT:
  - modify: app/layout.tsx
  - pattern: Import Sidebar, wrap children with SidebarProvider
  - note: SidebarProvider manages sidebar state and layout automatically

ROUTES:
  - create: app/dashboard/page.tsx
  - create: app/relatorios/page.tsx
  - create: app/configuracoes/page.tsx
  - pattern: Simple page components for each route
  - note: Routes must exist for navigation to work

CSS:
  - already exists: app/globals.css has sidebar CSS variables
  - no changes needed: shadcn/ui sidebar uses existing variables
  - note: CSS variables are already defined for light/dark mode

DEPENDENCIES:
  - install: shadcn/ui sidebar component via CLI
  - no new npm packages: All dependencies already in package.json
  - note: shadcn/ui sidebar may add radix-ui primitives automatically
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
pnpm type-check                    # TypeScript type checking
pnpm lint                          # ESLint checking
pnpm format:check                  # Prettier format checking

# Fix issues automatically
pnpm lint:fix                      # Auto-fix ESLint issues
pnpm format                        # Auto-format with Prettier

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Component Validation (Component Testing)

```bash
# Start development server
pnpm dev

# Manual testing checklist:
# 1. Open http://localhost:3000
# 2. Verify sidebar renders with project title and 3 menu items
# 3. Click toggle button - sidebar should collapse/expand
# 4. Click each menu item - should navigate to correct route
# 5. Verify active route is highlighted
# 6. Refresh page - sidebar state should persist
# 7. Check browser console for errors
# 8. Test in mobile view - sidebar should use drawer pattern

# Expected: All manual tests pass. No console errors. Smooth animations.
```

### Level 3: Integration Testing (System Validation)

```bash
# Build validation
pnpm build

# Expected: Build completes successfully with no errors

# Start production server
pnpm start

# Test in production mode:
# 1. Verify sidebar works in production build
# 2. Test localStorage persistence
# 3. Test navigation
# 4. Test responsive behavior

# Expected: All functionality works in production build
```

### Level 4: Creative & Domain-Specific Validation

```bash
# Accessibility validation
# Test with keyboard navigation:
# 1. Tab through sidebar items
# 2. Enter/Space to activate links
# 3. Verify focus indicators are visible
# 4. Test with screen reader (if available)

# Performance validation
# Check Lighthouse scores:
# 1. Run Lighthouse audit
# 2. Verify no layout shift (CLS)
# 3. Check First Contentful Paint

# Browser compatibility
# Test in:
# - Chrome/Edge (Chromium)
# - Firefox
# - Safari (if available)

# Expected: Accessible, performant, works across browsers
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] Type checking passes: `pnpm type-check`
- [ ] Linting passes: `pnpm lint`
- [ ] Formatting passes: `pnpm format:check`
- [ ] Build succeeds: `pnpm build`
- [ ] No console errors in browser
- [ ] No hydration errors

### Feature Validation

- [ ] Project title displays when sidebar is expanded
- [ ] Three menu items render correctly (Dashboard, Relatórios, Configurações)
- [ ] Toggle button collapses/expands sidebar
- [ ] Active route is highlighted with distinct styling
- [ ] Sidebar state persists in localStorage across page reloads
- [ ] Smooth animations for collapse/expand
- [ ] Mobile responsive behavior works (drawer pattern)
- [ ] Tooltips appear on icons when sidebar is collapsed
- [ ] Navigation works correctly to all three routes
- [ ] All routes render without errors

### Code Quality Validation

- [ ] Follows existing codebase patterns (see components/component-example.tsx)
- [ ] Uses "use client" directive only where needed
- [ ] Imports use @/ aliases (see tsconfig.json paths)
- [ ] Uses cn() utility for all className composition
- [ ] Icons imported with Icon suffix (see components/component-example.tsx)
- [ ] File placement matches desired codebase tree structure
- [ ] No hardcoded values - uses CSS variables from globals.css
- [ ] SSR-safe localStorage implementation (no hydration errors)

### Documentation & Deployment

- [ ] Code is self-documenting with clear variable/function names
- [ ] Component structure follows shadcn/ui sidebar patterns
- [ ] localStorage key is descriptive ("sidebar-open")
- [ ] No console.log statements in production code

---

## Anti-Patterns to Avoid

- ❌ Don't access localStorage directly without SSR check - causes hydration errors
- ❌ Don't use useState for localStorage - use custom hook pattern
- ❌ Don't forget "use client" directive on sidebar component
- ❌ Don't use Server Component for sidebar (needs usePathname, useState)
- ❌ Don't hardcode colors - use CSS variables from globals.css
- ❌ Don't skip SidebarProvider - sidebar requires context provider
- ❌ Don't use string concatenation for className - use cn() utility
- ❌ Don't import icons without Icon suffix - check component-example.tsx pattern
- ❌ Don't create routes without page.tsx files - Next.js App Router requirement
- ❌ Don't skip localStorage persistence - requirement from feature spec

---

## Confidence Score

**Rating: 9/10**

**Reasoning**:

- All required context is provided (shadcn/ui docs, Next.js patterns, codebase conventions)
- Specific file references with exact patterns to follow
- Clear implementation tasks with dependency ordering
- SSR-safe localStorage pattern documented
- All gotchas and critical requirements highlighted
- Project-specific validation commands provided
- Code examples show exact patterns to follow

**Potential risks**:

- shadcn/ui sidebar API may have slight variations - check latest docs if issues arise
- Mobile drawer pattern may need additional configuration - refer to shadcn/ui sidebar mobile docs
