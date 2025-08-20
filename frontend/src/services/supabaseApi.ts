/**
 * Supabase API Service Layer
 * 
 * This file replaces the mock API calls with real Supabase database operations.
 * It serves as the bridge between your React components and the database layer.
 * 
 * Key Features:
 * - Real-time data operations
 * - Error handling and validation
 * - Type-safe API calls
 * - Consistent response format
 * 
 * Usage:
 * Replace the existing API imports in your components:
 * import { jobsAPI, candidatesAPI } from '@/services/supabaseApi'
 */

import { JobsDB, CandidatesDB, InterviewsDB, OffersDB } from '../lib/database'
import type { Job, Candidate, Interview, Offer } from '../types'

// Transform database types to application types
const transformJob = (dbJob: any): Job => ({
  id: dbJob.id,
  title: dbJob.title,
  department: dbJob.department,
  location: dbJob.location,
  type: dbJob.type,
  status: dbJob.status,
  description: dbJob.description,
  requirements: dbJob.requirements,
  skills: dbJob.skills,
  experienceLevel: dbJob.experience_level,
  salary: {
    min: dbJob.salary_min,
    max: dbJob.salary_max,
    currency: dbJob.salary_currency
  },
  createdDate: dbJob.created_date,
  applicants: dbJob.applicants
})

const transformCandidate = (dbCandidate: any): Candidate => ({
  id: dbCandidate.id,
  name: dbCandidate.name,
  email: dbCandidate.email,
  phone: dbCandidate.phone,
  position: dbCandidate.position,
  experience: dbCandidate.experience,
  skills: dbCandidate.skills,
  stage: dbCandidate.stage,
  aiScore: dbCandidate.ai_score,
  appliedDate: dbCandidate.applied_date,
  resumeUrl: dbCandidate.resume_url,
  notes: dbCandidate.notes,
  status: dbCandidate.status,
  source: dbCandidate.source
})

const transformInterview = (dbInterview: any): Interview => ({
  id: dbInterview.id,
  candidateId: dbInterview.candidate_id,
  jobId: dbInterview.job_id,
  type: dbInterview.type,
  scheduledDate: dbInterview.scheduled_date,
  duration: dbInterview.duration,
  interviewer: dbInterview.interviewer,
  status: dbInterview.status,
  feedback: dbInterview.feedback,
  rating: dbInterview.rating,
  notes: dbInterview.notes
})

const transformOffer = (dbOffer: any): Offer => ({
  id: dbOffer.id,
  candidateId: dbOffer.candidate_id,
  jobId: dbOffer.job_id,
  salary: dbOffer.salary,
  currency: dbOffer.currency,
  benefits: dbOffer.benefits,
  startDate: dbOffer.start_date,
  status: dbOffer.status,
  createdDate: dbOffer.created_date,
  expiryDate: dbOffer.expiry_date,
  notes: dbOffer.notes
})

/**
 * Jobs API - Real Supabase Implementation
 */
export const jobsAPI = {
  async getAll(): Promise<Job[]> {
    const { data, error } = await JobsDB.getAll()
    if (error) throw new Error(`Failed to fetch jobs: ${error.message}`)
    return data ? data.map(transformJob) : []
  },

  async getById(id: string): Promise<Job> {
    const { data, error } = await JobsDB.getById(id)
    if (error) throw new Error(`Failed to fetch job: ${error.message}`)
    if (!data) throw new Error('Job not found')
    return transformJob(data)
  },

  async create(job: Omit<Job, 'id'>): Promise<Job> {
    const jobInsert = {
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: job.requirements,
      skills: job.skills,
      experience_level: job.experienceLevel,
      salary_min: job.salary.min,
      salary_max: job.salary.max,
      salary_currency: job.salary.currency
    }

    const { data, error } = await JobsDB.create(jobInsert)
    if (error) throw new Error(`Failed to create job: ${error.message}`)
    if (!data) throw new Error('Failed to create job')
    return transformJob(data)
  },

  async update(id: string, job: Partial<Job>): Promise<Job> {
    const jobUpdate: any = {}
    
    if (job.title) jobUpdate.title = job.title
    if (job.department) jobUpdate.department = job.department
    if (job.location) jobUpdate.location = job.location
    if (job.type) jobUpdate.type = job.type
    if (job.status) jobUpdate.status = job.status
    if (job.description) jobUpdate.description = job.description
    if (job.requirements) jobUpdate.requirements = job.requirements
    if (job.skills) jobUpdate.skills = job.skills
    if (job.experienceLevel) jobUpdate.experience_level = job.experienceLevel
    if (job.salary) {
      if (job.salary.min) jobUpdate.salary_min = job.salary.min
      if (job.salary.max) jobUpdate.salary_max = job.salary.max
      if (job.salary.currency) jobUpdate.salary_currency = job.salary.currency
    }

    const { data, error } = await JobsDB.update(id, jobUpdate)
    if (error) throw new Error(`Failed to update job: ${error.message}`)
    if (!data) throw new Error('Job not found')
    return transformJob(data)
  },

  async delete(id: string): Promise<void> {
    const { success, error } = await JobsDB.delete(id)
    if (!success) throw new Error(`Failed to delete job: ${error?.message || 'Unknown error'}`)
  }
}

