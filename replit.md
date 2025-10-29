# Delegate Lens

## Overview
Delegate Lens is a minimalist web dashboard designed for executives and assistants to track delegated tasks. It emphasizes calm simplicity and efficient task management through an intuitive interface for creating, filtering, and managing tasks with clear status indicators. The application is a full-stack TypeScript application with a React frontend and Express backend, currently using localStorage for data persistence but architected for a future migration to PostgreSQL with Drizzle ORM.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
**Technology Stack:** React 18, TypeScript, Vite, Shadcn UI (New York style) based on Radix UI, Tailwind CSS, React hooks for state, TanStack Query (configured for future use), React Hook Form with Zod validation.

**Design System:** Modern productivity aesthetic (inspired by Linear, Things, Apple HIG) with Inter/SF Pro Display typography, responsive grid (max-w-6xl), card-based design with rounded-xl corners, subtle shadows, and a neutral HSL-based color scheme.

**Key Components:** Dashboard, TaskCard, TaskForm (dialog-based), FilterBar, EmptyState.

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
  assignee: "Executive" | "Assistant" // or custom names
  status: "In Progress" | "Done" | "Blocked"
}
```

### Authentication and Authorization
No authentication implemented; designed for single-user or trusted multi-user. Future plans include session management, user authentication, and role-based access control.

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

### Type System
- TypeScript with strict mode, path aliases, and shared types between client/server.