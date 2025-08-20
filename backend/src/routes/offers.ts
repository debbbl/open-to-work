import { Router, Request, Response } from 'express'
import { Offer, CreateOfferRequest, UpdateOfferRequest } from '../models/Offer'
import { generateId } from '../utils/helpers'

const router = Router()

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

export default router