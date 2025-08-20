/**
 * Database Operations Layer
 * 
 * This file contains all database operations and serves as the main interface
 * between your application and Supabase. All database changes should go through
 * the functions defined in this file.
 * 
 * Architecture:
 * - Each table has its own class with CRUD operations
 * - Type-safe operations using TypeScript
 * - Error handling and validation
 * - Consistent API patterns
 * 
 * Usage:
 * import { JobsDB, CandidatesDB } from '@/lib/database'
 * const jobs = await JobsDB.getAll()
 */

import { supabase, Database, useMockMode } from './supabase'

// Mock data for demo when Supabase is not available
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'full-time',
    status: 'active',
    description: 'Looking for a senior frontend developer...',
    requirements: ['React', 'TypeScript', '5+ years experience'],
    skills: ['React', 'TypeScript', 'Node.js'],
    experience_level: 'senior',
    salary_min: 120000,
    salary_max: 160000,
    salary_currency: 'USD',
    created_date: '2024-01-15',
    applicants: 25
  },
  {
    id: '2',
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    type: 'full-time',
    status: 'active',
    description: 'Seeking an experienced product manager...',
    requirements: ['Product Strategy', 'Agile', '3+ years experience'],
    skills: ['Product Strategy', 'Agile', 'Analytics'],
    experience_level: 'mid',
    salary_min: 90000,
    salary_max: 130000,
    salary_currency: 'USD',
    created_date: '2024-01-10',
    applicants: 18
  }
]

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    position: 'Senior Frontend Developer',
    experience: 5,
    skills: ['React', 'TypeScript', 'Node.js'],
    stage: 'screening',
    ai_score: 4,
    applied_date: '2024-01-15',
    status: 'active',
    source: 'linkedin'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    position: 'Product Manager',
    experience: 3,
    skills: ['Product Strategy', 'Agile', 'Analytics'],
    stage: 'interviewing',
    ai_score: 5,
    applied_date: '2024-01-12',
    status: 'active',
    source: 'direct'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    position: 'Data Scientist',
    experience: 4,
    skills: ['Python', 'ML', 'SQL'],
    stage: 'offer',
    ai_score: 4,
    applied_date: '2024-01-10',
    status: 'active',
    source: 'referral'
  }
]

const mockInterviews: Interview[] = [
  {
    id: '1',
    candidate_id: '2',
    job_id: '2',
    type: 'video',
    scheduled_date: '2024-01-20T10:00:00Z',
    duration: 60,
    interviewer: 'Jane Doe',
    status: 'scheduled'
  }
]

const mockOffers: Offer[] = [
  {
    id: '1',
    candidate_id: '3',
    job_id: '1',
    salary: 140000,
    currency: 'USD',
    benefits: ['Health Insurance', '401k', 'PTO'],
    start_date: '2024-02-01',
    status: 'pending',
    created_date: '2024-01-18',
    expiry_date: '2024-01-25'
  }
]

// Type aliases for cleaner code
type Job = Database['public']['Tables']['jobs']['Row']
type JobInsert = Database['public']['Tables']['jobs']['Insert']
type JobUpdate = Database['public']['Tables']['jobs']['Update']

type Candidate = Database['public']['Tables']['candidates']['Row']
type CandidateInsert = Database['public']['Tables']['candidates']['Insert']
type CandidateUpdate = Database['public']['Tables']['candidates']['Update']

type Interview = Database['public']['Tables']['interviews']['Row']
type InterviewInsert = Database['public']['Tables']['interviews']['Insert']
type InterviewUpdate = Database['public']['Tables']['interviews']['Update']

type Offer = Database['public']['Tables']['offers']['Row']
type OfferInsert = Database['public']['Tables']['offers']['Insert']
type OfferUpdate = Database['public']['Tables']['offers']['Update']

/**
 * Jobs Database Operations
 * 
 * This class handles all database operations related to job postings.
 * It provides a clean interface for CRUD operations on the jobs table.
 */
export class JobsDB {
  /**
   * Get all jobs with optional filtering
   */
  static async getAll(filters?: {
    department?: string
    status?: string
    limit?: number
  }): Promise<{ data: Job[] | null; error: any }> {
    if (useMockMode) {
      // Return mock data with simulated delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      let filteredJobs = [...mockJobs]
      
      if (filters?.department) {
        filteredJobs = filteredJobs.filter(job => job.department === filters.department)
      }
      if (filters?.status) {
        filteredJobs = filteredJobs.filter(job => job.status === filters.status)
      }
      if (filters?.limit) {
        filteredJobs = filteredJobs.slice(0, filters.limit)
      }
      
      return { data: filteredJobs, error: null }
    }

    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .order('created_date', { ascending: false })

      // Apply filters
      if (filters?.department) {
        query = query.eq('department', filters.department)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return { data: null, error }
    }
  }

