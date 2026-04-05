'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import ClipCard from '@/components/video/ClipCard'
import axios from 'axios'
import { MagnifyingGlassIcon, FunnelIcon, FilmIcon } from '@heroicons/react/24/outline'

export default function ClipsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clips, setClips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchClips()
    }
  }, [status, session])

  const fetchClips = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/clips/', {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      })
      setClips(response.data)
    } catch (error) {
      console.error('Error fetching clips:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClips = clips.filter(clip => {
    const matchesSearch = clip.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = filterPlatform === 'all' || clip.platform === filterPlatform
    return matchesSearch && matchesPlatform
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
          <h1 className="text-3xl font-bold text-primary">My Clips</h1>
          <p className="text-secondary mt-2">AI-generated short clips ready for social media</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-theme rounded-lg p-4">
            <p className="text-muted text-sm">Total Clips</p>
            <p className="text-2xl font-bold text-primary">{clips.length}</p>
          </div>
          <div className="bg-surface border border-theme rounded-lg p-4">
            <p className="text-muted text-sm">Total Views</p>
            <p className="text-2xl font-bold text-primary">
              {clips.reduce((sum, clip) => sum + (clip.views || 0), 0)}
            </p>
          </div>
          <div className="bg-surface border border-theme rounded-lg p-4">
            <p className="text-muted text-sm">Total Downloads</p>
            <p className="text-2xl font-bold text-primary">
              {clips.reduce((sum, clip) => sum + (clip.downloads || 0), 0)}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              type="text"
              placeholder="Search clips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-theme rounded-lg text-primary focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 bg-surface border border-theme rounded-lg text-primary focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Platforms</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram Reels</option>
            <option value="youtube">YouTube Shorts</option>
          </select>
        </div>

        {/* Clips Grid */}
        {filteredClips.length === 0 ? (
          <div className="text-center py-12">
            <FilmIcon className="h-12 w-12 text-muted mx-auto mb-4" />
            <p className="text-secondary">No clips found</p>
            <p className="text-muted text-sm mt-2">
              Generate clips from your videos to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}