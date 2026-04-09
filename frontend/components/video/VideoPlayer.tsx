'use client'

import { useRef, useState } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

interface VideoPlayerProps {
  url: string
  title: string
  onDownload?: () => void
}

export default function VideoPlayer({ url, title, onDownload }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [progress, setProgress] = useState(0)

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = videoRef.current.currentTime / videoRef.current.duration
      setProgress(currentProgress || 0)
    }
  }

  return (
    <div className="bg-surface rounded-lg overflow-hidden border border-theme">
      <div className="aspect-video bg-black">
        <video
          ref={videoRef}
          src={url}
          controls
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          controlsList="nodownload"
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
          </div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Download
            </button>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-tertiary rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}