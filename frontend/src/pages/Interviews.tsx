import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Video, Phone, User, Plus, Brain, MessageSquare, FileText, BarChart3, Star, Loader2, CheckCircle } from 'lucide-react'
import { Interview, Candidate } from '../types'
import { interviewsAPI, candidatesAPI } from '../services/api'

const Interviews: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [activeTab, setActiveTab] = useState('schedule')
  
  // AI Question Generation State
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [questionType, setQuestionType] = useState('technical')
  const [difficultyLevel, setDifficultyLevel] = useState('mid-level')
  const [questionCategories, setQuestionCategories] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const interviewsData = await interviewsAPI.getAll()
        setInterviews(interviewsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Use mock data for demo
        setInterviews(mockInterviews)
      } finally {
        setLoading(false)
      }
    }

    const fetchCategories = async () => {
      // Use mock data for demo - no external API calls
      setQuestionCategories({
        categories: [
          { id: 'technical', name: 'Technical', description: 'Coding and technical problem solving' },
          { id: 'behavioral', name: 'Behavioral', description: 'Past experiences and STAR method questions' },
          { id: 'system_design', name: 'System Design', description: 'Architecture and scalability questions' },
          { id: 'cultural_fit', name: 'Cultural Fit', description: 'Values, teamwork, and company culture' }
        ],
        difficulty_levels: [
          { id: 'junior', name: 'Junior (1-2 years)', description: 'Entry level questions' },
          { id: 'mid-level', name: 'Mid-level (3-5 years)', description: 'Intermediate complexity' },
          { id: 'senior', name: 'Senior (5+ years)', description: 'Advanced and leadership questions' }
        ]
      })
    }

    fetchData()
    fetchCategories()
  }, [])

  const generateAIQuestions = async () => {
    if (!selectedCandidate) {
      alert('Please select a candidate first')
      return
    }

    setGeneratingQuestions(true)
    try {
      // Get candidate data from mock candidates for demo
      const candidate = mockCandidates.find(c => c.id === selectedCandidate)
      if (!candidate) return

      // Simulate AI processing with mock data for demo
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate personalized mock questions based on candidate and type
      const questions = getPersonalizedMockQuestions(candidate, questionType, difficultyLevel)
      setGeneratedQuestions(questions)
    } catch (error) {
      console.error('Error generating questions:', error)
      // Fallback to basic mock questions
      setGeneratedQuestions(getMockQuestions())
    } finally {
      setGeneratingQuestions(false)
    }
  }

  const getPersonalizedMockQuestions = (candidate: any, type: string, difficulty: string) => {
    const questionSets = {
      technical: {
        'John Smith': [
          {
            category: 'Technical',
            question: `Given your React and TypeScript experience, how would you implement a custom hook for data fetching with error handling?`,
            difficulty: difficulty === 'senior' ? 'Hard' : 'Medium',
            follow_up: 'How would you handle race conditions in this custom hook?',
            evaluation_criteria: ['React hooks expertise', 'TypeScript knowledge', 'Error handling patterns']
          },
          {
            category: 'Technical', 
            question: 'Explain the difference between React.memo, useMemo, and useCallback in performance optimization',
            difficulty: difficulty === 'junior' ? 'Medium' : 'Hard',
            follow_up: 'When would you choose each optimization technique?',
            evaluation_criteria: ['Performance optimization', 'React patterns', 'Understanding of re-renders']
          },
          {
            category: 'Technical',
            question: 'How would you design a scalable component library with TypeScript?',
            difficulty: 'Hard',
            follow_up: 'What would be your testing strategy for this component library?',
            evaluation_criteria: ['Architecture design', 'TypeScript advanced features', 'Component patterns']
          }
        ],
        'Sarah Wilson': [
          {
            category: 'Technical',
            question: 'How would you implement user analytics tracking in a React application while maintaining user privacy?',
            difficulty: 'Medium',
            follow_up: 'What GDPR considerations would you need to account for?',
            evaluation_criteria: ['Privacy awareness', 'Analytics implementation', 'Legal compliance']
          },
          {
            category: 'Technical',
            question: 'Design a system for A/B testing product features in a React application',
            difficulty: 'Hard',
            follow_up: 'How would you ensure statistical significance in your tests?',
            evaluation_criteria: ['System design', 'Product thinking', 'Statistical understanding']
          }
        ]
      },
      behavioral: [
        {
          category: 'Behavioral',
          question: `Tell me about a time when you had to learn ${candidate?.skills?.[0] || 'a new technology'} quickly for a project`,
          difficulty: 'Medium',
          follow_up: 'What was your learning strategy and how did you apply it?',
          evaluation_criteria: ['Learning ability', 'Adaptability', 'Self-direction']
        },
        {
          category: 'Behavioral',
          question: 'Describe a situation where you disagreed with a technical decision made by your team',
          difficulty: 'Medium',
          follow_up: 'How did you handle the disagreement and what was the outcome?',
          evaluation_criteria: ['Communication skills', 'Collaboration', 'Conflict resolution']
        }
      ],
      system_design: [
        {
          category: 'System Design',
          question: `Design a scalable web application similar to a tool you might use in ${candidate?.position || 'your role'}`,
          difficulty: 'Hard',
          follow_up: 'How would you handle high traffic and ensure reliability?',
          evaluation_criteria: ['System architecture', 'Scalability thinking', 'Real-world application']
        }
      ],
      cultural_fit: [
        {
          category: 'Cultural Fit',
          question: `What motivates you most in ${candidate?.position || 'your work'} and how do you stay current with industry trends?`,
          difficulty: 'Easy',
          follow_up: 'How do you handle feedback and continuous improvement?',
          evaluation_criteria: ['Self-awareness', 'Growth mindset', 'Industry engagement']
        }
      ]
    }

    const candidateQuestions = questionSets.technical[candidate?.name as keyof typeof questionSets.technical]
    if (type === 'technical' && candidateQuestions) {
      return candidateQuestions
    }

    return questionSets[type as keyof typeof questionSets] || questionSets.technical['John Smith']
  }

  const getMockQuestions = () => {
    return [
      {
        category: 'Technical',
        question: 'Explain the difference between React hooks and class components',
        difficulty: 'Medium',
        follow_up: 'When would you choose one over the other?',
        evaluation_criteria: ['React knowledge', 'Understanding of modern patterns']
      },
      {
        category: 'Technical',
        question: 'How would you optimize a slow database query?',
        difficulty: 'Hard',
        follow_up: 'What tools would you use to identify the bottleneck?',
        evaluation_criteria: ['Database optimization', 'Problem-solving approach']
      },
      {
        category: 'Technical',
        question: 'Describe how you would implement authentication in a React application',
        difficulty: 'Medium',
        follow_up: 'How would you handle token refresh?',
        evaluation_criteria: ['Security understanding', 'Frontend architecture']
      }
    ]
  }

  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const TabButton = ({ id, label, icon: Icon, active }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        active 
          ? 'bg-primary-500 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Module</h1>
          <p className="text-gray-600">AI-powered interview scheduling and evaluation</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4">
        <TabButton id="schedule" label="Scheduling" icon={Calendar} active={activeTab === 'schedule'} />
        <TabButton id="questions" label="AI Questions" icon={Brain} active={activeTab === 'questions'} />
        <TabButton id="assistant" label="Live Assistant" icon={MessageSquare} active={activeTab === 'assistant'} />
        <TabButton id="comparison" label="Candidate Comparison" icon={BarChart3} active={activeTab === 'comparison'} />
      </div>

      {/* Scheduling Tab */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar-based Scheduling */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar-Based Scheduling</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="font-medium text-gray-600 py-2">{day}</div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="p-2 hover:bg-gray-200 rounded cursor-pointer">
                      {i < 31 ? i + 1 : ''}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Available Slots Today</h4>
                {['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM'].map(time => (
                  <div key={time} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800">{time}</span>
                    <button className="btn-primary text-sm">Book Slot</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Interviews</h3>
              <div className="space-y-3">
                {[
                  { time: '10:00 AM', candidate: 'John Smith', position: 'Frontend Developer', type: 'Technical', status: 'upcoming' },
                  { time: '2:00 PM', candidate: 'Sarah Wilson', position: 'Product Manager', type: 'Behavioral', status: 'upcoming' },
                  { time: '4:00 PM', candidate: 'Mike Johnson', position: 'Data Scientist', type: 'Technical', status: 'completed' }
                ].map((interview, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{interview.time}</div>
                        <div className="text-xs text-gray-500">{interview.type}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{interview.candidate}</div>
                        <div className="text-sm text-gray-600">{interview.position}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        interview.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {interview.status}
                      </span>
                      <button className="btn-secondary text-sm">
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Auto-Generated Invitations */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Generated Invitations</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Email Template</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>Subject:</strong> Interview Invitation - Frontend Developer</p>
                  <p><strong>Date:</strong> Tomorrow, 10:00 AM</p>
                  <p><strong>Type:</strong> Technical Interview (60 mins)</p>
                  <p><strong>Link:</strong> Zoom meeting auto-generated</p>
                </div>
                <button className="btn-primary text-sm mt-3">Send Invitation</button>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Smart Scheduling</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Checks interviewer availability</li>
                  <li>• Avoids scheduling conflicts</li>
                  <li>• Considers time zones</li>
                  <li>• Sends calendar invites</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Bulk Scheduling</h4>
                <p className="text-sm text-yellow-800 mb-2">Schedule multiple candidates for screening rounds</p>
                <button className="btn-secondary text-sm">Bulk Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Questions Tab */}
      {activeTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Generator */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Question Generator</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Candidate</label>
                <select 
                  className="input-field"
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                >
                  <option value="">Choose candidate...</option>
                  {mockCandidates.map(candidate => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} - {candidate.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {questionCategories?.categories?.map((category: any) => (
                    <button 
                      key={category.id} 
                      onClick={() => setQuestionType(category.id)}
                      className={`p-2 text-sm border rounded hover:bg-gray-50 ${
                        questionType === category.id ? 'bg-blue-100 border-blue-500' : ''
                      }`}
                    >
                      {category.name}
                    </button>
                  )) || ['Technical', 'Behavioral', 'System Design', 'Cultural Fit'].map(type => (
                    <button 
                      key={type} 
                      onClick={() => setQuestionType(type.toLowerCase().replace(' ', '_'))}
                      className={`p-2 text-sm border rounded hover:bg-gray-50 ${
                        questionType === type.toLowerCase().replace(' ', '_') ? 'bg-blue-100 border-blue-500' : ''
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                <select 
                  className="input-field"
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                >
                  {questionCategories?.difficulty_levels?.map((level: any) => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  )) || (
                    <>
                      <option value="junior">Junior (1-2 years)</option>
                      <option value="mid-level">Mid-level (3-5 years)</option>
                      <option value="senior">Senior (5+ years)</option>
                    </>
                  )}
                </select>
              </div>

              <button 
                className="btn-primary w-full"
                onClick={generateAIQuestions}
                disabled={generatingQuestions || !selectedCandidate}
              >
                {generatingQuestions ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Questions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Generated Questions
              {generatedQuestions.length > 0 && (
                <span className="ml-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  {generatedQuestions.length} questions generated
                </span>
              )}
            </h3>
            <div className="space-y-4">
              {generatingQuestions ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <p className="text-gray-600">AI is generating personalized questions...</p>
                </div>
              ) : generatedQuestions.length > 0 ? (
                generatedQuestions.map((q, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {q.category || 'Technical'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        q.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {q.difficulty || 'Medium'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{q.question}</p>
                    {q.follow_up && (
                      <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 mb-2">
                        <strong>Follow-up:</strong> {q.follow_up}
                      </div>
                    )}
                    {q.evaluation_criteria && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-500">Evaluation criteria:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {q.evaluation_criteria.map((criteria: string, i: number) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {criteria}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-2 mt-2">
                      <button className="text-xs text-blue-600 hover:text-blue-800">Edit</button>
                      <button className="text-xs text-green-600 hover:text-green-800">Use in Interview</button>
                      <button className="text-xs text-red-600 hover:text-red-800">Remove</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Select a candidate and click "Generate Questions" to create AI-powered interview questions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Assistant Tab */}
      {activeTab === 'assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Interview Interface */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Interview Assistant</h3>
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between text-white mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Live Interview</span>
                  </div>
                  <div className="text-sm">15:30 / 60:00</div>
                </div>
                <div className="bg-gray-800 rounded p-4 text-center text-gray-400">
                  Video Stream Placeholder
                  <br />
                  <small>Candidate: John Smith</small>
                </div>
              </div>

              {/* AI Notes */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">AI-Generated Notes</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start space-x-2">
                    <span className="text-xs bg-blue-200 px-1 rounded">15:23</span>
                    <p>Candidate demonstrated strong understanding of React hooks</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-xs bg-blue-200 px-1 rounded">15:25</span>
                    <p>Explained state management with clear examples</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-xs bg-blue-200 px-1 rounded">15:28</span>
                    <p>💡 Suggested follow-up: Ask about performance optimization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Controls */}
          <div className="space-y-4">
            <div className="card">
              <h4 className="font-medium text-gray-900 mb-3">Interview Controls</h4>
              <div className="space-y-2">
                <button className="btn-primary w-full text-sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start AI Recording
                </button>
                <button className="btn-secondary w-full text-sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Summary
                </button>
                <button className="btn-secondary w-full text-sm">
                  <Star className="h-4 w-4 mr-2" />
                  Rate Candidate
                </button>
              </div>
            </div>

            <div className="card">
              <h4 className="font-medium text-gray-900 mb-3">AI Highlights</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-green-50 rounded">
                  <span className="text-green-800">✓ Strong technical skills</span>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <span className="text-yellow-800">⚠ Could improve communication</span>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <span className="text-blue-800">💡 Good problem-solving approach</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="font-medium text-gray-900 mb-3">Suggested Questions</h4>
              <div className="space-y-2">
                {[
                  'Can you explain your approach to testing?',
                  'How do you handle debugging complex issues?',
                  'What is your experience with CI/CD?'
                ].map((question, index) => (
                  <button key={index} className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded">
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Comparison Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Candidate</th>
                    <th className="text-left py-2">Technical Skills</th>
                    <th className="text-left py-2">Communication</th>
                    <th className="text-left py-2">Problem Solving</th>
                    <th className="text-left py-2">Culture Fit</th>
                    <th className="text-left py-2">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'John Smith', tech: 4, comm: 3, problem: 5, culture: 4, overall: 4.0 },
                    { name: 'Sarah Wilson', tech: 3, comm: 5, problem: 4, culture: 5, overall: 4.25 },
                    { name: 'Mike Johnson', tech: 5, comm: 4, problem: 4, culture: 3, overall: 4.0 }
                  ].map((candidate, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 font-medium">{candidate.name}</td>
                      <td className="py-3">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < candidate.tech ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < candidate.comm ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < candidate.problem ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < candidate.culture ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-lg">{candidate.overall}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { name: 'John Smith', position: 'Frontend Developer', strengths: ['Strong React skills', 'Good problem solver', 'Fast learner'], weaknesses: ['Needs better communication', 'Limited backend experience'], score: 4.0 },
              { name: 'Sarah Wilson', position: 'Product Manager', strengths: ['Excellent communication', 'Strategic thinking', 'Team leadership'], weaknesses: ['Limited technical depth', 'New to agile'], score: 4.25 },
              { name: 'Mike Johnson', position: 'Data Scientist', strengths: ['Advanced ML knowledge', 'Python expertise', 'Research background'], weaknesses: ['Quiet personality', 'Limited business experience'], score: 4.0 }
            ].map((candidate, index) => (
              <div key={index} className="card">
                <div className="text-center mb-4">
                  <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                  <p className="text-sm text-gray-600">{candidate.position}</p>
                  <div className="text-2xl font-bold text-blue-600 mt-2">{candidate.score}</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-green-700 mb-1">Strengths</h5>
                    <ul className="text-xs text-green-600 space-y-1">
                      {candidate.strengths.map((strength, i) => (
                        <li key={i}>• {strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-red-700 mb-1">Areas for Growth</h5>
                    <ul className="text-xs text-red-600 space-y-1">
                      {candidate.weaknesses.map((weakness, i) => (
                        <li key={i}>• {weakness}</li>
                      ))}
                    </ul>
        </div>
      </div>

                <button className="btn-primary w-full mt-4 text-sm">View Details</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Interview</h3>
            <p className="text-gray-600 mb-4">Interview scheduling feature coming soon!</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface InterviewCardProps {
  interview: Interview
  candidate?: Candidate
}

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, candidate }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video
      case 'phone': return Phone
      case 'in-person': return User
      default: return Calendar
    }
  }

  const TypeIcon = getTypeIcon(interview.type)
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="card hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <TypeIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {candidate?.name || 'Unknown Candidate'}
            </h4>
            <p className="text-sm text-gray-600 capitalize">
              {interview.type} Interview • {interview.duration} min
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{formatDate(interview.scheduledDate)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
            {interview.status}
          </span>
          {interview.rating && (
            <div className="flex items-center space-x-1">
              {Array.from({ length: interview.rating }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full" />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {interview.feedback && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{interview.feedback}</p>
        </div>
      )}
      
      {interview.status === 'scheduled' && (
        <div className="mt-4 flex items-center space-x-2">
          <button className="text-sm text-primary-600 hover:text-primary-700">
            Join Interview
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-700">
            Reschedule
          </button>
          <button className="text-sm text-red-600 hover:text-red-700">
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

interface ScheduleInterviewModalProps {
  candidates: Candidate[]
  onClose: () => void
  onSubmit: (interview: Omit<Interview, 'id'>) => void
}

const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  candidates,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    candidateId: '',
    jobId: '',
    type: 'video' as const,
    scheduledDate: '',
    duration: 60,
    interviewer: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const interviewData: Omit<Interview, 'id'> = {
      candidateId: formData.candidateId,
      jobId: formData.jobId,
      type: formData.type,
      scheduledDate: formData.scheduledDate,
      duration: formData.duration,
      interviewer: formData.interviewer,
      status: 'scheduled'
    }

    onSubmit(interviewData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Interview</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
            <select
              required
              value={formData.candidateId}
              onChange={(e) => setFormData(prev => ({ ...prev, candidateId: e.target.value }))}
              className="input-field"
            >
              <option value="">Select candidate...</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name} - {candidate.position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="input-field"
            >
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
              <option value="in-person">In-Person</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              required
              value={formData.scheduledDate}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="input-field"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
            <input
              type="text"
              required
              value={formData.interviewer}
              onChange={(e) => setFormData(prev => ({ ...prev, interviewer: e.target.value }))}
              className="input-field"
              placeholder="Enter interviewer name"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Schedule Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Mock data
const mockInterviews: Interview[] = [
  {
    id: '1',
    candidateId: '1',
    jobId: '1',
    type: 'video',
    scheduledDate: '2024-01-20T10:00:00',
    duration: 60,
    interviewer: 'John Manager',
    status: 'scheduled'
  },
  {
    id: '2',
    candidateId: '2',
    jobId: '2',
    type: 'phone',
    scheduledDate: '2024-01-18T14:00:00',
    duration: 45,
    interviewer: 'Sarah Lead',
    status: 'completed',
    rating: 4,
    feedback: 'Strong technical skills, good cultural fit'
  }
]

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    position: 'Senior Frontend Developer',
    experience: 5,
    skills: ['React', 'TypeScript'],
    stage: 'interviewing',
    aiScore: 4,
    appliedDate: '2024-01-15',
    status: 'active',
    source: 'linkedin'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    position: 'Product Manager',
    experience: 3,
    skills: ['Product Strategy', 'Agile'],
    stage: 'screening',
    aiScore: 5,
    appliedDate: '2024-01-12',
    status: 'active',
    source: 'direct'
  }
]

export default Interviews