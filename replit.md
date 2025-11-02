# Archer Educational Platform

## Overview

Archer is a secure educational platform designed for delivering video lectures, PDFs, and interactive quizzes with view-only access controls. The application features a dual-interface system with distinct user and admin experiences, built with a focus on minimalist design principles and content protection.

**Core Purpose**: Provide time-limited access to educational content with comprehensive administrative controls for managing users, subjects, chapters, and multimedia learning materials.

**Technology Stack**: React + TypeScript frontend, Express backend, SQLite database with session-based authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite for optimal development experience and production builds.

**Rationale**: React provides component reusability and efficient rendering for the card-based UI. TypeScript ensures type safety across the large codebase with complex data structures (users, subjects, chapters, content, quiz questions).

**State Management**: 
- TanStack Query (React Query) for server state management and caching
- Local component state for UI interactions
- Session-based authentication state checked on mount

**Design System**:
- Shadcn UI component library with "new-york" style variant
- Custom Tailwind configuration with monochromatic palette (black, white, grayscale)
- Glassmorphism effects using backdrop-blur utilities
- Inter font family from Google Fonts
- Responsive grid layouts using Tailwind's grid system

**Routing Strategy**: Single-page application with view-based navigation (login, user-dashboard, chapter-content, admin-dashboard) controlled by React state rather than a traditional router.

**Pros**: Simpler state management for small app, no router dependency
**Cons**: No deep linking, browser back button doesn't work naturally

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js

**Rationale**: Express provides a minimal, flexible foundation for RESTful APIs. TypeScript extends type safety from frontend to backend, reducing runtime errors.

**API Design**: RESTful endpoints organized by resource:
- `/api/auth/*` - Authentication (login, logout, session check)
- `/api/admin/*` - Admin operations (user/subject/chapter/content management)
- `/api/subjects/*` - Subject and chapter content retrieval
- `/api/chapters/*` - Chapter content and quiz questions
- `/api/upload` - File upload endpoint with catbox.moe integration for fast CDN hosting

**Session Management**:
- express-session middleware with cookie-based sessions
- Session store uses in-memory storage (default)
- Sessions include userId and isAdmin flags for authorization

**Middleware Chain**:
1. JSON body parsing with raw body capture
2. URL-encoded form parsing
3. Request logging with timing
4. Session management
5. Route handlers with authentication guards

**Authentication Guards**:
- `isAuthenticated`: Verifies session userId exists and user account is valid/not expired
- `isAdmin`: Verifies user has admin privileges
- Validation occurs by checking validUntil date against current date

### Data Storage

**Database**: SQLite with better-sqlite3 driver

**Rationale**: 
- Serverless, zero-configuration database ideal for single-file deployment
- Synchronous API simplifies code flow compared to async PostgreSQL
- Sufficient for educational platform with moderate concurrent users
- Easy backup (single file)

**Schema Design**:

```
users (id, username, password, validUntil, isAdmin)
subjects (id, name)
chapters (id, subjectId, name, orderIndex)
content (id, chapterId, type, title, url, orderIndex)
quiz_questions (id, contentId, question, options, imageUrl, orderIndex)
```

**Data Access Layer**: Custom storage interface (IStorage) with SQLiteStorage implementation allows potential future database swapping.

**Password Security**: bcryptjs for password hashing with salt rounds.

**Content Types**:
- Video: Embedded YouTube/external video players or uploaded files via catbox.moe
- PDF: Embedded Google Drive, direct PDF links, or uploaded files via catbox.moe
- Quiz: JSON-stored question objects with multiple choice options

**File Upload & Hosting**:
- Integrated with catbox.moe API for anonymous file uploads
- Admins can upload videos (MP4, MOV, AVI, MKV, WEBM) and PDFs directly
- File size limit: 500MB maximum
- MIME type validation enforces allowed formats
- Error handling parses catbox.moe responses (200 status with error messages in body)
- Uploaded files stored on catbox.moe CDN, URLs saved in database
- UI provides tab-based toggle between "Enter URL" and "Upload File" modes
- Edit forms auto-select "URL" tab when existing content has a stored URL

**Content Protection**:
- Developer tools are accessible (no inspect element blocking)
- iframe-based embedding limits download options
- URL parameters strip toolbars from PDFs
- No client-side download buttons

### External Dependencies

**UI Component Libraries**:
- @radix-ui/* - 20+ headless UI primitives for accessibility
- class-variance-authority - Type-safe component variant management
- tailwindcss - Utility-first CSS framework
- cmdk - Command menu component

**Data Fetching & Forms**:
- @tanstack/react-query - Server state management with caching
- @hookform/resolvers - Form validation integration
- zod - Runtime type validation for API payloads

**Authentication & Security**:
- express-session - Session management middleware
- bcryptjs - Password hashing
- multer - File upload handling with memory storage
- form-data - Multipart form data for catbox.moe uploads
- No JWT tokens (session-based auth chosen for simplicity)

**Database & ORM**:
- better-sqlite3 - Synchronous SQLite bindings
- drizzle-kit - Database migration tooling (configured but migrations in separate folder)
- Note: Drizzle ORM is configured (drizzle.config.ts references PostgreSQL) but actual implementation uses raw SQLite queries

**Build Tools**:
- vite - Frontend build tool and dev server
- esbuild - Backend bundler for production
- tsx - TypeScript execution for development

**Development Tools**:
- @replit/vite-plugin-* - Replit-specific development enhancements
- Various type definitions (@types/*) for TypeScript support

**Design Assets**:
- Google Fonts (Inter) - Typography
- lucide-react - Icon library matching minimalist design

**Notable Architecture Decision**: The drizzle.config.ts file references PostgreSQL and @neondatabase/serverless, but the actual implementation uses SQLite. This suggests either planned migration to PostgreSQL or configuration left from a template. The code agent should be aware that adding PostgreSQL support may be desired in the future.