name: "Authentication Integration PRP"
description: |
Implement real authentication for the Next.js dashboard: JWT login via Server Action with httpOnly cookie storage,
middleware route protection, API proxy for authenticated requests, and logout functionality.

---

## Goal

**Feature Goal**: Replace the mock login with real FastAPI authentication, protect all dashboard routes, and ensure all API requests include the JWT Bearer token — using httpOnly cookies for secure token storage with zero new npm dependencies.

**Deliverable**:

- `middleware.ts` — Route protection (redirect unauthenticated users to `/login`)
- `lib/auth/actions.ts` — Server Actions for `login()` and `logout()`
- `app/api/proxy/[...path]/route.ts` — API proxy that injects Bearer token from cookie
- Modified `app/(auth)/login/page.tsx` — Real authentication replacing mock timeout
- Modified `lib/hooks/dashboard.ts` — Use proxy URL instead of hardcoded FastAPI URL
- `.env.local` and `.env.example` — Environment variable configuration

**Success Definition**:

- User can log in with `admin@camping.com` / `admin123` and see the dashboard
- Unauthenticated users are redirected from `/` to `/login`
- Authenticated users are redirected from `/login` to `/`
- Dashboard data loads via authenticated proxy (Bearer token injected server-side)
- Invalid credentials show error message on login form
- Logout clears session and redirects to `/login`
- JWT token is stored in httpOnly cookie (never accessible to client JS)
- 401 responses from FastAPI redirect user to login

---

## User Persona

**Target User**: Dashboard administrators accessing metrics for music performers

**Use Case**: Admin logs in with email/password to view protected social media metrics

**User Journey**:

1. User navigates to `http://localhost:3000/`
2. Middleware detects no `access_token` cookie → redirects to `/login`
3. User fills in email and password, clicks "Entrar"
4. Server Action calls `POST http://localhost:8000/auth/login` with credentials
5. On success, Server Action stores JWT in httpOnly cookie, redirects to `/`
6. Dashboard page loads → `useDashboard()` calls `/api/proxy/api/dashboard`
7. Proxy route reads cookie, forwards request to FastAPI with `Authorization: Bearer <token>`
8. Dashboard renders with real data
9. User clicks "Sair" in sidebar → `logout()` Server Action deletes cookie → redirects to `/login`

**Pain Points Addressed**:

- Currently anyone can access the dashboard without authentication
- Dashboard API calls fail silently (no auth header sent)
- Login form is a non-functional mock

---

## Why

- **Security**: Dashboard contains business metrics that must be access-controlled
- **Real API Integration**: Replace mock login with actual FastAPI backend authentication
- **Token Security**: httpOnly cookies prevent XSS token theft (tokens never in JS)
- **User Experience**: Seamless login/logout flow with proper error handling
- **Foundation**: Authentication infrastructure enables future features (user roles, profiles)

---

## What

### User-visible Behavior

- Login page submits real credentials to FastAPI `/auth/login`
- Invalid credentials display "Credenciais invalidas" error on the form
- Successful login redirects to dashboard with loaded data
- Visiting any dashboard route without auth redirects to `/login`
- Sidebar has a logout button that clears session
- Network errors display appropriate error message

### Technical Requirements

- JWT stored in httpOnly cookie (secure, SameSite=lax)
- Middleware checks cookie existence for route protection
- API proxy forwards Bearer token from cookie to FastAPI
- Server Action handles login (server-to-server call, no token in browser)
- SWR fetcher updated to use proxy route
- Environment variables for API base URL

### Success Criteria

