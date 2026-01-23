name: "Dark/Light Theme Toggle PRP - Next.js 16 + shadcn/ui Implementation"
description: |
Comprehensive PRP for implementing theme switching functionality with system preference detection,
manual control, persistence, and smooth transitions in a Next.js 16 camping dashboard application.

---

## Goal

**Feature Goal**: Implement a complete dark/light theme toggle system that automatically detects user's system preference on first visit, provides manual theme switching via header button, persists user choices, and applies consistent theming across the entire application.

**Deliverable**: Fully functional theme switching system with:

- System preference auto-detection on first visit
- Manual toggle button in application header
- Theme persistence across browser sessions
- Smooth transitions between themes
- Consistent styling across all shadcn/ui components

**Success Definition**: Users can seamlessly switch between light and dark themes with their preference remembered, system preference is respected initially, and all UI components display correctly in both themes.

## User Persona

**Target User**: End users of the camping dashboard application

**Use Case**: Users want to customize their viewing experience based on personal preference, ambient lighting conditions, or system settings

**User Journey**:

1. User visits application for first time → System detects OS theme preference → Application loads in matching theme
2. User clicks theme toggle button in header → Theme switches instantly with smooth transition
3. User refreshes page or returns later → Previous manual choice is preserved and loaded
4. User changes system theme → If no manual preference set, application follows system change

**Pain Points Addressed**:

- Eye strain in low-light conditions (dark mode)
- Preference for consistent theming with system settings
- Need for manual override when system preference doesn't match current context
- Jarring theme switches without smooth transitions

## Why

- **User Experience**: Provides personalized viewing experience that reduces eye strain and matches user preferences
- **Accessibility**: Dark mode helps users with light sensitivity and improves usability in various lighting conditions
- **Modern Standards**: Theme switching is expected functionality in contemporary web applications
- **System Integration**: Respects user's system-wide theme preferences while allowing manual override
- **Brand Consistency**: Maintains design system integrity across both light and dark themes

## What

### User-Visible Behavior

- **Initial Load**: Application detects system theme preference and applies appropriate theme
- **Manual Control**: Toggle button in header allows instant theme switching
- **Persistence**: Manual theme choice overrides system preference and persists across sessions
- **Smooth Transitions**: Theme changes animate smoothly without jarring flashes
- **Consistent Styling**: All components (sidebar, buttons, forms, etc.) adapt to selected theme

### Technical Requirements

- Integration with Next.js 16 App Router and SSR
- Use of next-themes library for theme management
- Tailwind CSS dark mode classes for styling
- shadcn/ui component compatibility
- localStorage persistence for user preferences
- CSS transitions for smooth theme changes

### Success Criteria

- [ ] System theme preference is automatically detected on first visit
- [ ] Theme toggle button is accessible in application header on all pages
- [ ] Manual theme selection overrides system preference
- [ ] Theme choice persists across browser sessions and page reloads
- [ ] All shadcn/ui components display correctly in both themes
- [ ] Theme transitions are smooth without content flashing
- [ ] No hydration mismatches or SSR issues
- [ ] Theme state is accessible throughout component tree

## All Needed Context

### Context Completeness Check

_This PRP provides complete implementation context including exact file paths, library integration patterns, component structures, and validation commands. An AI agent with no prior knowledge of this codebase can successfully implement the theme system using only this PRP and codebase access._

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- docfile: PRPs/ai_docs/next-themes.md
  why: Complete next-themes library documentation with SSR patterns, hooks usage, and Tailwind integration
  section: All sections - Core Concepts, SSR Considerations, Tailwind Integration, Common Patterns
  critical: SSR hydration patterns and suppressHydrationWarning usage to prevent flash

- url: https://ui.shadcn.com/docs/dark-mode
  why: Official shadcn/ui dark mode implementation guide with theme provider setup
  critical: CSS variable approach and component compatibility patterns

- file: app/globals.css
  why: Current CSS variables structure and dark mode classes - follow existing pattern
  pattern: CSS variables in :root and .dark selectors, @theme inline structure
  gotcha: Uses oklch() color format, not hex or rgb - maintain consistency

- file: app/layout.tsx
  why: Root layout structure for ThemeProvider placement and suppressHydrationWarning
  pattern: Font loading, metadata, and provider wrapping structure
  gotcha: Must wrap AppSidebar with ThemeProvider, not replace it

