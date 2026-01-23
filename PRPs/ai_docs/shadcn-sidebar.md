# shadcn/ui Sidebar Component - AI Reference Documentation

> **Source**: https://ui.shadcn.com/docs/components/sidebar
> **Purpose**: Comprehensive reference for implementing collapsible sidebar with header integration

## Installation

```bash
pnpm dlx shadcn@latest add sidebar
```

## Core Concepts

### CSS Variables (Width Control)

```tsx
const SIDEBAR_WIDTH = "16rem"; // 256px - expanded
const SIDEBAR_WIDTH_MOBILE = "18rem"; // 288px - mobile sheet
const SIDEBAR_WIDTH_ICON = "3rem"; // 48px - collapsed (icon mode)
```

### State Management

The sidebar uses React Context to share state between components:

```tsx
type SidebarContextProps = {
  state: "expanded" | "collapsed"; // Visual state for data attributes
  open: boolean; // Desktop open state
  setOpen: (open: boolean) => void;
  openMobile: boolean; // Mobile sheet state
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean; // Viewport detection
  toggleSidebar: () => void; // Toggle function
};
```

### useSidebar Hook

Access sidebar state from any component within SidebarProvider:

```tsx
import { useSidebar } from "@/components/ui/sidebar";

function MyComponent() {
  const { state, open, toggleSidebar, isMobile } = useSidebar();

  // state === "expanded" | "collapsed"
  // open === true | false
  // isMobile === true on viewports < 768px
}
```

## Component Hierarchy

```
SidebarProvider          (Context + wrapper div)
├── Sidebar              (Fixed sidebar panel)
│   ├── SidebarHeader    (Sticky header with logo/title)
│   ├── SidebarContent   (Scrollable menu area)
│   │   └── SidebarGroup
│   │       ├── SidebarGroupLabel
│   │       └── SidebarGroupContent
│   │           └── SidebarMenu
│   │               └── SidebarMenuItem
│   │                   └── SidebarMenuButton
│   ├── SidebarFooter    (Sticky footer)
│   └── SidebarRail      (Edge toggle area)
└── SidebarInset         (Main content area - <main>)
    ├── header           (Your header component)
    └── children         (Page content)
```

## Key Props

### SidebarProvider

| Prop           | Type                      | Default | Description                  |
| -------------- | ------------------------- | ------- | ---------------------------- |
| `defaultOpen`  | `boolean`                 | `true`  | Initial state (uncontrolled) |
| `open`         | `boolean`                 | -       | Controlled open state        |
| `onOpenChange` | `(open: boolean) => void` | -       | Change callback              |

### Sidebar

| Prop          | Type     | Options                              | Default         | Description    |
| ------------- | -------- | ------------------------------------ | --------------- | -------------- |
| `side`        | `string` | `"left"`, `"right"`                  | `"left"`        | Side placement |
| `variant`     | `string` | `"sidebar"`, `"floating"`, `"inset"` | `"sidebar"`     | Visual style   |
| `collapsible` | `string` | `"offExamples"`, `"icon"`, `"none"`  | `"offExamples"` | Collapse mode  |

**Collapsible Modes:**

- `"icon"` - Collapses to show only icons (RECOMMENDED for dashboards)
- `"offExamples"` - Slides completely off-screen
- `"none"` - Always expanded

### SidebarMenuButton

| Prop       | Type      | Description                     |
| ---------- | --------- | ------------------------------- |
| `asChild`  | `boolean` | Use with Link components        |
| `isActive` | `boolean` | Highlight as current page       |
| `tooltip`  | `string`  | Shown when sidebar is collapsed |

## Data Attributes for Styling

Use these data attributes to style based on sidebar state:

```tsx
// Hide element when collapsed to icons
className = "group-data-[collapsible=icon]:hidden";

// Conditional styling based on state
className = "group-data-[state=collapsed]:opacity-0";

// Target active menu items
className = "data-active:bg-sidebar-accent";
```

## Layout Pattern (with Header)

```tsx
// app/layout.tsx or components/sidebar.tsx
<SidebarProvider defaultOpen>
  <Sidebar collapsible="icon">
    <SidebarHeader>...</SidebarHeader>
    <SidebarContent>...</SidebarContent>
    <SidebarFooter>...</SidebarFooter>
    <SidebarRail />
  </Sidebar>
  <SidebarInset>
    {/* Header goes here - inside SidebarInset */}
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger />
      {/* Your header content */}
    </header>
    {/* Page content */}
    <div className="flex-1 p-4">{children}</div>
  </SidebarInset>
</SidebarProvider>
```

## Header Width Adjustment

The header width adjusts automatically because:

1. `SidebarProvider` creates a flex container
2. `Sidebar` creates a "gap" element that transitions width
3. `SidebarInset` uses `flex-1` to fill remaining space
4. Transitions are handled by: `transition-[width] duration-200 ease-linear`

**No additional CSS needed for header to respond to sidebar collapse.**

## State Persistence

### Cookie Persistence (Built-in)

The sidebar automatically saves state to a cookie:

```tsx
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
```

### Read Cookie (Server Component)

```tsx
import { cookies } from "next/headers";

export default async function Layout({ children }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return <SidebarProvider defaultOpen={defaultOpen}>...</SidebarProvider>;
}
```

## Keyboard Shortcut

Built-in toggle: **Ctrl/Cmd + B**

```tsx
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
```

## Mobile Behavior

- Viewport < 768px triggers mobile mode
- Uses `Sheet` component (slide-over drawer)
- Separate state: `openMobile`, `setOpenMobile`
- `SidebarTrigger` automatically handles both modes

## Styling Variables

Add to globals.css:

```css
:root {
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}
```

## Common Patterns

### Active Route Detection

```tsx
import { usePathname } from "next/navigation";

const pathname = usePathname();
const isActive = pathname === item.href;

<SidebarMenuButton isActive={isActive} tooltip={item.label}>
```

### Navigation Items Array

```tsx
const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { label: "Reports", href: "/reports", icon: FileTextIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];
```

### Sticky Header Pattern

```tsx
<header
  className={cn(
    "sticky top-0 z-40",
    "flex h-16 shrink-0 items-center gap-2 border-b px-4",
    "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
  )}
>
  <SidebarTrigger />
  <Separator orientation="vertical" className="h-4" />
  {/* Header content */}
</header>
```

## Exports Reference

```tsx
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
```
