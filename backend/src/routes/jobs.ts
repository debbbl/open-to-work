import { Router, Request, Response } from 'express'
import JobService from '../services/JobService'
import { CreateJobRequest, UpdateJobRequest } from '../models/Job'

const router = Router()

// GET /api/jobs - Get all jobs
router.get('/', async (req: Request, res: Response) => {
  try {
    const { department, status } = req.query
    
    let jobs = await JobService.getAllJobs()
    
    if (department) {
      jobs = jobs.filter(job => job.department.toLowerCase() === (department as string).toLowerCase())
    }
    
    if (status) {
      jobs = jobs.filter(job => job.status === status)
    }
    
    res.json(jobs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' })
  }
})

// GET /api/jobs/:id - Get job by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const job = await JobService.getJobById(req.params.id)
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    res.json(job)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' })
  }
})

// POST /api/jobs - Create new job
router.post('/', async (req: Request, res: Response) => {
  try {
    const jobData: CreateJobRequest = req.body
    
    // Basic validation
    if (!jobData.title || !jobData.department || !jobData.location) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const newJob = await JobService.createJob(jobData)
    res.status(201).json(newJob)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' })
  }
})

// PUT /api/jobs/:id - Update job
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updateData: UpdateJobRequest = req.body
    const updatedJob = await JobService.updateJob(req.params.id, updateData)
    
    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    res.json(updatedJob)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job' })
  }
})

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await JobService.deleteJob(req.params.id)
    
    if (!deleted) {
      return res.status(404).json({ error: 'Job not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job' })
  }
})

// GET /api/jobs/active - Get active jobs
router.get('/status/active', async (req: Request, res: Response) => {
  try {
    const activeJobs = await JobService.getActiveJobs()
    res.json(activeJobs)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active jobs' })
  }
})

export default router