- file: components/app-header.tsx
  why: Header component structure for theme toggle button placement
  pattern: SidebarTrigger, Separator usage, and button positioning
  gotcha: Uses FilterProvider context - theme toggle must not conflict

- file: components/ui/button.tsx
  why: Button component variants and styling patterns for theme toggle
  pattern: Variant system with cva, size props, and icon handling
  gotcha: Complex variant system - use existing patterns for consistency

- file: lib/hooks/use-local-storage.ts
  why: SSR-safe localStorage pattern already implemented in codebase
  pattern: useState with useEffect, typeof window checks, error handling
  gotcha: Already handles SSR safety - can reference for consistency but next-themes handles persistence
```

### Current Codebase Tree

```bash
camping-dashboard/
├── app/
│   ├── layout.tsx              # Root layout with AppSidebar - ADD ThemeProvider here
│   ├── globals.css             # CSS variables and dark mode classes - EXTEND
│   ├── page.tsx                # Dashboard page
│   ├── relatorios/page.tsx     # Reports page
│   └── configuracoes/page.tsx  # Settings page
├── components/
│   ├── sidebar.tsx             # Main sidebar with SidebarProvider
│   ├── app-header.tsx          # Header with filters - ADD theme toggle here
│   └── ui/
│       ├── button.tsx          # Button component - USE for theme toggle
│       ├── sidebar.tsx         # shadcn/ui sidebar components
│       └── [other-ui-components]
├── lib/
│   ├── utils.ts                # cn() utility function
│   └── hooks/
│       └── use-local-storage.ts # SSR-safe localStorage hook (reference)
├── hooks/
│   └── use-filters.tsx         # Filter context provider
├── tailwind.config.ts          # Tailwind configuration
└── components.json             # shadcn/ui configuration
```

### Desired Codebase Tree with New Files

```bash
camping-dashboard/
├── app/
│   ├── layout.tsx              # MODIFY: Add ThemeProvider wrapper
│   └── globals.css             # MODIFY: Extend dark mode CSS variables if needed
├── components/
│   ├── app-header.tsx          # MODIFY: Add theme toggle button
│   ├── theme-toggle.tsx        # CREATE: Theme toggle button component
│   └── theme-provider.tsx      # CREATE: Client-side theme provider wrapper
├── lib/
│   └── hooks/
│       └── use-theme.ts        # CREATE: Custom theme hook wrapper (optional)
└── package.json                # MODIFY: Add next-themes dependency
```

### Known Gotchas of our Codebase & Library Quirks

```typescript
// CRITICAL: Next.js 16 App Router requires client components for theme providers
// ThemeProvider from next-themes must be in a "use client" component
// Cannot be directly in app/layout.tsx which is a server component

// CRITICAL: Hydration mismatch prevention
// Must use suppressHydrationWarning on <html> element in layout.tsx
// Theme toggle components must check mounted state before rendering

// CRITICAL: CSS Variables in globals.css use oklch() format
// :root and .dark selectors already exist with comprehensive variable set
// Follow existing oklch(lightness chroma hue) format, not hex/rgb

// CRITICAL: shadcn/ui components use CSS variables for theming
// All components automatically support dark mode via CSS variables
// No need to modify individual component styles

// CRITICAL: FilterProvider context in sidebar.tsx
// Theme toggle in app-header.tsx must not interfere with existing FilterProvider
// Both providers can coexist - ThemeProvider should wrap higher in tree

// CRITICAL: Tailwind CSS configuration
// Project uses custom @theme inline configuration in globals.css
// Dark mode already configured with @custom-variant dark (&:is(.dark *))
// Use 'class' strategy for next-themes attribute prop

// CRITICAL: SSR and localStorage
// next-themes handles persistence automatically via localStorage
// Don't create custom localStorage logic - use library's built-in persistence
// Library handles SSR safety internally
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// Theme state managed by next-themes library
type Theme = "light" | "dark" | "system";

// Theme context provided by next-themes
interface ThemeContextType {
  theme: Theme | undefined;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark" | undefined;
  systemTheme: "light" | "dark" | undefined;
  themes: string[];
}

