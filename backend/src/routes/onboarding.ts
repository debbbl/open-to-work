import { Router, Request, Response } from 'express'
import { generateId } from '../utils/helpers'

const router = Router()

// Mock data for new hires
const newHires = [
  {
    id: '1',
    candidateId: '1',
    name: 'John Smith',
    position: 'Senior Frontend Developer',
    department: 'Engineering',
    startDate: '2024-01-15',
    buddy: 'Sarah Tech Lead',
    manager: 'Mike Manager',
    status: 'onboarding',
    progress: 65,
    tasks: [
      {
        id: '1',
        title: 'Complete IT Setup',
        description: 'Set up your laptop and development environment',
        category: 'setup',
        status: 'completed',
        points: 50
      },
      {
        id: '2',
        title: 'Review Company Handbook',
        description: 'Read through company policies and procedures',
        category: 'documentation',
        status: 'completed',
        points: 30
      },
      {
        id: '3',
        title: 'First Team Meeting',
        description: 'Meet with your immediate team members',
        category: 'meeting',
        status: 'in-progress',
        dueDate: '2024-01-18',
        points: 40
      }
    ]
  },
  {
    id: '2',
    candidateId: '2',
    name: 'Sarah Wilson',
    position: 'Product Manager',
    department: 'Product',
    startDate: '2024-01-12',
    buddy: 'Emily Product Lead',
    manager: 'David Director',
    status: 'onboarding',
    progress: 45,
    tasks: [
      {
        id: '5',
        title: 'Product Strategy Overview',
        description: 'Learn about current product roadmap and strategy',
        category: 'training',
        status: 'completed',
        points: 75
      },
      {
        id: '6',
        title: 'Stakeholder Introductions',
        description: 'Meet key stakeholders across departments',
        category: 'meeting',
        status: 'in-progress',
        dueDate: '2024-01-19',
        points: 60
      }
    ]
  }
]

// GET /api/onboarding/new-hires - Get all new hires
router.get('/new-hires', async (req: Request, res: Response) => {
  try {
    const { status, department } = req.query
    
    let filteredHires = newHires
    
    if (status) {
      filteredHires = filteredHires.filter(hire => hire.status === status)
    }
    
    if (department) {
      filteredHires = filteredHires.filter(hire => 
        hire.department.toLowerCase() === (department as string).toLowerCase()
      )
    }
    
    res.json(filteredHires)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch new hires' })
  }
})

// GET /api/onboarding/new-hires/:id - Get new hire by ID
router.get('/new-hires/:id', async (req: Request, res: Response) => {
  try {
    const hire = newHires.find(hire => hire.id === req.params.id)
    
    if (!hire) {
      return res.status(404).json({ error: 'New hire not found' })
    }
    
    res.json(hire)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch new hire' })
  }
})

// PUT /api/onboarding/tasks/:taskId - Update task status
router.put('/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    const taskId = req.params.taskId
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }
    
    // Find the hire and task
    let foundTask = null
    let foundHire = null
    
    for (const hire of newHires) {
      const task = hire.tasks.find(t => t.id === taskId)
      if (task) {
        task.status = status
        foundTask = task
        foundHire = hire
        
        // Recalculate progress
        const completedTasks = hire.tasks.filter(t => t.status === 'completed').length
        hire.progress = Math.round((completedTasks / hire.tasks.length) * 100)
        
        break
      }
    }
    
    if (!foundTask) {
      return res.status(404).json({ error: 'Task not found' })
    }
    
    res.json(foundTask)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' })
  }
})

// POST /api/onboarding/new-hires - Create new hire onboarding
router.post('/new-hires', async (req: Request, res: Response) => {
  try {
    const { candidateId, name, position, department, startDate, manager } = req.body
    
    if (!candidateId || !name || !position || !department || !startDate) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    // Create default onboarding tasks
    const defaultTasks = [
      {
        id: generateId(),
        title: 'Complete IT Setup',
        description: 'Set up your laptop and development environment',
        category: 'setup',
        status: 'pending',
        points: 50
      },
      {
        id: generateId(),
        title: 'Review Company Handbook',
        description: 'Read through company policies and procedures',
        category: 'documentation',
        status: 'pending',
        points: 30
      },
      {
        id: generateId(),
        title: 'First Team Meeting',
        description: 'Meet with your immediate team members',
        category: 'meeting',
        status: 'pending',
        points: 40
      }
    ]
    
    const newHire = {
      id: generateId(),
      candidateId,
      name,
      position,
      department,
      startDate,
      manager,
      status: 'pre-boarding',
      progress: 0,
      tasks: defaultTasks
    }
    
    newHires.push(newHire)
    res.status(201).json(newHire)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create new hire onboarding' })
  }
})

// GET /api/onboarding/stats - Get onboarding statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = {
      total: newHires.length,
      preBoarding: newHires.filter(h => h.status === 'pre-boarding').length,
      onboarding: newHires.filter(h => h.status === 'onboarding').length,
      completed: newHires.filter(h => h.status === 'completed').length,
      averageProgress: newHires.length > 0 
        ? Math.round(newHires.reduce((sum, hire) => sum + hire.progress, 0) / newHires.length)
        : 0,
      totalPoints: newHires.reduce((sum, hire) => {
        return sum + hire.tasks.filter(t => t.status === 'completed').reduce((taskSum, task) => taskSum + task.points, 0)
      }, 0)
    }
    
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch onboarding statistics' })
  }
})

export default router