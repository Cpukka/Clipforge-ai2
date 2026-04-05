'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { 
  SparklesIcon, 
  FilmIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  HashtagIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const features = [
    {
      icon: FilmIcon,
      title: 'Auto Clip Generation',
      description: 'Automatically create TikTok, Reels, and Shorts from your long videos',
    },
    {
      icon: DocumentTextIcon,
      title: 'AI Captions',
      description: 'Generate viral captions and titles using advanced AI',
    },
    {
      icon: HashtagIcon,
      title: 'Smart Hashtags',
      description: 'Get relevant hashtags to maximize your reach',
    },
    {
      icon: SparklesIcon,
      title: 'Auto Subtitles',
      description: 'Burn professional subtitles with customizable styles',
    },
    {
      icon: ClockIcon,
      title: 'Save Time',
      description: 'Reduce editing time from hours to minutes',
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Increase Engagement',
      description: 'Optimize clips for maximum virality',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Turn Long Videos into
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                {' '}Viral Shorts
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              AI-powered platform that automatically repurposes your content for TikTok, Instagram Reels, and YouTube Shorts
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="#demo"
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Watch Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Powerful Features for Content Creators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900 rounded-xl p-6 hover:shadow-xl transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Supercharge Your Content?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of creators who are saving time and growing their audience with ClipForge AI
          </p>
          <Link
            href="/register"
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  )
}