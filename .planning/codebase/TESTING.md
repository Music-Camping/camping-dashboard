# Testing Patterns

**Analysis Date:** 2026-04-02

## Test Framework

**Status:** No test framework configured

This project **does not use Jest, Vitest, or any unit testing framework**. Testing is performed through:

- TypeScript strict mode type checking (`npm run type-check`)
- ESLint linting (`npm run lint`)
- Full application builds (`npm run build`)
- Manual browser testing via dev server (`npm run dev`)

**Validation Chain:**

```bash
npm run type-check    # TypeScript strict mode
npm run lint          # ESLint + Prettier formatting
npm run build         # Next.js production build
```

All three checks must pass before code is committed (enforced via `npm run prepush`).

## Validation Approach

**TypeScript Strict Mode:**

- `tsconfig.json` configured with `"strict": true`
- All implicit `any` types are errors
- Union types must be narrowed before use
- Null/undefined safety enforced

**ESLint Validation:**

- Airbnb base config + TypeScript rules
- Max 10 warnings per run
- `@typescript-eslint/consistent-type-imports`: Type imports must use `import type`
- `unused-imports/no-unused-imports`: No unused variables or imports
- Custom type narrowing enforced in chart components

**Data Validation:**

- Zod schemas for all API responses (single source of truth)
- Located in: `lib/api/schemas.ts`
- Pattern: Use `schema.safeParse()` and log validation failures

Example from `lib/api/schemas.ts`:

