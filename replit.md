# Delegate Lens

## Overview

Delegate Lens is a minimalist web dashboard for tracking delegated tasks between an executive and their assistant. The application focuses on calm simplicity and task-focused workflows, providing an intuitive interface for creating, filtering, and managing tasks with clear status indicators.

The application is built as a full-stack TypeScript application with a React frontend and Express backend, designed to run on Replit's infrastructure. Currently, the application uses localStorage for data persistence, with infrastructure in place to migrate to a PostgreSQL database using Drizzle ORM.

## Recent Changes

**Phase 8: Release Lock (Completed - October 28, 2025)**
Final production polish achieving "executive calm" aesthetic through micro-refinements:
- Visual rhythm: Borders updated to border-border/30, card padding to p-5, hover states with shadow-sm
- Typography: Presentation Mode titles use font-medium for quieter authority, refined hierarchy throughout
- Motion equilibrium: All animations standardized to 250ms with cubic-bezier(0.25, 0.1, 0.25, 1) easing
- Accessibility: Complete ARIA implementation (live regions, describedby, required, invalid, alert)
- Form validation: Added accessible error messages with role="alert" and proper ARIA attributes
- Brand signature: Footer in Presentation Mode displaying "Delegate Lens · v1.0 · Cognitive Clarity Suite"
- Data stability: Malformed task filtering, 999+ metric capping, comprehensive validation
- Status: Production-ready, all end-to-end tests passed

**All 8 Development Phases Complete:**
1. ✅ Foundation & Core (Task management, localStorage, basic UI)
2. ✅ Priority System (Three-tier priority levels with visual indicators)
3. ✅ Focus Mode (Distraction-free single-task view)
4. ✅ Cognitive Trace (Context switching metrics, history tracking)
5. ✅ Focus Insights (Pattern analysis, recommendations)
6. ✅ Presentation Mode (Executive overview for board presentations)
7. ✅ Lifecycle Completeness (Task history, edge cases, error handling)
8. ✅ Release Lock (Executive-ready production polish)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite for fast development and optimized production builds
- **UI Components:** Shadcn UI component library (New York style variant) built on Radix UI primitives
- **Styling:** Tailwind CSS with custom design tokens following a neutral color scheme
- **State Management:** React hooks for local state, TanStack Query configured for future API integration
- **Form Handling:** React Hook Form with Zod schema validation

**Design System:**
The application follows a modern productivity tool aesthetic inspired by Linear, Things, and Apple HIG:
- Typography: Inter/SF Pro Display for primary text, with a defined type scale
- Layout: Responsive grid system (max-w-6xl container) with generous spacing (Tailwind units: 2, 4, 6, 8, 12, 16)
- Components: Card-based design with rounded-xl corners, subtle shadows, and hover elevations
- Color Scheme: Neutral base with HSL color variables for theme consistency

**Key Components:**
- `Dashboard`: Main page containing task grid, filters, and form modal
- `TaskCard`: Individual task display with status badges and action buttons
- `TaskForm`: Dialog-based form for creating/editing tasks with validation
- `FilterBar`: Horizontal pill buttons for filtering by assignee and status
- `EmptyState`: Placeholder with call-to-action when no tasks exist

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js framework
- **Language:** TypeScript with ES modules
- **Development Server:** Vite middleware integration for hot module replacement
- **Build Process:** esbuild for production bundling

**API Structure:**
The backend is structured to support RESTful API routes (prefix: `/api`), though currently minimal routes are implemented as the application uses localStorage. The architecture includes:
- Route registration system in `server/routes.ts`
- Storage abstraction layer via `IStorage` interface in `server/storage.ts`
- Request/response logging middleware
- Static file serving for production builds

**Storage Layer:**
- **Current Implementation:** `MemStorage` class providing in-memory storage interface
- **Migration Path:** Infrastructure ready for PostgreSQL integration via Drizzle ORM
- **Schema Definition:** Shared schema in `shared/schema.ts` using Zod for validation and type safety

### Data Storage Solutions

**Current State - Client-Side Storage:**
- Tasks stored in browser localStorage under key `"delegate-lens-tasks"`
- Utility functions in `client/src/lib/localStorage.ts` for CRUD operations
- JSON serialization/deserialization with error handling

**Planned Migration - PostgreSQL Database:**
- Drizzle ORM configured in `drizzle.config.ts` for PostgreSQL dialect
- Schema migrations directory: `./migrations`
- Neon Database serverless driver (`@neondatabase/serverless`) included
- Environment variable: `DATABASE_URL` for database connection

**Data Model:**
```typescript
Task {
  id: string (UUID)
  title: string (required, min length 1)
  assignee: "Executive" | "Assistant"
  status: "In Progress" | "Done" | "Blocked"
}
```

### Authentication and Authorization

No authentication system is currently implemented. The application is designed as a single-user or trusted multi-user system without access controls. Future implementations could add:
- Session management (connect-pg-simple package included for PostgreSQL sessions)
- User authentication
- Role-based access control for executive/assistant roles

## External Dependencies

### Third-Party UI Libraries

**Radix UI Primitives:**
- Complete set of unstyled, accessible UI components (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, toggle, tooltip)
- Provides accessibility features and keyboard navigation out of the box

**Shadcn UI:**
- Pre-built component system configured via `components.json`
- Aliases: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`
- Tailwind integration with CSS variables for theming

**Supporting Libraries:**
- `class-variance-authority`: Type-safe component variants
- `clsx` + `tailwind-merge`: Utility class management
- `cmdk`: Command palette component
- `embla-carousel-react`: Carousel functionality
- `lucide-react`: Icon library
- `vaul`: Drawer component
- `react-day-picker`: Date picker component
- `recharts`: Charting library
- `input-otp`: OTP input component

### Form and Validation

- `react-hook-form`: Form state management
- `@hookform/resolvers`: Validation resolver integration
- `zod`: Schema validation and type inference
- `drizzle-zod`: Drizzle ORM to Zod schema conversion

### Database and ORM

- `drizzle-orm`: Type-safe ORM for PostgreSQL
- `drizzle-kit`: Database migration toolkit
- `@neondatabase/serverless`: Serverless PostgreSQL driver for Neon Database

### Build and Development Tools

- `vite`: Fast build tool with HMR support
- `@vitejs/plugin-react`: React integration for Vite
- `tsx`: TypeScript execution for development
- `esbuild`: JavaScript bundler for production
- `tailwindcss` + `autoprefixer`: CSS processing
- `postcss`: CSS transformation pipeline

**Replit-Specific Plugins:**
- `@replit/vite-plugin-runtime-error-modal`: Development error overlay
- `@replit/vite-plugin-cartographer`: Code mapping
- `@replit/vite-plugin-dev-banner`: Development banner

### Utility Libraries

- `date-fns`: Date manipulation and formatting
- `nanoid`: Unique ID generation
- `@tanstack/react-query`: Async state management (configured but not actively used with localStorage)

### Type System

- TypeScript with strict mode enabled
- Path aliases configured for clean imports (`@/*`, `@shared/*`)
- Shared types between client and server via `shared/` directory