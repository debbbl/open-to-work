import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Clock, Target, Download, Filter } from 'lucide-react'
import { analyticsAPI } from '../services/api'

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch analytics data
        await analyticsAPI.getDashboardMetrics()
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const timeToHireData = [
    { name: 'Week 1', engineering: 18, product: 22, design: 16, data: 28 },
    { name: 'Week 2', engineering: 22, product: 19, design: 21, data: 25 },
    { name: 'Week 3', engineering: 16, product: 25, design: 18, data: 32 },
    { name: 'Week 4', engineering: 20, product: 18, design: 14, data: 22 }
  ]

  const candidateSourceData = [
    { name: 'LinkedIn', value: 45, color: '#2563eb' },
    { name: 'Direct Apply', value: 25, color: '#7c3aed' },
    { name: 'Referrals', value: 20, color: '#059669' },
    { name: 'Job Boards', value: 10, color: '#dc2626' }
  ]

  const conversionFunnelData = [
    { stage: 'Applications', count: 1200, percentage: 100 },
    { stage: 'Screening', count: 480, percentage: 40 },
    { stage: 'Interviews', count: 240, percentage: 20 },
    { stage: 'Offers', count: 72, percentage: 6 },
    { stage: 'Hired', count: 48, percentage: 4 }
  ]

  const departmentHiringData = [
    { department: 'Engineering', target: 20, actual: 18, budget: 95000 },
    { department: 'Product', target: 8, actual: 6, budget: 110000 },
    { department: 'Design', target: 5, actual: 4, budget: 85000 },
    { department: 'Data', target: 6, actual: 5, budget: 120000 },
    { department: 'Sales', target: 15, actual: 12, budget: 75000 }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Deep insights into your hiring performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-32"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Time to Hire"
          value="21 days"
          change="-2 days vs last month"
          trend="down"
          icon={Clock}
        />
        <MetricCard
          title="Candidate Satisfaction"
          value="4.2/5"
          change="+0.3 vs last month"
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Offer Acceptance Rate"
          value="78%"
          change="+5% vs last month"
          trend="up"
          icon={Target}
        />
        <MetricCard
          title="Cost Per Hire"
          value="$3,250"
          change="-$200 vs last month"
          trend="down"
          icon={TrendingUp}
        />
      </div>

      {/* Time to Hire by Department */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time to Hire by Department</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeToHireData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="engineering" stroke="#2563eb" strokeWidth={2} />
            <Line type="monotone" dataKey="product" stroke="#7c3aed" strokeWidth={2} />
            <Line type="monotone" dataKey="design" stroke="#059669" strokeWidth={2} />
            <Line type="monotone" dataKey="data" stroke="#dc2626" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Engineering</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Product</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Design</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Data</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Sources */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Sources</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={candidateSourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {candidateSourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {candidateSourceData.map((entry) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}: {entry.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Funnel</h3>
          <div className="space-y-4">
            {conversionFunnelData.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                  <span className="text-sm text-gray-600">{stage.count} ({stage.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Performance Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Hiring Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Target</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actual</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Achievement</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg. Salary</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {departmentHiringData.map((dept) => {
                const achievement = Math.round((dept.actual / dept.target) * 100)
                const statusColor = achievement >= 100 ? 'text-green-600' : achievement >= 80 ? 'text-yellow-600' : 'text-red-600'
                
                return (
                  <tr key={dept.department} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{dept.department}</td>
                    <td className="py-3 px-4 text-gray-600">{dept.target}</td>
                    <td className="py-3 px-4 text-gray-600">{dept.actual}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${Math.min(achievement, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{achievement}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">${dept.budget.toLocaleString()}</td>
                    <td className={`py-3 px-4 font-medium ${statusColor}`}>
                      {achievement >= 100 ? 'On Track' : achievement >= 80 ? 'Behind' : 'Critical'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Screening Insights</h4>
            <p className="text-sm text-blue-800">
              Your AI screening is filtering out 60% of unqualified candidates, saving approximately 24 hours per week in manual review time.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Optimization Suggestion</h4>
            <p className="text-sm text-green-800">
              Consider increasing LinkedIn sourcing for Engineering roles - they show 23% higher offer acceptance rates compared to other sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ElementType
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon: Icon }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-8 w-8 text-primary-500" />
        <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`h-4 w-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
          <span>{change}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  )
}

export default Analytics