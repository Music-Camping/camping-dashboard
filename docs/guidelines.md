# Next.js Development Guidelines

> **Version**: Next.js 16.1.1 | **Last Updated**: January 2026
> Based on official Next.js documentation and React best practices.

## Project Stack

**Auto-Populated Essential Tools**:

- **Testing**: Vitest (v3.x) - Fast, modern test runner - https://vitest.dev
- **Formatting**: Prettier (v3.x) - Opinionated code formatter - https://prettier.io
- **Linting**: ESLint + @next/eslint-plugin-next - Next.js-specific rules - https://nextjs.org/docs/app/api-reference/config/eslint
- **Type Checking**: TypeScript (v5.x) - Static type checking - https://www.typescriptlang.org

> **Note**: All code examples use Next.js built-in features and React primitives.
> Principles apply regardless of additional library choices.

---

## 1. Core Principles

### 1.1 Philosophy and Style

- **Server-first**: Use Server Components by default, Client Components only when needed
- **File conventions**: Follow Next.js file naming (`page.tsx`, `layout.tsx`, `error.tsx`)
- **Automatic formatting**: Use Prettier with consistent configuration
- **Type safety**: Enable strict TypeScript mode

```bash
# Format and lint
pnpm prettier --write .
pnpm eslint . --fix
```

### 1.2 Clarity over Brevity

- Component names should reflect their purpose (`UserProfileCard`, not `UPC`)
- Prefer explicit props over implicit context
- Use meaningful route segment names (`/dashboard/settings`, not `/d/s`)

### 1.3 Server Components by Default

```tsx
// Good: Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data.title}</div>;
}

// Only use 'use client' when necessary
("use client");
export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

---

## 2. Project Initialization

### 2.1 Creating New Project

```bash
# Create new Next.js project with TypeScript
pnpm create next-app@latest my-app --typescript --tailwind --eslint --app --src-dir

# Navigate and start
cd my-app
pnpm dev
```

### 2.2 Dependency Management

```bash
# Add dependencies
pnpm add package-name
pnpm add -D dev-package-name

# Update dependencies
pnpm update
pnpm update --latest

# Remove dependency
pnpm remove package-name

# Check outdated
pnpm outdated
```

### 2.3 Essential Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

## 3. Project Structure

### 3.1 Standard Layout

```
my-app/
├── src/
│   ├── app/                    # App Router
│   │   ├── (marketing)/        # Route Group
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── api/                # Route Handlers
│   │   │   └── users/
│   │   │       └── route.ts
│   │   ├── layout.tsx          # Root Layout
│   │   ├── page.tsx            # Home Page
│   │   ├── error.tsx           # Error Boundary
│   │   ├── loading.tsx         # Loading UI
│   │   └── not-found.tsx       # 404 Page
│   ├── components/             # Shared Components
│   │   ├── ui/                 # UI primitives
│   │   └── features/           # Feature components
│   ├── lib/                    # Utilities
│   │   ├── db.ts
│   │   └── utils.ts
│   └── types/                  # Type definitions
├── public/                     # Static assets
├── tests/                      # Test files
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

### 3.2 File Conventions

| File            | Purpose                                      |
| --------------- | -------------------------------------------- |
| `page.tsx`      | Route UI (makes segment publicly accessible) |
| `layout.tsx`    | Shared UI wrapper for segment and children   |
| `loading.tsx`   | Loading UI (Suspense boundary)               |
| `error.tsx`     | Error UI (Error boundary)                    |
| `not-found.tsx` | 404 UI                                       |
| `route.ts`      | API endpoint (Route Handler)                 |
| `template.tsx`  | Re-rendered layout                           |

### 3.3 Route Organization

```
# Dynamic Routes
app/blog/[slug]/page.tsx        → /blog/my-post
app/shop/[...slug]/page.tsx     → /shop/a/b/c (catch-all)
app/docs/[[...slug]]/page.tsx   → /docs or /docs/a/b (optional)

# Route Groups (organization only, not in URL)
app/(marketing)/about/page.tsx  → /about
app/(dashboard)/page.tsx        → / (with dashboard layout)

# Private Folders (excluded from routing)
app/_components/Button.tsx      → Not routable
app/_lib/utils.ts               → Not routable
```

