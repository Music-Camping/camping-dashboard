# 🎵 Camping Dashboard

Multi-platform metrics dashboard for Spotify, YouTube, and Instagram with real-time data visualization and presenter mode.

---

## ✨ Features

- 📊 **Multi-platform Metrics** - Real-time data visualization
- 🎤 **Artist Rankings** - Top tracks and performance analytics
- 📈 **Growth Tracking** - Historical metrics with trend analysis
- 🎥 **Presentation Mode** - Full-screen view with auto-rotation
- 🎵 **Music Catalog** - Track status management
- ♿ **Accessible** - WCAG 2.1 compliant
- 🌙 **Dark Mode** - Theme switching

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local

# Development server
pnpm dev

# Type checking & linting
pnpm type-check && pnpm lint

# Build for production
pnpm build
```

---

## 📁 Project Structure

```
/app              - Next.js App Router + pages
/components       - React components (ui/, dashboard/, etc)
/lib              - Types, utils, hooks, API functions
/hooks            - Custom React hooks
/contexts         - React Context providers
```

---

## 🏗️ Architecture

**Server → Client → UI Pattern**

- Server components for data fetching (ISR 3h)
- Client components for interactivity
- Context API for global state (minimal)
- Local hooks for component state

---

## 🛠️ Scripts

```bash
pnpm dev           # Start dev server
pnpm build         # Production build
pnpm start         # Run production server
pnpm type-check    # TypeScript validation
pnpm lint          # ESLint validation
pnpm format        # Prettier formatting
pnpm check-all     # All validations
```

---

## 🎨 Tech Stack

- **Framework**: Next.js 16
- **UI**: React 19, shadcn/ui, Tailwind CSS
- **Types**: TypeScript strict mode
- **Data**: SWR, React Query patterns
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Animations**: Framer Motion

---

## 🔐 Security

- ✅ Bearer token authentication
- ✅ Server-side token validation
- ✅ No hardcoded secrets
- ✅ HTTPS enforced (production)
- ✅ XSS protection (React auto-escapes)

---

## 📚 Documentation

- [API Routes](./docs/API.md) - Backend integration
- [Components](./docs/COMPONENTS.md) - Component catalog
- [Contributing](./CONTRIBUTING.md) - Development guidelines

---

## 🧪 Testing

```bash
pnpm test              # Run tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report
```

---

## 📦 Dependencies

Core: Next.js 16, React 19, TypeScript 5
UI: Tailwind CSS 4, shadcn/ui, Framer Motion
Data: SWR, Zod, date-fns
Dev: ESLint, Prettier, Husky, Vitest

---

**Version**: 0.1.0 | **Last Updated**: 2026-03-06
