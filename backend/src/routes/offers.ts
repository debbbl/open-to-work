import { Router, Request, Response } from 'express'
import { Offer, CreateOfferRequest, UpdateOfferRequest } from '../models/Offer'
import { generateId } from '../utils/helpers'
import axios from 'axios'

const router = Router()

// Configuration for Python AI service
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// Mock data
let offers: Offer[] = [
  {
    id: '1',
    candidateId: '1',
    jobId: '1',
    salary: 120000,
    currency: 'USD',
    benefits: ['Health Insurance', '401k Match', 'Flexible PTO', 'Remote Work'],
    startDate: '2024-02-15',
    status: 'pending',
    createdDate: '2024-01-15',
    expiryDate: '2024-01-29',
    notes: 'Competitive offer with full benefits package'
  },
  {
    id: '2',
    candidateId: '2',
    jobId: '2',
    salary: 110000,
    currency: 'USD',
    benefits: ['Health Insurance', 'Stock Options', 'Learning Budget'],
    startDate: '2024-02-01',
    status: 'accepted',
    createdDate: '2024-01-10',
    expiryDate: '2024-01-24',
    acceptedDate: '2024-01-12'
  }
]

// GET /api/offers - Get all offers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { candidateId, status, jobId } = req.query
    
    let filteredOffers = offers
    
    if (candidateId) {
      filteredOffers = filteredOffers.filter(offer => 
        offer.candidateId === candidateId
      )
    }
    
    if (status) {
      filteredOffers = filteredOffers.filter(offer => 
        offer.status === status
      )
    }
    
    if (jobId) {
      filteredOffers = filteredOffers.filter(offer => 
        offer.jobId === jobId
      )
    }
    
    res.json(filteredOffers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offers' })
  }
})

// GET /api/offers/:id - Get offer by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const offer = offers.find(offer => offer.id === req.params.id)
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' })
    }
    
    res.json(offer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offer' })
  }
})

// POST /api/offers - Create new offer
router.post('/', async (req: Request, res: Response) => {
  try {
    const offerData: CreateOfferRequest = req.body
    
    // Basic validation
    if (!offerData.candidateId || !offerData.salary || !offerData.startDate) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const newOffer: Offer = {
      id: generateId(),
      ...offerData,
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: 'system',
      updatedAt: new Date().toISOString()
    }
    
    offers.unshift(newOffer)
    res.status(201).json(newOffer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create offer' })
  }
})

// PUT /api/offers/:id - Update offer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updateData: UpdateOfferRequest = req.body
    const offerIndex = offers.findIndex(offer => offer.id === req.params.id)
    
    if (offerIndex === -1) {
      return res.status(404).json({ error: 'Offer not found' })
    }
    
    const updatedOffer = {
      ...offers[offerIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    // Track acceptance/decline dates
    if (updateData.status === 'accepted' && !offers[offerIndex].acceptedDate) {
      updatedOffer.acceptedDate = new Date().toISOString().split('T')[0]
    }
    if (updateData.status === 'declined' && !offers[offerIndex].declinedDate) {
      updatedOffer.declinedDate = new Date().toISOString().split('T')[0]
    }
    
    offers[offerIndex] = updatedOffer
    res.json(updatedOffer)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update offer' })
  }
})

// POST /api/offers/:id/accept - Accept offer
router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const offerIndex = offers.findIndex(offer => offer.id === req.params.id)
    
    if (offerIndex === -1) {
      return res.status(404).json({ error: 'Offer not found' })
    }
    
    if (offers[offerIndex].status !== 'pending') {
      return res.status(400).json({ error: 'Offer is not pending' })
    }
    
    offers[offerIndex].status = 'accepted'
    offers[offerIndex].acceptedDate = new Date().toISOString().split('T')[0]
    offers[offerIndex].updatedAt = new Date().toISOString()
    
    res.json(offers[offerIndex])
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept offer' })
  }
})

// POST /api/offers/:id/decline - Decline offer
router.post('/:id/decline', async (req: Request, res: Response) => {
  try {
    const offerIndex = offers.findIndex(offer => offer.id === req.params.id)
    
    if (offerIndex === -1) {
      return res.status(404).json({ error: 'Offer not found' })
    }
    
    if (offers[offerIndex].status !== 'pending') {
      return res.status(400).json({ error: 'Offer is not pending' })
    }
    
    offers[offerIndex].status = 'declined'
    offers[offerIndex].declinedDate = new Date().toISOString().split('T')[0]
    offers[offerIndex].updatedAt = new Date().toISOString()
    
    res.json(offers[offerIndex])
  } catch (error) {
    res.status(500).json({ error: 'Failed to decline offer' })
  }
})