---

## 4. Container Development (Docker)

### 4.1 Dockerfile for Development

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Development port
EXPOSE 3000

# Keep container running for development
CMD ["sleep", "infinity"]
```

### 4.2 Docker Compose

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    volumes: [".:/app", "/app/node_modules", "/app/.next"]
    environment: [NODE_ENV=development, NEXT_TELEMETRY_DISABLED=1]
    depends_on: [db]

  db:
    image: postgres:16-alpine
    environment: [POSTGRES_USER=dev, POSTGRES_PASSWORD=dev, POSTGRES_DB=app_dev]
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

volumes:
  postgres_data:
```

### 4.3 .dockerignore

```
node_modules
.next
.git
*.log
.env*.local
coverage
.turbo
```

### 4.4 Essential Commands

| Command                             | Description       |
| ----------------------------------- | ----------------- |
| `docker compose up -d`              | Start environment |
| `docker compose logs -f app`        | View logs         |
| `docker compose exec app pnpm dev`  | Run dev server    |
| `docker compose exec app pnpm test` | Run tests         |
| `docker compose exec app sh`        | Interactive shell |
| `docker compose down`               | Stop environment  |

---

## 5. Naming Conventions

### 5.1 Files and Folders

| Type        | Convention      | Example                  |
| ----------- | --------------- | ------------------------ |
| Route files | lowercase       | `page.tsx`, `layout.tsx` |
| Components  | PascalCase      | `UserCard.tsx`           |
| Utilities   | camelCase       | `formatDate.ts`          |
| Constants   | SCREAMING_SNAKE | `API_ENDPOINTS.ts`       |
| Types       | PascalCase      | `User.types.ts`          |

### 5.2 Code Conventions

```tsx
// Components: PascalCase
export function UserProfileCard({ user }: UserProfileCardProps) {}

// Hooks: camelCase with 'use' prefix
function useUserData(userId: string) {}

// Utilities: camelCase
function formatCurrency(amount: number) {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types/Interfaces: PascalCase
interface UserProfile {
  id: string;
  name: string;
}

type ButtonVariant = "primary" | "secondary" | "ghost";
```

---

## 6. Types and Type System

### 6.1 Type Declaration

```tsx
// Props interfaces
interface ButtonProps {
  variant: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

// API response types
interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

// Page props (auto-generated)
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Server action return type
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### 6.2 Type Safety Patterns

```tsx
// Statically typed links (next.config.ts)
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
}

// Usage
import Link from 'next/link'
import type { Route } from 'next'

<Link href="/about" />           // Valid
<Link href="/aboot" />           // TypeScript error
<Link href={`/blog/${slug}` as Route} />  // Dynamic routes
```

### 6.3 Strict Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## 7. Functions and Components

### 7.1 Component Signatures

```tsx
// Server Component (async allowed)
interface UserListProps {
  limit?: number;
  filter?: string;
}

export default async function UserList({ limit = 10, filter }: UserListProps) {
  const users = await fetchUsers({ limit, filter });

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Client Component (no async)
("use client");

interface CounterProps {
  initialValue?: number;
  onCountChange?: (count: number) => void;
}

export function Counter({ initialValue = 0, onCountChange }: CounterProps) {
  const [count, setCount] = useState(initialValue);

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    onCountChange?.(newCount);
  };

  return <button onClick={increment}>{count}</button>;
}
```

### 7.2 Good vs Bad Patterns

```tsx
// Bad: Mixing concerns, unclear return
function UserCard({ id }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => r.json())
      .then(setUser);
  }, [id]);
  if (!user) return null; // Silent failure
  return <div>{user.name}</div>;
}

// Good: Server Component, explicit loading/error
interface UserCardProps {
  userId: string;
}

export default async function UserCard({ userId }: UserCardProps) {
  const user = await getUser(userId);

  if (!user) {
    notFound();
  }

  return (
    <article>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </article>
  );
}
```

### 7.3 Best Practices

- Server Components for data fetching, Client Components for interactivity
- Keep components focused on single responsibility
- Use TypeScript for all props
- Prefer composition over prop drilling

---

## 8. Error Handling

### 8.1 Error Philosophy

Next.js distinguishes between:

- **Expected errors**: Form validation, failed requests (return as values)
- **Uncaught exceptions**: Bugs (caught by error boundaries)

```tsx
// Expected error: Return as value
"use server";

