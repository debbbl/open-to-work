import React, { useCallback, useState } from 'react'
// import { useDropzone } from 'react-dropzone'
import { Upload, File, CheckCircle, X } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  status: 'uploading' | 'completed' | 'error'
}

const ResumeUploader: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading' as const
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Simulate upload process
    newFiles.forEach(file => {
      setTimeout(() => {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === file.id ? { ...f, status: 'completed' } : f
          )
        )
      }, 2000 + Math.random() * 3000)
    })
  }, [])

  // Simplified file input without react-dropzone for now
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    onDrop(files)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 hover:bg-gray-50 transition-all duration-200"
      >
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileInput}
          className="hidden"
          id="resume-upload"
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Upload resumes here
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Click to browse files (PDF, DOC, DOCX)
        </p>
        <label htmlFor="resume-upload" className="btn-primary cursor-pointer">
          Browse Files
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h3>
          <div className="space-y-2">
            {uploadedFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.status === 'uploading' && (
                    <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
                  )}
                  {file.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <div className="h-5 w-5 bg-red-500 rounded-full" />
                  )}
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeUploader