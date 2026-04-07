# Technology Stack

**Analysis Date:** 2026-04-02

## Languages

**Primary:**

- TypeScript 5 - Full codebase with strict mode enabled (`strict: true` in `tsconfig.json`)
- JavaScript (ES2017 target) - Bundled through Next.js

**Secondary:**

- JSX/TSX - React component files and App Router layouts

## Runtime

**Environment:**

- Node.js (version specified in `.nvmrc` as "node")

**Package Manager:**

- npm (primary) - Scripts defined in `package.json`
- Lock file: `package-lock.json` (inferred from npm usage)

## Frameworks

**Core:**

- Next.js 16.1.1 - Full-stack React framework with App Router, server/client components
- React 19.2.3 - UI library with concurrent rendering

**UI & Styling:**

- Tailwind CSS 4 - Utility-first CSS framework
- Tailwind CSS PostCSS 4 - Next generation Tailwind with CSS bundling
- shadcn/ui 3.6.2 - Component library built on Radix UI
- Framer Motion 12.34.0 - Animation library for transitions and motion effects
- Radix UI 1.4.3 - Headless UI primitives (base layer for shadcn)
- class-variance-authority 0.7.1 - Component variant management

**Data Visualization:**

- Recharts 3.7.0 - React charting library for dashboards

**Forms & Input:**

- React Hook Form 7.71.2 - Form state management and validation
- @hookform/resolvers 5.2.2 - Schema validation integrations

**Data & Tables:**

- @tanstack/react-table 8.21.3 - Headless table library for data grids

**Maps:**

- react-simple-maps 3.0.0 - SVG maps component

**Other UI Components:**

- lucide-react 0.562.0 - Icon library
- sonner 2.0.7 - Toast notifications
- qrcode.react 4.2.0 - QR code generation
- next-themes 0.4.6 - Theme switching (light/dark)
- @base-ui/react 1.0.0 - Low-level UI component library

## Key Dependencies

**Critical:**

- zod 3.25.76 - TypeScript-first schema validation (validates API responses)
- swr 2.3.8 - Data fetching client library with caching
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.0 - Merges Tailwind classes without conflicts
- date-fns 4.1.0 - Date/time utilities

**Utilities:**

- git-cz 4.9.0 - Commitizen adapter for conventional commits
- tw-animate-css 1.4.0 - Additional Tailwind animation utilities

## Testing

**No test runners configured** - Validation via:

```bash
npm run type-check   # TypeScript strict mode checking
npm run lint         # ESLint validation
npm run build        # Next.js build validation
```

## Linting & Code Quality

**Linting:**

- ESLint 8.57.1 - JavaScript/TypeScript linter
- @typescript-eslint/eslint-plugin 7.18.0 - TypeScript rules
- @typescript-eslint/parser 7.18.0 - TypeScript parser
- eslint-config-airbnb 19.0.4 - Airbnb style guide (extended for TypeScript)
- eslint-config-airbnb-typescript 18.0.0 - Airbnb rules for TypeScript
- eslint-plugin-react 7.37.5 - React linting rules
- eslint-plugin-react-hooks 4.6.0 - React hooks rules
- eslint-plugin-jsx-a11y 6.10.2 - Accessibility rules
- eslint-plugin-import 2.32.0 - Import/export linting
- eslint-plugin-simple-import-sort 12.1.1 - Import sorting
- eslint-plugin-unused-imports 4.3.0 - Unused import detection
- eslint-config-prettier 10.1.8 - Prettier integration
- eslint-import-resolver-typescript 3.7.0 - TypeScript module resolution

**Formatting:**

- Prettier 3.7.4 - Code formatter
- prettier-plugin-tailwindcss 0.7.2 - Tailwind class sorting

**Git Hooks:**

- Husky 9.1.7 - Git hook framework
- lint-staged 16.2.7 - Pre-commit linting
- @commitlint/cli 20.3.1 - Commit message linting
- @commitlint/config-conventional 20.3.1 - Conventional commits config

## Build & Dev Tools

**Build:**

- cross-env 7.0.3 - Cross-platform environment variables
- rimraf 6.0.1 - Cross-platform rm -rf utility
- npm-run-all2 6.1.1 - Run multiple npm scripts

**Development:**

- TypeScript 5 - Type checking and compilation
- @types/node 20 - Node.js type definitions
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions
- @types/qrcode.react 3.0.0 - QR code library types

## Configuration

**Environment:**

- `.env` file pattern (not committed) - Contains `API_URL`, `API_KEY`, `REVALIDATE_SECRET`
- Default `API_URL`: `http://localhost:3001` (fallback in `lib/api/dashboard-server.ts`)
- `NODE_ENV`: Controls secure cookie settings (`production` enables `secure: true`)

**TypeScript:**

- `tsconfig.json`: Strict mode enabled, ES2017 target, JSX react-jsx, path alias `@/*`

**Prettier Configuration** (`prettierrc.json`):

- 80 character print width
- 2 space indentation
- Semicolons enabled
- Single quotes disabled
- Trailing commas all
- Tailwind class sorting enabled

**ESLint Configuration** (`.eslintrc.cjs`):

- Extends Airbnb + Airbnb TypeScript + Prettier
- Max warnings: 10 per lint run
- Custom rules: Consistent type imports, no unused imports
- Warnings for accessibility rules (click events, img redundant alt)

**Next.js Configuration** (`next.config.ts`):

- Output mode: `standalone` (self-contained build)
- Remote image patterns (Spotify, Campingviral APIs)
- Allows images from:
  - `**.scdn.co` (Spotify CDN)
  - `**.spotifycdn.com` (Spotify media)
  - `api.campingviral.com.br` (Internal API)

**Tailwind Configuration** (`tailwind.config.ts`):

- Scans content from `app/`, `components/`, `lib/` directories

## Platform Requirements

**Development:**

- Node.js (version from `.nvmrc`)
- npm 6+
- Git (for Husky hooks)

**Production:**

- Node.js 18+ (Next.js 16 requirement)
- Deployment: Standalone Docker or Node.js hosting
- Memory: Moderate (Next.js SSR + in-memory caching via SWR)
- Environment variables: `API_URL`, `API_KEY`, `REVALIDATE_SECRET` required

**External Services Required:**

- Backend API at `process.env.API_URL`
- Spotify CDN for image assets
- Campingviral API for image assets

---

_Stack analysis: 2026-04-02_
