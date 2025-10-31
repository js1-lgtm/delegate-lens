# Delegate Lens

## Overview
Delegate Lens is a minimalist web dashboard designed for executives and assistants to track delegated tasks. It emphasizes calm simplicity and efficient task management through an intuitive interface for creating, filtering, and managing tasks with clear status indicators. The application is a full-stack TypeScript application with a React frontend and Express backend, currently using localStorage for data persistence but architected for a future migration to PostgreSQL with Drizzle ORM.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Technology Stack:** React 18, TypeScript, Vite, Shadcn UI (New York style) based on Radix UI, Tailwind CSS, React hooks for state, TanStack Query (configured for future use), React Hook Form with Zod validation.

**Design System:** Modern productivity aesthetic (inspired by Linear, Things, Apple HIG) with Inter/SF Pro Display typography, responsive grid (max-w-6xl), card-based design with rounded-xl corners, subtle shadows, and a neutral HSL-based color scheme.

**Routing:** Multi-page application using wouter for client-side routing with routes for Dashboard (/), Pricing (/pricing), Success (/success), and Cancel (/cancel).

**Key Components:** Dashboard, TaskCard, TaskForm (dialog-based), FilterBar, EmptyState, Pricing, Success, Cancel.

### Backend Architecture
**Technology Stack:** Node.js, Express.js, TypeScript (ES modules), Vite middleware for HMR, esbuild for production.

**API Structure:** Supports RESTful API routes (`/api`), with a route registration system (`server/routes.ts`), storage abstraction (`server/storage.ts`), and request/response logging middleware.

**Storage Layer:** Currently uses `MemStorage` (in-memory). Designed for migration to PostgreSQL via Drizzle ORM.

### Data Storage Solutions
**Current:** Client-side localStorage for tasks.
**Planned Migration:** PostgreSQL database using Drizzle ORM, with Neon Database serverless driver.

**Data Model:**
```typescript
Task {
  id: string (UUID)
  title: string (required, min length 1)
  assigneeRole: "Executive" | "Assistant" | "Analyst" | "Consultant"
  assigneeName: string (optional, freeform text for person's name)
  status: "In Progress" | "Done" | "Blocked"
  priority: "High" | "Normal" | "Low"
  lastUpdated: string (ISO timestamp)
  contextSwitchCount: number
  focusActiveDuringUpdate: boolean
  history: Array<{ date: string, oldStatus: string, newStatus: string }>
}
```

**Task Creation Behavior:**
- New tasks are inserted at the start of the tasks array using prepend logic: `setTasks((prev) => [task, ...prev])`
- This causes newly created tasks to appear at the top-left of the dashboard grid
- Tasks flow in grid layout: left-to-right, top-to-bottom
- Most recent tasks always appear first

### Authentication and Authorization
No authentication implemented; designed for single-user or trusted multi-user. Future plans include session management, user authentication, and role-based access control.

### Payment and Monetization
**Stripe Integration:** Full payment processing using Stripe Checkout Sessions (blueprint:javascript_stripe integration).

**Pricing Model:**
- **Monthly Subscription:** £35/month recurring (subscription mode)
- **Lifetime License:** £349 one-time payment (payment mode)

**Payment Flow:**
1. User navigates to /pricing page from Dashboard header
2. Clicks checkout button for desired plan
3. Backend creates Stripe Checkout Session with secure redirect URLs
4. User completes payment on Stripe-hosted checkout page
5. Redirects to /success (with session_id) or /cancel page

**Security:**
- Base URLs for redirects sourced from trusted REPLIT_DOMAINS environment variable
- No client-controlled redirect targets (prevents open redirect vulnerabilities)
- Stripe API initialized without hardcoded API version (uses account default)

**Required Environment Variables:**
- `STRIPE_SECRET_KEY`: Stripe secret API key (from stripe.com/dashboard/apikeys)
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key for frontend (optional, not currently used)
- `REPLIT_DOMAINS`: Automatically provided by Replit for production redirects

**API Endpoints:**
- `POST /api/create-subscription-session`: Creates monthly subscription checkout
- `POST /api/create-lifetime-session`: Creates lifetime license checkout

## External Dependencies

### Third-Party UI Libraries
- **Radix UI Primitives:** Unstyled, accessible UI components.
- **Shadcn UI:** Pre-built component system configured with Tailwind CSS.
- **Supporting Libraries:** `class-variance-authority`, `clsx`, `tailwind-merge`, `cmdk`, `embla-carousel-react`, `lucide-react`, `vaul`, `react-day-picker`, `recharts`, `input-otp`.

### Form and Validation
- `react-hook-form`: Form state management.
- `@hookform/resolvers`: Validation resolver.
- `zod`: Schema validation and type inference.
- `drizzle-zod`: Drizzle ORM to Zod schema conversion.