export async function createUser(formData: FormData) {
  const result = validateUser(formData);

  if (!result.success) {
    return { error: result.error.message };
  }

  try {
    const user = await db.user.create(result.data);
    return { data: user };
  } catch (e) {
    return { error: "Failed to create user" };
  }
}

// Uncaught exception: Let error boundary handle
export default async function Page() {
  const data = await riskyOperation(); // Throws on failure
  return <div>{data}</div>;
}
```

### 8.2 Error Boundaries (error.tsx)

```tsx
// app/dashboard/error.tsx
"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div role="alert">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 8.3 Good vs Bad Error Handling

```tsx
// Bad: Silent failure, generic message
async function getData() {
  try {
    return await fetch("/api/data").then((r) => r.json());
  } catch {
    return null; // Silent failure
  }
}

// Good: Explicit error handling with context
async function getData(): Promise<ApiResponse<Data>> {
  const res = await fetch("/api/data");

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch data: ${res.status} - ${error}`);
  }

  return res.json();
}
```

### 8.4 Not Found Handling

```tsx
// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return <article>{post.content}</article>;
}

// app/blog/[slug]/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Post Not Found</h2>
      <p>The requested blog post does not exist.</p>
    </div>
  );
}
```

---

## 9. Async and Data Fetching

### 9.1 Server Component Data Fetching

```tsx
// Direct fetch in Server Components
export default async function Page() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  const posts = await res.json();

  return (
    <ul>
      {posts.map((post: Post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

// Direct database access (safe in Server Components)
import { db } from "@/lib/db";

export default async function Page() {
  const users = await db.query.users.findMany();
  return <UserList users={users} />;
}
```

### 9.2 Parallel Data Fetching

```tsx
// Good: Parallel requests with Promise.all
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Start both requests simultaneously
  const [user, posts] = await Promise.all([getUser(id), getUserPosts(id)]);

  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} />
    </div>
  );
}

// With error resilience
const [userResult, postsResult] = await Promise.allSettled([
  getUser(id),
  getUserPosts(id),
]);

const user = userResult.status === "fulfilled" ? userResult.value : null;
const posts = postsResult.status === "fulfilled" ? postsResult.value : [];
```

### 9.3 Streaming with Suspense

```tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
    </div>
  );
}
```

### 9.4 Client-Side Data Fetching

```tsx
"use client";

import { use } from "react";

