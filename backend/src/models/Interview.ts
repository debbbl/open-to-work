export interface Interview {
  id: string
  candidateId: string
  jobId: string
  type: 'phone' | 'video' | 'in-person' | 'technical'
  scheduledDate: string
  duration: number // minutes
  interviewer: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  feedback?: string
  rating?: number // 1-5
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateInterviewRequest {
  candidateId: string
  jobId: string
  type: 'phone' | 'video' | 'in-person' | 'technical'
  scheduledDate: string
  duration: number
  interviewer: string
}

export interface UpdateInterviewRequest extends Partial<CreateInterviewRequest> {
  status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  feedback?: string
  rating?: number
  notes?: string
}