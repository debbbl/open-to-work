import { Job, CreateJobRequest, UpdateJobRequest } from '../models/Job'
import { generateId } from '../utils/helpers'

class JobService {
  private jobs: Job[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'full-time',
      status: 'active',
      description: 'We are looking for a Senior Frontend Developer to join our team...',
      requirements: [
        '5+ years of React experience',
        'Strong TypeScript skills',
        'Experience with modern build tools'
      ],
      skills: ['React', 'TypeScript', 'Redux', 'Webpack', 'Jest'],
      experienceLevel: 'senior',
      salary: { min: 120000, max: 160000, currency: 'USD' },
      createdDate: '2024-01-10',
      applicants: 23
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: 'full-time',
      status: 'active',
      description: 'Join our product team to drive innovation...',
      requirements: [
        '3+ years of product management experience',
        'Strong analytical skills',
        'Experience with Agile methodologies'
      ],
      skills: ['Product Strategy', 'Analytics', 'Agile', 'Roadmapping'],
      experienceLevel: 'mid',
      salary: { min: 110000, max: 140000, currency: 'USD' },
      createdDate: '2024-01-08',
      applicants: 18
    }
  ]

  async getAllJobs(): Promise<Job[]> {
    return this.jobs
  }

  async getJobById(id: string): Promise<Job | null> {
    return this.jobs.find(job => job.id === id) || null
  }

  async createJob(jobData: CreateJobRequest): Promise<Job> {
    const newJob: Job = {
      id: generateId(),
      ...jobData,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      applicants: 0,
      createdBy: 'system', // In real app, this would be the authenticated user
      updatedAt: new Date().toISOString()
    }

    this.jobs.unshift(newJob)
    return newJob
  }

  async updateJob(id: string, updateData: UpdateJobRequest): Promise<Job | null> {
    const jobIndex = this.jobs.findIndex(job => job.id === id)
    if (jobIndex === -1) return null

    const updatedJob = {
      ...this.jobs[jobIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    this.jobs[jobIndex] = updatedJob
    return updatedJob
  }

  async deleteJob(id: string): Promise<boolean> {
    const initialLength = this.jobs.length
    this.jobs = this.jobs.filter(job => job.id !== id)
    return this.jobs.length < initialLength
  }

  async getJobsByDepartment(department: string): Promise<Job[]> {
    return this.jobs.filter(job => 
      job.department.toLowerCase() === department.toLowerCase()
    )
  }

  async getActiveJobs(): Promise<Job[]> {
    return this.jobs.filter(job => job.status === 'active')
  }
}

export default new JobService()