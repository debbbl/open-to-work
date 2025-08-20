export interface Job {
  id: string
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract'
  status: 'active' | 'paused' | 'closed'
  description: string
  requirements: string[]
  skills: string[]
  experienceLevel: 'entry' | 'mid' | 'senior'
  salary: {
    min: number
    max: number
    currency: string
  }
  createdDate: string
  applicants: number
}

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
  interviews?: Interview[]
  status: 'active' | 'rejected' | 'hired'
  source: 'direct' | 'linkedin' | 'referral' | 'job-board'
}

export interface Interview {
  id: string
  candidateId: string
  jobId: string
  type: 'phone' | 'video' | 'in-person' | 'technical'
  scheduledDate: string
  duration: number // minutes
  interviewer: string
  status: 'scheduled' | 'completed' | 'cancelled'
  feedback?: string
  rating?: number // 1-5
  notes?: string
}

export interface Offer {
  id: string
  candidateId: string
  jobId: string
  salary: number
  currency: string
  benefits: string[]
  startDate: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdDate: string
  expiryDate: string
  notes?: string
}

export interface OnboardingTask {
  id: string
  title: string
  description: string
  category: 'documentation' | 'setup' | 'training' | 'meeting'
  status: 'pending' | 'in-progress' | 'completed'
  dueDate?: string
  assignee?: string
  points: number // gamification points
}

export interface NewHire {
  id: string
  candidateId: string
  name: string
  position: string
  department: string
  startDate: string
  buddy?: string
  manager: string
  status: 'pre-boarding' | 'onboarding' | 'completed'
  progress: number // 0-100 percentage
  tasks: OnboardingTask[]
}

export interface DashboardMetrics {
  openPositions: number
  activeCandidates: number
  interviewsScheduled: number
  offersExtended: number
  newHires: number
  timeToHire: number // average days
  candidateSourceBreakdown: Record<string, number>
  pipelineMetrics: Record<string, number>
}