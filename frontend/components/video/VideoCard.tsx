'use client'

import { FilmIcon, ClockIcon, PlayIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useState } from 'react'

interface VideoCardProps {
  video: {
    id: number
    title: string
    thumbnail_url?: string
    duration: number
    status: string  // pending, processing, completed, failed
    created_at: string
  }
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10'
      case 'processing': return 'text-yellow-500 bg-yellow-500/10'
      case 'failed': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  return (
    <Link href={`/videos/${video.id}`}>
      <div 
        className="bg-surface border border-theme rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-video bg-tertiary">
          {video.thumbnail_url ? (
            <img 
              src={video.thumbnail_url} 
              alt={video.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FilmIcon className="h-12 w-12 text-muted" />
            </div>
          )}
          
          {/* Duration Badge */}
          {video.duration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {formatDuration(video.duration)}
            </div>
          )}
          
          {/* Play Overlay on Hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <PlayIcon className="h-12 w-12 text-white" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(video.status)}`}>
            {video.status}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-primary font-medium truncate">{video.title}</h3>
          <div className="flex items-center justify-between mt-2 text-sm text-muted">
            <span>{new Date(video.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}