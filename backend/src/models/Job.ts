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
  createdBy?: string
  updatedAt?: string
}

export interface CreateJobRequest {
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract'
  description: string
  requirements: string[]
  skills: string[]
  experienceLevel: 'entry' | 'mid' | 'senior'
  salary: {
    min: number
    max: number
    currency: string
  }
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: 'active' | 'paused' | 'closed'
}