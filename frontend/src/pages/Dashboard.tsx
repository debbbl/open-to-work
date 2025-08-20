import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Briefcase, Calendar, FileText, TrendingUp, Clock, MessageCircle, UserPlus, AlertCircle, Filter } from 'lucide-react'
import PipelineBoard from '../components/PipelineBoard'
import { DashboardMetrics, Candidate } from '../types'
import { analyticsAPI, candidatesAPI } from '../services/api'

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, candidatesData] = await Promise.all([
          analyticsAPI.getDashboardMetrics(),
          candidatesAPI.getAll()
        ])
        setMetrics(metricsData)
        setCandidates(candidatesData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Use mock data for demo
        setMetrics(mockMetrics)
        setCandidates(mockCandidates)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCandidateMove = async (candidateId: string, newStage: string) => {
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

  if (!metrics) return null

  const timeToHireData = [
    { name: 'Week 1', hires: 2 },
    { name: 'Week 2', hires: 5 },
    { name: 'Week 3', hires: 8 },
    { name: 'Week 4', hires: 3 }
  ]

  const sourceData = Object.entries(metrics.candidateSourceBreakdown).map(([key, value]) => ({
    name: key,
    value
  }))

  const COLORS = ['#2563eb', '#7c3aed', '#059669', '#dc2626']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600">Manage your talent acquisition pipeline</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: just now</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Open Positions"
          value={metrics.openPositions}
          icon={Briefcase}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Active Candidates"
          value={metrics.activeCandidates}
          icon={Users}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Interviews Scheduled"
          value={metrics.interviewsScheduled}
          icon={Calendar}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <MetricCard
          title="Offers Extended"
          value={metrics.offersExtended}
          icon={FileText}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Time to Hire Trends</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Last 4 weeks</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={timeToHireData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="hires" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Candidate Sources</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">This month</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {sourceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {sourceData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="capitalize text-gray-700">{entry.name}: <span className="font-medium">{entry.value}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recruitment Pipeline</h2>
            <p className="text-sm text-gray-600">Drag and drop candidates between stages</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Clock className="h-4 w-4" />
              <span>Avg. time to hire: <span className="font-medium">{metrics.timeToHire} days</span></span>
            </div>
            <Filter className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <PipelineBoard candidates={candidates} onCandidateMove={handleCandidateMove} />
        </div>
      </div>

      {/* Collaboration & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { user: 'Sarah M.', action: 'moved John Smith to Interview stage', time: '2 hours ago', type: 'move' },
              { user: 'Mike R.', action: 'commented on Jane Doe profile', time: '3 hours ago', type: 'comment' },
              { user: 'Lisa K.', action: 'scheduled interview with Alex Chen', time: '5 hours ago', type: 'schedule' },
              { user: 'Tom W.', action: 'added notes to Maria Garcia', time: '1 day ago', type: 'note' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className="flex-shrink-0">
                  {activity.type === 'move' && <UserPlus className="h-4 w-4 text-blue-500 mt-0.5" />}
                  {activity.type === 'comment' && <MessageCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                  {activity.type === 'schedule' && <Calendar className="h-4 w-4 text-purple-500 mt-0.5" />}
                  {activity.type === 'note' && <FileText className="h-4 w-4 text-orange-500 mt-0.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Collaboration */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Collaboration</h3>
          <div className="space-y-4">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-900">Pending Reviews</span>
              </div>
              <p className="text-sm text-yellow-800 mb-2">3 candidates need manager approval</p>
              <button className="text-xs text-yellow-700 hover:text-yellow-900">Review Now →</button>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Comments</span>
              </div>
              <p className="text-sm text-blue-800 mb-2">5 new comments on candidate profiles</p>
              <button className="text-xs text-blue-700 hover:text-blue-900">View Comments →</button>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Tagged</span>
              </div>
              <p className="text-sm text-green-800 mb-2">You're tagged in 2 candidate discussions</p>
              <button className="text-xs text-green-700 hover:text-green-900">Check Tags →</button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-5 w-5 text-primary-600" />
                <div>
                  <div className="font-medium text-primary-900">Post New Job</div>
                  <div className="text-sm text-primary-700">Create and publish job posting</div>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">Schedule Interviews</div>
                  <div className="text-sm text-green-700">Bulk schedule this week's interviews</div>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900">Generate Report</div>
                  <div className="text-sm text-purple-700">Weekly hiring analytics report</div>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-900">AI Insights</div>
                  <div className="text-sm text-orange-700">Get hiring recommendations</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Screening Insights Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Screening Insights</h3>
          <button className="btn-secondary text-sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Top Candidate Trends</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• React skills in high demand</li>
              <li>• Remote candidates performing well</li>
              <li>• Bootcamp grads showing strong results</li>
              <li>• 5+ years experience preferred</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Drop-off Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-green-800">After Screening:</span>
                <span className="text-sm font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-800">After Interview:</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-800">After Offer:</span>
                <span className="text-sm font-medium">10%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">AI Recommendations</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Expand search to include Vue.js skills</li>
              <li>• Consider junior developers with potential</li>
              <li>• Interview response rate is low - review questions</li>
              <li>• Salary benchmarks may need adjustment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
  bgColor: string
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, bgColor }) => (
  <div className="card hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 ${bgColor} rounded-xl`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
  </div>
)

// Mock data for demo purposes
const mockMetrics: DashboardMetrics = {
  openPositions: 12,
  activeCandidates: 48,
  interviewsScheduled: 15,
  offersExtended: 6,
  newHires: 3,
  timeToHire: 21,
  candidateSourceBreakdown: {
    linkedin: 25,
    direct: 15,
    referral: 8,
    'job-board': 12
  },
  pipelineMetrics: {
    screening: 20,
    interviewing: 15,
    offer: 8,
    hired: 5
  }
}

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    position: 'Senior Frontend Developer',
    experience: 5,
    skills: ['React', 'TypeScript', 'Node.js'],
    stage: 'screening',
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
    skills: ['Product Strategy', 'Agile', 'Analytics'],
    stage: 'interviewing',
    aiScore: 5,
    appliedDate: '2024-01-12',
    status: 'active',
    source: 'direct'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    position: 'Data Scientist',
    experience: 4,
    skills: ['Python', 'ML', 'SQL'],
    stage: 'offer',
    aiScore: 4,
    appliedDate: '2024-01-10',
    status: 'active',
    source: 'referral'
  }
]

export default Dashboard