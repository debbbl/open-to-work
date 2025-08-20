import { Candidate, CreateCandidateRequest, UpdateCandidateRequest } from '../models/Candidate'
import { generateId } from '../utils/helpers'

class CandidateService {
  private candidates: Candidate[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      position: 'Senior Frontend Developer',
      experience: 5,
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
      stage: 'screening',
      aiScore: 4,
      appliedDate: '2024-01-15',
      status: 'active',
      source: 'linkedin',
      jobId: '1'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      position: 'Product Manager',
      experience: 3,
      skills: ['Product Strategy', 'Agile', 'Analytics', 'Roadmapping'],
      stage: 'interviewing',
      aiScore: 5,
      appliedDate: '2024-01-12',
      status: 'active',
      source: 'direct',
      jobId: '2'
    }
  ]

  async getAllCandidates(): Promise<Candidate[]> {
    return this.candidates
  }

  async getCandidateById(id: string): Promise<Candidate | null> {
    return this.candidates.find(candidate => candidate.id === id) || null
  }

  async createCandidate(candidateData: CreateCandidateRequest): Promise<Candidate> {
    // Simulate AI scoring
    const aiScore = Math.floor(Math.random() * 5) + 1

    const newCandidate: Candidate = {
      id: generateId(),
      ...candidateData,
      stage: 'screening',
      aiScore,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.candidates.unshift(newCandidate)
    return newCandidate
  }

  async updateCandidate(id: string, updateData: UpdateCandidateRequest): Promise<Candidate | null> {
    const candidateIndex = this.candidates.findIndex(candidate => candidate.id === id)
    if (candidateIndex === -1) return null

    const updatedCandidate = {
      ...this.candidates[candidateIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    this.candidates[candidateIndex] = updatedCandidate
    return updatedCandidate
  }

  async updateCandidateStage(id: string, stage: string): Promise<Candidate | null> {
    const candidate = await this.getCandidateById(id)
    if (!candidate) return null

    return this.updateCandidate(id, { stage: stage as any })
  }

  async getCandidatesByStage(stage: string): Promise<Candidate[]> {
    return this.candidates.filter(candidate => candidate.stage === stage)
  }

  async getCandidatesByJob(jobId: string): Promise<Candidate[]> {
    return this.candidates.filter(candidate => candidate.jobId === jobId)
  }

  async searchCandidates(query: string): Promise<Candidate[]> {
    const searchTerm = query.toLowerCase()
    return this.candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm) ||
      candidate.position.toLowerCase().includes(searchTerm) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    )
  }

  async uploadResume(candidateId: string, resumeUrl: string): Promise<boolean> {
    const candidate = await this.getCandidateById(candidateId)
    if (!candidate) return false

    await this.updateCandidate(candidateId, { resumeUrl })
    return true
  }
}

export default new CandidateService()