- [ ] Login with `admin@camping.com` / `admin123` succeeds and redirects to `/`
- [ ] Login with wrong credentials shows error message
- [ ] Accessing `/` without auth redirects to `/login`
- [ ] Accessing `/login` while authenticated redirects to `/`
- [ ] Dashboard loads real data via authenticated proxy
- [ ] Logout clears cookie and redirects to `/login`
- [ ] JWT token is NOT accessible via `document.cookie` or JS
- [ ] `pnpm type-check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds

---

## All Needed Context

### Context Completeness Check

_"If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_ **YES** — All file paths, API contracts, patterns, and gotchas are documented below.

### Documentation & References

```yaml
# MUST READ - Backend API Contract
- file: docs/features/auth2.md
  why: Complete API contract for login endpoint, token format, dashboard endpoint
  critical: |
    POST /auth/login → { access_token, token_type, expires_in: 900, refresh_token, refresh_expires_in }
    GET /api/dashboard requires Authorization: Bearer <access_token>
    Test creds: admin@camping.com / admin123
    Rate limit: 10 attempts/minute
    Error 401: { "detail": "Invalid credentials" }

# CODEBASE PATTERNS - Follow These Exactly
- file: app/(auth)/login/page.tsx
  why: Existing login page to modify — replace mock timeout with real server action call
  pattern: "use client", React.useState for form state, inline validation, Loader2 spinner, toast for errors
  gotcha: Keep the existing UI/UX (Card, Field, Input components). Only change handleSubmit internals.

- file: hooks/use-filters.tsx
  why: Reference pattern for React Context — same "use client", createContext, Provider, useContext pattern
  pattern: Context creation, Provider component, custom hook with error boundary
  gotcha: Follow same naming and structure if creating auth context (not needed for v1)

- file: lib/hooks/dashboard.ts
  why: SWR fetcher that currently calls http://localhost:8000/api/dashboard directly
  pattern: useSWR with inline fetcher function
  gotcha: MUST change URL to /api/proxy/api/dashboard (relative, goes through Next.js proxy)

- file: app/(dashboard)/layout.tsx
  why: Dashboard layout — currently imports AppSidebar only, no auth wrapper
  pattern: Server Component that wraps children

- file: app/layout.tsx
  why: Root layout structure — ThemeProvider, Toaster, fonts. No auth provider needed here for v1.
  pattern: Server Component with metadata export

- file: components/sidebar.tsx
  why: Sidebar component where logout button should be added
  pattern: "use client", navItems array, SidebarMenu structure, lucide-react icons
  gotcha: Add logout as a SidebarMenuItem at the bottom, use LogOutIcon from lucide-react

- file: components/ui/field.tsx
  why: Form field wrapper used in login page (Field, FieldLabel, FieldContent, FieldError)
  pattern: data-invalid attribute for error styling

- file: lib/utils.ts
  why: Utility functions — cn() for className merging
  pattern: Import from "@/lib/utils"

# EXTERNAL DOCUMENTATION
- url: https://nextjs.org/docs/app/building-your-application/routing/middleware
  why: Next.js middleware for route protection — matcher config, cookies API, redirect pattern
  critical: |
    middleware.ts must be at project root (same level as app/)
    Use req.cookies.get('name') to read cookies in middleware
    Use NextResponse.redirect() for redirects
    matcher config excludes _next/static, _next/image, favicon.ico

- url: https://nextjs.org/docs/app/api-reference/functions/cookies
  why: How to set/read/delete cookies in Server Actions and Route Handlers
  critical: |
    In Next.js 15+, cookies() is async: const cookieStore = await cookies()
    cookieStore.set(name, value, options) — set cookie
    cookieStore.get(name)?.value — read cookie
    cookieStore.delete(name) — delete cookie
    Options: httpOnly, secure, sameSite, path, maxAge

- url: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
  why: Route Handlers for API proxy pattern ([...path] catch-all)
  critical: |
    Export async function GET(req, { params }) for GET handler
    params is a Promise in Next.js 15+ — must await it
    req.nextUrl.search for query string forwarding

- url: https://nextjs.org/docs/app/guides/authentication
  why: Official Next.js auth guide — defense-in-depth pattern
  critical: |
    Middleware for optimistic route protection (check cookie exists)
    Server Actions for login/logout (can set httpOnly cookies)
    redirect() throws internally — must be called OUTSIDE try/catch
