# Archer Design Guidelines

## Design Approach
**System**: Shadcn-inspired minimalist design with Apple Human Interface Guidelines influences
**Rationale**: Educational platform requiring clarity, functionality, and sophisticated simplicity. Black and white aesthetic with frosted glass effects creates a professional, distraction-free learning environment.

## Core Design Principles
- **Extreme Minimalism**: Every element serves a clear purpose
- **Monochromatic Palette**: Black, white, and grayscale only
- **Glassmorphism**: Subtle frosted glass effects for depth and hierarchy
- **Functional Clarity**: Information architecture over decoration

## Typography
**Primary Font**: Inter (Google Fonts)
- Headings: 600-700 weight, tight tracking (-0.02em)
- Body: 400-500 weight, comfortable line height (1.6)
- Labels/UI: 500 weight, small caps for emphasis

**Hierarchy**:
- Page Titles: text-3xl/text-4xl font-semibold
- Section Headers: text-xl/text-2xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Secondary Text: text-sm text-gray-600
- Captions: text-xs text-gray-500

## Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16
- Component padding: p-6 to p-8
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-4 or gap-6
- Page margins: max-w-7xl mx-auto px-6

**Grid Structure**:
- Admin panels: Two-column split (sidebar + main content)
- Content cards: Grid with responsive columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Forms: Single column, max-w-md centered

## Component Library

### Navigation
- **Top Bar**: Fixed header with frosted glass (backdrop-blur-xl bg-white/80 border-b border-gray-200)
- **Admin Sidebar**: Left-aligned navigation with subtle hover states
- **Breadcrumbs**: text-sm with slash separators for deep navigation

### Cards & Containers
- **Glass Cards**: Subtle backdrop-blur-md bg-white/60 with border border-gray-200/50
- **Content Cards**: White background with shadow-sm hover:shadow-md transition
- **Nested Containers**: border-l-2 border-gray-200 pl-4 for hierarchy

### Buttons
- **Primary**: Black background (bg-black text-white) with subtle scale on hover
- **Secondary**: White with border (bg-white border-2 border-black)
- **Ghost**: Transparent with hover:bg-gray-100
- **On Glass**: backdrop-blur-lg bg-black/20 text-white (no hover/active states)
- All buttons: rounded-lg px-6 py-2.5 font-medium

### Forms
- **Input Fields**: border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-black transition
- **Labels**: text-sm font-medium mb-2 block
- **Validation**: Red text (text-red-600) below inputs for errors

### Data Display
- **Tables**: Minimal borders, alternating row backgrounds (even:bg-gray-50)
- **Lists**: Clean separation with border-b, generous padding (py-4)
- **Status Badges**: Small rounded pills (px-3 py-1 rounded-full text-xs font-medium)

### Content Viewers
- **Video Player**: Embedded iframe with border-0, aspect-video container
- **PDF Viewer**: Full-height iframe with subtle border
- **Quiz Cards**: White cards with radio buttons, clear option spacing (space-y-3)

### Overlays
- **Modals**: Centered with backdrop-blur-sm bg-black/40 overlay
- **Dropdowns**: Shadow-lg with rounded-lg, subtle animation (scale-95 to scale-100)

## Glassmorphism Implementation
- **Header/Navbar**: backdrop-blur-xl bg-white/80
- **Floating Panels**: backdrop-blur-md bg-white/60
- **Overlays**: backdrop-blur-sm bg-black/40
- Always pair with subtle borders for definition

## Animations
**Minimal & Purposeful**:
- Transitions: transition-all duration-200 ease-in-out
- Hover states: Scale (scale-105) or shadow changes only
- Page transitions: Simple fade-in
- Loading states: Subtle pulse animation
**Avoid**: Complex scroll effects, carousels, excessive motion

## Page-Specific Layouts

### Login Page
- Centered card (max-w-md) with frosted glass effect
- Logo/title at top, form fields with generous spacing
- Clear error messaging below inputs

### User Dashboard
- Grid of subject cards (3 columns on desktop)
- Each card shows subject name, chapter count, progress indicator
- Click to expand chapters inline or navigate

### Chapter View
- List layout with video/PDF/quiz sections clearly separated
- Each content type has distinct visual treatment
- Locked content indicated with opacity and lock icon

### Admin Dashboard
- Two-column: Left sidebar (navigation), right content area
- Tabs for different management sections (Users, Subjects, Content)
- Tables with inline editing capabilities
- Action buttons aligned right

### Content Management
- Form-based interface with clear sections
- Preview pane for added content
- Drag-and-drop ordering where applicable

## Security Visual Indicators
- **Expired Users**: Red badge, grayed out in lists
- **Protected Content**: Lock icon, reduced opacity
- **Admin-Only**: Subtle badge or border accent

## Accessibility
- High contrast black/white ensures readability
- Focus states: 2px black outline with offset
- Clear button text, no icon-only actions
- Proper heading hierarchy (h1 → h2 → h3)

## Responsive Behavior
- **Desktop**: Full multi-column layouts, sidebar visible
- **Tablet**: Collapsible sidebar, 2-column grids
- **Mobile**: Single column, hamburger menu, stacked cards

No images required for this application - focus is on clean, functional interface with data and content display.