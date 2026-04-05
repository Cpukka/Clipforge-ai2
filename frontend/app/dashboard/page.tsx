'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import UploadArea from '@/components/video/UploadArea'
import VideoCard from '@/components/video/VideoCard'
import StatsCard from '@/components/dashboard/StatsCard'
import { api } from '@/lib/api'  // Import the API client
import { 
  VideoCameraIcon, 
  FilmIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlayIcon,
  DocumentTextIcon,
  HashtagIcon,
  ChartBarIcon,
  ArrowPathIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [videos, setVideos] = useState<any[]>([])
  const [clips, setClips] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalClips: 0,
    totalViews: 0,
    totalDownloads: 0,
    processingCount: 0,
    completedCount: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
  }, [status])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAllData()
    }
  }, [status])  // Removed session dependency, using api interceptor instead

  const fetchAllData = async () => {
    try {
      // Fetch videos using the API client (token automatically added)
      const videosRes = await api.get('/api/videos/')
      setVideos(videosRes.data)
      
      // Fetch clips
      const clipsRes = await api.get('/api/clips/')
      setClips(clipsRes.data)
      
      // Calculate stats
      const totalViews = clipsRes.data.reduce((sum: number, clip: any) => sum + (clip.views || 0), 0)
      const totalDownloads = clipsRes.data.reduce((sum: number, clip: any) => sum + (clip.downloads || 0), 0)
      const processingCount = videosRes.data.filter((v: any) => v.status === 'processing').length
      const completedCount = videosRes.data.filter((v: any) => v.status === 'completed').length
      
      setStats({
        totalVideos: videosRes.data.length,
        totalClips: clipsRes.data.length,
        totalViews,
        totalDownloads,
        processingCount,
        completedCount
      })
      
      // Mock trend data (replace with real data from backend)
      setTrendData([
        { day: 'Mon', views: 120, clips: 5 },
        { day: 'Tue', views: 150, clips: 8 },
        { day: 'Wed', views: 180, clips: 12 },
        { day: 'Thu', views: 220, clips: 15 },
        { day: 'Fri', views: 280, clips: 20 },
        { day: 'Sat', views: 350, clips: 25 },
        { day: 'Sun', views: 420, clips: 30 },
      ])
      
      // Recent activity
      const recentVideos = videosRes.data.slice(0, 3).map((v: any) => ({ ...v, type: 'video' }))
      const recentClips = clipsRes.data.slice(0, 3).map((c: any) => ({ ...c, type: 'clip' }))
      setRecentActivity([...recentVideos, ...recentClips].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5))
      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'processing': return <ArrowPathIcon className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'failed': return <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-8 mb-8 border border-theme">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                Welcome back, {session?.user?.email?.split('@')[0] || 'Creator'}! 👋
              </h1>
              <p className="text-secondary">
                Your content is performing well. Keep up the great work!
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/videos"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105"
              >
                <SparklesIcon className="h-5 w-5" />
                Create New Clip
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Videos" 
            value={stats.totalVideos} 
            icon={VideoCameraIcon} 
            trend={`+${Math.floor(stats.totalVideos * 0.12)}%`}
            color="blue" 
          />
          <StatsCard 
            title="Generated Clips" 
            value={stats.totalClips} 
            icon={FilmIcon} 
            trend={`+${Math.floor(stats.totalClips * 0.23)}%`}
            color="purple" 
          />
          <StatsCard 
            title="Total Views" 
            value={stats.totalViews} 
            icon={EyeIcon} 
            trend={`+${Math.floor(stats.totalViews * 0.45)}%`}
            color="green" 
          />
          <StatsCard 
            title="Downloads" 
            value={stats.totalDownloads} 
            icon={ArrowDownTrayIcon} 
            trend={`+${Math.floor(stats.totalDownloads * 0.18)}%`}
            color="yellow" 
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface border border-theme rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted text-sm">Processing Videos</span>
              <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.processingCount}</p>
            <p className="text-xs text-muted mt-1">Currently being processed</p>
          </div>
          <div className="bg-surface border border-theme rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted text-sm">Completed Videos</span>
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.completedCount}</p>
            <p className="text-xs text-muted mt-1">Ready for clip generation</p>
          </div>
          <div className="bg-surface border border-theme rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted text-sm">Engagement Rate</span>
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-primary">
              {stats.totalClips > 0 ? Math.floor((stats.totalViews / stats.totalClips) * 10) / 10 : 0}%
            </p>
            <p className="text-xs text-muted mt-1">Average views per clip</p>
          </div>
        </div>

   {/* Charts Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
  <div className="bg-surface border border-theme rounded-lg p-6">
    <h2 className="text-lg font-semibold text-primary mb-4">Performance Trend</h2>
    <div className="h-80 w-full min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="day" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} name="Views" />
          <Line type="monotone" dataKey="clips" stroke="#8b5cf6" strokeWidth={2} name="Clips Generated" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

          <div className="bg-surface border border-theme rounded-lg p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/videos"
                className="p-4 bg-tertiary rounded-lg hover:bg-surface-hover transition-all group"
              >
                <VideoCameraIcon className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="text-primary font-medium mb-1">Upload Video</h3>
                <p className="text-muted text-sm">Upload new content to repurpose</p>
              </Link>
              <Link
                href="/clips"
                className="p-4 bg-tertiary rounded-lg hover:bg-surface-hover transition-all group"
              >
                <FilmIcon className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="text-primary font-medium mb-1">View Clips</h3>
                <p className="text-muted text-sm">Manage your generated clips</p>
              </Link>
              <Link
                href="/analytics"
                className="p-4 bg-tertiary rounded-lg hover:bg-surface-hover transition-all group"
              >
                <ChartBarIcon className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="text-primary font-medium mb-1">Analytics</h3>
                <p className="text-muted text-sm">Track your performance</p>
              </Link>
              <Link
                href="/settings"
                className="p-4 bg-tertiary rounded-lg hover:bg-surface-hover transition-all group"
              >
                <SparklesIcon className="h-8 w-8 text-yellow-500 mb-2" />
                <h3 className="text-primary font-medium mb-1">AI Settings</h3>
                <p className="text-muted text-sm">Configure AI preferences</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Videos Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-primary">Recent Videos</h2>
              <p className="text-secondary text-sm mt-1">Your latest uploads</p>
            </div>
            <Link 
              href="/videos"
              className="text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          
          {videos.length === 0 ? (
            <div className="bg-surface rounded-lg p-12 text-center border border-theme">
              <VideoCameraIcon className="h-12 w-12 text-muted mx-auto mb-4" />
              <p className="text-secondary mb-2">No videos yet</p>
              <p className="text-muted text-sm">Upload your first video to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.slice(0, 3).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface border border-theme rounded-lg p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? (
              <p className="text-secondary text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-tertiary rounded-lg">
                    {item.type === 'video' ? (
                      <VideoCameraIcon className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FilmIcon className="h-5 w-5 text-purple-500" />
                    )}
                    <div className="flex-1">
                      <p className="text-primary text-sm font-medium">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(item.status || 'completed')}
                        <span className="text-xs text-muted">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={item.type === 'video' ? `/videos/${item.id}` : `/clips/${item.id}`}
                      className="text-blue-500 hover:text-blue-400"
                    >
                      <PlayIcon className="h-5 w-5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface border border-theme rounded-lg p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Pro Tips</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-primary font-medium">AI Captions Boost Engagement</p>
                  <p className="text-muted text-sm">Videos with AI-generated captions get 40% more views</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <HashtagIcon className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-primary font-medium">Use Relevant Hashtags</p>
                  <p className="text-muted text-sm">Our AI suggests trending hashtags for maximum reach</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-primary font-medium">Optimal Video Length</p>
                  <p className="text-muted text-sm">Clips between 15-30 seconds perform best on social media</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <ClockIcon className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-primary font-medium">Post at Peak Times</p>
                  <p className="text-muted text-sm">Schedule your clips for optimal engagement</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-primary mb-4">Upload New Video</h2>
          <UploadArea onUploadComplete={fetchAllData} />
        </div>
      </main>
    </div>
  )
}