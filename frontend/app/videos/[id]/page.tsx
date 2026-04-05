'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { api } from '@/lib/api'
import { 
  ArrowLeftIcon, 
  ArrowDownTrayIcon,
  FilmIcon,
  ClockIcon,
  SparklesIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Video {
  id: number
  title: string
  description: string
  filename: string
  file_size: number
  duration: number
  s3_url: string
  status: string
  processing_progress: number
  created_at: string
}

interface Clip {
  id: number
  title: string
  s3_url: string
  platform: string
  duration: number
  views: number
  downloads: number
  created_at: string
}

export default function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [clips, setClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchVideo()
      fetchClips()
    }
  }, [status, id])

  const fetchVideo = async () => {
    try {
      const response = await api.get(`/api/videos/${id}`)
      setVideo(response.data)
    } catch (error) {
      console.error('Error fetching video:', error)
      toast.error('Failed to load video')
    }
  }

  const fetchClips = async () => {
    try {
      const response = await api.get(`/api/clips/?video_id=${id}`)
      setClips(response.data)
    } catch (error) {
      console.error('Error fetching clips:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePlatformClip = async (platform: string) => {
    setGenerating(true)
    toast.loading(`Generating ${platform} clip...`, { id: 'clip-gen' })
    
    try {
      const response = await api.post(`/api/videos/${id}/generate-clip`, {
        platform: platform,
        duration: 30
      })
      
      if (response.data) {
        toast.success(`${platform} clip generated!`, { id: 'clip-gen' })
        fetchClips()
      }
    } catch (error: any) {
      console.error('Error generating clip:', error)
      toast.error(error.response?.data?.detail || 'Failed to generate clip', { id: 'clip-gen' })
    } finally {
      setGenerating(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10'
      case 'processing': return 'text-yellow-500 bg-yellow-500/10'
      case 'failed': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'processing': return 'Processing...'
      case 'failed': return 'Failed'
      default: return 'Pending'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-secondary">Video not found</p>
            <Link href="/videos" className="text-blue-500 hover:text-blue-400 mt-4 inline-block">
              Back to Videos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          href="/videos"
          className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Videos
        </Link>

        {/* Video Player Section - Native HTML5 Video */}
        <div className="bg-surface rounded-lg overflow-hidden border border-theme mb-8">
          <div className="aspect-video bg-black">
            <video
              controls
              className="w-full h-full"
              src={video.s3_url}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              controlsList="nodownload"
            >
              <source src={video.s3_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-primary mb-2">{video.title}</h1>
                {video.description && (
                  <p className="text-secondary">{video.description}</p>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(video.status)}`}>
                {getStatusText(video.status)}
              </div>
            </div>
            
            {/* Video Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-theme">
              <div>
                <p className="text-muted text-sm">Duration</p>
                <p className="text-primary font-medium">{formatDuration(video.duration)}</p>
              </div>
              <div>
                <p className="text-muted text-sm">File Size</p>
                <p className="text-primary font-medium">{formatFileSize(video.file_size)}</p>
              </div>
              <div>
                <p className="text-muted text-sm">Uploaded</p>
                <p className="text-primary font-medium">{formatDate(video.created_at)}</p>
              </div>
              <div>
                <p className="text-muted text-sm">Processing Progress</p>
                {video.status === 'processing' ? (
                  <div className="mt-1">
                    <div className="w-full bg-tertiary rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${video.processing_progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted mt-1">{video.processing_progress}%</p>
                  </div>
                ) : (
                  <p className="text-primary font-medium">{getStatusText(video.status)}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Clips Section - Platform Buttons */}
        <div className="bg-surface border border-theme rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-primary mb-4">Generate Clips</h2>
          <p className="text-secondary text-sm mb-4">
            Create short-form clips for different social media platforms
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => generatePlatformClip('tiktok')}
              disabled={generating}
              className="px-4 py-2 bg-black text-white rounded-lg capitalize transition-colors hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
            >
              <SparklesIcon className="h-4 w-4" />
              Generate TikTok Clip
            </button>
            <button
              onClick={() => generatePlatformClip('instagram')}
              disabled={generating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg capitalize transition-colors hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
            >
              <SparklesIcon className="h-4 w-4" />
              Generate Instagram Reel
            </button>
            <button
              onClick={() => generatePlatformClip('youtube')}
              disabled={generating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg capitalize transition-colors hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
            >
              <SparklesIcon className="h-4 w-4" />
              Generate YouTube Short
            </button>
          </div>
        </div>

        {/* Generated Clips Section */}
        {clips.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-primary">Generated Clips</h2>
                <p className="text-secondary text-sm mt-1">
                  Ready for social media
                </p>
              </div>
              <Link
                href="/clips"
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                View All Clips →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clips.map((clip) => (
                <div key={clip.id} className="bg-surface border border-theme rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-[9/16] bg-tertiary relative">
                    <video
                      className="w-full h-full object-cover"
                      src={clip.s3_url}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
                      <PlayIcon className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-black/75 text-white capitalize">
                      {clip.platform}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-primary font-medium mb-2 truncate">{clip.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted">
                      <span>{formatDuration(clip.duration)}</span>
                      <a
                        href={clip.s3_url}
                        download
                        className="text-blue-500 hover:text-blue-400 flex items-center gap-1"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State - No Clips */}
        {clips.length === 0 && (
          <div className="text-center py-12 bg-surface border border-theme rounded-lg">
            <FilmIcon className="h-12 w-12 text-muted mx-auto mb-4" />
            <p className="text-secondary mb-2">No clips generated yet</p>
            <p className="text-muted text-sm">Click a button above to generate your first clip</p>
          </div>
        )}
      </main>
    </div>
  )
}