// GET /api/offers/stats - Get offer statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = {
      total: offers.length,
      pending: offers.filter(o => o.status === 'pending').length,
      accepted: offers.filter(o => o.status === 'accepted').length,
      declined: offers.filter(o => o.status === 'declined').length,
      expired: offers.filter(o => o.status === 'expired').length,
      acceptanceRate: offers.length > 0 
        ? Math.round((offers.filter(o => o.status === 'accepted').length / offers.length) * 100)
        : 0
    }
    
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offer statistics' })
  }
})

// AI-powered offer letter generation
router.post('/ai/generate-letter', async (req: Request, res: Response) => {
  try {
    const { candidate_info, position_details, compensation, company_info } = req.body

    if (!candidate_info || !position_details || !compensation) {
      return res.status(400).json({ error: 'Candidate info, position details, and compensation are required' })
    }

    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/offer-letter`, {
      candidate_info,
      position_details,
      compensation,
      company_info: company_info || { name: 'TechCorp Inc.' }
    })

    res.json({
      ...response.data,
      generated_at: new Date().toISOString(),
      candidate: candidate_info.name,
      position: position_details.title
    })
  } catch (error: any) {
    console.error('Error generating offer letter:', error.message)
    // Fallback to mock offer letter
    const mockOffer = getMockOfferLetter(req.body.candidate_info, req.body.position_details, req.body.compensation)
    res.json({
      ...mockOffer,
      fallback: true
    })
  }
})

// AI-powered compensation market analysis
router.post('/ai/market-analysis', async (req: Request, res: Response) => {
  try {
    const { job_title, location, experience_level, company_size } = req.body

    if (!job_title || !location) {
      return res.status(400).json({ error: 'Job title and location are required' })
    }

    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/market-analysis`, {
      job_title,
      location,
      experience_level: experience_level || 'mid-level',
      company_size: company_size || 'Mid-size (51-500)'
    })

    res.json({
      ...response.data,
      analyzed_at: new Date().toISOString(),
      job_title,
      location
    })
  } catch (error: any) {
    console.error('Error analyzing compensation market:', error.message)
    // Fallback to mock market data
    const mockData = getMockMarketData(req.body.job_title, req.body.location)
    res.json({
      ...mockData,
      fallback: true
    })
  }
})

// Get offer letter templates
router.get('/ai/templates', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/ai/offer-templates`)
    res.json(response.data)
  } catch (error) {
    // Fallback templates
    res.json({
      templates: [
        { id: 'standard', name: 'Standard Offer', description: 'General offer letter template' },
        { id: 'senior', name: 'Senior Role', description: 'Template for senior positions with leadership' },
        { id: 'remote', name: 'Remote Position', description: 'Template for remote work arrangements' },
        { id: 'equity_heavy', name: 'Equity Heavy', description: 'Template emphasizing stock options' }
      ]
    })
  }
})

// Generate personalized compensation recommendations
router.post('/ai/compensation-recommendations', async (req: Request, res: Response) => {
  try {
    const { candidate_profile, market_data, budget_constraints } = req.body

    // This is a custom endpoint that combines market analysis with candidate specifics
    const recommendations = generateCompensationRecommendations(
      candidate_profile,
      market_data,
      budget_constraints
    )

    res.json({
      recommendations,
      generated_at: new Date().toISOString(),
      confidence_score: 0.85
    })
  } catch (error: any) {
    console.error('Error generating compensation recommendations:', error.message)
    res.status(500).json({ error: 'Failed to generate recommendations' })
  }
})

// Helper functions for mock data
function getMockOfferLetter(candidate_info: any, position_details: any, compensation: any) {
  const candidateName = candidate_info?.name || 'Candidate Name'
  const position = position_details?.title || 'Software Engineer'
  const salary = compensation?.base_salary || 120000
  const startDate = position_details?.start_date || '2024-03-01'

  return {
    content: `Dear ${candidateName},

We are pleased to offer you the position of ${position} with TechCorp Inc.

POSITION DETAILS:
• Title: ${position}
• Department: ${position_details?.department || 'Engineering'}
• Start Date: ${startDate}
• Location: ${position_details?.location || 'San Francisco, CA'}
• Reports To: ${position_details?.reports_to || 'Engineering Manager'}

COMPENSATION PACKAGE:
• Annual Base Salary: $${salary.toLocaleString()}
• Stock Options: ${compensation?.equity_shares || 1000} shares
• Signing Bonus: $${(compensation?.signing_bonus || 5000).toLocaleString()}
• Annual Performance Bonus: Up to ${compensation?.bonus_percentage || 10}%

BENEFITS:
• Comprehensive health, dental, and vision insurance
• 401(k) retirement plan with company matching
• Flexible PTO policy
• $3,000 annual learning and development budget
• Flexible work arrangements

This offer is contingent upon successful completion of background checks and is valid until ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}.