// Stream promise from Server Component
export function Posts({ postsPromise }: { postsPromise: Promise<Post[]> }) {
  const posts = use(postsPromise);

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

---

## 10. Interfaces and Types

### 10.1 Component Props Interfaces

```tsx
// Base props pattern
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Extending HTML element props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

// Polymorphic components
interface BoxProps<T extends React.ElementType> {
  as?: T;
  children: React.ReactNode;
}

type PolymorphicProps<T extends React.ElementType> = BoxProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof BoxProps<T>>;
```

### 10.2 API Types

```tsx
// Request/Response types
interface ApiRequest<T> {
  data: T
  headers?: Record<string, string>
}

interface ApiResponse<T> {
  data: T
  error: null
  status: 'success'
} | {
  data: null
  error: string
  status: 'error'
}

// Route Handler types
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest): Promise<NextResponse<User[]>> {
  const users = await getUsers()
  return NextResponse.json(users)
}
```

### 10.3 Form and Action Types

```tsx
// Server Action types
interface ActionState {
  message: string | null;
  errors?: Record<string, string[]>;
}

// Form schema type
interface CreateUserInput {
  name: string;
  email: string;
  role: "admin" | "user";
}
```

---

## 11. Unit Tests

### 11.1 Test Structure

```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 11.2 Table-Driven Tests

```tsx
describe("formatCurrency", () => {
  const testCases = [
    { input: 0, expected: "$0.00" },
    { input: 100, expected: "$100.00" },
    { input: 1234.56, expected: "$1,234.56" },
    { input: -50, expected: "-$50.00" },
  ];

  it.each(testCases)("formats $input as $expected", ({ input, expected }) => {
    expect(formatCurrency(input)).toBe(expected);
  });
});

// Testing multiple scenarios
describe("validateEmail", () => {
  const validEmails = ["test@example.com", "user.name@domain.co"];
  const invalidEmails = ["invalid", "@domain.com", "test@"];

  it.each(validEmails)("accepts valid email: %s", (email) => {
    expect(validateEmail(email)).toBe(true);
  });

  it.each(invalidEmails)("rejects invalid email: %s", (email) => {
    expect(validateEmail(email)).toBe(false);
  });
});
```

### 11.3 Test Commands

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test Button.test.tsx

# Run tests matching pattern
pnpm test --grep "formatCurrency"

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch

# Run once (CI mode)
pnpm test --run
```

---

## 12. Mocks and Testability

### 12.1 Mocking Fetch

```tsx
// vitest.setup.ts
import { vi } from "vitest";
global.fetch = vi.fn();

// In test file
beforeEach(() => {
  vi.mocked(fetch).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([{ id: "1", name: "John" }]),
  } as Response);
});
afterEach(() => vi.clearAllMocks());
```

### 12.2 Mocking Modules

```tsx
// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/dashboard",
}));

// Mock custom module
vi.mock("@/lib/db", () => ({
  db: { user: { findMany: vi.fn().mockResolvedValue([]) } },
}));
```

### 12.3 Testing Server Components

For async Server Components, prefer E2E tests. Unit test data fetching functions instead.

```tsx
import { getUser } from "@/lib/users";

it("returns user for valid id", async () => {
  const user = await getUser("123");
  expect(user).toMatchObject({ id: "123", name: expect.any(String) });
});

it("returns null for invalid id", async () => {
  expect(await getUser("invalid")).toBeNull();
});
```

---

## 13. Integration Tests

### 13.1 Test Organization

```
tests/
├── unit/                    # Unit tests
│   └── components/
├── integration/             # Integration tests
│   └── api/
└── e2e/                     # End-to-end tests
    └── flows/
```

### 13.2 API Route Testing

```tsx
// tests/integration/api/users.test.ts
import { GET, POST } from "@/app/api/users/route";

describe("API /api/users", () => {
  it("GET returns users list", async () => {
    const response = await GET(new Request("http://localhost/api/users"));
    expect(response.status).toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });

  it("POST creates new user", async () => {
    const request = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({ name: "Test", email: "test@test.com" }),
    });
    expect((await POST(request)).status).toBe(201);
  });
});
```

### 13.3 E2E with Playwright

```tsx
// tests/e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("user can sign in", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "password123");
  await page.click('[type="submit"]');
  await expect(page).toHaveURL("/dashboard");
});

test("shows error for invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "wrong@example.com");
  await page.fill('[name="password"]', "wrongpass");
  await page.click('[type="submit"]');
  await expect(page.locator('[role="alert"]')).toBeVisible();
});
```

---

## 14. Profiling and Performance

### 14.1 React DevTools Profiler

Use React DevTools > Profiler tab to record and analyze component renders.

```tsx
import { Profiler } from "react";

<Profiler
  id="App"
  onRender={(id, phase, duration) => console.log(`${id}: ${duration}ms`)}
>
  <MainContent />
</Profiler>;
```

### 14.2 Web Vitals Monitoring

```tsx
// app/layout.tsx - Add SpeedInsights for Vercel deployment
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 14.3 Bundle Analysis

```bash
# Install analyzer
pnpm add -D @next/bundle-analyzer

# next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true pnpm build
```

---

## 15. Optimization

### 15.1 Image Optimization

```tsx
import Image from "next/image";

// Optimized image with automatic sizing
export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority // Preload for LCP
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}

// Responsive images
<Image
  src="/photo.jpg"
  alt="Photo"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>;
```

### 15.2 Font Optimization

```tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### 15.3 Component Lazy Loading

```tsx
import dynamic from "next/dynamic";

// Lazy load heavy component
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Client-only component
});

// Lazy load with named export
const Modal = dynamic(() =>
  import("@/components/Modal").then((mod) => mod.Modal),
);
```

---

## 16. Security

### 16.1 Essential Practices