### Database and ORM
- `drizzle-orm`: Type-safe ORM for PostgreSQL.
- `drizzle-kit`: Database migration toolkit.
- `@neondatabase/serverless`: Serverless PostgreSQL driver for Neon Database.

### Build and Development Tools
- `vite`: Fast build tool with HMR.
- `@vitejs/plugin-react`: React integration.
- `tsx`: TypeScript execution for development.
- `esbuild`: JavaScript bundler.
- `tailwindcss`, `autoprefixer`, `postcss`: CSS processing.
- **Replit-Specific Plugins:** `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner`.

### Utility Libraries
- `date-fns`: Date manipulation.
- `nanoid`: Unique ID generation.
- `@tanstack/react-query`: Async state management (configured).
- `wouter`: Lightweight routing library for React SPAs.

### Payment Processing
- `stripe`: Stripe Node.js library for payment processing.
- `@stripe/stripe-js`: Stripe JavaScript SDK for frontend (installed but not currently used).
- `@stripe/react-stripe-js`: React components for Stripe (installed but not currently used).

### Analytics and Monitoring
- `@vercel/analytics`: Web analytics for tracking page views and user interactions (integrated in App.tsx).
- `@vercel/speed-insights`: Performance monitoring and Core Web Vitals tracking (integrated in App.tsx).

### SEO and Social Sharing
- **Open Graph Metadata:** Complete OG tags in client/index.html for Facebook/LinkedIn sharing.
- **Twitter Card Metadata:** Twitter-specific meta tags for enhanced social media previews.
- **Preview Image:** Custom 1200x630px OG preview image at public/og-preview.png.

### Type System
- TypeScript with strict mode, path aliases, and shared types between client/server.

## Accessibility Compliance
The application meets **WCAG 2.1 AA** standards with comprehensive accessibility features:
- **Skip to Content Link:** Keyboard-accessible skip link appears on focus for easy navigation to main content
- **Semantic HTML:** Proper `<main id="main-content">` landmark with explicit ID anchor for screen reader navigation
- **ARIA Support:** Descriptive labels on all interactive elements, proper `aria-hidden` on decorative icons, explicit heading roles
- **Form Labels:** All inputs linked via `htmlFor` with proper label elements
- **Focus Visibility:** Consistent :focus-visible outlines (2px solid primary color) site-wide with 3px offset for clarity
- **Contrast Ratios:** Enhanced text contrast (muted-foreground/90-95) and background contrast (muted/20)
- **Viewport Accessibility:** Allows pinch-to-zoom for low-vision users (no maximum-scale restriction)
- **Status Indicators:** Color-coded with enhanced contrast (bg-green-100, bg-red-100)
- **Keyboard Navigation:** Full keyboard access to all features with visible focus indicators

## Recent Changes (v1.1.0)
- **2025-10-31:** Stripe Payment Integration: Added monetization with £35/month subscription and £349 lifetime license
  - Implemented Stripe Checkout Sessions for secure payment processing
  - Created Pricing page with two pricing cards and checkout buttons
  - Created Success and Cancel pages for payment flow completion
  - Restructured app with wouter routing: extracted Dashboard component from App.tsx
  - Added Pricing link to Dashboard header for easy access
  - Security: Base URLs sourced from REPLIT_DOMAINS (prevents open redirect vulnerabilities)
  - Backend: Two API endpoints for subscription and lifetime checkout session creation
  - Stripe integration uses blueprint:javascript_stripe for secure key management
- **2025-10-31:** Semantic Polish Pass: Screen reader & keyboard navigation enhancements
  - Added "Skip to Content" link (visible on focus) for keyboard users
  - Added id="main-content" anchor to main landmark for skip link target
  - Added explicit role="heading" aria-level={1} to h1 element for clarity
  - Implemented consistent :focus-visible CSS (2px primary outline, 3px offset) in index.css
- **2025-10-31:** Accessibility Pass 3: Lighthouse compliance fixes
  - Removed viewport zoom restriction (maximum-scale) for low-vision accessibility
  - Added semantic `<main>` landmark for screen reader navigation
  - Fixed prohibited ARIA attributes on priority indicator dots
  - Enhanced text contrast ratios: muted-foreground/95, muted-foreground/90
  - Improved status badge contrast: bg-green-100, bg-red-100
  - Upgraded focus visibility to 2px rings site-wide
- **2025-10-31:** Accessibility Pass 2: Enhanced labels, ARIA, contrast, focus visibility
- **2025-10-31:** Accessibility Pass 1: Added aria-hidden to icons, improved contrast, visible focus states
- **2025-10-30:** Added Vercel Analytics and Speed Insights integration for production monitoring
- **2025-10-30:** Implemented Open Graph and Twitter Card metadata for enhanced social media sharing
- **2025-10-30:** Generated custom OG preview image (1200x630px) with calm minimalist design
- **2025-10-29:** Fixed task history display order (now shows chronological: oldest→newest)
- **2025-10-29:** Changed task creation behavior to prepend (top-left placement)