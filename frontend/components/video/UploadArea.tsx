'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import toast from 'react-hot-toast'

// Set the base URL for API calls
const API_BASE_URL = 'http://localhost:8000'

interface UploadAreaProps {
  onUploadComplete?: () => void
}

export default function UploadArea({ onUploadComplete }: UploadAreaProps) {
  const { data: session } = useSession()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      uploadFile(file)
    }
  }, [session])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov', '.MOV'],
      'video/mpeg': ['.mpeg', '.mpg'],
      'video/webm': ['.webm'],
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    maxFiles: 1,
  })

  const uploadFile = async (file: File) => {
    console.log('Session in upload:', session)
    console.log('Access token:', session?.accessToken)
    
    if (!session?.accessToken) {
      toast.error('Please login to upload videos')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)

    try {
      console.log('Uploading file:', file.name, 'Size:', file.size)
      
      const response = await axios.post(`${API_BASE_URL}/api/videos/upload`, formData, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setProgress(percentCompleted)
          }
        },
      })

      console.log('Upload response:', response.data)
      toast.success('Video uploaded successfully! Processing has started.')
      setFile(null)
      setProgress(0)
      onUploadComplete?.()
      
    } catch (error: any) {
      console.error('Upload error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.detail || 'Invalid file type or size')
      } else if (error.response?.status === 413) {
        toast.error('File too large. Max size is 500MB')
      } else {
        toast.error(error.response?.data?.detail || 'Upload failed. Please try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  const cancelUpload = () => {
    setFile(null)
    setProgress(0)
    setUploading(false)
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-theme hover:border-blue-500 hover:bg-surface-hover'
          }
        `}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="h-12 w-12 text-muted mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-blue-500">Drop the video here...</p>
        ) : (
          <div>
            <p className="text-primary mb-2">
              Drag & drop a video here, or click to select
            </p>
            <p className="text-muted text-sm">
              Supports MP4, MOV, MPEG, WebM (Max 500MB)
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {file && uploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-4 bg-surface border border-theme rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-sm text-primary truncate">{file.name}</span>
                <span className="text-xs text-muted">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                onClick={cancelUpload}
                className="text-muted hover:text-red-500 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="w-full bg-tertiary rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-right text-xs text-muted mt-1">{progress}%</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}