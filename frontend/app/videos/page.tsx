'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import VideoCard from '@/components/video/VideoCard'
import { api } from '@/lib/api'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  VideoCameraIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function VideosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchVideos()
    }
  }, [status])

  const fetchVideos = async () => {
    try {
      const response = await api.get('/api/videos/')
      setVideos(response.data)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">My Videos</h1>
          <p className="text-secondary mt-2">Manage and process your uploaded videos</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-theme rounded-lg text-primary focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-surface border border-theme rounded-lg text-primary focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button 
            onClick={fetchVideos}
            className="px-4 py-2 bg-surface border border-theme rounded-lg text-secondary hover:text-primary hover:border-blue-500 transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <VideoCameraIcon className="h-12 w-12 text-muted mx-auto mb-4" />
            <p className="text-secondary mb-2">No videos found</p>
            {searchTerm || filterStatus !== 'all' ? (
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('all')
                }}
                className="text-blue-500 hover:text-blue-400"
              >
                Clear filters
              </button>
            ) : (
              <Link 
                href="/dashboard"
                className="text-blue-500 hover:text-blue-400"
              >
                Upload your first video
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}