// Component props for theme toggle
interface ThemeToggleProps {
  variant?: "button" | "dropdown";
  size?: "sm" | "default" | "lg";
  className?: string;
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: INSTALL next-themes library
  - COMMAND: cd /home/wicarpessoa/personal/camping-dashboard && pnpm add next-themes
  - VERIFY: package.json includes "next-themes": "^0.4.4" or latest
  - DEPENDENCIES: None
  - PLACEMENT: Root dependency

Task 2: CREATE components/theme-provider.tsx
  - IMPLEMENT: Client-side wrapper for next-themes ThemeProvider
  - FOLLOW pattern: "use client" directive, children prop typing
  - NAMING: ThemeProvider component wrapping next-themes ThemeProvider
  - FEATURES:
    * attribute="class" for Tailwind CSS integration
    * defaultTheme="system" for system preference detection
    * enableSystem={true} for system theme detection
    * suppressHydrationWarning for SSR compatibility
  - PLACEMENT: components/theme-provider.tsx
  - DEPENDENCIES: next-themes library from Task 1

Task 3: MODIFY app/layout.tsx
  - INTEGRATE: Wrap existing AppSidebar with ThemeProvider
  - FIND pattern: Current AppSidebar wrapping in body element
  - ADD: Import ThemeProvider and wrap AppSidebar
  - PRESERVE: Existing font loading, metadata, className structure
  - ADD: suppressHydrationWarning to html element
  - PLACEMENT: Modify existing app/layout.tsx
  - DEPENDENCIES: ThemeProvider component from Task 2

Task 4: CREATE components/theme-toggle.tsx
  - IMPLEMENT: Theme toggle button component with icon transitions
  - FOLLOW pattern: components/ui/button.tsx for button styling
  - NAMING: ThemeToggle component with useTheme hook integration
  - FEATURES:
    * Sun/Moon icon with smooth transitions
    * Mounted state check for SSR safety
    * Button variant="ghost" size="icon"
    * Accessible screen reader text
    * Click handler for theme switching
  - PLACEMENT: components/theme-toggle.tsx
  - DEPENDENCIES: next-themes useTheme hook, lucide-react icons, Button component

Task 5: MODIFY components/app-header.tsx
  - INTEGRATE: Add ThemeToggle component to header
  - FIND pattern: Existing button layout with Separator components
  - ADD: ThemeToggle component in appropriate position
  - PRESERVE: Existing SidebarTrigger, filter controls, and layout
  - PLACEMENT: Add to existing header component structure
  - DEPENDENCIES: ThemeToggle component from Task 4

Task 6: VERIFY globals.css dark mode variables
  - CHECK: Existing .dark selector has all necessary CSS variables
  - VALIDATE: All shadcn/ui components have dark mode variable definitions
  - EXTEND: Add any missing variables if components don't theme properly
  - PRESERVE: Existing oklch() color format and variable structure
  - PLACEMENT: Modify app/globals.css only if needed
  - DEPENDENCIES: All previous tasks completed for testing
```

### Implementation Patterns & Key Details

```typescript
// Pattern: Client-side ThemeProvider wrapper
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Pattern: SSR-safe theme toggle component
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Pattern: Layout integration with suppressHydrationWarning
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppSidebar>{children}</AppSidebar>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Pattern: Header integration preserving existing structure
export function AppHeader() {
  const { filters, setPeriod, setProfileId } = useFilters();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />

      <div className="flex-1" />

      {/* Existing filter controls */}
      <div className="flex items-center gap-1">
        {/* ... existing period buttons ... */}
      </div>

      <Separator orientation="vertical" className="h-4" />

      {/* Existing profile select */}
      <Select>
        {/* ... existing select ... */}
      </Select>

      <Separator orientation="vertical" className="h-4" />

      {/* NEW: Theme toggle */}
      <ThemeToggle />
    </header>
  );
}
```

### Integration Points

```yaml
LAYOUT:
  - modify: app/layout.tsx
  - pattern: "Wrap AppSidebar with ThemeProvider, add suppressHydrationWarning to html"
  - preserve: "Existing font loading, metadata, and body className"

HEADER:
  - modify: components/app-header.tsx
  - pattern: "Add ThemeToggle after existing controls with Separator"
  - preserve: "SidebarTrigger, filter controls, and existing layout"

STYLING:
  - verify: app/globals.css
  - pattern: "Existing .dark selector and CSS variables should work automatically"
  - extend: "Only if specific components need additional dark mode variables"

