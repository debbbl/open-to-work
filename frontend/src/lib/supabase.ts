/**
 * Supabase Client Configuration
 * 
 * This file handles the manual setup of Supabase client connection.
 * It creates a singleton instance that can be used throughout the application.
 * 
 * Key Features:
 * - Manual client initialization (not using built-in functions)
 * - Environment variable configuration
 * - Type-safe database operations
 * - Error handling and connection validation
 */

import React from 'react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Database Types - Define your database schema types here
export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          title: string
          department: string
          location: string
          type: 'full-time' | 'part-time' | 'contract'
          status: 'active' | 'paused' | 'closed'
          description: string
          requirements: string[]
          skills: string[]
          experience_level: 'entry' | 'mid' | 'senior'
          salary_min: number
          salary_max: number
          salary_currency: string
          created_date: string
          applicants: number
          created_by?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          title: string
          department: string
          location: string
          type: 'full-time' | 'part-time' | 'contract'
          status?: 'active' | 'paused' | 'closed'
          description: string
          requirements: string[]
          skills: string[]
          experience_level: 'entry' | 'mid' | 'senior'
          salary_min: number
          salary_max: number
          salary_currency?: string
          created_date?: string
          applicants?: number
          created_by?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          department?: string
          location?: string
          type?: 'full-time' | 'part-time' | 'contract'
          status?: 'active' | 'paused' | 'closed'
          description?: string
          requirements?: string[]
          skills?: string[]
          experience_level?: 'entry' | 'mid' | 'senior'
          salary_min?: number
          salary_max?: number
          salary_currency?: string
          created_date?: string
          applicants?: number
          created_by?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          name: string
          email: string
          phone?: string
          position: string
          experience: number
          skills: string[]
          stage: 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected'
          ai_score: number
          applied_date: string
          resume_url?: string
          notes?: string
          status: 'active' | 'rejected' | 'hired'
          source: 'direct' | 'linkedin' | 'referral' | 'job-board'
          job_id?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string
          position: string
          experience: number
          skills: string[]
          stage?: 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected'
          ai_score?: number
          applied_date?: string
          resume_url?: string
          notes?: string
          status?: 'active' | 'rejected' | 'hired'
          source: 'direct' | 'linkedin' | 'referral' | 'job-board'
          job_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          position?: string
          experience?: number
          skills?: string[]
          stage?: 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected'
          ai_score?: number
          applied_date?: string
          resume_url?: string
          notes?: string
          status?: 'active' | 'rejected' | 'hired'
          source?: 'direct' | 'linkedin' | 'referral' | 'job-board'
          job_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          candidate_id: string
          job_id: string
          type: 'phone' | 'video' | 'in-person' | 'technical'
          scheduled_date: string
          duration: number
          interviewer: string
          status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
          feedback?: string
          rating?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          candidate_id: string
          job_id: string
          type: 'phone' | 'video' | 'in-person' | 'technical'
          scheduled_date: string
          duration: number
          interviewer: string
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
          feedback?: string
          rating?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          job_id?: string
          type?: 'phone' | 'video' | 'in-person' | 'technical'
          scheduled_date?: string
          duration?: number
          interviewer?: string
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
          feedback?: string
          rating?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          candidate_id: string
          job_id: string
          salary: number
          currency: string
          benefits: string[]
          start_date: string
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          created_date: string
          expiry_date: string
          notes?: string
          accepted_date?: string
          declined_date?: string
          created_by?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          candidate_id: string
          job_id: string
          salary: number
          currency?: string
          benefits: string[]
          start_date: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          created_date?: string
          expiry_date: string
          notes?: string
          accepted_date?: string
          declined_date?: string
          created_by?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          job_id?: string
          salary?: number
          currency?: string
          benefits?: string[]
          start_date?: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          created_date?: string
          expiry_date?: string
          notes?: string
          accepted_date?: string
          declined_date?: string
          created_by?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Supabase Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use mock mode if environment variables are not set
const useMockMode = !supabaseUrl || !supabaseAnonKey

if (useMockMode) {
  console.warn('Supabase environment variables not found. Running in mock mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use real database.')
}

// Create Supabase client instance
// This is a singleton pattern - the client is created once and reused
export const supabase: SupabaseClient<Database> = useMockMode 
  ? createClient<Database>(
      'https://xyzcompany.supabase.co', // Valid mock URL format
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTIzMjAwMCwiZXhwIjoxOTYwODA4MDAwfQ.MockTokenForDemoUseOnly', // Valid mock JWT format
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )
  : createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          // Configure auth settings
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        db: {
          // Configure database settings
          schema: 'public'
        },
        global: {
          // Configure global settings
          headers: {
            'X-Client-Info': 'hr-talent-platform'
          }
        }
      }
    )

// Export mock mode flag for use in other files
export { useMockMode }

/**
 * Connection Health Check
 * 
 * This function tests the database connection and returns connection status.
 * Use this to verify that your Supabase setup is working correctly.
 */
export const checkConnection = async (): Promise<{
  connected: boolean
  error?: string
}> => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('count')
      .limit(1)
    
    if (error) {
      return { connected: false, error: error.message }
    }
    
    return { connected: true }
  } catch (error) {
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown connection error' 
    }
  }
}

/**
 * Database Connection Status Hook
 * 
 * This can be used in React components to check connection status
 */
export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = React.useState<boolean | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    checkConnection().then(({ connected, error }) => {
      setIsConnected(connected)
      setError(error || null)
    })
  }, [])
  
  return { isConnected, error }
}

// Export the database type for use in other files
export type { Database }