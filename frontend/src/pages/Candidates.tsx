import React, { useState, useEffect } from 'react'
import { Search, Filter, Upload, Eye, MessageCircle, Star } from 'lucide-react'
import ResumeUploader from '../components/ResumeUploader'
import SkillHeatmap from '../components/SkillHeatmap'
import { Candidate } from '../types'
import { candidatesAPI } from '../services/api'

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStage, setFilterStage] = useState<string>('all')
  const [showUploader, setShowUploader] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [biasFreeModeEnabled, setBiasFreeModeEnabled] = useState(false)

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const candidatesData = await candidatesAPI.getAll()
        setCandidates(candidatesData)
      } catch (error) {
        console.error('Error fetching candidates:', error)
        // Use mock data for demo
        setCandidates(mockCandidates)
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [])

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStage === 'all' || candidate.stage === filterStage
    return matchesSearch && matchesFilter && candidate.status === 'active'
  })

  const handleStageChange = async (candidateId: string, newStage: string) => {
    try {
      await candidatesAPI.updateStage(candidateId, newStage)
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, stage: newStage as any }
            : candidate
        )
      )
    } catch (error) {
      console.error('Error updating candidate stage:', error)
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
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">Manage and screen candidates</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={biasFreeModeEnabled}
              onChange={(e) => setBiasFreeModeEnabled(e.target.checked)}
              className="rounded"
            />
            <span>Bias-Free Mode</span>
          </label>
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="btn-primary flex items-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Resumes</span>
          </button>
        </div>
      </div>

      {/* Resume Uploader */}
      {showUploader && (
        <div className="card animate-slide-up">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Resume Upload</h2>
          <ResumeUploader />
        </div>
      )}

      {/* AI Screening Panel */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Screening Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Phase 1: Quick Filter</h4>
            <p className="text-sm text-blue-700">Fast classifier removes non-relevant profiles</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900">Phase 2: Semantic Search</h4>
            <p className="text-sm text-purple-700">Identifies candidates with relevant experience</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Phase 3: LLM Analysis</h4>
            <p className="text-sm text-green-700">Deep evaluation based on job requirements</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="all">All Stages</option>
          <option value="screening">Screening</option>
          <option value="interviewing">Interviewing</option>
          <option value="offer">Offer</option>
          <option value="hired">Hired</option>
        </select>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            biasFreeModeEnabled={biasFreeModeEnabled}
            onStageChange={handleStageChange}
            onViewDetails={(candidate) => setSelectedCandidate(candidate)}
          />
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or upload some resumes.</p>
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  )
}

interface CandidateCardProps {
  candidate: Candidate
  biasFreeModeEnabled: boolean
  onStageChange: (candidateId: string, newStage: string) => void
  onViewDetails: (candidate: Candidate) => void
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  biasFreeModeEnabled,
  onStageChange,
  onViewDetails
}) => {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'screening': return 'bg-yellow-100 text-yellow-800'
      case 'interviewing': return 'bg-blue-100 text-blue-800'
      case 'offer': return 'bg-purple-100 text-purple-800'
      case 'hired': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {biasFreeModeEnabled ? 'Candidate #' + candidate.id : candidate.name}
              </h3>
              <p className="text-gray-600">{candidate.position}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {Array.from({ length: candidate.aiScore }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStageColor(candidate.stage)}`}>
                {candidate.stage}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-sm">
              <span className="text-gray-500">Experience:</span>
              <span className="ml-2 font-medium">{candidate.experience} years</span>
            </div>
            {!biasFreeModeEnabled && (
              <div className="text-sm">
                <span className="text-gray-500">Source:</span>
                <span className="ml-2 font-medium capitalize">{candidate.source}</span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-gray-500">Applied:</span>
              <span className="ml-2 font-medium">{candidate.appliedDate}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {candidate.skills.map((skill) => (
              <span
                key={skill}
                className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewDetails(candidate)}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-700 flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>Add Note</span>
              </button>
            </div>

            <select
              value={candidate.stage}
              onChange={(e) => onStageChange(candidate.id, e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="screening">Screening</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer</option>
              <option value="hired">Hired</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CandidateDetailsModalProps {
  candidate: Candidate
  onClose: () => void
}

const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({ candidate, onClose }) => {
  const mockSkills = [
    { name: 'React', required: true, match: 95, weight: 5 },
    { name: 'TypeScript', required: true, match: 88, weight: 4 },
    { name: 'Node.js', required: false, match: 75, weight: 3 },
    { name: 'GraphQL', required: false, match: 45, weight: 2 },
    { name: 'AWS', required: true, match: 60, weight: 4 }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{candidate.name}</h2>
              <p className="text-gray-600">{candidate.position}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* AI Analysis */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">AI Analysis Summary</h3>
            <p className="text-blue-800">
              This candidate has {candidate.experience} years of experience and shows a very good fit 
              for the role. Strong technical background in React and TypeScript. Recommended for 
              technical interview round.
            </p>
          </div>

          {/* Skill Heatmap */}
          <SkillHeatmap skills={mockSkills} candidateName={candidate.name} />

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium">{candidate.email}</p>
              </div>
              {candidate.phone && (
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <p className="font-medium">{candidate.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Interview History */}
          {candidate.interviews && candidate.interviews.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview History</h3>
              <div className="space-y-3">
                {candidate.interviews.map((interview) => (
                  <div key={interview.id} className="border border-gray-200 rounded p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{interview.type} Interview</span>
                      <span className="text-sm text-gray-600">{interview.scheduledDate}</span>
                    </div>
                    {interview.feedback && (
                      <p className="text-sm text-gray-600 mt-2">{interview.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Mock data for demo
const mockCandidates: Candidate[] = [
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
    source: 'linkedin'
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
    source: 'direct'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    position: 'Data Scientist',
    experience: 4,
    skills: ['Python', 'TensorFlow', 'SQL', 'Statistics'],
    stage: 'offer',
    aiScore: 4,
    appliedDate: '2024-01-10',
    status: 'active',
    source: 'referral'
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.chen@email.com',
    position: 'UX Designer',
    experience: 6,
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    stage: 'screening',
    aiScore: 3,
    appliedDate: '2024-01-14',
    status: 'active',
    source: 'job-board'
  }
]

export default Candidates