DEPENDENCIES:
  - add: package.json
  - pattern: "pnpm add next-themes"
  - version: "Latest stable version (^0.4.4 or newer)"
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
cd /home/wicarpessoa/personal/camping-dashboard

# Type checking
pnpm type-check

# Linting and formatting
pnpm lint
pnpm lint:fix

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Component Testing (Feature Validation)

```bash
# Start development server
pnpm dev

# Manual testing checklist:
# 1. Open application in browser
# 2. Verify initial theme matches system preference
# 3. Click theme toggle button in header
# 4. Verify smooth transition between themes
# 5. Refresh page - verify theme persists
# 6. Change system theme - verify app follows if no manual selection
# 7. Test on different pages (dashboard, relatorios, configuracoes)
# 8. Verify all components (sidebar, buttons, forms) theme correctly

# Browser console check
# Open DevTools Console - should show no hydration warnings or errors
# Network tab - verify no unnecessary re-renders or requests

# Expected: All manual tests pass, no console errors, smooth transitions
```

### Level 3: Cross-Browser & Device Testing

```bash
# Test system preference detection
# 1. Set OS to light mode, open app in new incognito window
# 2. Set OS to dark mode, open app in new incognito window
# 3. Verify app matches system preference in both cases

# Test persistence
# 1. Toggle theme manually
# 2. Close browser completely
# 3. Reopen browser and navigate to app
# 4. Verify manual choice is preserved

# Test responsive behavior
# 1. Test theme toggle on mobile viewport
# 2. Verify button is accessible and functional
# 3. Check theme consistency across different screen sizes

# Expected: Consistent behavior across browsers, devices, and viewport sizes
```

### Level 4: Integration & Performance Validation

```bash
# Build and production testing
pnpm build
pnpm start

# Performance testing
# 1. Lighthouse audit - verify no performance regression
# 2. Check for theme flash on page load
# 3. Measure theme toggle response time
# 4. Verify no layout shift during theme changes

# SSR validation
# 1. View page source - verify no theme-specific content in HTML
# 2. Disable JavaScript - verify graceful degradation
# 3. Test with slow network - verify no theme flash

# Accessibility testing
# 1. Screen reader testing - verify theme toggle is announced
# 2. Keyboard navigation - verify theme toggle is focusable
# 3. High contrast mode - verify themes work with system high contrast

# Expected: Production build works, no performance issues, accessible
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] No TypeScript errors: `pnpm type-check`
- [ ] No linting errors: `pnpm lint`
- [ ] Production build successful: `pnpm build`
- [ ] No hydration warnings in browser console

### Feature Validation

- [ ] System theme preference detected on first visit
- [ ] Theme toggle button visible and functional in header
- [ ] Manual theme selection overrides system preference
- [ ] Theme choice persists across browser sessions
- [ ] Smooth transitions between light and dark themes
- [ ] All shadcn/ui components display correctly in both themes
- [ ] No flash of wrong theme on page load

### User Experience Validation

- [ ] Theme toggle is intuitive and responsive
- [ ] Icons animate smoothly during theme changes
- [ ] Consistent theming across all application pages
- [ ] Accessible to screen readers and keyboard navigation
- [ ] Works correctly on mobile and desktop viewports

### Integration Validation

- [ ] No conflicts with existing FilterProvider context
- [ ] Sidebar, header, and content areas theme consistently
- [ ] Theme state accessible throughout component tree
- [ ] No impact on existing functionality (filters, navigation)

---

## Anti-Patterns to Avoid

- ❌ Don't create custom localStorage theme persistence - use next-themes built-in
- ❌ Don't modify individual component styles - use CSS variables approach
- ❌ Don't render theme-dependent UI without checking mounted state
- ❌ Don't forget suppressHydrationWarning on html element
- ❌ Don't place ThemeProvider in server components - use client wrapper
- ❌ Don't hardcode theme values - use useTheme hook for dynamic access
- ❌ Don't skip SSR testing - theme flash issues only appear in production-like conditions

**Confidence Score: 9/10** - This PRP provides complete implementation context with exact file paths, proven patterns, comprehensive validation, and addresses all known SSR and hydration gotchas specific to Next.js 16 and shadcn/ui integration.
