# next-themes Library Documentation

## Overview

`next-themes` is the standard library for implementing theme switching in Next.js applications. It provides system preference detection, persistence, and SSR-safe theme management.

## Installation

```bash
npm install next-themes
```

## Core Concepts

### ThemeProvider

The main provider component that manages theme state and provides context to child components.

```tsx
import { ThemeProvider } from "next-themes";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

### Key Props

- `attribute`: How theme is applied (`"class"` for Tailwind CSS)
- `defaultTheme`: Initial theme (`"light"`, `"dark"`, `"system"`)
- `enableSystem`: Allow system preference detection
- `storageKey`: localStorage key (default: `"theme"`)
- `themes`: Array of available themes (default: `["light", "dark"]`)

### useTheme Hook

Access theme state and controls in components:

```tsx
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Current: {resolvedTheme}
    </button>
  );
}
```

### Hook Properties

- `theme`: Current theme setting (`"light"`, `"dark"`, `"system"`)
- `setTheme(theme)`: Function to change theme
- `resolvedTheme`: Actual theme being used (resolves "system" to light/dark)
- `systemTheme`: System preference (`"light"` or `"dark"`)
- `themes`: Available themes array

## SSR Considerations

### Hydration Mismatch Prevention

```tsx
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or skeleton
  }

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle theme
    </button>
  );
}
```

### Script Tag for Flash Prevention

Add to `pages/_document.tsx` or `app/layout.tsx`:

```tsx
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Tailwind CSS Integration

### Configuration

Ensure Tailwind is configured for dark mode:

```js
// tailwind.config.js
module.exports = {
  darkMode: "class", // or 'media' for system-only
  // ... rest of config
};
```

### CSS Variables Approach

```css
:root {
  --background: 255 255 255;
  --foreground: 0 0 0;
}

.dark {
  --background: 0 0 0;
  --foreground: 255 255 255;
}
```

## Common Patterns

### Theme Toggle Button

```tsx
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

### Theme Dropdown

```tsx
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Best Practices

1. **Always use `suppressHydrationWarning`** on html element
2. **Check mounted state** before rendering theme-dependent UI
3. **Use `resolvedTheme`** for actual theme value, not `theme`
4. **Place ThemeProvider high** in component tree
5. **Use CSS variables** for theme-aware styling
6. **Test system preference** changes during development

## Common Issues

### Flash of Wrong Theme

- Add `suppressHydrationWarning` to html element
- Use proper SSR patterns with mounted state

### Hydration Mismatches

- Always check if component is mounted before rendering theme UI
- Use consistent initial states between server and client

### System Theme Not Working

- Ensure `enableSystem={true}` on ThemeProvider
- Check browser support for `prefers-color-scheme`

## Version Compatibility

- Next.js 12+: Full support
- Next.js 13+ App Router: Use in client components or with proper SSR patterns
- React 16.8+: Required for hooks support
