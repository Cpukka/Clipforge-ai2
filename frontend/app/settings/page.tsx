'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import { 
  SparklesIcon, 
  LanguageIcon, 
  HashtagIcon,
  DocumentTextIcon,
  FilmIcon,
  ClockIcon,
  CheckIcon,  // Changed from SaveIcon to CheckIcon
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface AISettings {
  // Transcription settings
  transcriptionModel: string
  transcriptionLanguage: string
  
  // Clip generation settings
  clipDuration: number
  maxClipsPerVideo: number
  platforms: string[]
  
  // Caption settings
  captionStyle: string
  captionLength: 'short' | 'medium' | 'long'
  includeHashtags: boolean
  numberOfHashtags: number
  
  // Auto-publish settings
  autoPublish: boolean
  scheduleTime: string
}

export default function AISettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<AISettings>({
    transcriptionModel: 'base',
    transcriptionLanguage: 'en',
    clipDuration: 30,
    maxClipsPerVideo: 5,
    platforms: ['tiktok', 'instagram', 'youtube'],
    captionStyle: 'casual',
    captionLength: 'medium',
    includeHashtags: true,
    numberOfHashtags: 10,
    autoPublish: false,
    scheduleTime: '09:00'
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/users/settings')
      if (response.data) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      // Use default settings if API fails
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await api.post('/api/users/settings', settings)
      toast.success('AI settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof AISettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const togglePlatform = (platform: string) => {
    setSettings(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SparklesIcon className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-primary">AI Settings</h1>
          </div>
          <p className="text-secondary">
            Configure how AI processes your videos for social media
          </p>
        </div>

        <div className="space-y-6">
          {/* Transcription Settings */}
          <div className="bg-surface border border-theme rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <LanguageIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-primary">Transcription Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Whisper Model
                </label>
                <select
                  value={settings.transcriptionModel}
                  onChange={(e) => updateSetting('transcriptionModel', e.target.value)}
                  className="w-full px-3 py-2 bg-tertiary border border-theme rounded-lg text-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="tiny">Tiny (Fastest, less accurate)</option>
                  <option value="base">Base (Balanced)</option>
                  <option value="small">Small (More accurate, slower)</option>
                  <option value="medium">Medium (Very accurate)</option>
                  <option value="large">Large (Most accurate, slowest)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Language
                </label>
                <select
                  value={settings.transcriptionLanguage}
                  onChange={(e) => updateSetting('transcriptionLanguage', e.target.value)}
                  className="w-full px-3 py-2 bg-tertiary border border-theme rounded-lg text-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clip Generation Settings */}
          <div className="bg-surface border border-theme rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FilmIcon className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-primary">Clip Generation</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Clip Duration (seconds)
                </label>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={settings.clipDuration}
                  onChange={(e) => updateSetting('clipDuration', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted mt-1">
                  <span>15s</span>
                  <span>{settings.clipDuration}s</span>
                  <span>60s</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Max Clips per Video
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.maxClipsPerVideo}
                  onChange={(e) => updateSetting('maxClipsPerVideo', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-tertiary border border-theme rounded-lg text-primary focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-secondary mb-2">
                Generate for Platforms
              </label>
              <div className="flex flex-wrap gap-3">
                {['tiktok', 'instagram', 'youtube'].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                      settings.platforms.includes(platform)
                        ? `bg-${platform === 'tiktok' ? 'black' : platform === 'instagram' ? 'purple-600' : 'red-600'} text-white`
                        : 'bg-tertiary text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Caption Settings */}
          <div className="bg-surface border border-theme rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <DocumentTextIcon className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold text-primary">AI Captions & Hashtags</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Caption Style
                </label>
                <select
                  value={settings.captionStyle}
                  onChange={(e) => updateSetting('captionStyle', e.target.value)}
                  className="w-full px-3 py-2 bg-tertiary border border-theme rounded-lg text-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="casual">Casual & Engaging</option>
                  <option value="professional">Professional</option>
                  <option value="funny">Funny & Entertaining</option>
                  <option value="inspirational">Inspirational</option>
                  <option value="educational">Educational</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Caption Length
                </label>
                <select
                  value={settings.captionLength}
                  onChange={(e) => updateSetting('captionLength', e.target.value as any)}
                  className="w-full px-3 py-2 bg-tertiary border border-theme rounded-lg text-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="short">Short (1-2 sentences)</option>
                  <option value="medium">Medium (2-3 sentences)</option>
                  <option value="long">Long (3-5 sentences)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeHashtags}
                  onChange={(e) => updateSetting('includeHashtags', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-secondary">Include AI-generated hashtags</span>
              </label>
              
              {settings.includeHashtags && (
                <div className="mt-3 ml-6">
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Number of Hashtags
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={settings.numberOfHashtags}
                    onChange={(e) => updateSetting('numberOfHashtags', parseInt(e.target.value))}
                    className="w-full max-w-xs"
                  />
                  <span className="text-sm text-muted">{settings.numberOfHashtags} hashtags</span>
                </div>
              )}
            </div>
          </div>

          {/* Auto-Publish Settings */}
          <div className="bg-surface border border-theme rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-primary">Auto-Publish</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoPublish}
                  onChange={(e) => updateSetting('autoPublish', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-secondary">Automatically publish clips to social media</span>
              </label>
              
              {settings.autoPublish && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Schedule Time (UTC)
                  </label>
                  <input
                    type="time"
                    value={settings.scheduleTime}
                    onChange={(e) => updateSetting('scheduleTime', e.target.value)}
                    className="px-3 py-2 bg-tertiary border border-theme rounded-lg text-primary focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-muted mt-1">
                    Clips will be published daily at this time
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-secondary">
                  <strong className="text-primary">Note:</strong> Changes will apply to newly uploaded videos. 
                  Existing videos will not be reprocessed. Higher quality settings may increase processing time.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}