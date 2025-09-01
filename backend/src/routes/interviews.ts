import { Router, Request, Response } from 'express'
import { Interview, CreateInterviewRequest, UpdateInterviewRequest } from '../models/Interview'
import { generateId } from '../utils/helpers'
import axios from 'axios'

const router = Router()

// Configuration for Python AI service
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

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

// AI-powered interview question generation
router.post('/ai/questions', async (req: Request, res: Response) => {
  try {
    const { candidate_profile, interview_type = 'technical', difficulty_level = 'mid-level', num_questions = 5 } = req.body
    
    if (!candidate_profile) {
      return res.status(400).json({ error: 'Candidate profile is required' })
    }

    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/interview-questions`, {
      candidate_profile,
      interview_type,
      difficulty_level,
      num_questions
    })

    res.json({
      questions: response.data,
      generated_at: new Date().toISOString(),
      candidate: candidate_profile.name,
      type: interview_type
    })
  } catch (error: any) {
    console.error('Error generating interview questions:', error.message)
    // Fallback to mock questions
    const mockQuestions = getMockQuestions(req.body.interview_type || 'technical', req.body.num_questions || 5)
    res.json({
      questions: mockQuestions,
      generated_at: new Date().toISOString(),
      candidate: req.body.candidate_profile?.name || 'Unknown',
      type: req.body.interview_type || 'technical',
      fallback: true
    })
  }
})

// Get available question categories and difficulty levels
router.get('/ai/categories', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/ai/question-categories`)
    res.json(response.data)
  } catch (error) {
    // Fallback categories
    res.json({
      categories: [
        { id: 'technical', name: 'Technical', description: 'Coding and technical problem solving' },
        { id: 'behavioral', name: 'Behavioral', description: 'Past experiences and STAR method questions' },
        { id: 'system_design', name: 'System Design', description: 'Architecture and scalability questions' },
        { id: 'cultural_fit', name: 'Cultural Fit', description: 'Values, teamwork, and company culture' }
      ],
      difficulty_levels: [
        { id: 'junior', name: 'Junior (1-2 years)', description: 'Entry level questions' },
        { id: 'mid-level', name: 'Mid-level (3-5 years)', description: 'Intermediate complexity' },
        { id: 'senior', name: 'Senior (5+ years)', description: 'Advanced and leadership questions' }
      ]
    })
  }
})

// AI service health check
router.get('/ai/health', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/ai/health`)
    res.json({ ...response.data, backend_status: 'connected' })
  } catch (error) {
    res.json({ 
      ai_service: 'offline', 
      backend_status: 'using_fallback',
      message: 'AI service unavailable, using mock data'
    })
  }
})

// Helper function for mock questions
function getMockQuestions(type: string, count: number) {
  const mockQuestions = {
    technical: [
      {
        category: 'Technical',
        question: 'Explain the difference between React hooks and class components',
        difficulty: 'Medium',
        follow_up: 'When would you choose one over the other?',
        evaluation_criteria: ['React knowledge', 'Understanding of modern patterns']
      },
      {
        category: 'Technical',
        question: 'How would you optimize a slow database query?',
        difficulty: 'Hard',
        follow_up: 'What tools would you use to identify the bottleneck?',
        evaluation_criteria: ['Database optimization', 'Problem-solving approach']
      },
      {
        category: 'Technical',
        question: 'Describe how you would implement authentication in a React application',
        difficulty: 'Medium',
        follow_up: 'How would you handle token refresh?',
        evaluation_criteria: ['Security understanding', 'Frontend architecture']
      },
      {
        category: 'Technical',
        question: 'What is the difference between REST and GraphQL?',
        difficulty: 'Easy',
        follow_up: 'When would you choose one over the other?',
        evaluation_criteria: ['API design knowledge', 'Architecture understanding']
      },
      {
        category: 'Technical',
        question: 'How would you handle state management in a large React application?',
        difficulty: 'Hard',
        follow_up: 'What are the pros and cons of different state management solutions?',
        evaluation_criteria: ['State management', 'Scalability thinking']
      }
    ],
    behavioral: [
      {
        category: 'Behavioral',
        question: 'Tell me about a time when you had to work with a difficult team member',
        difficulty: 'Medium',
        follow_up: 'What was the outcome and what did you learn?',
        evaluation_criteria: ['Communication skills', 'Conflict resolution']
      },
      {
        category: 'Behavioral',
        question: 'Describe a project where you had to learn a new technology quickly',
        difficulty: 'Medium',
        follow_up: 'How did you approach the learning process?',
        evaluation_criteria: ['Adaptability', 'Learning ability']
      },
      {
        category: 'Behavioral',
        question: 'Tell me about a time when you disagreed with your manager',
        difficulty: 'Hard',
        follow_up: 'How did you handle the situation?',
        evaluation_criteria: ['Professional communication', 'Conflict management']
      }
    ],
    system_design: [
      {
        category: 'System Design',
        question: 'Design a URL shortening service like bit.ly',
        difficulty: 'Hard',
        follow_up: 'How would you handle high traffic and ensure reliability?',
        evaluation_criteria: ['System architecture', 'Scalability design']
      },
      {
        category: 'System Design',
        question: 'How would you design a chat application for millions of users?',
        difficulty: 'Hard',
        follow_up: 'What technologies would you use for real-time messaging?',
        evaluation_criteria: ['Real-time systems', 'Scale considerations']
      }
    ],
    cultural_fit: [
      {
        category: 'Cultural Fit',
        question: 'What motivates you in your work?',
        difficulty: 'Easy',
        follow_up: 'How do you handle challenging situations?',
        evaluation_criteria: ['Self-awareness', 'Values alignment']
      },
      {
        category: 'Cultural Fit',
        question: 'How do you prefer to receive feedback?',
        difficulty: 'Easy',
        follow_up: 'Can you give an example of how you acted on feedback?',
        evaluation_criteria: ['Growth mindset', 'Coachability']
      }
    ]
  }

  const questions = mockQuestions[type as keyof typeof mockQuestions] || mockQuestions.technical
  return questions.slice(0, count)
}

export default router