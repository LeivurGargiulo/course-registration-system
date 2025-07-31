# Course Registration System

## Overview

This is a comprehensive course registration system specifically designed for web development classes with an inclusive approach for the travesti-trans-nonbinary community. The application provides a multi-step registration process that guides users through course selection, commission (schedule) selection, personal information collection, and final confirmation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built as a modern React single-page application using:

- **React 18** with TypeScript for type safety
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query)** for server state management and caching
- **React Hook Form** with Zod validation for form handling
- **Tailwind CSS** for styling with shadcn/ui component library
- **Radix UI** primitives for accessible, unstyled components

The frontend follows a component-based architecture with clear separation of concerns:
- Pages handle routing and high-level state management
- Components are modular and reusable
- Hooks manage shared logic and side effects
- Type definitions ensure data consistency

### Backend Architecture

The backend is built with Express.js following RESTful principles:

- **Express.js** server with TypeScript
- **In-memory storage** for development (MemStorage class implementing IStorage interface)
- **Drizzle ORM** configured for PostgreSQL (ready for database integration)
- **Zod schemas** for request/response validation
- **Modular route handling** with centralized error management

### Database Architecture

The system is fully implemented with Drizzle ORM and PostgreSQL:

- **Users table** for basic authentication
- **Courses table** for course information and metadata  
- **Commissions table** for class schedules and capacity management
- **Registrations table** for student enrollment data

**Current State**: System is fully configured for Supabase database integration. The system includes both DatabaseStorage (for Supabase/PostgreSQL) and MemStorage (in-memory fallback) implementations. Currently using MemStorage until user sets up Supabase credentials, but the full database implementation is ready.

**Database Migration**: Run `node scripts/enable-supabase.js` after setting up Supabase credentials to enable database storage.

## Key Components

### Registration Flow Components

1. **ProgressStepper** - Visual progress indicator for the 4-step process
2. **CourseSelection** - Displays available courses with filtering and selection
3. **CommissionSelection** - Shows available time slots with capacity indicators
4. **PersonalInfoForm** - Collects student information with inclusive field options
5. **FinalConfirmation** - Review and submit registration with consent management

### UI Component Library

Comprehensive shadcn/ui component library including:
- Form controls (inputs, selects, checkboxes, radio groups)
- Layout components (cards, dialogs, sheets)
- Feedback components (toasts, alerts, loading states)
- Navigation components (menus, breadcrumbs)

### Data Management

- **React Query** for server state with optimistic updates
- **React Hook Form** for client-side form state and validation
- **Zod schemas** for runtime type checking and validation
- **TypeScript interfaces** for compile-time type safety

## Data Flow

1. **Course Loading**: Fetch available courses and commissions from `/api/courses`
2. **Selection State**: Manage selected course and commission in component state
3. **Form Validation**: Client-side validation with Zod schemas before submission
4. **Submission**: POST registration data to `/api/registrations`
5. **Optimistic Updates**: Immediately update UI while processing server response
6. **Cache Invalidation**: Refresh course availability after successful registration

## External Dependencies

### Core Dependencies

- **@tanstack/react-query** - Server state management
- **@hookform/resolvers** - Form validation integration
- **wouter** - Lightweight routing
- **drizzle-orm** - Database ORM and query builder
- **@neondatabase/serverless** - PostgreSQL database driver
- **zod** - Schema validation
- **class-variance-authority** - CSS class variants
- **tailwindcss** - Utility-first CSS framework

### UI Dependencies

Extensive Radix UI component collection for accessibility:
- Form controls, navigation, overlays, and feedback components
- Icons from Lucide React
- Date utilities from date-fns

### Development Dependencies

- **Vite** with React plugin for fast development
- **TypeScript** for type safety
- **ESBuild** for production builds
- **tsx** for TypeScript execution in development

## Deployment Strategy

### Development Setup

- **Vite dev server** with HMR for frontend development
- **tsx** for running TypeScript server code directly
- **Concurrent development** with proxy setup for API routes
- **Replit integration** with development banner and error overlay

### Production Build

- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Unified serving**: Express serves both API routes and static frontend files
- **Environment-based configuration** for database connections

### Database Strategy

- **Development**: In-memory storage with sample data (current)
- **Production**: PostgreSQL with Drizzle ORM ready for use
- **Schema management**: Drizzle Kit configured for migrations and schema updates
- **Environment variables**: DATABASE_URL provisioned but has authentication issues

**Render Deployment Status**:
- ✅ PostgreSQL integration optimized for Render deployment
- ✅ Drizzle ORM configured with standard PostgreSQL driver
- ✅ DatabaseStorage class implemented with all CRUD operations
- ✅ Automatic database initialization on production startup
- ✅ Render deployment configuration with render.yaml
- ✅ Environment-aware SSL configuration
- ✅ Fallback to MemStorage for development reliability

**To Deploy to Render**:
1. Push code to GitHub repository
2. Create Render account and follow `docs/render-deployment.md`
3. Create PostgreSQL database service in Render
4. Create web service linked to GitHub repo
5. Configure environment variables (DATABASE_URL, SESSION_SECRET, etc.)
6. Deploy - database initialization happens automatically

## Recent Changes (January 31, 2025)

### Mobile Responsiveness Optimization
- ✅ Implemented comprehensive mobile-first responsive design across all pages
- ✅ Optimized landing page with flexible typography and mobile-friendly layouts
- ✅ Enhanced home dashboard with responsive navigation and card layouts
- ✅ Improved registration flow with mobile-optimized progress stepper (vertical on mobile, horizontal on desktop)
- ✅ Updated admin dashboard with responsive stats cards and mobile-friendly tabs
- ✅ Added mobile-specific CSS improvements for touch targets and form inputs
- ✅ Ensured proper spacing, typography scaling, and button sizing across all screen sizes

The application now provides an excellent user experience across all device types, from mobile phones to desktop computers, with appropriate layout adaptations and touch-friendly interface elements.