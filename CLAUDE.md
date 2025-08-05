# Project Context for Claude Code

## App Overview

**Sales Enablement App for Car Dealerships**

- **Core Problem**: Salespeople struggle with guest objections, managers lack real-time context
- **Solution**: Real-time objection alerts, data tracking, and personalized training
- **Key Flow**: Associate submits objection → Manager gets instant alert → Data tracked for training insights

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: npm/yarn/pnpm

## Core Services

- **Supabase**:
  - Database (PostgreSQL)
  - Authentication (email/password, social providers)
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Storage for files/images

## Project Structure

```
/src
  /app              # Next.js App Router pages
  /components       # React components
    /ui             # shadcn/ui components
  /lib              # Utility functions
    supabase.ts     # Supabase client configuration
  /types            # TypeScript type definitions
  /hooks            # Custom React hooks
```

## Key Dependencies

- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side rendering support
- `shadcn/ui` components
- `tailwindcss`
- `typescript`

## Authentication Flow

- Using Supabase Auth with email/password
- Server-side auth validation
- Protected routes with middleware
- User session management

## Development Preferences

- Use TypeScript for all new files
- Follow shadcn/ui patterns for components
- Implement proper error handling
- Use Supabase RLS for data security
- Prefer server components when possible
- Use React hooks for client-side state

## Application Structure & Business Logic

### User Roles & Access Control

- **Default Role**: All signups start as "Associate"
- **Role Upgrade**: Associates can upgrade to "Manager" using store PIN codes
- **Access Control**: Only managers have access to additional pages (route protection)
- **UI Pattern**: Side drawer navigation with settings page for role management

### Database Schema

```sql
-- Dealerships: Represents each store account
CREATE TABLE dealerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  manufacturer TEXT,
  website TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  store_pin INTEGER NOT NULL DEFAULT 0;
);

-- Profiles: Extends Supabase Auth users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('associate', 'manager')) DEFAULT 'associate',
  dealership_id UUID REFERENCES dealerships(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store pins for role upgrades
CREATE TABLE store_pins (
  id SERIAL PRIMARY KEY,
  pin TEXT NOT NULL
);

-- Choices: Master list of objection reasons
 CREATE TABLE choices (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    dealership_id UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true
  );

-- Submissions: Form submissions from associates
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  associate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  choices JSONB NOT NULL,
  comment TEXT,
  notified_manager_ids UUID[] NOT NULL,
  notify_flags BOOLEAN[] NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

-- User choice totals: Cumulative tracking
CREATE TABLE user_choice_totals (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  choice_id INTEGER REFERENCES choices(id),
  count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, choice_id)
);

-- Reset reports configuration
CREATE TABLE reset_configurations (
  id SERIAL PRIMARY KEY,
  dealership_id UUID NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  reset_type TEXT NOT NULL CHECK (reset_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  reset_time TIME NOT NULL,
  last_reset DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Training Programs
CREATE TABLE training_programs (
  id SERIAL PRIMARY KEY,
  associate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'document', 'article', 'performance_goal')),
  link TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  estimated_time_minutes INTEGER CHECK (estimated_time_minutes > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed BOOLEAN NOT NULL DEFAULT false;
);
```

### User Onboarding Flow

1. User creates account (Supabase Auth) - no dealership assigned yet
2. User redirected to create/join dealership
3. System assigns appropriate role and dealership association
4. User accesses role-based dashboard

### Authentication Pattern

- Single auth system for all users
- Two-step process: Auth signup → Profile creation
- Route protection based on user roles
- Server-side operations use service role key

### Key Features

- **Submissions System**: Associates submit objection forms with email notifications to managers
- **Role Management**: PIN-based role upgrades from associate to manager
- **Dealership Management**: Multi-tenant structure with dealership-specific data
- **Real-time Updates**: Use Supabase real-time for live data updates

## Notes

- Always consider RLS policies when creating database operations
- Use Supabase client-side for user interactions
- Use service role key server-side for admin operations
- Follow Next.js 14+ App Router conventions
- Implement proper route protection based on user roles
- Use database joins instead of frontend data manipulation
- Handle two-step signup: Auth → Profile creation
