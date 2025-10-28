# Delegate Lens - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Modern Productivity Tools)  
**Primary References:** Linear (clean task management), Things (minimalist aesthetic), Apple HIG (content-focused simplicity)  
**Design Principles:**
- Calm simplicity: Reduce visual noise, maximize clarity
- Task-focused: Every element serves task delegation workflow
- Generous spacing: Breathing room prevents overwhelm
- Subtle hierarchy: Clear but understated status differentiation

## Typography System

**Font Families:**
- Primary: Inter or SF Pro Display (via Google Fonts CDN)
- Monospace: JetBrains Mono for status badges (optional technical feel)

**Type Scale:**
- Page title: text-2xl font-semibold
- Section headers: text-lg font-medium
- Task titles: text-base font-medium
- Body/metadata: text-sm font-normal
- Labels/badges: text-xs font-medium uppercase tracking-wide

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Card padding: p-6
- Section gaps: gap-8 or gap-12
- Button padding: px-6 py-3
- Micro-spacing: gap-2 or gap-4

**Container Strategy:**
- Main dashboard: max-w-6xl mx-auto px-6 py-12
- Task grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

## Core Components

### Dashboard Layout
- **Header:** Fixed top bar with "Delegate Lens" title (left), quick stats summary (center), "New Task" CTA (right)
- **Filter Bar:** Horizontal pill buttons for "All Tasks", "Executive", "Assistant", and status filters ("In Progress", "Done", "Blocked")
- **Task Grid:** Responsive card grid displaying all tasks with hover elevation
- **Empty State:** Centered illustration placeholder with "No tasks yet" message and create prompt

### Task Cards
**Structure:**
- Border radius: rounded-xl
- Shadow: shadow-sm with hover:shadow-md transition
- Padding: p-6
- Layout: Vertical stack with clear sections

**Card Elements:**
- Title: Large, prominent at top (text-base font-medium)
- Assignee indicator: Small pill badge with icon (Executive/Assistant)
- Status badge: Distinct visual treatment per state
  - In Progress: Subtle indicator
  - Done: Checkmark with muted treatment
  - Blocked: Warning/alert styling
- Action buttons: Minimal icon buttons (edit, delete) in card footer or on hover

### Status Indicators
Use badge components with consistent patterns:
- Shape: rounded-full px-3 py-1
- Typography: text-xs font-medium uppercase tracking-wide
- Icons: Small status icon (Heroicons) before text

### Forms (New/Edit Task Modal)
- **Modal overlay:** Centered dialog with max-w-md
- **Form fields:** Vertical stack with gap-6
  - Title input: Full-width text field with focus ring
  - Assignee selector: Radio button group or dropdown
  - Status selector: Button group or segmented control
- **Actions:** Right-aligned primary "Save" + secondary "Cancel" buttons with gap-3

### Navigation/Filters
- Pill-style filter buttons in horizontal row
- Active state: Filled background
- Inactive state: Border-only ghost style
- Hover: Subtle background shift

## Component Specifications

**Buttons:**
- Primary CTA: px-6 py-3 rounded-lg font-medium
- Secondary: Border variant with transparent bg
- Icon buttons: p-2 rounded-md (for edit/delete actions)

**Input Fields:**
- Border: rounded-lg border with focus ring
- Padding: px-4 py-3
- Full-width within form context

**Cards:**
- Border: Optional subtle border or rely on shadow
- Hover state: Slight elevation increase (shadow-sm → shadow-md)
- Transition: transition-shadow duration-200

## Interaction Patterns

**Task Creation:**
1. "New Task" button triggers centered modal
2. Form appears with smooth fade-in
3. Auto-focus on title field
4. Validation: Require title, default to "In Progress"

**Task Editing:**
- Click card to open edit modal with pre-filled values
- Same form structure as creation

**Status Updates:**
- Quick status change via dropdown or button group within card
- Immediate visual feedback on change

**Task Deletion:**
- Icon button in card (trash icon)
- Optional: Confirmation dialog for destructive action

## Animations

**Minimal Motion:**
- Card hover: shadow transition only (duration-200)
- Modal entry: fade-in with slight scale (scale-95 → scale-100)
- Filter changes: Subtle opacity shift on task grid
- No elaborate page transitions or scroll-triggered effects

## Accessibility

- All interactive elements have proper focus states (ring-2 ring-offset-2)
- Status colors supplemented with icons/text (not color-only)
- Form labels properly associated with inputs
- Keyboard navigation: Tab through filters, cards, and form fields
- ARIA labels for icon-only buttons

## Images

**No hero image required** - This is a utility dashboard, not a marketing page.

**Optional Illustrations:**
- Empty state: Simple line illustration (404-style empty box or task checklist graphic)
- Keep minimal, avoid distracting from task workflow
- Use illustration library like unDraw or create simple SVG placeholder

## Responsive Behavior

**Mobile (< 768px):**
- Single column task grid
- Header stacks vertically: Title top, stats/CTA below
- Filter pills scroll horizontally if needed

**Tablet (768px - 1024px):**
- 2-column task grid
- Header remains horizontal

**Desktop (> 1024px):**
- 3-column task grid
- Full horizontal layout with generous spacing