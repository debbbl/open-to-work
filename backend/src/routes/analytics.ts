import { Router, Request, Response } from 'express'

const router = Router()

// GET /api/analytics/dashboard - Get dashboard metrics
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // Mock dashboard metrics
    const metrics = {
      openPositions: 12,
      activeCandidates: 48,
      interviewsScheduled: 15,
      offersExtended: 6,
      newHires: 3,
      timeToHire: 21,
      candidateSourceBreakdown: {
        linkedin: 25,
        direct: 15,
        referral: 8,
        'job-board': 12
      },
      pipelineMetrics: {
        screening: 20,
        interviewing: 15,
        offer: 8,
        hired: 5
      }
    }
    
    res.json(metrics)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' })
  }
})

// GET /api/analytics/time-to-hire - Get time to hire data
router.get('/time-to-hire', async (req: Request, res: Response) => {
  try {
    const { timeRange = '30' } = req.query
    
    // Mock time to hire data based on time range
    const data = [
      { period: 'Week 1', engineering: 18, product: 22, design: 16, data: 28 },
      { period: 'Week 2', engineering: 22, product: 19, design: 21, data: 25 },
      { period: 'Week 3', engineering: 16, product: 25, design: 18, data: 32 },
      { period: 'Week 4', engineering: 20, product: 18, design: 14, data: 22 }
    ]
    
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch time to hire data' })
  }
})

// GET /api/analytics/candidate-sources - Get candidate source data
router.get('/candidate-sources', async (req: Request, res: Response) => {
  try {
    const sourceData = [
      { name: 'LinkedIn', value: 45, count: 112 },
      { name: 'Direct Apply', value: 25, count: 62 },
      { name: 'Referrals', value: 20, count: 50 },
      { name: 'Job Boards', value: 10, count: 25 }
    ]
    
    res.json(sourceData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidate source data' })
  }
})

// GET /api/analytics/department-performance - Get department hiring performance
router.get('/department-performance', async (req: Request, res: Response) => {
  try {
    const departmentData = [
      { department: 'Engineering', target: 20, actual: 18, budget: 95000 },
      { department: 'Product', target: 8, actual: 6, budget: 110000 },
      { department: 'Design', target: 5, actual: 4, budget: 85000 },
      { department: 'Data', target: 6, actual: 5, budget: 120000 },
      { department: 'Sales', target: 15, actual: 12, budget: 75000 }
    ]
    
    res.json(departmentData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch department performance data' })
  }
})

// GET /api/analytics/conversion-funnel - Get hiring funnel data
router.get('/conversion-funnel', async (req: Request, res: Response) => {
  try {
    const funnelData = [
      { stage: 'Applications', count: 1200, percentage: 100 },
      { stage: 'Screening', count: 480, percentage: 40 },
      { stage: 'Interviews', count: 240, percentage: 20 },
      { stage: 'Offers', count: 72, percentage: 6 },
      { stage: 'Hired', count: 48, percentage: 4 }
    ]
    
    res.json(funnelData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversion funnel data' })
  }
})

// GET /api/analytics/ai-insights - Get AI-powered insights
router.get('/ai-insights', async (req: Request, res: Response) => {
  try {
    const insights = [
      {
        type: 'screening',
        title: 'Screening Efficiency',
        description: 'Your AI screening is filtering out 60% of unqualified candidates, saving approximately 24 hours per week in manual review time.',
        impact: 'positive',
        metric: '60%'
      },
      {
        type: 'optimization',
        title: 'Source Optimization',
        description: 'Consider increasing LinkedIn sourcing for Engineering roles - they show 23% higher offer acceptance rates compared to other sources.',
        impact: 'positive',
        metric: '23%'
      },
      {
        type: 'trend',
        title: 'Interview Completion',
        description: 'Interview completion rates have decreased by 12% this month. Consider optimizing scheduling process.',
        impact: 'negative',
        metric: '12%'
      }
    ]
    
    res.json(insights)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI insights' })
  }
})

// POST /api/analytics/export - Export analytics data
router.post('/export', async (req: Request, res: Response) => {
  try {
    const { type, timeRange } = req.body
    
    // In a real implementation, this would generate and return a file
    // For now, we'll return a mock response
    const exportData = {
      exportId: `export_${Date.now()}`,
      type,
      timeRange,
      status: 'processing',
      downloadUrl: null,
      createdAt: new Date().toISOString()
    }
    
    // Simulate processing delay
    setTimeout(() => {
      exportData.status = 'completed'
      exportData.downloadUrl = `https://example.com/exports/${exportData.exportId}.csv`
    }, 3000)
    
    res.json(exportData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate export' })
  }
})

export default router