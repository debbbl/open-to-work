import React, { useState, useEffect } from 'react'
import { Users, Trophy, MessageCircle, CheckCircle, Star, Target, Book } from 'lucide-react'
import { NewHire, OnboardingTask } from '../types'
import { onboardingAPI } from '../services/api'

const Onboarding: React.FC = () => {
  const [newHires, setNewHires] = useState<NewHire[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHire, setSelectedHire] = useState<NewHire | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hiresData = await onboardingAPI.getNewHires()
        setNewHires(hiresData)
      } catch (error) {
        console.error('Error fetching new hires:', error)
        // Use mock data for demo
        setNewHires(mockNewHires)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await onboardingAPI.updateTask(taskId, status)
      setNewHires(prev =>
        prev.map(hire => ({
          ...hire,
          tasks: hire.tasks.map(task =>
            task.id === taskId ? { ...task, status: status as any } : task
          )
        }))
      )
    } catch (error) {
      console.error('Error updating task:', error)
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
        <p className="text-gray-600">Gamified onboarding experience for new hires</p>
      </div>

      {/* AI Chatbot Assistant */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Onboarding Assistant</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-8 w-8 text-primary-500" />
              <div>
                <h4 className="font-medium text-gray-900">RAG-Powered Chatbot</h4>
                <p className="text-sm text-gray-600">
                  Answers questions using company policies and documents
                </p>
              </div>
            </div>
            <button className="btn-primary text-sm">Configure Chatbot</button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">AI</span>
              </div>
              <span className="text-sm font-medium">Onboarding Assistant</span>
            </div>
            <p className="text-sm text-gray-700">
              "Hi! I'm here to help with your onboarding questions. Ask me about company policies, benefits, or your first week schedule."
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{newHires.length}</p>
              <p className="text-sm text-gray-600">Active Onboarding</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">847</p>
              <p className="text-sm text-gray-600">Points Earned</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">78%</p>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <Star className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
              <p className="text-sm text-gray-600">Satisfaction Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Hires Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {newHires.map((hire) => (
          <NewHireCard
            key={hire.id}
            hire={hire}
            onClick={() => setSelectedHire(hire)}
          />
        ))}
      </div>

      {/* Detailed View Modal */}
      {selectedHire && (
        <OnboardingDetailsModal
          hire={selectedHire}
          onClose={() => setSelectedHire(null)}
          onTaskUpdate={updateTaskStatus}
        />
      )}
    </div>
  )
}

interface NewHireCardProps {
  hire: NewHire
  onClick: () => void
}

