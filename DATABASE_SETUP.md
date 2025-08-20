# Database Setup and Connection Guide

This document provides comprehensive guidance on how the database connection is implemented in this HR Talent Platform and how to set it up with Supabase.

## 🏗️ Architecture Overview

The database layer is organized into several key files that handle different aspects of data management:

```
frontend/src/
├── lib/
│   ├── supabase.ts          # Supabase client configuration
│   └── database.ts          # Database operations layer
├── services/
│   └── supabaseApi.ts       # API service layer
└── .env                     # Environment configuration
```

## 📁 File Responsibilities

### 1. `frontend/src/lib/supabase.ts`
**Purpose**: Supabase client initialization and configuration
- Creates the Supabase client instance
- Defines TypeScript types for database schema
- Handles connection validation
- Provides connection health check utilities

**Key Features**:
- Manual client setup (not using built-in functions)
- Type-safe database operations
- Environment variable validation
- Connection status monitoring

### 2. `frontend/src/lib/database.ts`
**Purpose**: Database operations layer - **THIS IS THE MAIN FILE FOR DATABASE CHANGES**
- Contains all CRUD operations for each table
- Provides type-safe database interactions
- Handles error management and validation
- Implements consistent API patterns

**Database Classes**:
- `JobsDB` - Handles job postings operations
- `CandidatesDB` - Manages candidate data
- `InterviewsDB` - Interview scheduling and management
- `OffersDB` - Job offer operations
- `DatabaseUtils` - Utility functions and statistics

### 3. `frontend/src/services/supabaseApi.ts`
**Purpose**: API service layer that bridges React components and database
- Transforms database types to application types
- Provides consistent API interface
- Handles error propagation
- Replaces mock API calls with real database operations

### 4. `frontend/.env`
**Purpose**: Environment configuration
- Stores Supabase connection credentials
- Configures database URL and API keys

## 🚀 Setup Instructions

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be fully provisioned
4. Go to Settings > API to get your credentials

### Step 2: Configure Environment Variables
Update `frontend/.env` with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Create Database Tables
Run these SQL commands in your Supabase SQL editor:

```sql
-- Jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT CHECK (type IN ('full-time', 'part-time', 'contract')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'closed')) DEFAULT 'active',
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior')) NOT NULL,
  salary_min INTEGER NOT NULL,
  salary_max INTEGER NOT NULL,
  salary_currency TEXT DEFAULT 'USD',
  created_date DATE DEFAULT CURRENT_DATE,
  applicants INTEGER DEFAULT 0,
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates table
CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  experience INTEGER NOT NULL,
  skills TEXT[] DEFAULT '{}',
  stage TEXT CHECK (stage IN ('screening', 'interviewing', 'offer', 'hired', 'rejected')) DEFAULT 'screening',
  ai_score INTEGER CHECK (ai_score >= 1 AND ai_score <= 5) DEFAULT 3,
  applied_date DATE DEFAULT CURRENT_DATE,
  resume_url TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('active', 'rejected', 'hired')) DEFAULT 'active',
  source TEXT CHECK (source IN ('direct', 'linkedin', 'referral', 'job-board')) NOT NULL,
  job_id UUID REFERENCES jobs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviews table
CREATE TABLE interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) NOT NULL,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  type TEXT CHECK (type IN ('phone', 'video', 'in-person', 'technical')) NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  interviewer TEXT NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers table
CREATE TABLE offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES candidates(id) NOT NULL,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  salary INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  benefits TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  created_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  notes TEXT,
  accepted_date DATE,
  declined_date DATE,
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON jobs FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON jobs FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON candidates FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON candidates FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON interviews FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON interviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON interviews FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON offers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON offers FOR UPDATE USING (true);
```

### Step 4: Update API Imports
Replace the existing API imports in your components:

```typescript
// OLD - Mock API
import { jobsAPI, candidatesAPI } from '../services/api'

// NEW - Supabase API
import { jobsAPI, candidatesAPI } from '../services/supabaseApi'
```

## 🔧 How to Make Database Changes

### Adding New Operations
To add new database operations, modify `frontend/src/lib/database.ts`:

```typescript
// Example: Add a new method to JobsDB class
export class JobsDB {
  // ... existing methods

  /**
   * Get jobs by department with candidate count
   */
  static async getByDepartmentWithStats(department: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          candidates:candidates(count)
        `)
        .eq('department', department)
        .eq('status', 'active')

      return { data, error }
    } catch (error) {
      console.error('Error fetching jobs with stats:', error)
      return { data: null, error }
    }
  }
}
```

### Adding New Tables
1. Create the table in Supabase SQL editor
2. Add the table definition to the `Database` type in `supabase.ts`
3. Create a new class in `database.ts` for the table operations
4. Add transformation functions in `supabaseApi.ts`

### Modifying Existing Tables
1. Run ALTER TABLE commands in Supabase
2. Update the type definitions in `supabase.ts`
3. Update the corresponding class methods in `database.ts`
4. Update transformation functions if needed

## 🔍 Testing Database Connection

Use the built-in connection checker:

```typescript
import { checkConnection } from '@/lib/supabase'

// Test connection
const { connected, error } = await checkConnection()
if (connected) {
  console.log('✅ Database connected successfully')
} else {
  console.error('❌ Database connection failed:', error)
}
```

## 📊 Database Statistics

Get database statistics using the utility class:

```typescript
import { DatabaseUtils } from '@/lib/database'

const stats = await DatabaseUtils.getStats()
console.log('Database stats:', stats)
// Output: { jobs: 12, candidates: 48, interviews: 15, offers: 6 }
```

## 🚨 Error Handling

All database operations return a consistent error format:
- Success: `{ data: T[], error: null }`
- Error: `{ data: null, error: ErrorObject }`

Always check for errors in your components:

```typescript
const { data, error } = await JobsDB.getAll()
if (error) {
  console.error('Database error:', error)
  // Handle error appropriately
  return
}
// Use data safely
```

## 🔐 Security Considerations

1. **Row Level Security (RLS)**: Enabled on all tables
2. **Environment Variables**: Never commit actual credentials
3. **API Keys**: Use anon key for client-side operations
4. **Policies**: Adjust RLS policies based on your authentication needs

## 📝 Best Practices

1. **Always use the database classes** in `database.ts` for data operations
2. **Don't write raw SQL** in components - use the abstraction layer
3. **Handle errors gracefully** and provide user feedback
4. **Use TypeScript types** for type safety
5. **Test database operations** before deploying
6. **Keep credentials secure** and use environment variables

## 🔄 Migration Strategy

When moving from mock data to real database:
1. Update environment variables
2. Create database tables
3. Replace API imports in components
4. Test each feature individually
5. Handle any data transformation differences

This setup provides a robust, type-safe, and scalable database layer for your HR Talent Platform.