```

### Current Codebase Tree

```bash
.
├── app
│   ├── (auth)
│   │   ├── forgot-password/page.tsx   # Password recovery (UI only, not in scope)
│   │   └── login/page.tsx             # MODIFY: Replace mock with server action
│   ├── (dashboard)
│   │   ├── configuracoes/page.tsx     # Protected route
│   │   ├── relatorios/page.tsx        # Protected route
│   │   ├── layout.tsx                 # Dashboard layout with AppSidebar
│   │   └── page.tsx                   # Main dashboard using useDashboard()
│   ├── globals.css
│   └── layout.tsx                     # Root layout (ThemeProvider, Toaster)
├── components
│   ├── dashboard/                     # Chart components (no changes needed)
│   ├── ui/                            # shadcn/ui primitives (no changes needed)
│   │   ├── button.tsx, card.tsx, checkbox.tsx, field.tsx, input.tsx, ...
│   │   └── sonner.tsx                 # Toast notifications
│   ├── app-header.tsx                 # Header with filters
│   ├── sidebar.tsx                    # MODIFY: Add logout button
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── hooks
│   ├── use-chart-data.ts
│   ├── use-filters.tsx                # Filter context (reference pattern)
│   └── use-mobile.ts
├── lib
│   ├── hooks
│   │   ├── dashboard.ts              # MODIFY: Change URL to proxy
│   │   └── use-local-storage.ts
│   ├── types
│   │   ├── dashboard.ts              # Dashboard response types
│   │   └── filters.ts
│   ├── validations/                   # Empty — could add auth types here
│   └── utils.ts                       # cn(), formatNumber, etc.
├── PRPs/
├── package.json                       # next@16.1.1, react@19.2.3, swr@2.3.8
├── tsconfig.json                      # strict: true, paths: { "@/*": ["./*"] }
├── next.config.ts                     # Minimal config
└── .eslintrc.cjs                      # Airbnb + TypeScript + Prettier
```

### Desired Codebase Tree (files to add/modify)

```bash
.
├── middleware.ts                       # CREATE: Route protection
├── .env.local                         # CREATE: API_URL=http://localhost:8000
├── .env.example                       # CREATE: Template for env vars
├── app
│   ├── api
│   │   └── proxy
│   │       └── [...path]
│   │           └── route.ts           # CREATE: API proxy with Bearer token injection
│   ├── (auth)
│   │   └── login/page.tsx             # MODIFY: Use login() server action
│   └── (dashboard)/                   # No changes to dashboard pages
├── components
│   └── sidebar.tsx                    # MODIFY: Add logout button
├── lib
│   ├── auth
│   │   └── actions.ts                 # CREATE: login() and logout() server actions
│   └── hooks
│       └── dashboard.ts               # MODIFY: Use /api/proxy/api/dashboard URL
└── (everything else unchanged)
```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: Next.js 15+ cookies() is ASYNC
// WRONG: const cookieStore = cookies()
// RIGHT: const cookieStore = await cookies()

// CRITICAL: redirect() throws a special error internally
// It MUST be called OUTSIDE try/catch blocks
// WRONG:
//   try { /* login logic */ redirect('/') } catch { /* swallows redirect */ }
// RIGHT:
//   try { /* login logic */ } catch { return { error: "..." } }
//   redirect('/')  // after try/catch

// CRITICAL: Route Handler params is a Promise in Next.js 15+
// WRONG: function GET(req, { params }: { params: { path: string[] } })
// RIGHT: function GET(req, { params }: { params: Promise<{ path: string[] }> })
//   const { path } = await params

// CRITICAL: middleware.ts MUST be at project root (same level as app/)
// NOT inside app/ or lib/

// CRITICAL: Server Actions must have "use server" at top of file
// Client components calling server actions just import them normally

// GOTCHA: SWR fetcher URL must be relative for proxy (no localhost)
// WRONG: useSWR("http://localhost:8000/api/dashboard", fetcher)
// RIGHT: useSWR("/api/proxy/api/dashboard", fetcher)

// GOTCHA: Login page uses sonner toast for error messages
// Keep using toast.error() for network errors
// Use form-level error state for credential errors (better UX)

// GOTCHA: ESLint enforces consistent-type-imports
// Use: import type { NextRequest } from "next/server"
// Not: import { NextRequest } from "next/server"

// GOTCHA: Package manager is pnpm (not npm or yarn)
// Use: pnpm dev, pnpm build, pnpm type-check, pnpm lint

// GOTCHA: Icon imports use Icon suffix in this codebase
// Use: import { LogOutIcon } from "lucide-react"
// Not: import { LogOut } from "lucide-react"

// GOTCHA: The existing login page uses controlled inputs (useState per field)
// Keep this pattern — do NOT rewrite to uncontrolled inputs or useActionState
// Just replace the mock API call in handleSubmit with the server action

// GOTCHA: httpOnly cookie is NOT accessible via document.cookie in the browser
// This is intentional for security — the proxy route reads it server-side
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// lib/auth/actions.ts — Server Action types
interface LoginResult {
  success: boolean;
  error?: string;
}

// FastAPI login response shape (from docs/features/auth2.md)
interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number; // 900 seconds (15 minutes)
  refresh_token: string;
  refresh_expires_in: number; // 604800 seconds (7 days)
}

// FastAPI error response shape
interface ApiError {
  detail: string;
}
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: CREATE .env.local and .env.example
  - CREATE .env.local with: API_URL=http://localhost:8000
  - CREATE .env.example with: API_URL=http://localhost:8000
  - NAMING: API_URL (server-only, no NEXT_PUBLIC_ prefix — only used in server actions and route handlers)
  - GOTCHA: Do NOT use NEXT_PUBLIC_ prefix — the API URL must not be exposed to the browser

Task 2: CREATE lib/auth/actions.ts (Server Actions)
  - IMPLEMENT: login(email: string, password: string): Promise<LoginResult>
    1. Call fetch(`${process.env.API_URL}/auth/login`, { method: "POST", body: JSON.stringify({ email, password }) })
    2. If response not ok, return { success: false, error: data.detail || "Credenciais invalidas" }
    3. If response ok, set httpOnly cookie: cookieStore.set("access_token", data.access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: data.expires_in })
    4. Return { success: true }
  - IMPLEMENT: logout(): Promise<void>
    1. Delete cookie: cookieStore.delete("access_token")
    2. Call redirect("/login")
  - MARK: "use server" at top of file
  - CRITICAL: In login(), do NOT call redirect() — return the result and let the client handle navigation
    Why: The login page needs to show loading state and handle errors before redirecting
  - CRITICAL: In logout(), redirect() is fine because there's no error handling needed
  - FOLLOW pattern: async function, cookies() from "next/headers", redirect() from "next/navigation"
  - DEPENDENCIES: Task 1 (API_URL env var)

Task 3: CREATE middleware.ts (Route Protection)
  - IMPLEMENT: Check for access_token cookie on protected routes
  - LOGIC:
    1. Define public paths: ["/login", "/forgot-password"]
    2. If path is public AND cookie exists → redirect to "/" (already logged in)
    3. If path is NOT public AND cookie does NOT exist → redirect to "/login"
    4. Otherwise → NextResponse.next()
  - MATCHER CONFIG: Exclude static files and API routes
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$).*)"]
  - PLACEMENT: Project root (same level as app/, NOT inside app/)
  - NAMING: middleware.ts (exact name required by Next.js)
  - FOLLOW pattern: import { NextResponse } from "next/server", type { NextRequest }

Task 4: CREATE app/api/proxy/[...path]/route.ts (API Proxy)
  - IMPLEMENT: Proxy that forwards requests to FastAPI with Bearer token from cookie
  - HANDLERS: GET and POST (export both)
  - LOGIC:
    1. Read access_token from cookies
    2. If no token → return 401 JSON response
    3. Build target URL: ${process.env.API_URL}/${path.join("/")}${req.nextUrl.search}
    4. Forward request to FastAPI with Authorization: Bearer <token> header
    5. Return FastAPI response (status, body, content-type)
  - CRITICAL: params is Promise in Next.js 15+ — must await it
  - PLACEMENT: app/api/proxy/[...path]/route.ts (creates catch-all route /api/proxy/*)
  - DEPENDENCIES: Task 1 (API_URL env var)

Task 5: MODIFY lib/hooks/dashboard.ts (Use Proxy)
  - CHANGE: URL from "http://localhost:8000/api/dashboard" to "/api/proxy/api/dashboard"
  - ALSO: Add error handling for 401 in the fetcher
  - NEW fetcher:
    const fetcher = async (...args: Parameters<typeof fetch>) => {
      const res = await fetch(...args);
      if (res.status === 401) {
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }
      if (!res.ok) {
        throw new Error("API error");
      }
      return res.json();
    };
  - PRESERVE: useSWR hook structure, return signature { data, isLoading, isError }
  - DEPENDENCIES: Task 4 (proxy must exist for URL to work)

Task 6: MODIFY app/(auth)/login/page.tsx (Real Login)
  - IMPORT: login from "@/lib/auth/actions"
  - CHANGE handleSubmit internals:
    1. Keep existing validation logic (validateEmail, validatePassword, touched state)
    2. Replace the mock setTimeout/Promise with: const result = await login(email, password)
    3. If result.success → router.push("/") (keep existing redirect)
    4. If !result.success → toast.error(result.error) (keep existing toast pattern)
  - REMOVE: The simulated API call block (lines ~104-116)
  - KEEP: All existing UI, validation, loading state, Loader2 spinner, remember me checkbox
  - KEEP: "use client" directive (calling server action from client is fine)
  - KEEP: All imports, all state variables, all handlers (handleEmailChange, handlePasswordChange, etc.)
  - GOTCHA: Server actions can be called from client components — just import and await

Task 7: MODIFY components/sidebar.tsx (Add Logout)
  - IMPORT: logout from "@/lib/auth/actions", LogOutIcon from "lucide-react"
  - ADD: Logout button at the bottom of the sidebar, below navigation items
  - PATTERN: Use SidebarMenu > SidebarMenuItem > SidebarMenuButton structure
  - STYLING: Use the same pattern as navItems but with onClick instead of Link
  - IMPLEMENTATION:
    - Add a SidebarFooter or a separate SidebarGroup at the bottom
    - Use a button (not Link) that calls the logout server action
    - Show LogOutIcon + "Sair" text (same pattern as nav items)
  - FOLLOW pattern: Existing navItems.map structure for consistent styling
  - GOTCHA: logout() is a server action that calls redirect() — it will throw and redirect
  - DEPENDENCIES: Task 2 (logout server action must exist)
```

