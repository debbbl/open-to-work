import { Router, Request, Response } from 'express'
import { Interview, CreateInterviewRequest, UpdateInterviewRequest } from '../models/Interview'
import { generateId } from '../utils/helpers'

const router = Router()

// Mock data
let interviews: Interview[] = [
  {
    id: '1',
    candidateId: '1',
    jobId: '1',
    type: 'video',
    scheduledDate: '2024-01-20T10:00:00',
    duration: 60,
    interviewer: 'John Manager',
    status: 'scheduled'
  },
  {
    id: '2',
    candidateId: '2',
    jobId: '2',
    type: 'phone',
    scheduledDate: '2024-01-18T14:00:00',
    duration: 45,
    interviewer: 'Sarah Lead',
    status: 'completed',
    rating: 4,
    feedback: 'Strong technical skills, good cultural fit'
  }
]

// GET /api/interviews - Get all interviews
router.get('/', async (req: Request, res: Response) => {
  try {
    const { candidateId, status, date } = req.query
    
    let filteredInterviews = interviews
    
    if (candidateId) {
      filteredInterviews = filteredInterviews.filter(interview => 
        interview.candidateId === candidateId
      )
    }
    
    if (status) {
      filteredInterviews = filteredInterviews.filter(interview => 
        interview.status === status
      )
    }
    
    if (date) {
      const targetDate = new Date(date as string).toDateString()
      filteredInterviews = filteredInterviews.filter(interview => 
        new Date(interview.scheduledDate).toDateString() === targetDate
      )
    }
    
    res.json(filteredInterviews)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interviews' })
  }
})

// GET /api/interviews/:id - Get interview by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const interview = interviews.find(interview => interview.id === req.params.id)
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' })
    }
    
    res.json(interview)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interview' })
  }
})

// POST /api/interviews - Create new interview
router.post('/', async (req: Request, res: Response) => {
  try {
    const interviewData: CreateInterviewRequest = req.body
    
    // Basic validation
    if (!interviewData.candidateId || !interviewData.scheduledDate || !interviewData.interviewer) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const newInterview: Interview = {
      id: generateId(),
      ...interviewData,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    interviews.unshift(newInterview)
    res.status(201).json(newInterview)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create interview' })
  }
})

// PUT /api/interviews/:id - Update interview
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updateData: UpdateInterviewRequest = req.body
    const interviewIndex = interviews.findIndex(interview => interview.id === req.params.id)
    
    if (interviewIndex === -1) {
      return res.status(404).json({ error: 'Interview not found' })
    }
    
    const updatedInterview = {
      ...interviews[interviewIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    interviews[interviewIndex] = updatedInterview
    res.json(updatedInterview)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update interview' })
  }
})

// DELETE /api/interviews/:id - Cancel interview
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const interviewIndex = interviews.findIndex(interview => interview.id === req.params.id)
    
    if (interviewIndex === -1) {
      return res.status(404).json({ error: 'Interview not found' })
    }
    
    // Mark as cancelled instead of deleting
    interviews[interviewIndex].status = 'cancelled'
    interviews[interviewIndex].updatedAt = new Date().toISOString()
    
    res.json({ message: 'Interview cancelled successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel interview' })
  }
})

// GET /api/interviews/upcoming - Get upcoming interviews
router.get('/status/upcoming', async (req: Request, res: Response) => {
  try {
    const now = new Date()
    const upcomingInterviews = interviews.filter(interview => 
      interview.status === 'scheduled' && new Date(interview.scheduledDate) > now
    )
    
    res.json(upcomingInterviews)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming interviews' })
  }
})

export default router