'use client'

import { FilmIcon, ArrowDownTrayIcon, HashtagIcon, DocumentTextIcon, ShareIcon, PlayIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface ClipCardProps {
  clip: {
    id: number
    title: string
    s3_url: string
    platform: string
    duration: number
    views: number
    downloads: number
    created_at: string
    captions?: {
      content: string
      hashtags: string[]
      title: string
    }
  }
}

export default function ClipCard({ clip }: ClipCardProps) {
  const [showCaptions, setShowCaptions] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = clip.s3_url
    link.download = `${clip.title}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Download started!')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(clip.s3_url)
    toast.success('Link copied to clipboard!')
  }

  const copyHashtags = () => {
    if (clip.captions?.hashtags) {
      const hashtags = clip.captions.hashtags.map(tag => `#${tag}`).join(' ')
      navigator.clipboard.writeText(hashtags)
      toast.success('Hashtags copied!')
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'tiktok': return 'bg-black text-white'
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      case 'youtube': return 'bg-red-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-surface border border-theme rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Video Player - Using native video element instead of ReactPlayer */}
      <div className="relative aspect-[9/16] bg-tertiary">
        <video
          src={clip.s3_url}
          controls
          className="w-full h-full object-cover"
          poster={clip.s3_url}
        />
        
        {/* Play overlay when not playing */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer hover:bg-black/50 transition-all"
            onClick={() => setIsPlaying(true)}
          >
            <PlayIcon className="h-12 w-12 text-white opacity-80" />
          </div>
        )}
        
        {/* Platform Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getPlatformColor(clip.platform)}`}>
          {clip.platform}
        </div>
      </div>
      
      <div className="p-4">
        {/* Title and Stats */}
        <div className="mb-3">
          <h3 className="text-primary font-semibold mb-1 line-clamp-2">{clip.title}</h3>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{formatDuration(clip.duration)}</span>
            <span>{clip.views} views</span>
            <span>{clip.downloads} downloads</span>
          </div>
        </div>
        
        {/* AI Captions Section */}
        {clip.captions && (
          <div className="mt-3">
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
            >
              <DocumentTextIcon className="h-4 w-4" />
              {showCaptions ? 'Hide AI Captions' : 'Show AI Captions'}
            </button>
            
            {showCaptions && (
              <div className="mt-2 space-y-2 animate-fade-in">
                <p className="text-sm text-secondary bg-tertiary p-2 rounded">
                  {clip.captions.content}
                </p>
                <div className="flex items-center justify-between">
                  <button
                    onClick={copyHashtags}
                    className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                  >
                    <HashtagIcon className="h-3 w-3" />
                    Copy Hashtags
                  </button>
                  <span className="text-xs text-muted">
                    {clip.captions.hashtags?.length} hashtags
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-theme">
          <button
            onClick={handleDownload}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={handleShare}
            className="px-3 py-2 bg-tertiary hover:bg-surface-hover text-secondary rounded-lg transition-colors"
          >
            <ShareIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}