### Implementation Patterns & Key Details

```typescript
// ============================================================
// Pattern: lib/auth/actions.ts — Server Actions
// ============================================================
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface LoginResult {
  success: boolean;
  error?: string;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error: data.detail || "Credenciais invalidas. Tente novamente.",
      };
    }

    const data = await response.json();

    const cookieStore = await cookies();
    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.expires_in, // 900 seconds = 15 minutes
    });

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Erro de conexao. Verifique se o servidor esta rodando.",
    };
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  redirect("/login");
}

// ============================================================
// Pattern: middleware.ts — Route Protection
// ============================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/forgot-password"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  // Authenticated user on public page → redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Unauthenticated user on protected page → redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
};

// ============================================================
// Pattern: app/api/proxy/[...path]/route.ts — API Proxy
// ============================================================
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

async function proxyRequest(
  req: NextRequest,
  { path }: { path: string[] },
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiPath = `/${path.join("/")}`;
  const url = `${process.env.API_URL}${apiPath}${req.nextUrl.search}`;

  const response = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: req.method !== "GET" ? await req.text() : undefined,
  });

  const data = await response.text();

  return new NextResponse(data, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, await params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, await params);
}

// ============================================================
// Pattern: Modified login handleSubmit (changes only)
// ============================================================
// In app/(auth)/login/page.tsx, replace the handleSubmit try block:

import { login } from "@/lib/auth/actions";

// Inside handleSubmit, REPLACE the mock timeout block with:
const result = await login(email, password);

if (result.success) {
  if (rememberMe) {
    localStorage.setItem("rememberMe", "true");
  }
  router.push("/");
} else {
  toast.error(result.error || "Erro ao fazer login. Tente novamente.");
}

// ============================================================
// Pattern: Modified dashboard.ts fetcher
// ============================================================
import useSWR from "swr";

const fetcher = async (...args: Parameters<typeof fetch>) => {
  const res = await fetch(...args);
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error("API error");
  }
  return res.json();
};

export function useDashboard() {
  const { data, error, isLoading } = useSWR(
    "/api/proxy/api/dashboard",
    fetcher,
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}

// ============================================================
// Pattern: Sidebar logout button (addition to sidebar.tsx)
// ============================================================
// Add LogOutIcon import and logout import at top:
import { LogOutIcon } from "lucide-react";
import { logout } from "@/lib/auth/actions";

// Add at bottom of sidebar, after nav items SidebarGroup:
// Use SidebarFooter or a new SidebarGroup
<SidebarFooter>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton tooltip="Sair" onClick={() => logout()}>
        <LogOutIcon />
        <span>Sair</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarFooter>
```

