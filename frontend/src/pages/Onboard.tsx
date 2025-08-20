import React, { useState } from 'react'
import { Bot, Star, Trophy, Zap, Target, Book, Coffee, Laptop, FileText, Camera, Users, MessageCircle, Award, CheckCircle, Clock, BarChart3, User, Calendar } from 'lucide-react'

const Onboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedHire, setSelectedHire] = useState<any>(null)
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', message: 'Hi! I\'m your AI onboarding assistant. How can I help you today?' },
    { type: 'user', message: 'What do I need to complete first?' },
    { type: 'bot', message: 'Great question! Your first quest is to complete your HR paperwork. This includes your tax forms, emergency contacts, and benefits enrollment. Would you like me to guide you through it?' }
  ])

  const newHires = [
    {
      id: '1',
      name: 'Sarah Chen',
      position: 'Senior Frontend Developer',
      startDate: '2024-01-15',
      progress: 75,
      level: 3,
      points: 750,
      buddy: 'Mike Johnson',
      status: 'active',
      quests: [
        { id: '1', title: 'Complete HR Paperwork', category: 'documentation', status: 'completed', points: 100, dueDate: '2024-01-16' },
        { id: '2', title: 'Setup Development Environment', category: 'setup', status: 'completed', points: 150, dueDate: '2024-01-17' },
        { id: '3', title: 'Security Training', category: 'training', status: 'in-progress', points: 100, dueDate: '2024-01-20' },
        { id: '4', title: 'Meet Your Team', category: 'meeting', status: 'completed', points: 75, dueDate: '2024-01-18' },
        { id: '5', title: 'First Project Assignment', category: 'setup', status: 'pending', points: 200, dueDate: '2024-01-25' },
        { id: '6', title: 'Company Culture Quiz', category: 'training', status: 'pending', points: 50, dueDate: '2024-01-22' }
      ]
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      position: 'Product Manager',
      startDate: '2024-01-20',
      progress: 45,
      level: 2,
      points: 425,
      buddy: 'Emily Watson',
      status: 'active',
      quests: [
        { id: '1', title: 'Complete HR Paperwork', category: 'documentation', status: 'completed', points: 100, dueDate: '2024-01-21' },
        { id: '2', title: 'Product Team Introduction', category: 'meeting', status: 'completed', points: 75, dueDate: '2024-01-22' },
        { id: '3', title: 'Tools & Software Setup', category: 'setup', status: 'in-progress', points: 125, dueDate: '2024-01-23' },
        { id: '4', title: 'Product Strategy Overview', category: 'training', status: 'pending', points: 150, dueDate: '2024-01-25' }
      ]
    }
  ]

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

  const QuestIcon = ({ category }: { category: string }) => {
    switch (category) {
      case 'documentation': return <FileText className="h-4 w-4" />
      case 'setup': return <Laptop className="h-4 w-4" />
      case 'training': return <Book className="h-4 w-4" />
      case 'meeting': return <Users className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in-progress': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Onboard Module</h1>
        <p className="text-gray-600">AI-driven and gamified onboarding experience</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4">
        <TabButton id="dashboard" label="Dashboard" icon={BarChart3} active={activeTab === 'dashboard'} />
        <TabButton id="quests" label="Quest System" icon={Target} active={activeTab === 'quests'} />
        <TabButton id="chatbot" label="AI Assistant" icon={Bot} active={activeTab === 'chatbot'} />
        <TabButton id="buddies" label="Buddy System" icon={Users} active={activeTab === 'buddies'} />
        <TabButton id="tour" label="Virtual Tour" icon={Camera} active={activeTab === 'tour'} />
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Hires Overview */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Onboarding</h3>
              <div className="space-y-4">
                {newHires.map((hire) => (
                  <div
                    key={hire.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedHire?.id === hire.id 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedHire(hire)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{hire.name}</h4>
                        <p className="text-sm text-gray-600">{hire.position}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">Level {hire.level}</span>
                        </div>
                        <div className="text-xs text-gray-500">{hire.points} points</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{hire.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${hire.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          Started {hire.startDate}
                        </span>
                        <span className="flex items-center text-gray-600">
                          <User className="h-3 w-3 mr-1" />
                          Buddy: {hire.buddy}
                        </span>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {hire.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="card text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">2</div>
              <div className="text-sm text-gray-600">Active Onboardings</div>
            </div>

            <div className="card text-center">
              <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">60%</div>
              <div className="text-sm text-gray-600">Avg Completion</div>
            </div>

            <div className="card text-center">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">5.2</div>
              <div className="text-sm text-gray-600">Avg Days to Complete</div>
            </div>

            <div className="card text-center">
              <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">1,175</div>
              <div className="text-sm text-gray-600">Total Points Earned</div>
            </div>
          </div>
        </div>
      )}

      {/* Quest System Tab */}
      {activeTab === 'quests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quest Progress */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedHire ? `${selectedHire.name}'s Quests` : 'Select a New Hire'}
            </h3>
            
            {selectedHire ? (
              <div>
                {/* Level and Progress */}
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90">Current Level</div>
                      <div className="text-2xl font-bold">Level {selectedHire.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">Total Points</div>
                      <div className="text-2xl font-bold">{selectedHire.points}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm opacity-90 mb-1">Progress to Level {selectedHire.level + 1}</div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full"
                        style={{ width: `${(selectedHire.points % 500) / 5}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quests List */}
                <div className="space-y-3">
                  {selectedHire.quests.map((quest: any) => (
                    <div key={quest.id} className={`p-3 border rounded-lg ${getStatusColor(quest.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <QuestIcon category={quest.category} />
                          <span className="font-medium">{quest.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(quest.status)}`}>
                            {quest.status.replace('-', ' ')}
                          </span>
                          <span className="text-sm font-medium">+{quest.points} pts</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Due: {quest.dueDate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Select a new hire to view their quests</p>
              </div>
            )}
          </div>

          {/* Quest Templates */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quest Templates</h3>
            <div className="space-y-3">
              {[
                { title: 'HR Paperwork Quest', category: 'documentation', points: 100, description: 'Complete all required HR forms and documentation' },
                { title: 'Tech Setup Challenge', category: 'setup', points: 150, description: 'Configure development environment and tools' },
                { title: 'Culture Learning Path', category: 'training', points: 100, description: 'Learn about company values and culture' },
                { title: 'Team Integration Mission', category: 'meeting', points: 75, description: 'Meet team members and key stakeholders' },
                { title: 'First Week Challenge', category: 'setup', points: 200, description: 'Complete first meaningful project contribution' }
              ].map((template, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <QuestIcon category={template.category} />
                      <span className="font-medium text-gray-900">{template.title}</span>
                    </div>
                    <span className="text-sm font-medium text-purple-600">+{template.points} pts</span>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <button className="mt-2 text-xs text-primary-600 hover:text-primary-800">
                    Add to New Hire →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot Tab */}
      {activeTab === 'chatbot' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Interface */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Bot className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">AI Onboarding Assistant</h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 h-80 overflow-y-auto mb-4">
              <div className="space-y-3">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Ask me anything about onboarding..."
                className="input-field flex-1"
              />
              <button className="btn-primary">Send</button>
            </div>
          </div>

          {/* FAQ & Knowledge Base */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base (RAG)</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">Popular Questions</h4>
                <div className="space-y-2 text-sm">
                  <button className="text-blue-700 hover:text-blue-900 block text-left">
                    • How do I access my benefits information?
                  </button>
                  <button className="text-blue-700 hover:text-blue-900 block text-left">
                    • What's the company's vacation policy?
                  </button>
                  <button className="text-blue-700 hover:text-blue-900 block text-left">
                    • How do I set up my development environment?
                  </button>
                  <button className="text-blue-700 hover:text-blue-900 block text-left">
                    • Who should I contact for IT support?
                  </button>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full text-left text-sm text-green-700 hover:text-green-900 p-2 bg-green-100 rounded">
                    📋 View Company Handbook
                  </button>
                  <button className="w-full text-left text-sm text-green-700 hover:text-green-900 p-2 bg-green-100 rounded">
                    🎯 Check My Progress
                  </button>
                  <button className="w-full text-left text-sm text-green-700 hover:text-green-900 p-2 bg-green-100 rounded">
                    📅 Schedule with Buddy
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-1">AI Capabilities</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Answer policy questions using company docs</li>
                  <li>• Guide through onboarding steps</li>
                  <li>• Help with technical setup</li>
                  <li>• Connect with right people</li>
                  <li>• Track quest progress</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buddy System Tab */}
      {activeTab === 'buddies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Pairings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Buddy Pairings</h3>
            <div className="space-y-4">
              {newHires.map((hire) => (
                <div key={hire.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{hire.name}</h4>
                    <p className="text-sm text-gray-600">{hire.position}</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">paired with</p>
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="font-medium text-gray-900">{hire.buddy}</h4>
                    <p className="text-sm text-gray-600">Senior Developer</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-primary w-full mt-4">
              <Zap className="h-4 w-4 mr-2" />
              AI Auto-Match New Pairs
            </button>
          </div>

          {/* AI Matching Insights */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Matching System</h3>
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Matching Criteria</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Technical skills overlap</li>
                  <li>• Personality compatibility</li>
                  <li>• Department synergy</li>
                  <li>• Experience level balance</li>
                  <li>• Communication style</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Success Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-800">Buddy Satisfaction</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-800">Onboarding Speed</span>
                    <span className="text-sm font-medium">+23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-800">Retention Rate</span>
                    <span className="text-sm font-medium">98%</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Upcoming Matches</h4>
                <p className="text-sm text-blue-800">
                  3 new hires starting next week. AI suggests optimal buddy pairings based on personality assessments and skill compatibility.
                </p>
                <button className="mt-2 text-sm text-blue-700 hover:text-blue-900">
                  View Suggestions →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Tour Tab */}
      {activeTab === 'tour' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Virtual Office Tour</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tour Interface */}
            <div>
              <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center mb-4">
                <div className="text-center">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">360° Office Tour</h4>
                  <p className="text-gray-500 mb-4">Explore our office virtually</p>
                  <button className="btn-primary">Start Tour</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {['Reception', 'Engineering Floor', 'Kitchen', 'Meeting Rooms', 'Game Room', 'Rooftop'].map((area) => (
                  <button key={area} className="p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Tour Guide */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🗺️ Tour Highlights</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Interactive office map</li>
                  <li>• Meet key team members virtually</li>
                  <li>• Learn about each department</li>
                  <li>• Discover company culture spots</li>
                  <li>• Find important facilities</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">📍 Key Locations</h4>
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex items-center space-x-2">
                    <Coffee className="h-4 w-4" />
                    <span>Kitchen & Café Area</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Collaboration Spaces</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Laptop className="h-4 w-4" />
                    <span>Engineering Floor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Meeting Rooms</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">🎮 Interactive Features</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Click on people to see their roles</li>
                  <li>• Access area-specific information</li>
                  <li>• Complete tour-based quests</li>
                  <li>• Leave notes and feedback</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Onboard