  /**
   * Get a single job by ID
   */
  static async getById(id: string): Promise<{ data: Job | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching job:', error)
      return { data: null, error }
    }
  }

  /**
   * Create a new job posting
   */
  static async create(job: JobInsert): Promise<{ data: Job | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...job,
          created_date: new Date().toISOString().split('T')[0],
          applicants: 0,
          status: job.status || 'active',
          salary_currency: job.salary_currency || 'USD'
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating job:', error)
      return { data: null, error }
    }
  }

  /**
   * Update an existing job
   */
  static async update(id: string, updates: JobUpdate): Promise<{ data: Job | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating job:', error)
      return { data: null, error }
    }
  }

  /**
   * Delete a job (soft delete by setting status to closed)
   */
  static async delete(id: string): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'closed', updated_at: new Date().toISOString() })
        .eq('id', id)

      return { success: !error, error }
    } catch (error) {
      console.error('Error deleting job:', error)
      return { success: false, error }
    }
  }

  /**
   * Get active jobs only
   */
  static async getActive(): Promise<{ data: Job[] | null; error: any }> {
    return this.getAll({ status: 'active' })
  }
}

/**
 * Candidates Database Operations
 * 
 * This class handles all database operations related to candidates.
 * It provides methods for managing candidate data throughout the hiring pipeline.
 */
export class CandidatesDB {
  /**
   * Get all candidates with optional filtering
   */
  static async getAll(filters?: {
    stage?: string
    jobId?: string
    status?: string
    limit?: number
  }): Promise<{ data: Candidate[] | null; error: any }> {
    if (useMockMode) {
      // Return mock data with simulated delay
      await new Promise(resolve => setTimeout(resolve, 200))
      
      let filteredCandidates = [...mockCandidates]
      
      if (filters?.stage) {
        filteredCandidates = filteredCandidates.filter(candidate => candidate.stage === filters.stage)
      }
      if (filters?.jobId) {
        filteredCandidates = filteredCandidates.filter(candidate => candidate.job_id === filters.jobId)
      }
      if (filters?.status) {
        filteredCandidates = filteredCandidates.filter(candidate => candidate.status === filters.status)
      }
      if (filters?.limit) {
        filteredCandidates = filteredCandidates.slice(0, filters.limit)
      }
      
      return { data: filteredCandidates, error: null }
    }

    try {
      let query = supabase
        .from('candidates')
        .select('*')
        .order('applied_date', { ascending: false })

      // Apply filters
      if (filters?.stage) {
        query = query.eq('stage', filters.stage)
      }
      if (filters?.jobId) {
        query = query.eq('job_id', filters.jobId)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error('Error fetching candidates:', error)
      return { data: null, error }
    }
  }

  /**
   * Get a single candidate by ID
   */
  static async getById(id: string): Promise<{ data: Candidate | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching candidate:', error)
      return { data: null, error }
    }
  }

  /**
   * Create a new candidate
   */
  static async create(candidate: CandidateInsert): Promise<{ data: Candidate | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .insert({
          ...candidate,
          applied_date: candidate.applied_date || new Date().toISOString().split('T')[0],
          stage: candidate.stage || 'screening',
          status: candidate.status || 'active',
          ai_score: candidate.ai_score || Math.floor(Math.random() * 5) + 1,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating candidate:', error)
      return { data: null, error }
    }
  }

  /**
   * Update candidate information
   */
  static async update(id: string, updates: CandidateUpdate): Promise<{ data: Candidate | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating candidate:', error)
      return { data: null, error }
    }
  }

  /**
   * Update candidate stage in the pipeline
   */
  static async updateStage(id: string, stage: string): Promise<{ data: Candidate | null; error: any }> {
    if (useMockMode) {
      // Find and update candidate in mock data
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const candidateIndex = mockCandidates.findIndex(c => c.id === id)
      if (candidateIndex === -1) {
        return { data: null, error: { message: 'Candidate not found' } }
      }
      
      mockCandidates[candidateIndex] = {
        ...mockCandidates[candidateIndex],
        stage: stage as any
      }
      
      return { data: mockCandidates[candidateIndex], error: null }
    }
    
    return this.update(id, { stage: stage as any })
  }

  /**
   * Search candidates by name, position, or skills
   */
  static async search(query: string): Promise<{ data: Candidate[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .or(`name.ilike.%${query}%,position.ilike.%${query}%,skills.cs.{${query}}`)
        .eq('status', 'active')

      return { data, error }
    } catch (error) {
      console.error('Error searching candidates:', error)
      return { data: null, error }
    }
  }
}