```tsx
// Never expose secrets to client
// .env.local
DATABASE_URL=...           // Server-only (no NEXT_PUBLIC_)
NEXT_PUBLIC_API_URL=...    // Exposed to client

// Validate environment variables
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
})

export const env = envSchema.parse(process.env)
```

### 16.2 Input Validation

```tsx
"use server";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const result = CreateUserSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.flatten() };
  // Safe to use result.data
}
```

### 16.3 Security Headers

```tsx
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
```

---

## 17. Code Patterns

### 17.1 Early Return

```tsx
// Bad: Deep nesting
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      return <Dashboard />;
    }
  }
}

// Good: Early returns
export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const user = await getUser(id);
  if (!user) notFound();
  if (!user.isActive) redirect("/inactive");
  if (!user.hasPermission) return <AccessDenied />;
  return <Dashboard user={user} />;
}
```

### 17.2 Separation of Concerns

```tsx
// lib/users.ts - Data layer
export async function getUser(id: string) {
  return db.user.findUnique({ where: { id } });
}

// app/users/[id]/page.tsx - Presentation layer
export default async function UserPage({ params }: PageProps) {
  const user = await getUser((await params).id);
  if (!user) notFound();
  return <UserProfile user={user} />;
}

// components/UserProfile.tsx - UI component
export function UserProfile({ user }: { user: User }) {
  return (
    <article>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </article>
  );
}
```

### 17.3 Composition over Props

```tsx
// Bad: Prop drilling
<Layout user={user}><Sidebar user={user}><Content user={user} /></Sidebar></Layout>

// Good: Composition with children
<Layout><Sidebar><UserMenu /></Sidebar><Content><UserDashboard /></Content></Layout>
```

---

## 18. Dependency Management

### 18.1 Principles

- Use Next.js built-in features first (Image, Font, Script)
- Prefer small, focused packages
- Check bundle impact before adding dependencies
- Keep dependencies updated

### 18.2 Commands

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit --fix

# Check outdated packages
pnpm outdated

# Update all dependencies
pnpm update

# Update to latest (breaking changes possible)
pnpm update --latest

# Remove unused dependencies
pnpm prune

# Check bundle size impact
npx bundlephobia-cli package-name
```

### 18.3 Version Pinning

```json
// package.json
{
  "dependencies": {
    "next": "16.1.1", // Pin major.minor.patch
    "react": "^19.0.0", // Allow patches and minors
    "some-package": "~2.0.0" // Allow patches only
  }
}
```

---

## 19. Comments and Documentation

### 19.1 Code Comments

```tsx
// Bad: Comment describes what
// Loop through users
for (const user of users) {
  // Check if active
  if (user.isActive) {
    // Send email
    sendEmail(user);
  }
}

// Good: Comment explains why
// Only notify active users to avoid sending to deactivated accounts
// that may have invalid email addresses
for (const user of users.filter((u) => u.isActive)) {
  sendEmail(user);
}
```

### 19.2 JSDoc for Public APIs

```tsx
/**
 * Fetches a user by ID from the database.
 * @param id - The unique identifier of the user
 * @returns The user object if found, null otherwise
 */
