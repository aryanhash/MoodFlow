# MoodFlow - Adaptive Daily Planner

## Overview

MoodFlow is a mood-adaptive daily planner that intelligently adjusts task recommendations, meal suggestions, and wellness interventions based on the user's detected emotional state. The application combines text sentiment analysis with optional facial recognition to provide personalized daily planning experiences. The system features task management with difficulty-based filtering, meal recommendations with health scores, breathing exercises, ambient sound therapy, and general lifestyle recommendations across multiple categories (workouts, music, books, movies, recipes, fashion).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for component-based UI development
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- Tailwind CSS with custom design system based on shadcn/ui component library
- Vite as the build tool and development server

**Design System:**
- Custom Material Design 3-inspired theme with mood-adaptive color schemes
- Typography: Inter (UI/body) and Space Grotesk (headings) via Google Fonts
- Card-based layout architecture with glassmorphic effects
- Responsive grid layouts (1-column mobile, 2-3 columns desktop)
- Emotion-responsive gradients and color themes for each mood state (calm, energized, stressed, focused, neutral)

**State Management:**
- React Query for server state with infinite stale time and disabled refetching
- Local React state (useState) for UI-specific concerns
- Query invalidation pattern for cache updates after mutations

**Component Structure:**
- Atomic design pattern with reusable UI components from shadcn/ui
- Custom feature components (MoodCard, TaskCard, MealCard, BreathingExercise, etc.)
- Page-level components with route-based code splitting

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for RESTful API endpoints
- Custom middleware for request logging and JSON body parsing with raw buffer preservation
- Vite integration in development mode for HMR and SSR-ready setup

**Core Services:**

1. **Mood Analysis Service** (`server/moodAnalysis.ts`):
   - Text sentiment analysis using keyword-based scoring
   - Mock facial analysis placeholder for webcam integration
   - Multi-source fusion algorithm that weights text and facial data
   - Returns mood classification (calm/energized/stressed/focused/neutral) with confidence scores

2. **Storage Layer** (`server/storage.ts`):
   - In-memory data store implementation (MemStorage class)
   - Interfaces designed for easy database migration
   - Supports users, mood entries, tasks, and user settings
   - Seeded with sample data for development

**API Design:**
- RESTful endpoints under `/api` namespace
- POST `/api/mood/detect` - Multi-modal mood detection
- GET `/api/mood/latest` - Retrieve most recent mood entry
- GET `/api/tasks` - Filtered task retrieval by mood state
- GET/PATCH `/api/settings` - User preference management
- Zod schemas for request validation
- Standardized error handling with appropriate HTTP status codes

### Data Storage Solutions

**Current Implementation:**
- In-memory storage using JavaScript Maps for rapid prototyping
- Data structures mirror PostgreSQL schema design for future migration

**Schema Design** (Drizzle ORM ready):

1. **Users Table:**
   - UUID primary keys
   - Username/password authentication fields

2. **Mood Entries Table:**
   - Links to user via userId
   - Stores mood type, confidence score, text input, and optional face analysis JSON
   - Timestamp for historical tracking

3. **Tasks Table:**
   - User-specific tasks with title, duration, difficulty rating
   - Mood association for filtered recommendations
   - Completion status tracking

4. **User Settings Table:**
   - Privacy controls: webcam consent, local-only processing, data logging
   - One-to-one relationship with users

**Migration Path:**
- Drizzle ORM configured for PostgreSQL (via Neon serverless driver)
- Schema definitions in `shared/schema.ts` with Zod validation
- Migration files generated to `./migrations` directory
- Database connection via `DATABASE_URL` environment variable

### Authentication and Authorization

**Current State:**
- Authentication placeholder with default userId ("default")
- Password field exists in schema but not currently validated
- Session management infrastructure absent (connect-pg-simple installed but unused)

**Planned Implementation:**
- Express sessions with PostgreSQL store (connect-pg-simple)
- Cookie-based authentication with httpOnly flags
- User registration and login endpoints
- Protected routes requiring authentication

### External Dependencies

**Development Tools:**
- Replit-specific plugins for development experience (cartographer, dev banner, runtime error overlay)
- TypeScript with strict mode enabled
- ESBuild for production server bundling

**UI Component Library:**
- Radix UI primitives for accessible, unstyled components (30+ component imports)
- Custom styling via Tailwind with CVA (class-variance-authority) for variant management

**Utilities:**
- date-fns for date manipulation
- clsx + tailwind-merge for conditional className composition
- nanoid for unique ID generation
- zod for runtime type validation and schema generation from Drizzle models

**Future Integrations (Placeholders):**
- Webcam API for facial emotion detection
- Real sentiment analysis ML models (currently keyword-based)
- External APIs for meal ordering, recipe videos, product recommendations
- Ambient sound audio files (currently UI-only with mock playback)

**Database:**
- Configured for Neon PostgreSQL serverless (not yet provisioned)
- Drizzle ORM with SQL query builder
- PostgreSQL-specific features (gen_random_uuid, jsonb columns)