/**
 * Interviews Database Operations
 * 
 * This class handles all database operations related to interviews.
 */
export class InterviewsDB {
  /**
   * Get all interviews with optional filtering
   */
  static async getAll(filters?: {
    candidateId?: string
    status?: string
    date?: string
  }): Promise<{ data: Interview[] | null; error: any }> {
    try {
      let query = supabase
        .from('interviews')
        .select('*')
        .order('scheduled_date', { ascending: true })

      if (filters?.candidateId) {
        query = query.eq('candidate_id', filters.candidateId)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.date) {
        query = query.gte('scheduled_date', filters.date)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error('Error fetching interviews:', error)
      return { data: null, error }
    }
  }

  /**
   * Create a new interview
   */
  static async create(interview: InterviewInsert): Promise<{ data: Interview | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert({
          ...interview,
          status: interview.status || 'scheduled',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating interview:', error)
      return { data: null, error }
    }
  }

  /**
   * Update interview details
   */
  static async update(id: string, updates: InterviewUpdate): Promise<{ data: Interview | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating interview:', error)
      return { data: null, error }
    }
  }
}

/**
 * Offers Database Operations
 * 
 * This class handles all database operations related to job offers.
 */
export class OffersDB {
  /**
   * Get all offers with optional filtering
   */
  static async getAll(filters?: {
    candidateId?: string
    status?: string
    jobId?: string
  }): Promise<{ data: Offer[] | null; error: any }> {
    try {
      let query = supabase
        .from('offers')
        .select('*')
        .order('created_date', { ascending: false })

      if (filters?.candidateId) {
        query = query.eq('candidate_id', filters.candidateId)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.jobId) {
        query = query.eq('job_id', filters.jobId)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      console.error('Error fetching offers:', error)
      return { data: null, error }
    }
  }

  /**
   * Create a new offer
   */
  static async create(offer: OfferInsert): Promise<{ data: Offer | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .insert({
          ...offer,
          status: offer.status || 'pending',
          currency: offer.currency || 'USD',
          created_date: offer.created_date || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error creating offer:', error)
      return { data: null, error }
    }
  }

  /**
   * Update offer status
   */
  static async updateStatus(id: string, status: 'pending' | 'accepted' | 'declined' | 'expired'): Promise<{ data: Offer | null; error: any }> {
    try {
      const updates: any = { 
        status, 
        updated_at: new Date().toISOString() 
      }

      // Add timestamp for status changes
      if (status === 'accepted') {
        updates.accepted_date = new Date().toISOString().split('T')[0]
      } else if (status === 'declined') {
        updates.declined_date = new Date().toISOString().split('T')[0]
      }

      const { data, error } = await supabase
        .from('offers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating offer status:', error)
      return { data: null, error }
    }
  }
}

/**
 * Database Utilities
 * 
 * Helper functions for common database operations
 */
export class DatabaseUtils {
  /**
   * Get database statistics
   */
  static async getStats(): Promise<{
    jobs: number
    candidates: number
    interviews: number
    offers: number
  }> {
    try {
      const [jobsResult, candidatesResult, interviewsResult, offersResult] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact', head: true }),
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('interviews').select('id', { count: 'exact', head: true }),
        supabase.from('offers').select('id', { count: 'exact', head: true })
      ])

      return {
        jobs: jobsResult.count || 0,
        candidates: candidatesResult.count || 0,
        interviews: interviewsResult.count || 0,
        offers: offersResult.count || 0
      }
    } catch (error) {
      console.error('Error fetching database stats:', error)
      return { jobs: 0, candidates: 0, interviews: 0, offers: 0 }
    }
  }

  /**
   * Backup data (export all tables)
   */
  static async exportData(): Promise<{
    jobs: Job[]
    candidates: Candidate[]
    interviews: Interview[]
    offers: Offer[]
  } | null> {
    try {
      const [jobsResult, candidatesResult, interviewsResult, offersResult] = await Promise.all([
        JobsDB.getAll(),
        CandidatesDB.getAll(),
        InterviewsDB.getAll(),
        OffersDB.getAll()
      ])

      if (jobsResult.error || candidatesResult.error || interviewsResult.error || offersResult.error) {
        throw new Error('Failed to export data')
      }

      return {
        jobs: jobsResult.data || [],
        candidates: candidatesResult.data || [],
        interviews: interviewsResult.data || [],
        offers: offersResult.data || []
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      return null
    }
  }
}

// Export all database classes and types
export type { Job, JobInsert, JobUpdate, Candidate, CandidateInsert, CandidateUpdate, Interview, InterviewInsert, InterviewUpdate, Offer, OfferInsert, OfferUpdate }