### Integration Points

```yaml
ENVIRONMENT:
  - create: .env.local with API_URL=http://localhost:8000
  - create: .env.example with API_URL=http://localhost:8000
  - note: API_URL is server-only (no NEXT_PUBLIC_ prefix)

MIDDLEWARE:
  - create: middleware.ts at project root
  - reads: access_token cookie
  - redirects: unauthenticated users to /login, authenticated users away from /login

SERVER_ACTIONS:
  - create: lib/auth/actions.ts
  - login(): Calls FastAPI, sets httpOnly cookie, returns result
  - logout(): Deletes cookie, redirects to /login

API_PROXY:
  - create: app/api/proxy/[...path]/route.ts
  - reads: access_token cookie
  - forwards: Requests to FastAPI with Authorization header
  - returns: FastAPI response transparently

LOGIN_PAGE:
  - modify: app/(auth)/login/page.tsx
  - change: Replace mock timeout with login() server action call
  - preserve: All existing UI, validation, loading state

DASHBOARD_HOOK:
  - modify: lib/hooks/dashboard.ts
  - change: URL to /api/proxy/api/dashboard
  - add: 401 handling in fetcher (redirect to /login)

SIDEBAR:
  - modify: components/sidebar.tsx
  - add: Logout button using SidebarFooter + logout() server action
```

