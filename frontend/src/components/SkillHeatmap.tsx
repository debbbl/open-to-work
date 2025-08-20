import React from 'react'

interface Skill {
  name: string
  required: boolean
  match: number // 0-100 percentage
  weight: number // 1-5 importance
}

interface SkillHeatmapProps {
  skills: Skill[]
  candidateName: string
}

const SkillHeatmap: React.FC<SkillHeatmapProps> = ({ skills, candidateName }) => {
  const getHeatmapColor = (match: number) => {
    if (match >= 80) return 'bg-green-500'
    if (match >= 60) return 'bg-yellow-500'
    if (match >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getIntensity = (match: number) => {
    const intensity = Math.floor(match / 20) + 1
    return Math.min(intensity, 5)
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Skill Match Analysis - {candidateName}
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        {skills.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{skill.name}</span>
                {skill.required && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                    Required
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  Weight: {skill.weight}/5
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {skill.match}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getHeatmapColor(skill.match)}`}
                style={{ width: `${skill.match}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        i < getIntensity(skill.match) ? 'bg-white' : 'bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Overall Match Score</h4>
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
              style={{ width: `${skills.reduce((acc, skill) => acc + skill.match, 0) / skills.length}%` }}
            />
          </div>
          <span className="text-lg font-bold text-gray-900">
            {Math.round(skills.reduce((acc, skill) => acc + skill.match, 0) / skills.length)}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default SkillHeatmap