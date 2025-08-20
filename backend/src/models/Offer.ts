export interface Offer {
  id: string
  candidateId: string
  jobId: string
  salary: number
  currency: string
  benefits: string[]
  startDate: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdDate: string
  expiryDate: string
  notes?: string
  acceptedDate?: string
  declinedDate?: string
  createdBy?: string
  updatedAt?: string
}

export interface CreateOfferRequest {
  candidateId: string
  jobId: string
  salary: number
  currency: string
  benefits: string[]
  startDate: string
  expiryDate: string
  notes?: string
}

export interface UpdateOfferRequest extends Partial<CreateOfferRequest> {
  status?: 'pending' | 'accepted' | 'declined' | 'expired'
}