'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import axios from 'axios'
import {
  VideoCameraIcon,
  FilmIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

/* ================= TYPES ================= */

type PlatformView = {
  name: string
  value: number
  color: string
}

type ViewByDay = {
  day: string
  views: number
  clips: number
}

type ClipType = {
  id: number
  title: string
  platform: string
  duration: number
  views?: number
  downloads?: number
}

type AnalyticsType = {
  totalVideos: number
  totalClips: number
  totalViews: number
  totalDownloads: number
  viewsByPlatform: PlatformView[]
  viewsByDay: ViewByDay[]
  topPerformingClips: ClipType[]
}

/* ================= COMPONENT ================= */

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [analytics, setAnalytics] = useState<AnalyticsType>({
    totalVideos: 0,
    totalClips: 0,
    totalViews: 0,
    totalDownloads: 0,
    viewsByPlatform: [],
    viewsByDay: [],
    topPerformingClips: []
  })

  /* ================= AUTH ================= */

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  /* ================= FETCH ================= */

  const fetchAnalytics = async () => {
    try {
      const videosRes = await axios.get('http://localhost:8000/api/videos/', {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      })

      const clipsRes = await axios.get('http://localhost:8000/api/clips/', {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      })

      const clips: ClipType[] = clipsRes.data

      /* ===== Stats ===== */
      const totalViews = clips.reduce((sum, clip) => sum + (clip.views || 0), 0)
      const totalDownloads = clips.reduce((sum, clip) => sum + (clip.downloads || 0), 0)

      /* ===== Platform grouping ===== */
      const platformViews: Record<string, number> = {}

      clips.forEach((clip) => {
        platformViews[clip.platform] =
          (platformViews[clip.platform] || 0) + (clip.views || 0)
      })

      const viewsByPlatform: PlatformView[] = Object.entries(platformViews).map(
        ([name, value]) => ({
          name,
          value,
          color:
            name === 'tiktok'
              ? '#000000'
              : name === 'instagram'
              ? '#E4405F'
              : '#FF0000'
        })
      )

      /* ===== Mock chart data ===== */
      const viewsByDay: ViewByDay[] = [
        { day: 'Mon', views: 120, clips: 5 },
        { day: 'Tue', views: 150, clips: 8 },
        { day: 'Wed', views: 180, clips: 12 },
        { day: 'Thu', views: 220, clips: 15 },
        { day: 'Fri', views: 280, clips: 20 },
        { day: 'Sat', views: 350, clips: 25 },
        { day: 'Sun', views: 420, clips: 30 },
      ]

      /* ===== Top clips ===== */
      const topPerformingClips: ClipType[] = [...clips]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)

      /* ===== Set state ===== */
      setAnalytics({
        totalVideos: videosRes.data.length,
        totalClips: clips.length,
        totalViews,
        totalDownloads,
        viewsByPlatform,
        viewsByDay,
        topPerformingClips
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchAnalytics()
    }
  }, [status, session])

  const COLORS = ['#000000', '#E4405F', '#FF0000', '#3b82f6', '#10b981']

  /* ================= LOADING ================= */

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Analytics Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Stat title="Videos" value={analytics.totalVideos} icon={VideoCameraIcon} />
          <Stat title="Clips" value={analytics.totalClips} icon={FilmIcon} />
          <Stat title="Views" value={analytics.totalViews} icon={EyeIcon} />
          <Stat title="Downloads" value={analytics.totalDownloads} icon={ArrowDownTrayIcon} />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Pie */}
          <div className="bg-surface p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-primary">
              Views by Platform
            </h2>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics.viewsByPlatform} dataKey="value">
                  {analytics.viewsByPlatform.map((entry, index) => (
                    <Cell key={index} fill={entry.color || COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line */}
          <div className="bg-surface p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-primary">
              Views Over Time
            </h2>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.viewsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clips */}
        <div className="bg-surface p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-primary">
            Top Performing Clips
          </h2>

          {analytics.topPerformingClips.length === 0 ? (
            <p>No clips yet</p>
          ) : (
            analytics.topPerformingClips.map((clip, index) => (
              <div key={clip.id} className="flex justify-between py-3 border-b border-gray-700">
                <div>
                  <p className="text-primary">{clip.title}</p>
                  <small className="text-muted">{clip.platform}</small>
                </div>
                <div className="text-right">
                  <p>{clip.views || 0} views</p>
                  <p>{clip.downloads || 0} downloads</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

/* ================= SMALL COMPONENT ================= */

function Stat({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-surface p-4 rounded-lg flex justify-between items-center">
      <div>
        <p className="text-muted text-sm">{title}</p>
        <p className="text-xl font-bold text-primary">{value}</p>
      </div>
      <Icon className="h-6 w-6 text-blue-500" />
    </div>
  )
}