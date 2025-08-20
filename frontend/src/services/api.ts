/**
 * DEPRECATED: Mock API Service
 * 
 * This file has been replaced by the Supabase API implementation.
 * Please use the new API service instead:
 * 
 * import { jobsAPI, candidatesAPI } from './supabaseApi'
 * 
 * This file is kept for reference and backward compatibility.
 */

// Re-export from the new Supabase API service
export {
  jobsAPI,
  candidatesAPI,
  interviewsAPI,
  offersAPI,
  onboardingAPI,
  analyticsAPI
} from './supabaseApi'

import { Job, Candidate, Interview, Offer, NewHire, OnboardingTask, DashboardMetrics } from '../types'