---

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

```bash
# Run after each file creation - fix before proceeding
pnpm type-check          # TypeScript type checking (strict mode)
pnpm lint                # ESLint (Airbnb + TypeScript + Prettier)
pnpm format:check        # Prettier formatting check

# Auto-fix if needed
pnpm lint:fix            # Auto-fix ESLint issues
pnpm format              # Auto-format with Prettier

# Expected: Zero errors. If errors exist, READ output and fix before proceeding.
```

### Level 2: Build Validation

```bash
# Full build check
pnpm build

# Expected: Build succeeds with no errors
# Common issues:
# - Missing "use server" directive → build error
# - Wrong cookies() usage (sync vs async) → build error
# - middleware.ts in wrong location → middleware won't work
```

### Level 3: Integration Testing (Manual)

```bash
# 1. Ensure FastAPI backend is running on http://localhost:8000
# 2. Start development server
pnpm dev

# Test sequence:
# Step 1: Visit http://localhost:3000/ → should redirect to /login
# Step 2: Try login with wrong credentials → should show error
# Step 3: Login with admin@camping.com / admin123 → should redirect to /
# Step 4: Verify dashboard loads with real data
# Step 5: Visit http://localhost:3000/login → should redirect to / (already authenticated)
# Step 6: Open DevTools > Application > Cookies → verify access_token is httpOnly
# Step 7: Run document.cookie in console → should NOT contain access_token
# Step 8: Click "Sair" in sidebar → should redirect to /login
# Step 9: Visit http://localhost:3000/ → should redirect to /login again
```