const NewHireCard: React.FC<NewHireCardProps> = ({ hire, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pre-boarding': return 'bg-yellow-100 text-yellow-800'
      case 'onboarding': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const completedTasks = hire.tasks.filter(task => task.status === 'completed').length
  const totalTasks = hire.tasks.length
  const totalPoints = hire.tasks.filter(task => task.status === 'completed')
    .reduce((sum, task) => sum + task.points, 0)

  return (
    <div 
      className="card hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{hire.name}</h3>
          <p className="text-gray-600">{hire.position}</p>
          <p className="text-sm text-gray-500">{hire.department}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(hire.status)}`}>
          {hire.status.replace('-', ' ')}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{hire.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${hire.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">{completedTasks}/{totalTasks} tasks</span>
          </div>
          <div className="flex items-center space-x-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="font-medium text-gray-900">{totalPoints} pts</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Start Date:</span>
          <span className="font-medium">{hire.startDate}</span>
        </div>

        {hire.buddy && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Buddy:</span>
            <span className="font-medium">{hire.buddy}</span>
          </div>
        )}
      </div>
    </div>
  )
}

interface OnboardingDetailsModalProps {
  hire: NewHire
  onClose: () => void
  onTaskUpdate: (taskId: string, status: string) => void
}

const OnboardingDetailsModal: React.FC<OnboardingDetailsModalProps> = ({
  hire,
  onClose,
  onTaskUpdate
}) => {
  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'documentation': return Book
      case 'setup': return Target
      case 'training': return Star
      case 'meeting': return Users
      default: return CheckCircle
    }
  }

  const getTaskColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const tasksByCategory = hire.tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = []
    acc[task.category].push(task)
    return acc
  }, {} as Record<string, OnboardingTask[]>)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{hire.name}</h2>
              <p className="text-gray-600">{hire.position} • {hire.department}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Quest System Progress */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              Onboarding Quest Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{hire.progress}%</p>
                <p className="text-sm text-gray-600">Complete</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {hire.tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.points, 0)}
                </p>
                <p className="text-sm text-gray-600">Points Earned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {hire.tasks.filter(t => t.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Quests Completed</p>
              </div>
            </div>
          </div>

          {/* Tasks by Category */}
          <div className="space-y-6">
            {Object.entries(tasksByCategory).map(([category, tasks]) => {
              const CategoryIcon = getTaskIcon(category)
              return (
                <div key={category}>
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center capitalize">
                    <CategoryIcon className="h-5 w-5 mr-2 text-gray-500" />
                    {category} Quests
                  </h4>
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{task.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          {task.dueDate && (
                            <p className="text-xs text-gray-500 mt-2">Due: {task.dueDate}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-center">
                            <Trophy className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                            <span className="text-xs text-gray-600">{task.points} pts</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskColor(task.status)}`}>
                            {task.status.replace('-', ' ')}
                          </span>
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => onTaskUpdate(task.id, 'completed')}
                              className="text-sm text-primary-600 hover:text-primary-700"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mentor Information */}
          {hire.buddy && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Assigned Buddy</h4>
              <p className="text-blue-800">{hire.buddy} has been matched based on similar skills and interests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Mock data
const mockNewHires: NewHire[] = [
  {
    id: '1',
    candidateId: '1',
    name: 'John Smith',
    position: 'Senior Frontend Developer',
    department: 'Engineering',
    startDate: '2024-01-15',
    buddy: 'Sarah Tech Lead',
    manager: 'Mike Manager',
    status: 'onboarding',
    progress: 65,
    tasks: [
      {
        id: '1',
        title: 'Complete IT Setup',
        description: 'Set up your laptop and development environment',
        category: 'setup',
        status: 'completed',
        points: 50
      },
      {
        id: '2',
        title: 'Review Company Handbook',
        description: 'Read through company policies and procedures',
        category: 'documentation',
        status: 'completed',
        points: 30
      },
      {
        id: '3',
        title: 'First Team Meeting',
        description: 'Meet with your immediate team members',
        category: 'meeting',
        status: 'in-progress',
        dueDate: '2024-01-18',
        points: 40
      },
      {
        id: '4',
        title: 'React Training Module',
        description: 'Complete React best practices training',
        category: 'training',
        status: 'pending',
        dueDate: '2024-01-20',
        points: 100
      }
    ]
  },
  {
    id: '2',
    candidateId: '2',
    name: 'Sarah Wilson',
    position: 'Product Manager',
    department: 'Product',
    startDate: '2024-01-12',
    buddy: 'Emily Product Lead',
    manager: 'David Director',
    status: 'onboarding',
    progress: 45,
    tasks: [
      {
        id: '5',
        title: 'Product Strategy Overview',
        description: 'Learn about current product roadmap and strategy',
        category: 'training',
        status: 'completed',
        points: 75
      },
      {
        id: '6',
        title: 'Stakeholder Introductions',
        description: 'Meet key stakeholders across departments',
        category: 'meeting',
        status: 'in-progress',
        dueDate: '2024-01-19',
        points: 60
      }
    ]
  },
  {
    id: '3',
    candidateId: '3',
    name: 'Mike Johnson',
    position: 'Data Scientist',
    department: 'Data',
    startDate: '2024-01-10',
    buddy: 'Alex Data Lead',
    manager: 'Lisa Manager',
    status: 'pre-boarding',
    progress: 20,
    tasks: [
      {
        id: '7',
        title: 'Data Platform Access',
        description: 'Get access to data warehouse and analytics tools',
        category: 'setup',
        status: 'completed',
        points: 40
      },
      {
        id: '8',
        title: 'ML Framework Training',
        description: 'Complete machine learning framework overview',
        category: 'training',
        status: 'pending',
        dueDate: '2024-01-25',
        points: 120
      }
    ]
  }
]

export default Onboarding