export async function getUser(id: string): Promise<User | null> {
  return db.user.findUnique({ where: { id } });
}
```

### 19.3 Component Documentation

```tsx
interface ButtonProps {
  /** Visual style variant */
  variant: "primary" | "secondary" | "ghost";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({ variant, size = "md", children }: ButtonProps) {
  /* ... */
}
```

---

## 20. Database

### 20.1 Approach

Next.js supports multiple database approaches:

- **ORMs**: Prisma, Drizzle, TypeORM
- **Query Builders**: Kysely, Knex
- **Raw SQL**: Direct drivers (pg, mysql2, better-sqlite3)

Server Components can safely access databases directly.

### 20.2 Connection Pattern

```tsx
// lib/db.ts - Connection singleton
import { Pool } from "pg";

const globalForDb = globalThis as unknown as { pool: Pool };

export const pool =
  globalForDb.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

// Graceful shutdown
process.on("SIGTERM", () => {
  pool.end();
});
```

### 20.3 Query Execution

```tsx
// lib/users.ts - Parameterized queries (prevents SQL injection)
import { pool } from "./db";

export async function getUser(id: string): Promise<User | null> {
  const result = await pool.query<User>("SELECT * FROM users WHERE id = $1", [
    id,
  ]);
  return result.rows[0] ?? null;
}

export async function createUser(name: string, email: string): Promise<User> {
  const result = await pool.query<User>(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
    [name, email],
  );
  return result.rows[0];
}

// Transaction example
export async function transferFunds(
  fromId: string,
  toId: string,
  amount: number,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
      [amount, fromId],
    );
    await client.query(
      "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
      [amount, toId],
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
```

### 20.4 Best Practices

- Always use parameterized queries (never string concatenation)
- Use connection pooling for production
- Handle connection errors with retry logic
- Close connections properly on shutdown
- Use transactions for multi-step operations

---

## 21. Logs and Observability

### 21.1 Log Levels

| Level   | Usage                             |
| ------- | --------------------------------- |
| `debug` | Development details, verbose info |
| `info`  | Normal operations, key events     |
| `warn`  | Unexpected but handled situations |
| `error` | Failures requiring attention      |

### 21.2 Structured Logging

```tsx
// lib/logger.ts
type LogLevel = "debug" | "info" | "warn" | "error";

function log(
  level: LogLevel,
  message: string,
  context: Record<string, unknown> = {},
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  process.env.NODE_ENV === "production"
    ? console[level](JSON.stringify(entry))
    : console[level](`[${level.toUpperCase()}] ${message}`, context);
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
};
```

### 21.3 Request Logging

```tsx
// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);

  logger.info("Request", {
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
  });

  return response;
}
```

### 21.4 Error Logging

```tsx
// app/error.tsx
"use client";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Unhandled error", {
      message: error.message,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 22. Golden Rules

1. **Server-First Architecture**
   - Use Server Components by default
   - Only add `'use client'` for interactivity
   - Fetch data in Server Components

2. **Type Safety Everywhere**
   - Enable strict TypeScript
   - Type all props and returns
   - Use statically typed routes

3. **Progressive Enhancement**
   - Apps should work without JavaScript
   - Use Server Actions for forms
   - Implement proper loading states

4. **Error Boundaries**
   - Create `error.tsx` for each route segment
   - Return errors as values from Server Actions
   - Use `notFound()` for missing resources

5. **Performance by Default**
   - Use Next.js Image, Font, Script components
   - Implement proper caching strategies
   - Stream with Suspense boundaries

---

## 23. Pre-Commit Checklist

### Code Quality

- [ ] `pnpm prettier --check .` passes
- [ ] `pnpm eslint .` has no errors
- [ ] `pnpm tsc --noEmit` has no type errors
- [ ] `pnpm build` completes successfully

### Tests

- [ ] `pnpm test` - all tests pass
- [ ] Coverage >= 70% on critical paths
- [ ] E2E tests pass (`pnpm test:e2e`)

### Security

- [ ] No secrets in code (use environment variables)
- [ ] Input validation on all Server Actions
- [ ] `pnpm audit` has no critical vulnerabilities
- [ ] Security headers configured

### Performance

- [ ] No unnecessary `'use client'` directives
- [ ] Images use `next/image`
- [ ] Fonts use `next/font`
- [ ] Large components are lazy loaded

### Documentation

- [ ] Public functions have JSDoc comments
- [ ] Complex logic has explanatory comments
- [ ] README is updated if needed

### Docker (if applicable)

- [ ] `docker compose build` succeeds
- [ ] `docker compose up` starts without errors
- [ ] Application responds on expected port

---

## 24. References

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Essential Tools

- [ESLint](https://eslint.org/) - Linting
- [Prettier](https://prettier.io/) - Formatting
- [Vitest](https://vitest.dev/) - Testing
- [Playwright](https://playwright.dev/) - E2E Testing
- [pnpm](https://pnpm.io/) - Package Manager

### Testing and Performance

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Community

- [Next.js GitHub](https://github.com/vercel/next.js)
- [Next.js Discord](https://nextjs.org/discord)
- [Vercel Blog](https://vercel.com/blog)
- [r/nextjs](https://www.reddit.com/r/nextjs/)
