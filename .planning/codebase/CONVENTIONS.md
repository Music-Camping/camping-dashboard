# Coding Conventions

**Analysis Date:** 2026-04-02

## Naming Patterns

**Files:**

- Components: `PascalCase.tsx` (e.g., `SpotifyHub.tsx`, `MetricCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `chart-data-transformer.ts`, `use-local-storage.ts`)
- Hooks: `kebab-case.ts` with `use-` prefix (e.g., `use-local-storage.ts`)
- Types: `kebab-case.ts` (e.g., `dashboard.ts`, `spotify.ts`)
- Server files: `kebab-case-server.ts` (e.g., `dashboard-server.ts`)

**Functions:**

- Exported functions: `camelCase` (e.g., `calculateGrowth`, `formatCompactNumber`, `extractMultiPerformerData`)
- React components: `PascalCase` (e.g., `SpotifyHub`, `MetricCard`, `AnimatedTopTracks`)
- Private/internal functions: `camelCase` with comments indicating scope (e.g., `transformMetrics`, `consolidateMultiPerformerData`)

**Variables:**

- Constants: `UPPER_SNAKE_CASE` for module-level constants (e.g., `PERFORMER_COLORS`, `REVALIDATE_TIME`)
- Variables and parameters: `camelCase` (e.g., `currentPerformerIndex`, `validPerformers`, `totalValue`)
- Boolean variables: `is-` or `has-` prefix (e.g., `isPositive`, `isPaused`, `hasPlaylistData`)

**Types:**

- Type definitions: `PascalCase` (e.g., `MetricEntry`, `SpotifyMetrics`, `PerformerRanking`)
- Interface names: `PascalCase` suffix with `Props` for component props (e.g., `SpotifyHubProps`, `MetricCardProps`)
- Zod schemas: `PascalCase` suffix with `Schema` (e.g., `MetricEntrySchema`, `DashboardResponseSchema`)

## Code Style

**Formatting:**

- Tool: Prettier 3.7.4
- Line width: 80 characters
- Indentation: 2 spaces (spaces, not tabs)
- Semicolons: Always required
- Trailing commas: All (trailing commas in arrays and objects)
- Quotes: Double quotes for strings (`"text"`, not `'text'`)
- Arrow parens: Always required (e.g., `(arg) => expr`, not `arg => expr`)

**Linting:**

- Tool: ESLint 8.57.1 with Airbnb config
- Max warnings: 10 per lint run (configured in `npm run lint`)
- Auto-fix enabled in git hooks via `eslint --fix`
- TypeScript strict mode: Enabled
- Configuration file: `.eslintrc.cjs`

**Key ESLint Rules:**

- `@typescript-eslint/consistent-type-imports`: Error - Use `import type` for types
- `unused-imports/no-unused-imports`: Error - No unused imports allowed
- `eqeqeq`: Error with null override - Use `===` except for null checks (`== null`)
- `react/react-in-jsx-scope`: Off - Not needed with React 19
- `react/jsx-props-no-spreading`: Off - Allowed for flexibility
- `react/prop-types`: Off - TypeScript handles prop validation
- `react/no-array-index-key`: Warn - Index keys allowed but discouraged

## Import Organization

**Order:**

1. React and Next.js imports (`import { useEffect } from "react"; import Image from "next/image";`)
2. Third-party libraries (`import { motion, AnimatePresence } from "framer-motion";`)
3. Internal components (`import { Button } from "@/components/ui/button";`)
4. Internal utilities and types (`import type { MetricEntry } from "@/lib/types/dashboard"; import { formatCompactNumber } from "@/lib/utils";`)
5. Local module exports (`export function MyComponent() { ... }`)

**Path Aliases:**

- `@/*` → Root directory (configured in `tsconfig.json`)
- All internal imports use absolute path aliases (e.g., `@/components/ui/button`, `@/lib/types/dashboard`)
- No relative imports (`../../../components/...`) in codebase

**Type Imports:**

- Always use `import type` for type-only imports: `import type { MetricEntry } from "@/lib/types/dashboard"`
- Mixed imports use `import type { TypeA } from "..."; import { functionA } from "...";` on separate lines
- Enforced by ESLint rule `@typescript-eslint/consistent-type-imports`

## Error Handling

**Patterns:**

- **API errors**: Log with context tag `[API Error]` or `[API Validation Error]`, include endpoint and preview of response
- **Try-catch blocks**: Always catch errors; return sensible defaults (`null`, `[]`, `{}`) instead of throwing
- **Silent failures**: Acceptable for localStorage operations, graceful fallback to initial value
- **Validation errors**: Use Zod schemas; log validation failures with `console.error` (disabled in prod via linting)
- **Console logging**: Prefix with context (e.g., `[API Error]`) for filtering; prefix errors with module context

Example from `lib/api/schemas.ts`:

```typescript
export function validateData<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context: string = "Unknown endpoint",
): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error(`[API Validation Error] ${context}`, {
      errors: result.error.flatten(),
      preview: JSON.stringify(data).slice(0, 200),
    });
    return null;
  }
  return result.data;
}
```

## Logging

**Framework:** Console API (`console.log`, `console.error`, `console.warn`)

**Patterns:**

- **Error logging**: Always include context tag in square brackets: `console.error("[API Error] ...", error);`
- **Validation logging**: Use dedicated `validateData()` helper in `lib/api/schemas.ts`
- **Disabled in CI/linting**: All `console.*` calls must be disabled via `// eslint-disable-next-line no-console` comment
- **When to log**: Errors in API calls, validation failures, missing tokens/auth
- **What to log**: Context string, error object or preview of problematic data (truncate large responses to 200 chars)
- **What NOT to log**: Secrets, auth tokens, sensitive user data

Example from `lib/api/dashboard-server.ts`:

```typescript
if (!res.ok) {
  // eslint-disable-next-line no-console
  console.error(`[API Error] GET /api/dashboard returned ${res.status}`);
  return null;
}
```

## Comments

**When to Comment:**

- Complex logic: Explain the "why" not the "what" (code shows what, comments explain decision)
- Non-obvious behavior: Timezone conversions, edge cases, workarounds
- API transformations: Document format changes from external APIs
- TODO/FIXME: Use sparingly; prefer creating issues
- Never comment obvious code: `const x = 5; // Set x to 5` ❌

**JSDoc/TSDoc:**

- Used for exported functions, especially server-side functions
- Format: `/** Multi-line comment describing what function does */`
- Include parameter descriptions for complex parameters
- Required for: Public API functions, data transformation functions, server actions

Example from `lib/api/dashboard-server.ts`:

```typescript
/**
 * Transforms raw API response into structured DashboardResponse
 *
 * API format (nested):
 * { "<Company>": { "files": {}, "metrics": {}, "performers": { ... } } }
 *
 * Transforms into flat DashboardResponse:
 * { company: CompanyData, "Performer1": PerformerData, ... }
 */
```

**Inline Comments:**

- Use sparingly; prefer self-documenting code
- Explain non-obvious datetime/timezone logic, browser compatibility quirks
- Use `//` for single-line comments within functions

## Function Design

**Size:**

- Prefer functions under 50 lines (excluding comments)
- Extract complex logic into separate named functions
- Use utility functions in `lib/utils.ts` or `lib/api/schemas.ts` for reusable logic

**Parameters:**

- Prefer object destructuring for >2 parameters
- Use typed interfaces for component props
- Provide default values for optional parameters

Example:

```typescript
interface SpotifyHubProps {
  spotifyData?: SpotifyMetrics;
  fullDashboardData?: DashboardResponse;
  isLoading?: boolean;
  period?: PeriodFilter;
}

export function SpotifyHub({
  spotifyData,
  fullDashboardData,
  isLoading = false,
  period = "7d",
}: SpotifyHubProps) { ... }
```

**Return Values:**

- **Components**: Return JSX.Element
- **Data fetching**: Return `null` on error, typed data on success
- **Utilities**: Return typed values; use generics for reusable utilities like `validateData<T>`
- **Hooks**: Return tuples `[state, setter]` for state hooks; destructure on use

## Module Design

**Exports:**

- Use named exports for functions and components: `export function MyComponent() { ... }`
- Types are exported alongside implementations: `export interface Props { ... }`
- Barrel files: Not used in this codebase; import directly from specific files

**Component Organization:**

- Props interface defined at top of file: `interface ComponentNameProps { ... }`
- Component function defined after interfaces
- Helper functions defined before main component (private functions)
- Export statement at end of file

Example from `components/dashboard/spotify/spotify-hub.tsx`:

```typescript
interface SpotifyHubProps {
  spotifyData?: SpotifyMetrics;
  // ...
}

export function SpotifyHub({
  spotifyData,
  // ...
}: SpotifyHubProps) {
  // Component body
}
```

**Dependency Injection:**

- Props include data and callbacks; avoid importing singleton state
- Callbacks passed as props: `onTogglePause?: () => void; onIndexChange?: (index: number) => void`

## React Patterns

**useState:**

- Always include dependency arrays in hooks
- Keep separate state atoms for independent concerns
- Initialize with sensible defaults

Example from `components/dashboard/spotify/spotify-hub.tsx`:

```typescript
const [currentPerformerIndex, setCurrentPerformerIndex] = useState(0);
const [isPaused, setIsPaused] = useState(false);
```

**useMemo:**

- Use for expensive calculations or creating new objects/arrays
- Include all external variables in dependency array
- Validate with ESLint hook rules

Example:

```typescript
const validPerformers = useMemo(() => {
  if (!spotifyData) return [];
  return spotifyData.rankingsByPerformer.filter((p) => p.rankings.length > 0);
}, [spotifyData]);
```

**useEffect:**

- Always return cleanup function for intervals/listeners
- Include complete dependency array (no empty arrays unless intentional SSR)

Example from `components/dashboard/spotify/spotify-hub.tsx`:

```typescript
useEffect(() => {
  if (validPerformers.length <= 1) {
    return undefined;
  }

  const interval = setInterval(() => {
    if (!isPaused) {
      setCurrentPerformerIndex((prev) => (prev + 1) % validPerformers.length);
    }
  }, 8000);

  return () => clearInterval(interval);
}, [validPerformers.length, isPaused]);
```

**Client Components:**

- Mark with `"use client"` at top of file
- Use only in `components/` directory for interactive features
- Server components at `app/` level for data fetching

## Tailwind CSS & Styling

**Class Order:**

- Use Tailwind's utility classes in logical order
- Prettier plugin `prettier-plugin-tailwindcss` auto-sorts classes
- Use `cn()` utility from `lib/utils.ts` for conditional classes

Example:

```typescript
const className = cn(
  "flex items-center gap-2",
  isActive && "bg-green-500",
  className,
);
```

**Custom Styling:**

- Use Tailwind utilities whenever possible
- Dark mode: Use `dark:` prefix for dark theme classes (e.g., `dark:bg-green-900`)
- Colors: Standard Tailwind palette; avoid hardcoded hex values
- Icons: lucide-react icons with `size-` utility (e.g., `size-4`, `size-6`)

Example:

```typescript
<Badge
  variant="secondary"
  className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
>
  <TrendingUp className="mr-1 size-3" />
  +{formatCompactNumber(growth.absolute)}
</Badge>
```

**shadcn/ui Components:**

- Import from `@/components/ui/` (not npm packages)
- Use component props for styling when possible
- Extend with Tailwind classes when needed

---

_Convention analysis: 2026-04-02_
