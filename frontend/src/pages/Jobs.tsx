import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MapPin, Clock, Users } from 'lucide-react'
import { Job } from '../types'
import { jobsAPI } from '../services/api'

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsData = await jobsAPI.getAll()
        setJobs(jobsData)
      } catch (error) {
        console.error('Error fetching jobs:', error)
        // Use mock data for demo
        setJobs(mockJobs)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleCreateJob = async (jobData: Omit<Job, 'id'>) => {
    try {
      const newJob = await jobsAPI.create(jobData)
      setJobs(prev => [newJob, ...prev])
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating job:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600">Manage and create job opportunities</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Job</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or create a new job posting.</p>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <CreateJobModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateJob}
        />
      )}
    </div>
  )
}

interface JobCardProps {
  job: Job
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
          <p className="text-gray-600">{job.department}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(job.status)}`}>
          {job.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{job.location}</span>
          <span className="mx-2">•</span>
          <span className="capitalize">{job.type.replace('-', ' ')}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>Posted {job.createdDate}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <Users className="h-4 w-4 inline mr-1" />
            <span>{job.applicants} applicants</span>
          </div>
          <div className="text-sm font-medium text-gray-900">
            ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="text-xs text-gray-500">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface CreateJobModalProps {
  onClose: () => void
  onSubmit: (job: Omit<Job, 'id'>) => void
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time' as const,
    description: '',
    requirements: '',
    skills: '',
    experienceLevel: 'mid' as const,
    salaryMin: 0,
    salaryMax: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const jobData: Omit<Job, 'id'> = {
      title: formData.title,
      department: formData.department,
      location: formData.location,
      type: formData.type,
      status: 'active',
      description: formData.description,
      requirements: formData.requirements.split('\n').filter(Boolean),
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      experienceLevel: formData.experienceLevel,
      salary: {
        min: formData.salaryMin,
        max: formData.salaryMax,
        currency: 'USD'
      },
      createdDate: new Date().toISOString().split('T')[0],
      applicants: 0
    }

    onSubmit(jobData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Job</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="input-field"
                placeholder="e.g. Engineering"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="input-field"
                placeholder="e.g. San Francisco, CA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="input-field"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                className="input-field"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
              <input
                type="number"
                required
                value={formData.salaryMin}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: parseInt(e.target.value) }))}
                className="input-field"
                placeholder="80000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
              <input
                type="number"
                required
                value={formData.salaryMax}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: parseInt(e.target.value) }))}
                className="input-field"
                placeholder="120000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              required
              value={formData.skills}
              onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
              className="input-field"
              placeholder="React, TypeScript, Node.js"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field"
              placeholder="Describe the role and responsibilities..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
            <textarea
              required
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              className="input-field"
              placeholder="5+ years of experience&#10;Bachelor's degree in Computer Science&#10;Strong problem-solving skills"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Job
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Mock data for demo
const mockJobs: Job[] = [
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
  },
  {
    id: '3',
    title: 'Data Scientist',
    department: 'Data',
    location: 'Remote',
    type: 'full-time',
    status: 'paused',
    description: 'Help us leverage data to drive business decisions...',
    requirements: [
      'PhD in relevant field',
      'Strong Python skills',
      'Experience with ML frameworks'
    ],
    skills: ['Python', 'TensorFlow', 'SQL', 'Statistics'],
    experienceLevel: 'senior',
    salary: { min: 140000, max: 180000, currency: 'USD' },
    createdDate: '2024-01-05',
    applicants: 31
  }
]

export default Jobs