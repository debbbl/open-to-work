import React, { useState, useEffect } from 'react'
import { FileText, DollarSign, Calendar, TrendingUp, Clock, CheckCircle, XCircle, Brain, Zap, BarChart3, Edit, Send, Eye, Loader2 } from 'lucide-react'
import { Offer, Candidate } from '../types'
import { offersAPI, candidatesAPI } from '../services/api'

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('automation')
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  
  // AI Offer Generation State
  const [generatedOfferLetter, setGeneratedOfferLetter] = useState<any>(null)
  const [generatingOffer, setGeneratingOffer] = useState(false)
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null)
  const [analyzingMarket, setAnalyzingMarket] = useState(false)
  const [offerFormData, setOfferFormData] = useState({
    candidateName: '',
    position: '',
    salary: '',
    startDate: '',
    location: '',
    department: 'Engineering'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersData, candidatesData] = await Promise.all([
          offersAPI.getAll(),
          candidatesAPI.getAll()
        ])
        setOffers(offersData)
        setCandidates(candidatesData)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Use mock data for demo
        setOffers(mockOffers)
        setCandidates(mockCandidates)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const generateAIOfferLetter = async () => {
    if (!offerFormData.candidateName || !offerFormData.position || !offerFormData.salary) {
      alert('Please fill in candidate name, position, and salary')
      return
    }

    setGeneratingOffer(true)
    try {
      const candidateInfo = {
        name: offerFormData.candidateName,
        position: offerFormData.position,
        skills: ['React', 'TypeScript'], // Mock skills
        experience: 5
      }

      const positionDetails = {
        title: offerFormData.position,
        department: offerFormData.department,
        start_date: offerFormData.startDate || '2024-03-01',
        location: offerFormData.location || 'San Francisco, CA',
        reports_to: 'Engineering Manager'
      }

      const compensation = {
        base_salary: parseInt(offerFormData.salary),
        equity_shares: 1000,
        signing_bonus: 5000,
        bonus_percentage: 10
      }

      const companyInfo = {
        name: 'TechCorp Inc.'
      }

      // Simulate AI processing with mock data for demo
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      const mockOfferLetter = getMockOfferLetter()
      setGeneratedOfferLetter(mockOfferLetter)
    } catch (error) {
      console.error('Error generating offer letter:', error)
      // Fallback to mock offer letter
      setGeneratedOfferLetter(getMockOfferLetter())
    } finally {
      setGeneratingOffer(false)
    }
  }

  const analyzeMarketCompensation = async () => {
    if (!offerFormData.position || !offerFormData.location) {
      alert('Please fill in position and location')
      return
    }

    setAnalyzingMarket(true)
    try {
      // Simulate AI processing with mock data for demo
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockMarketData = getMockMarketData()
      setMarketAnalysis(mockMarketData)
    } catch (error) {
      console.error('Error analyzing market:', error)
      // Fallback to mock market data
      setMarketAnalysis(getMockMarketData())
    } finally {
      setAnalyzingMarket(false)
    }
  }

  const getMockOfferLetter = () => {
    return {
      content: `Dear ${offerFormData.candidateName},

We are pleased to offer you the position of ${offerFormData.position} with TechCorp Inc.

POSITION DETAILS:
• Title: ${offerFormData.position}
• Department: ${offerFormData.department}
• Start Date: ${offerFormData.startDate}
• Location: ${offerFormData.location}

COMPENSATION PACKAGE:
• Annual Base Salary: $${parseInt(offerFormData.salary).toLocaleString()}
• Stock Options: 1,000 shares
• Benefits: Health, dental, vision insurance, 401k matching

We look forward to your acceptance of this offer.

Sincerely,
TechCorp Hiring Team`,
      generated_at: new Date().toISOString(),
      status: 'generated',
      format: 'full_letter',
      fallback: true
    }
  }

  const getMockMarketData = () => {
    const baseSalary = parseInt(offerFormData.salary) || 125000
    return {
      market_average: { min: Math.round(baseSalary * 0.85), max: Math.round(baseSalary * 1.15) },
      competitive_range: { min: Math.round(baseSalary * 0.9), max: Math.round(baseSalary * 1.25) },
      top_tier: { min: Math.round(baseSalary * 1.15), max: Math.round(baseSalary * 1.45) },
      recommendations: [
        'Offer within competitive range to ensure acceptance',
        'Consider equity package for total compensation appeal'
      ],
      trends: [
        'Frontend developer salaries trending up 8% this year',
        'San Francisco market showing strong demand'
      ],
      fallback: true
    }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Offer Module</h1>
        <p className="text-gray-600">AI-powered offer letter automation and compensation benchmarking</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4">
        <TabButton id="automation" label="Letter Automation" icon={FileText} active={activeTab === 'automation'} />
        <TabButton id="benchmarking" label="Compensation" icon={BarChart3} active={activeTab === 'benchmarking'} />
        <TabButton id="tracking" label="Offer Tracking" icon={TrendingUp} active={activeTab === 'tracking'} />
      </div>

      {/* Letter Automation Tab */}
      {activeTab === 'automation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Auto-filled Templates */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-filled Offer Templates</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter candidate name"
                  value={offerFormData.candidateName}
                  onChange={(e) => setOfferFormData(prev => ({ ...prev, candidateName: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Senior Frontend Developer"
                  value={offerFormData.position}
                  onChange={(e) => setOfferFormData(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Salary</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g., 130000"
                  value={offerFormData.salary}
                  onChange={(e) => setOfferFormData(prev => ({ ...prev, salary: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={offerFormData.startDate}
                  onChange={(e) => setOfferFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., San Francisco, CA"
                  value={offerFormData.location}
                  onChange={(e) => setOfferFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Standard Offer', 'Senior Role', 'Remote Position', 'Equity Heavy'].map(type => (
                    <button key={type} className="p-2 text-sm border rounded hover:bg-gray-50 text-left">
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">AI Template Generator</span>
                </div>
                <p className="text-blue-800 text-sm mb-3">Generate personalized offer letter based on role, location, and candidate profile</p>
                <button 
                  className="btn-primary text-sm w-full"
                  onClick={generateAIOfferLetter}
                  disabled={generatingOffer || !offerFormData.candidateName || !offerFormData.position}
                >
                  {generatingOffer ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-1" />
                      Generate Offer Letter
                    </>
                  )}
                </button>
              </div>

              {selectedCandidate && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Auto-filled Details</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <div><strong>Role:</strong> Senior Frontend Developer</div>
                    <div><strong>Department:</strong> Engineering</div>
                    <div><strong>Start Date:</strong> February 15, 2024</div>
                    <div><strong>Reporting To:</strong> Engineering Manager</div>
                    <div><strong>Location:</strong> San Francisco, CA (Hybrid)</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Template Preview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              AI-Generated Offer Letter
              {generatedOfferLetter && (
                <span className="ml-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Generated {generatedOfferLetter.fallback ? '(Fallback)' : 'with AI'}
                </span>
              )}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 h-80 overflow-y-auto text-sm">
              {generatingOffer ? (
                <div className="text-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <p className="text-gray-600">AI is generating your personalized offer letter...</p>
                </div>
              ) : generatedOfferLetter ? (
                <div className="whitespace-pre-line">
                  {generatedOfferLetter.content}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-20">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Fill in the form and click "Generate Offer Letter" to create an AI-powered offer</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button className="btn-secondary flex-1 text-sm">
                <Edit className="h-4 w-4 mr-1" />
                Customize
              </button>
              <button className="btn-primary flex-1 text-sm">
                <Send className="h-4 w-4 mr-1" />
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compensation Benchmarking Tab */}
      {activeTab === 'benchmarking' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Data Input */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Compensation Insights</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Senior Frontend Developer"
                  value={offerFormData.position}
                  onChange={(e) => setOfferFormData(prev => ({ ...prev, position: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="San Francisco, CA"
                  value={offerFormData.location}
                  onChange={(e) => setOfferFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select className="input-field">
                  <option>3-5 years</option>
                  <option>5-7 years</option>
                  <option>7+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                <select className="input-field">
                  <option>Startup (1-50)</option>
                  <option>Mid-size (51-500)</option>
                  <option>Large (500+)</option>
                </select>
              </div>

              <button 
                className="btn-primary w-full"
                onClick={analyzeMarketCompensation}
                disabled={analyzingMarket || !offerFormData.position || !offerFormData.location}
              >
                {analyzingMarket ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get Market Data
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Market Insights */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                AI Market Compensation Analysis
                {marketAnalysis && (
                  <span className="ml-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Analysis {marketAnalysis.fallback ? '(Fallback)' : 'Complete'}
                  </span>
                )}
              </h3>
              {analyzingMarket ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <p className="text-gray-600">AI is analyzing market compensation data...</p>
                </div>
              ) : marketAnalysis ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        ${Math.round((marketAnalysis.market_average.min + marketAnalysis.market_average.max) / 2 / 1000)}K
                      </div>
                      <div className="text-sm text-blue-800">Market Average</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${Math.round(marketAnalysis.competitive_range.min / 1000)}K - ${Math.round(marketAnalysis.competitive_range.max / 1000)}K
                      </div>
                      <div className="text-sm text-green-800">Competitive Range</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        ${Math.round(marketAnalysis.top_tier.max / 1000)}K
                      </div>
                      <div className="text-sm text-purple-800">Top 75th Percentile</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Fill in job title and location, then click "Get Market Data" for AI-powered analysis</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Base Salary Range</span>
                    <span>$105K - $155K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Total Compensation</span>
                    <span>$120K - $180K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Equity Value</span>
                    <span>$15K - $35K</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {marketAnalysis ? (
                  marketAnalysis.recommendations?.map((rec: string, index: number) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-900">AI Insight</span>
                      </div>
                      <p className="text-sm text-green-800">{rec}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Brain className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-600">AI Analysis Pending</span>
                      </div>
                      <p className="text-sm text-gray-600">Run market analysis to get personalized recommendations</p>
                    </div>
                  </>
                )}

                {marketAnalysis?.trends && (
                  marketAnalysis.trends.map((trend: string, index: number) => (
                    <div key={`trend-${index}`} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Market Trend</span>
                      </div>
                      <p className="text-sm text-blue-800">{trend}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offer Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {/* Status Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-orange-600">6</div>
              <div className="text-sm text-gray-600">Pending Offers</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-red-600">1</div>
              <div className="text-sm text-gray-600">Declined</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-gray-600">2</div>
              <div className="text-sm text-gray-600">Expired</div>
            </div>
          </div>

          {/* Offers Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Status Tracking</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Candidate</th>
                    <th className="text-left py-2">Position</th>
                    <th className="text-left py-2">Salary</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Sent Date</th>
                    <th className="text-left py-2">Expires</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'John Smith', position: 'Frontend Developer', salary: '$130,000', status: 'pending', sent: '2024-01-20', expires: '2024-01-27', daysLeft: 3 },
                    { name: 'Sarah Wilson', position: 'Product Manager', salary: '$115,000', status: 'accepted', sent: '2024-01-18', expires: '2024-01-25', daysLeft: 0 },
                    { name: 'Mike Johnson', position: 'Data Scientist', salary: '$140,000', status: 'pending', sent: '2024-01-19', expires: '2024-01-26', daysLeft: 2 },
                    { name: 'Lisa Chen', position: 'UX Designer', salary: '$95,000', status: 'declined', sent: '2024-01-15', expires: '2024-01-22', daysLeft: 0 },
                  ].map((offer, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 font-medium">{offer.name}</td>
                      <td className="py-3">{offer.position}</td>
                      <td className="py-3 font-medium">{offer.salary}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          offer.status === 'declined' ? 'bg-red-100 text-red-800' :
                          offer.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="py-3">{offer.sent}</td>
                      <td className="py-3">
                        <div className="flex items-center space-x-1">
                          <span>{offer.expires}</span>
                          {offer.daysLeft > 0 && (
                            <span className="text-xs text-orange-600">({offer.daysLeft}d left)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex space-x-1">
                          <button className="text-blue-600 hover:text-blue-800 text-xs">
                            <Eye className="h-3 w-3" />
                          </button>
                          {offer.status === 'pending' && (
                            <button className="text-green-600 hover:text-green-800 text-xs">
                              <Send className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Offer Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acceptance Rate Trends</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Month</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quarter Avg</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time to Decision</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Response Time</span>
                  <span className="text-sm font-medium">3.2 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fastest Acceptance</span>
                  <span className="text-sm font-medium">Same day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Longest Pending</span>
                  <span className="text-sm font-medium">5 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Offers Expiring Soon</span>
                  <span className="text-sm font-medium text-orange-600">2 offers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mock data for demo
const mockOffers = [
  {
    id: '1',
    candidateId: '1',
    jobId: '1',
    salary: 130000,
    currency: 'USD',
    benefits: ['Health Insurance', 'Stock Options', '401k'],
    startDate: '2024-02-15',
    status: 'pending' as const,
    createdDate: '2024-01-20',
    expiryDate: '2024-01-27'
  }
]

const mockCandidates = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    position: 'Senior Frontend Developer',
    experience: 5,
    skills: ['React', 'TypeScript', 'Node.js'],
    stage: 'offer' as const,
    aiScore: 4,
    appliedDate: '2024-01-15',
    status: 'active' as const,
    source: 'linkedin' as const
  }
]

export default Offers