We are excited about the possibility of you joining our team and look forward to your response.

Sincerely,
The TechCorp Hiring Team`,
    generated_at: new Date().toISOString(),
    status: 'generated',
    format: 'full_letter'
  }
}

function getMockMarketData(job_title: string, location: string) {
  let baseSalary = 125000

  // Adjust based on job title
  if (job_title.toLowerCase().includes('senior')) {
    baseSalary *= 1.3
  } else if (job_title.toLowerCase().includes('junior') || job_title.toLowerCase().includes('entry')) {
    baseSalary *= 0.7
  } else if (job_title.toLowerCase().includes('principal') || job_title.toLowerCase().includes('staff')) {
    baseSalary *= 1.6
  }

  // Adjust based on location
  if (location.toLowerCase().includes('san francisco') || location.toLowerCase().includes('bay area')) {
    baseSalary *= 1.4
  } else if (location.toLowerCase().includes('new york')) {
    baseSalary *= 1.3
  } else if (location.toLowerCase().includes('seattle')) {
    baseSalary *= 1.2
  } else if (location.toLowerCase().includes('remote')) {
    baseSalary *= 1.1
  } else if (location.toLowerCase().includes('austin') || location.toLowerCase().includes('denver')) {
    baseSalary *= 1.05
  }

  return {
    market_average: { min: Math.round(baseSalary * 0.85), max: Math.round(baseSalary * 1.15) },
    competitive_range: { min: Math.round(baseSalary * 0.9), max: Math.round(baseSalary * 1.25) },
    top_tier: { min: Math.round(baseSalary * 1.15), max: Math.round(baseSalary * 1.45) },
    total_comp: { min: Math.round(baseSalary * 1.1), max: Math.round(baseSalary * 1.6) },
    equity_range: { min: 15000, max: 45000 },
    trends: [
      `${job_title} salaries trending up 8% this year`,
      `${location} market showing strong demand`,
      'Remote flexibility increasingly important'
    ],
    recommendations: [
      'Offer within competitive range to ensure acceptance',
      'Consider equity package for total compensation appeal',
      'Highlight growth opportunities and learning budget'
    ],
    benefits_insights: [
      'Health insurance is table stakes',
      'Flexible PTO policies are increasingly expected',
      'Learning and development budget highly valued'
    ]
  }
}

function generateCompensationRecommendations(candidate_profile: any, market_data: any, budget_constraints: any) {
  const experience = candidate_profile?.experience || 3
  const skills = candidate_profile?.skills || []
  const maxBudget = budget_constraints?.max_salary || 150000

  const baseRecommendation = market_data?.competitive_range?.min || 100000
  let adjustedSalary = baseRecommendation

  // Adjust based on experience
  if (experience > 7) {
    adjustedSalary *= 1.2
  } else if (experience > 5) {
    adjustedSalary *= 1.1
  } else if (experience < 2) {
    adjustedSalary *= 0.9
  }

  // Adjust based on high-demand skills
  const demandSkills = ['react', 'typescript', 'python', 'aws', 'kubernetes', 'machine learning']
  const matchingSkills = skills.filter((skill: string) => 
    demandSkills.some(demand => skill.toLowerCase().includes(demand))
  )
  
  if (matchingSkills.length > 3) {
    adjustedSalary *= 1.1
  }

  // Cap at budget
  const finalSalary = Math.min(adjustedSalary, maxBudget)

  return {
    recommended_salary: Math.round(finalSalary),
    salary_breakdown: {
      base_market: baseRecommendation,
      experience_adjustment: Math.round((adjustedSalary - baseRecommendation)),
      final_recommendation: Math.round(finalSalary)
    },
    equity_recommendation: {
      shares: Math.round(experience * 500 + matchingSkills.length * 200),
      reasoning: 'Based on experience level and high-demand skills'
    },
    benefits_priority: [
      'Health insurance (must-have)',
      'Flexible PTO (highly valued)',
      'Learning budget (differentiator)',
      'Stock options (long-term incentive)'
    ],
    acceptance_probability: Math.min(0.95, 0.6 + (finalSalary / (market_data?.competitive_range?.max || 130000)) * 0.35),
    negotiation_buffer: Math.round(finalSalary * 0.05)
  }
}

export default router