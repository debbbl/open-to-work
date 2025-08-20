import { Router, Request, Response } from 'express'
import CandidateService from '../services/CandidateService'
import { CreateCandidateRequest, UpdateCandidateRequest } from '../models/Candidate'

const router = Router()

// GET /api/candidates - Get all candidates
router.get('/', async (req: Request, res: Response) => {
  try {
    const { stage, jobId, search } = req.query
    
    let candidates = await CandidateService.getAllCandidates()
    
    if (stage) {
      candidates = await CandidateService.getCandidatesByStage(stage as string)
    }
    
    if (jobId) {
      candidates = await CandidateService.getCandidatesByJob(jobId as string)
    }
    
    if (search) {
      candidates = await CandidateService.searchCandidates(search as string)
    }
    
    res.json(candidates)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates' })
  }
})

// GET /api/candidates/:id - Get candidate by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const candidate = await CandidateService.getCandidateById(req.params.id)
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' })
    }
    
    res.json(candidate)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidate' })
  }
})

// POST /api/candidates - Create new candidate
router.post('/', async (req: Request, res: Response) => {
  try {
    const candidateData: CreateCandidateRequest = req.body
    
    // Basic validation
    if (!candidateData.name || !candidateData.email || !candidateData.position) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const newCandidate = await CandidateService.createCandidate(candidateData)
    res.status(201).json(newCandidate)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create candidate' })
  }
})

// PUT /api/candidates/:id - Update candidate
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updateData: UpdateCandidateRequest = req.body
    const updatedCandidate = await CandidateService.updateCandidate(req.params.id, updateData)
    
    if (!updatedCandidate) {
      return res.status(404).json({ error: 'Candidate not found' })
    }
    
    res.json(updatedCandidate)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update candidate' })
  }
})

// PUT /api/candidates/:id/stage - Update candidate stage
router.put('/:id/stage', async (req: Request, res: Response) => {
  try {
    const { stage } = req.body
    
    if (!stage) {
      return res.status(400).json({ error: 'Stage is required' })
    }
    
    const updatedCandidate = await CandidateService.updateCandidateStage(req.params.id, stage)
    
    if (!updatedCandidate) {
      return res.status(404).json({ error: 'Candidate not found' })
    }
    
    res.json(updatedCandidate)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update candidate stage' })
  }
})

// POST /api/candidates/resume - Upload resume (placeholder)
router.post('/resume', async (req: Request, res: Response) => {
  try {
    // In a real implementation, this would handle file upload
    // For now, we'll just return a mock URL
    const mockResumeUrl = `https://example.com/resumes/${Date.now()}.pdf`
    
    res.json({ url: mockResumeUrl })
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload resume' })
  }
})

// GET /api/candidates/stage/:stage - Get candidates by stage
router.get('/stage/:stage', async (req: Request, res: Response) => {
  try {
    const candidates = await CandidateService.getCandidatesByStage(req.params.stage)
    res.json(candidates)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates by stage' })
  }
})

export default router