/**
 * Candidates API - Real Supabase Implementation
 */
export const candidatesAPI = {
  async getAll(): Promise<Candidate[]> {
    const { data, error } = await CandidatesDB.getAll()
    if (error) throw new Error(`Failed to fetch candidates: ${error.message}`)
    return data ? data.map(transformCandidate) : []
  },

  async getById(id: string): Promise<Candidate> {
    const { data, error } = await CandidatesDB.getById(id)
    if (error) throw new Error(`Failed to fetch candidate: ${error.message}`)
    if (!data) throw new Error('Candidate not found')
    return transformCandidate(data)
  },

  async create(candidate: Omit<Candidate, 'id'>): Promise<Candidate> {
    const candidateInsert = {
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      position: candidate.position,
      experience: candidate.experience,
      skills: candidate.skills,
      source: candidate.source,
      job_id: (candidate as any).jobId
    }

    const { data, error } = await CandidatesDB.create(candidateInsert)
    if (error) throw new Error(`Failed to create candidate: ${error.message}`)
    if (!data) throw new Error('Failed to create candidate')
    return transformCandidate(data)
  },

  async update(id: string, candidate: Partial<Candidate>): Promise<Candidate> {
    const candidateUpdate: any = {}
    
    if (candidate.name) candidateUpdate.name = candidate.name
    if (candidate.email) candidateUpdate.email = candidate.email
    if (candidate.phone) candidateUpdate.phone = candidate.phone
    if (candidate.position) candidateUpdate.position = candidate.position
    if (candidate.experience) candidateUpdate.experience = candidate.experience
    if (candidate.skills) candidateUpdate.skills = candidate.skills
    if (candidate.stage) candidateUpdate.stage = candidate.stage
    if (candidate.status) candidateUpdate.status = candidate.status
    if (candidate.notes) candidateUpdate.notes = candidate.notes
    if (candidate.resumeUrl) candidateUpdate.resume_url = candidate.resumeUrl

    const { data, error } = await CandidatesDB.update(id, candidateUpdate)
    if (error) throw new Error(`Failed to update candidate: ${error.message}`)
    if (!data) throw new Error('Candidate not found')
    return transformCandidate(data)
  },

  async updateStage(id: string, stage: string): Promise<Candidate> {
    const { data, error } = await CandidatesDB.updateStage(id, stage)
    if (error) throw new Error(`Failed to update candidate stage: ${error.message}`)
    if (!data) throw new Error('Candidate not found')
    return transformCandidate(data)
  },

  async uploadResume(file: File): Promise<{ url: string }> {
    // This would typically upload to Supabase Storage
    // For now, return a mock URL
    return { url: `https://example.com/resumes/${file.name}` }
  }
}

/**
 * Interviews API - Real Supabase Implementation
 */
