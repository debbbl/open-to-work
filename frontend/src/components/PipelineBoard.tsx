import React from 'react'
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { User, Calendar, Star } from 'lucide-react'
import { Candidate } from '../types'

interface PipelineBoardProps {
  candidates: Candidate[]
  onCandidateMove: (candidateId: string, newStage: string) => void
}

const stages = [
  { id: 'screening', title: 'Screening', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'interviewing', title: 'Interviewing', color: 'bg-blue-100 border-blue-300' },
  { id: 'offer', title: 'Offer', color: 'bg-purple-100 border-purple-300' },
  { id: 'hired', title: 'Hired', color: 'bg-green-100 border-green-300' }
]

const PipelineBoard: React.FC<PipelineBoardProps> = ({ candidates, onCandidateMove }) => {
  // Temporarily disable drag and drop for initial setup
  // const handleDragEnd = (result: any) => {
  //   if (!result.destination) return
  //   
  //   const candidateId = result.draggableId
  //   const newStage = result.destination.droppableId
  //   
  //   onCandidateMove(candidateId, newStage)
  // }

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter(candidate => candidate.stage === stage)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {stages.map((stage) => (
        <div key={stage.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{stage.title}</h3>
            <span className="bg-white text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border">
              {getCandidatesByStage(stage.id).length}
            </span>
          </div>
          
          <div className="min-h-[400px] space-y-3">
            {getCandidatesByStage(stage.id).map((candidate, index) => (
              <div
                key={candidate.id}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                  <div className="flex items-center">
                    {Array.from({ length: candidate.aiScore }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{candidate.position}</p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{candidate.experience}y exp</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{candidate.appliedDate}</span>
                  </div>
                </div>
                
                {candidate.skills && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                {/* Stage change buttons */}
                <div className="mt-3 flex space-x-2">
                  {stages.map((targetStage) => {
                    if (targetStage.id === stage.id) return null
                    return (
                      <button
                        key={targetStage.id}
                        onClick={() => onCandidateMove(candidate.id, targetStage.id)}
                        className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
                      >
                        → {targetStage.title}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PipelineBoard