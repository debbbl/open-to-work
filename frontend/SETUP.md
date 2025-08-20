# Frontend Setup Guide

## Quick Start

The frontend will work immediately with mock data. No additional setup is required for basic functionality.

## Supabase Integration (Optional)

To connect to a real Supabase database:

1. Create a `.env` file in the `frontend/` directory
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Running the Application

```bash
cd frontend
npm install
npm run dev
```

The application will automatically detect if Supabase credentials are available:
- **With credentials**: Uses real Supabase database
- **Without credentials**: Uses mock data for demonstration

## Mock Mode Features

When running in mock mode, you'll see:
- Sample job postings
- Demo candidates in different pipeline stages
- Working drag-and-drop functionality (changes stored in memory)
- Interactive charts and metrics

## Supabase Database Setup

If you want to use a real database, refer to the `DATABASE_SETUP.md` file in the project root for instructions on setting up Supabase tables.