export const interviewsAPI = {
  async getAll(): Promise<Interview[]> {
    const { data, error } = await InterviewsDB.getAll()
    if (error) throw new Error(`Failed to fetch interviews: ${error.message}`)
    return data ? data.map(transformInterview) : []
  },

  async getById(id: string): Promise<Interview> {
    const { data, error } = await InterviewsDB.getAll({ candidateId: id })
    if (error) throw new Error(`Failed to fetch interview: ${error.message}`)
    if (!data || data.length === 0) throw new Error('Interview not found')
    return transformInterview(data[0])
  },

  async create(interview: Omit<Interview, 'id'>): Promise<Interview> {
    const interviewInsert = {
      candidate_id: interview.candidateId,
      job_id: interview.jobId,
      type: interview.type,
      scheduled_date: interview.scheduledDate,
      duration: interview.duration,
      interviewer: interview.interviewer
    }

    const { data, error } = await InterviewsDB.create(interviewInsert)
    if (error) throw new Error(`Failed to create interview: ${error.message}`)
    if (!data) throw new Error('Failed to create interview')
    return transformInterview(data)
  },

  async update(id: string, interview: Partial<Interview>): Promise<Interview> {
    const interviewUpdate: any = {}
    
    if (interview.type) interviewUpdate.type = interview.type
    if (interview.scheduledDate) interviewUpdate.scheduled_date = interview.scheduledDate
    if (interview.duration) interviewUpdate.duration = interview.duration
    if (interview.interviewer) interviewUpdate.interviewer = interview.interviewer
    if (interview.status) interviewUpdate.status = interview.status
    if (interview.feedback) interviewUpdate.feedback = interview.feedback
    if (interview.rating) interviewUpdate.rating = interview.rating
    if (interview.notes) interviewUpdate.notes = interview.notes

    const { data, error } = await InterviewsDB.update(id, interviewUpdate)
    if (error) throw new Error(`Failed to update interview: ${error.message}`)
    if (!data) throw new Error('Interview not found')
    return transformInterview(data)
  }
}

/**
 * Offers API - Real Supabase Implementation
 */
export const offersAPI = {
  async getAll(): Promise<Offer[]> {
    const { data, error } = await OffersDB.getAll()
    if (error) throw new Error(`Failed to fetch offers: ${error.message}`)
    return data ? data.map(transformOffer) : []
  },

  async create(offer: Omit<Offer, 'id'>): Promise<Offer> {
    const offerInsert = {
      candidate_id: offer.candidateId,
      job_id: offer.jobId,
      salary: offer.salary,
      currency: offer.currency,
      benefits: offer.benefits,
      start_date: offer.startDate,
      expiry_date: offer.expiryDate,
      notes: offer.notes
    }

    const { data, error } = await OffersDB.create(offerInsert)
    if (error) throw new Error(`Failed to create offer: ${error.message}`)
    if (!data) throw new Error('Failed to create offer')
    return transformOffer(data)
  },

  async update(id: string, offer: Partial<Offer>): Promise<Offer> {
    const { data, error } = await OffersDB.updateStatus(id, offer.status as any)
    if (error) throw new Error(`Failed to update offer: ${error.message}`)
    if (!data) throw new Error('Offer not found')
    return transformOffer(data)
  }
}

/**
 * Onboarding API - Mock Implementation (extend as needed)
 */
export const onboardingAPI = {
  async getNewHires(): Promise<any[]> {
    // This would be implemented with a real onboarding table
    return []
  },

  async updateTask(taskId: string, status: string): Promise<any> {
    // This would be implemented with a real tasks table
    return { id: taskId, status }
  }
}

/**
 * Analytics API - Mock Implementation (extend as needed)
 */
export const analyticsAPI = {
  async getDashboardMetrics(): Promise<any> {
    // This would aggregate data from multiple tables
    return {
      openPositions: 12,
      activeCandidates: 48,
      interviewsScheduled: 15,
      offersExtended: 6,
      newHires: 3,
      timeToHire: 21,
      candidateSourceBreakdown: {
        linkedin: 25,
        direct: 15,
        referral: 8,
        'job-board': 12
      },
      pipelineMetrics: {
        screening: 20,
        interviewing: 15,
        offer: 8,
        hired: 5
      }
    }
  },

  async getTimeToHireData(): Promise<any> {
    return []
  },

  async getCandidateSourceData(): Promise<any> {
    return []
  }
}