export interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  position: string
  experience: number
  skills: string[]
  stage: 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected'
  aiScore: number // 1-5 stars
  appliedDate: string
  resumeUrl?: string
  notes?: string
  interviews?: string[] // Interview IDs
  status: 'active' | 'rejected' | 'hired'
  source: 'direct' | 'linkedin' | 'referral' | 'job-board'
  jobId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCandidateRequest {
  name: string
  email: string
  phone?: string
  position: string
  experience: number
  skills: string[]
  source: 'direct' | 'linkedin' | 'referral' | 'job-board'
  jobId?: string
  resumeUrl?: string
}

export interface UpdateCandidateRequest extends Partial<CreateCandidateRequest> {
  stage?: 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected'
  status?: 'active' | 'rejected' | 'hired'
  notes?: string
  aiScore?: number
}