### Level 4: Security Validation

```bash
# Verify httpOnly cookie
# In browser DevTools > Application > Cookies > localhost:
# - access_token should show HttpOnly checkbox checked
# - access_token should show SameSite = Lax

# Verify token not in JS
# In browser DevTools > Console:
document.cookie  # Should NOT contain access_token

# Verify proxy auth
# In browser DevTools > Network tab:
# - Requests to /api/proxy/* should NOT have Authorization header (browser doesn't add it)
# - The proxy adds it server-side (invisible to browser)

# Verify 401 handling
# Wait 15 minutes (token expiry) or manually delete cookie in DevTools
# Refresh dashboard → should redirect to /login
```

---

## Final Validation Checklist

### Technical Validation

- [ ] `pnpm type-check` passes with zero errors
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm build` succeeds
- [ ] No console errors in browser DevTools
- [ ] middleware.ts is at project root (not inside app/)

### Feature Validation

- [ ] Login with valid credentials works (admin@camping.com / admin123)
- [ ] Login with invalid credentials shows error message
- [ ] Unauthenticated access to `/` redirects to `/login`
- [ ] Authenticated access to `/login` redirects to `/`
- [ ] Dashboard loads real data through authenticated proxy
- [ ] Logout button in sidebar clears session and redirects to `/login`
- [ ] Network errors show appropriate error message

### Security Validation

- [ ] JWT stored as httpOnly cookie (not accessible via document.cookie)
- [ ] SameSite=lax set on cookie
- [ ] API*URL not exposed to browser (no NEXT_PUBLIC* prefix)
- [ ] Token is injected server-side in proxy (not sent from browser)
- [ ] 401 responses redirect to login

### Code Quality Validation

- [ ] Server Actions use "use server" directive
- [ ] cookies() is awaited (async in Next.js 15+)
- [ ] params is awaited in Route Handler (Promise in Next.js 15+)
- [ ] redirect() called outside try/catch blocks
- [ ] Follows existing code patterns (cn(), Icon suffix, @/ imports)
- [ ] Login page preserves existing UI and validation
- [ ] No new npm dependencies added

---

## Anti-Patterns to Avoid

- ❌ Don't store JWT in localStorage or sessionStorage (XSS vulnerability)
- ❌ Don't expose API*URL to browser (no NEXT_PUBLIC* prefix)
- ❌ Don't call redirect() inside try/catch (it throws internally and gets caught)
- ❌ Don't use synchronous cookies() (it's async in Next.js 15+)
- ❌ Don't forget to await params in Route Handlers (it's a Promise in Next.js 15+)
- ❌ Don't rewrite the entire login page — only change handleSubmit internals
- ❌ Don't create an auth context/provider — not needed for v1 (keep it simple)
- ❌ Don't add JWT verification in middleware (FastAPI handles verification via proxy)
- ❌ Don't add new npm dependencies (jose, zod, etc.) — not needed
- ❌ Don't use CORS headers or fetch directly from browser to FastAPI
- ❌ Don't put middleware.ts inside app/ directory (must be at project root)
- ❌ Don't hardcode API URLs — always use process.env.API_URL
- ❌ Don't catch all exceptions generically — handle specific error cases

---

## Confidence Score: 9/10

**Rationale**:

- Complete API contract documented (endpoints, payloads, error codes)
- All file paths verified and exact patterns provided
- Zero new npm dependencies (uses only built-in Next.js features)
- Minimal changes to existing code (only login handleSubmit + dashboard URL + sidebar logout)
- All Next.js 15+ gotchas documented (async cookies, Promise params, redirect behavior)
- Security best practices followed (httpOnly cookies, server-side token handling)
- Comprehensive validation steps for manual testing
- Follows existing codebase conventions exactly

**Potential Risks**:

- FastAPI backend must be running on http://localhost:8000 for login to work
- Token expiry (15 min) may cause frequent redirects — no refresh token endpoint exists yet
- Rate limiting (10 attempts/min) not handled in UI — could add a message if needed in future
