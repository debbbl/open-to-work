import React, { useState } from 'react'
import { Upload, Briefcase, Brain, Filter, FileText, Github, Linkedin, Star, Users, Zap } from 'lucide-react'

const Recruit: React.FC = () => {
  const [activeTab, setActiveTab] = useState('jobs')
  const [biasFreeModeEnabled, setBiasFreeModeEnabled] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Recruit Module</h1>
        <p className="text-gray-600">AI-powered job posting and candidate screening</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4">
        <TabButton id="jobs" label="Job Creation" icon={Briefcase} active={activeTab === 'jobs'} />
        <TabButton id="upload" label="Resume Upload" icon={Upload} active={activeTab === 'upload'} />
        <TabButton id="screening" label="AI Screening" icon={Brain} active={activeTab === 'screening'} />
      </div>

      {/* Job Creation Tab */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Creation Form */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Job</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input type="text" className="input-field" placeholder="e.g., Senior Frontend Developer" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select className="input-field">
                  <option>Engineering</option>
                  <option>Product</option>
                  <option>Design</option>
                  <option>Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select className="input-field">
                  <option>Entry Level</option>
                  <option>Mid Level</option>
                  <option>Senior Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                <input type="text" className="input-field" placeholder="React, TypeScript, Node.js" />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">AI Assistant</span>
                </div>
                <p className="text-blue-800 text-sm mb-3">Let AI help you create the perfect job description!</p>
                <button className="btn-primary text-sm">
                  <Zap className="h-4 w-4 mr-1" />
                  Generate Description with AI
                </button>
              </div>

              <button className="btn-primary w-full">Create Job & Auto-Post</button>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Suggestions</h3>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Suggested Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'].map(skill => (
                    <span key={skill} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Recommended Platforms</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">LinkedIn Jobs</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm">Indeed</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">JobStreet</span>
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Market Insights</h4>
                <p className="text-yellow-800 text-sm">
                  💡 Similar roles offer $80k-$120k. Consider competitive compensation to attract top talent.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Upload Tab */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Upload & Parsing</h3>
              
              {/* Upload Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">Bulk Upload</h4>
                  <p className="text-sm text-gray-600 mb-4">Drag & drop PDF resumes</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="btn-primary cursor-pointer">
                    Choose Files
                  </label>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">ATS Integration</h4>
                  <p className="text-sm text-gray-600 mb-4">Connect to Workday, Greenhouse</p>
                  <button className="btn-secondary">
                    Configure API
                  </button>
                </div>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Uploaded Files ({uploadedFiles.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-green-600">✓ Parsed</span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary mt-4">
                    <Brain className="h-4 w-4 mr-2" />
                    Process with AI
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parsing Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={biasFreeModeEnabled}
                    onChange={(e) => setBiasFreeModeEnabled(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Bias-Free Mode</span>
                </label>
                <p className="text-xs text-gray-600 mt-1">Hide name, gender, nationality, photo</p>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 text-sm mb-2">AI Parsing Features</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Extract skills & experience</li>
                  <li>• Education background</li>
                  <li>• Work history timeline</li>
                  <li>• Contact information</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-medium text-purple-900 text-sm mb-2">Social Crawling</h4>
                <p className="text-xs text-purple-800 mb-2">Enhance profiles with:</p>
                <div className="flex items-center space-x-2">
                  <Github className="h-4 w-4" />
                  <Linkedin className="h-4 w-4" />
                  <span className="text-xs">GitHub & LinkedIn data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Screening Tab */}
      {activeTab === 'screening' && (
        <div className="space-y-6">
          {/* Screening Pipeline */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Stage AI Screening Pipeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <h4 className="font-medium text-yellow-900">Fast Filter</h4>
                </div>
                <p className="text-sm text-yellow-800">Remove non-tech resumes</p>
                <div className="mt-2 text-xs text-yellow-700">
                  ✓ 247 processed • ❌ 89 filtered out
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <h4 className="font-medium text-blue-900">Semantic Search</h4>
                </div>
                <p className="text-sm text-blue-800">Match relevant skills</p>
                <div className="mt-2 text-xs text-blue-700">
                  ✓ 158 candidates matched
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <h4 className="font-medium text-green-900">LLM Evaluation</h4>
                </div>
                <p className="text-sm text-green-800">Detailed assessment</p>
                <div className="mt-2 text-xs text-green-700">
                  ✓ 45 candidates evaluated
                </div>
              </div>
            </div>
          </div>

          {/* Top Candidates */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Screened Candidates</h3>
            <div className="space-y-4">
              {[
                { name: 'Candidate #1', score: 95, skills: ['React', 'TypeScript', 'AWS'], experience: '5 years', reasoning: 'Excellent match - has all required tech stack, strong experience in similar roles' },
                { name: 'Candidate #2', score: 87, skills: ['React', 'Node.js', 'Python'], experience: '4 years', reasoning: 'Good fit - strong technical background, missing some specific frameworks but quick learner' },
                { name: 'Candidate #3', score: 82, skills: ['JavaScript', 'React', 'Docker'], experience: '3 years', reasoning: 'Solid candidate - good fundamentals, would benefit from mentoring in advanced concepts' }
              ].map((candidate, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{biasFreeModeEnabled ? candidate.name : `John Smith #${index + 1}`}</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(candidate.score / 20) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-600">{candidate.score}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500">SKILLS</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {candidate.skills.map(skill => (
                          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">EXPERIENCE</span>
                      <p className="text-sm text-gray-700 mt-1">{candidate.experience}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">AI CHECKLIST</span>
                      <div className="text-xs mt-1">
                        <div className="text-green-600">✅ Tech Stack Match</div>
                        <div className="text-green-600">✅ Experience Level</div>
                        <div className="text-yellow-600">⚠ Domain Knowledge</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-xs font-medium text-gray-500">AI REASONING</span>
                    <p className="text-sm text-gray-700 mt-1">{candidate.reasoning}</p>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-3">
                    <button className="btn-secondary text-sm">View Profile</button>
                    <button className="btn-primary text-sm">Move to Interviews</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Recruit
