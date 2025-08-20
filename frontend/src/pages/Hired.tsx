import React, { useState } from 'react'
import { Download, Clock, Star, Calendar, FileText, User, TrendingUp, Award } from 'lucide-react'

const Hired: React.FC = () => {
  const [selectedHire, setSelectedHire] = useState<any>(null)

  const hiredCandidates = [
    {
      id: '1',
      name: 'Sarah Chen',
      position: 'Senior Frontend Developer',
      department: 'Engineering',
      hireDate: '2024-01-15',
      timeToHire: 18,
      totalInterviews: 3,
      finalScore: 94,
      salary: 125000,
      source: 'LinkedIn',
      journey: [
        { stage: 'Applied', date: '2023-12-28', notes: 'Strong technical background' },
        { stage: 'Screening', date: '2023-12-30', notes: 'Passed AI screening with 94% match' },
        { stage: 'Technical Interview', date: '2024-01-05', notes: 'Excellent problem-solving skills', rating: 5 },
        { stage: 'Culture Fit', date: '2024-01-08', notes: 'Great team player, aligns with values', rating: 5 },
        { stage: 'Final Interview', date: '2024-01-12', notes: 'Strong leadership potential', rating: 4 },
        { stage: 'Offer Extended', date: '2024-01-13', notes: 'Competitive package offered' },
        { stage: 'Offer Accepted', date: '2024-01-15', notes: 'Accepted same day!' },
        { stage: 'Hired', date: '2024-01-15', notes: 'Welcome to the team!' }
      ]
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      position: 'Product Manager',
      department: 'Product',
      hireDate: '2024-01-20',
      timeToHire: 25,
      totalInterviews: 4,
      finalScore: 89,
      salary: 115000,
      source: 'Referral',
      journey: [
        { stage: 'Applied', date: '2023-12-26', notes: 'Referred by John Smith' },
        { stage: 'Screening', date: '2023-12-28', notes: 'Strong product sense' },
        { stage: 'Product Case Study', date: '2024-01-03', notes: 'Innovative solution approach', rating: 5 },
        { stage: 'Stakeholder Interview', date: '2024-01-08', notes: 'Great communication skills', rating: 4 },
        { stage: 'Team Interview', date: '2024-01-12', notes: 'Collaborative mindset', rating: 4 },
        { stage: 'Executive Interview', date: '2024-01-15', notes: 'Strategic thinking', rating: 5 },
        { stage: 'Offer Extended', date: '2024-01-18', notes: 'Negotiated equity package' },
        { stage: 'Offer Accepted', date: '2024-01-20', notes: 'Ready to start!' },
        { stage: 'Hired', date: '2024-01-20', notes: 'Onboarding scheduled' }
      ]
    },
    {
      id: '3',
      name: 'Emily Watson',
      position: 'Data Scientist',
      department: 'Analytics',
      hireDate: '2024-01-10',
      timeToHire: 15,
      totalInterviews: 2,
      finalScore: 92,
      salary: 130000,
      source: 'Direct',
      journey: [
        { stage: 'Applied', date: '2023-12-26', notes: 'PhD in Machine Learning' },
        { stage: 'Screening', date: '2023-12-27', notes: 'Exceptional academic background' },
        { stage: 'Technical Challenge', date: '2024-01-02', notes: 'Outstanding ML solution', rating: 5 },
        { stage: 'Team Interview', date: '2024-01-05', notes: 'Great cultural fit', rating: 5 },
        { stage: 'Offer Extended', date: '2024-01-08', notes: 'Fast-tracked offer' },
        { stage: 'Offer Accepted', date: '2024-01-10', notes: 'Immediate acceptance' },
        { stage: 'Hired', date: '2024-01-10', notes: 'Top performer potential' }
      ]
    }
  ]

  const averageTimeToHire = Math.round(hiredCandidates.reduce((sum, hire) => sum + hire.timeToHire, 0) / hiredCandidates.length)
  const averageInterviews = Math.round(hiredCandidates.reduce((sum, hire) => sum + hire.totalInterviews, 0) / hiredCandidates.length * 10) / 10

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hired Candidates</h1>
          <p className="text-gray-600">Track successful hires and their journey</p>
        </div>
        <button className="btn-primary">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{hiredCandidates.length}</div>
          <div className="text-sm text-gray-600">Total Hires</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{averageTimeToHire} days</div>
          <div className="text-sm text-gray-600">Avg Time to Hire</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{averageInterviews}</div>
          <div className="text-sm text-gray-600">Avg Interviews</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">91%</div>
          <div className="text-sm text-gray-600">Avg Final Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hired Candidates List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Hires</h3>
          <div className="space-y-3">
            {hiredCandidates.map((hire) => (
              <div
                key={hire.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedHire?.id === hire.id 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedHire(hire)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{hire.name}</h4>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(hire.finalScore / 20) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">{hire.finalScore}%</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">{hire.position} • {hire.department}</div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {hire.hireDate}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {hire.timeToHire} days
                    </span>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">${hire.salary.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Journey */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedHire ? `${selectedHire.name}'s Journey` : 'Candidate Journey'}
          </h3>
          
          {selectedHire ? (
            <div>
              {/* Candidate Overview */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Position:</span>
                    <div className="text-gray-900">{selectedHire.position}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Department:</span>
                    <div className="text-gray-900">{selectedHire.department}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Source:</span>
                    <div className="text-gray-900">{selectedHire.source}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Salary:</span>
                    <div className="text-gray-900">${selectedHire.salary.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Journey Timeline */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedHire.journey.map((step: any, index: number) => (
                  <div key={index} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        step.stage === 'Hired' ? 'bg-green-500' :
                        step.stage.includes('Offer') ? 'bg-blue-500' :
                        step.stage.includes('Interview') ? 'bg-purple-500' :
                        'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{step.stage}</p>
                        <p className="text-xs text-gray-500">{step.date}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{step.notes}</p>
                      {step.rating && (
                        <div className="flex items-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < step.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({step.rating}/5)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4 pt-4 border-t">
                <button className="btn-secondary text-sm flex-1">
                  <FileText className="h-4 w-4 mr-1" />
                  View Details
                </button>
                <button className="btn-primary text-sm flex-1">
                  <Award className="h-4 w-4 mr-1" />
                  Start Onboarding
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Select a hired candidate to view their journey</p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Sources Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">LinkedIn</span>
                <span className="text-sm font-medium">33%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Referral</span>
                <span className="text-sm font-medium">33%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Direct</span>
                <span className="text-sm font-medium">34%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Department Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Engineering</span>
                <span className="text-sm font-medium">33%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Product</span>
                <span className="text-sm font-medium">33%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Analytics</span>
                <span className="text-sm font-medium">34%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Performance Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Offer Acceptance Rate</span>
                <span className="text-sm font-medium text-green-600">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quality of Hire</span>
                <span className="text-sm font-medium text-green-600">91%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Time to Productivity</span>
                <span className="text-sm font-medium text-yellow-600">30 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hired