```typescript
export function validateData<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  context: string = "Unknown endpoint",
): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[API Validation Error] ${context}`, {
      errors: result.error.flatten(),
      preview: JSON.stringify(data).slice(0, 200),
    });
    return null;
  }
  return result.data;
}
```

## Code Coverage

**Requirements:** No coverage targets enforced

Coverage is achieved through:

- Compilation and build validation (catches type errors)
- Static analysis via ESLint (catches unused code, import issues)
- Type-driven development (types guide implementation)

No runtime test suites are used.

## Validation Commands

**Development:**

```bash
npm run type-check        # Check TypeScript types (no build)
npm run lint              # Run ESLint with --fix for auto-corrections
npm run format            # Format code with Prettier
npm run check-all         # Run type-check, lint, and format:check sequentially
```

**Pre-commit (automatic):**

```bash
npx lint-staged           # Run in .lintstagedrc.cjs config
```

**Pre-push (automatic):**

```bash
npm run type-check && npm run lint   # Must both pass to push
```

**Build Validation:**

```bash
npm run build             # Full Next.js production build
npm run start             # Start production server (requires successful build)
```

## Git Hooks & Automation

**Pre-commit Hook (.husky/pre-commit):**

- Runs `npx lint-staged` automatically
- Validates only staged files
- Configured in `.lintstagedrc.cjs`

**Lint-staged Configuration:**

```javascript
// .lintstagedrc.cjs
"*.{js,jsx,ts,tsx}": [buildEslintCommand, "prettier --write"],
"*.{json,md,mdx,css,yaml,yml}": ["prettier --write"],
"package.json": ["prettier --write"],
```

- TypeScript/JavaScript: ESLint with `--fix` + Prettier
- Other files: Prettier only
- Config files excluded from linting

**Pre-push Hook (.husky/pre-push):**

- Runs `npm run type-check && npm run lint`
- Must pass before push allowed

**Commit Message Validation:**

- Uses `commitlint` with conventional commits
- Enforced via `.commitlint.config.js`

## Testing Patterns in Code

**Type Safety as Test:**

- TypeScript strict mode catches type mismatches at compile time
- Zod schemas validate runtime data before use
- Examples in `lib/api/schemas.ts` show pattern for all API data

**Error Handling as Validation:**

- API fetch functions return `null` on error or validation failure
- Consumers check for null: `if (!data) return fallback`
- Prevents passing invalid data downstream

Example from `lib/api/dashboard-server.ts`:

```typescript
export async function getDashboardData(): Promise<DashboardResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
      // ...
    });

    if (!res.ok) {
      console.error(`[API Error] GET /api/dashboard returned ${res.status}`);
      return null;
    }

    const rawData = await res.json();
    return processCompanyAndPerformers(rawData as Record<string, unknown>);
  } catch (error) {
    console.error("[API Error] Failed to fetch dashboard data:", error);
    return null;
  }
}
```

**Custom Hook Testing:**

- `useLocalStorage` hook (`lib/hooks/use-local-storage.ts`) handles hydration mismatch
- Tests hydration on mount, persistence on update
- Silently fails on localStorage access errors

Example pattern:

```typescript
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch {
        // Failed to read from localStorage
      }
      setIsHydrated(true);
    }
  }, [key]);
  // ... rest of implementation
}
```

**Component Integration Testing:**

- Manual testing via browser dev server
- Components render with real data from API
- Visual regression caught by developer review

Example test scenario (manual):

1. Start dev server: `npm run dev`
2. Load dashboard in browser
3. Verify chart renders correctly with multi-performer data
4. Check dark mode toggle works
5. Verify responsive layout at different breakpoints

## API Data Validation

**Schema Location:** `lib/api/schemas.ts`

**Schemas defined for:**

- `MetricEntrySchema`: Single data point with timestamp
- `MetricDataSchema`: Latest value + historical entries
- `PlatformMetricsSchema`: Platform-specific metrics (YouTube, Instagram, Spotify)
- `PerformerDataSchema`: Base performer data structure
- `CompanyDataSchema`: Company-level aggregated data
- `DashboardResponseSchema`: Full API response
- `RawPerformerApiSchema`: Raw API format before transformation
- `RawCompanyApiSchema`: Raw company format from backend

**Usage Pattern:**

```typescript
// Validate data before use
const result = DashboardResponseSchema.safeParse(rawData);
if (!result.success) {
  console.error("[API Validation Error]", result.error);
  return null;
}
const validData = result.data; // Fully typed
```

**Type Inference:**

- Types inferred from Zod schemas: `export type DashboardResponse = z.infer<typeof DashboardResponseSchema>`
- Eliminates duplication of type definitions
- Single source of truth for both validation and typing

## Edge Cases & Error Scenarios

**Tested Implicitly Through Build:**

1. **Empty data:**
   - Charts with no data points render loading state
   - Fallback messages shown when data unavailable
   - Type system ensures null checks before rendering

2. **Missing performers:**
   - Components filter to valid performers before use
   - Example: `spotifyData.rankingsByPerformer.filter((p) => p.rankings.length > 0)`

3. **Invalid API responses:**
   - Zod validation catches unexpected schema
   - Logged with context and data preview
   - Returns null to caller

4. **SSR/Hydration issues:**
   - `useLocalStorage` avoids hydration mismatch by initializing with default value
   - Only reads from localStorage after component mounts

5. **Timezone handling:**
   - Fixed UTC-3 offset for Brasília timezone
   - Comment documents DST limitation
   - Recommendation: use `date-fns-tz` for production

Example from `lib/chart-data-transformer.ts`:

```typescript
/**
 * Convert UTC datetime to Brasília timezone (UTC-3 / UTC-2 during DST)
 * NOTE: This uses a fixed UTC-3 offset and doesn't account for DST transitions.
 * For production use with DST support, consider using `date-fns-tz`:
 * formatInTimeZone(date, 'America/Sao_Paulo', 'yyyy-MM-dd')
 */
function getDateKeyInBrasilia(datetimeStr: string): string {
  const date = new Date(datetimeStr);
  const brasiliDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  // ... rest of implementation
}
```

## Manual Testing Checklist

**Before committing:**

1. `npm run type-check` - No TypeScript errors
2. `npm run lint` - No ESLint errors (max 10 warnings)
3. `npm run format:check` - Code is properly formatted
4. `npm run build` - Production build succeeds

**Visual verification (dev server):**

1. `npm run dev` and open http://localhost:3000
2. Load dashboard with real data
3. Verify charts render correctly
4. Test filter period changes (today, 7d, 30d)
5. Test dark mode toggle (if applicable)
6. Verify responsive layout (mobile, tablet, desktop)
7. Check console for any errors or warnings

## Future Testing Considerations

**If test framework is added:**

- Jest or Vitest would handle unit tests
- Focus on data transformation logic and utility functions
- API schema validation already covered by Zod
- Component integration tests via React Testing Library
- E2E tests via Playwright or Cypress

**Currently sufficient validation:**

- TypeScript strict mode catches most errors at compile time
- ESLint catches patterns and unused code
- Zod validates all runtime data
- Manual testing covers UI/UX and integration

---

_Testing analysis: 2026-04-02_
