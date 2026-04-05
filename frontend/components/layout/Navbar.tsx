'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  HomeIcon, 
  VideoCameraIcon, 
  FilmIcon, 
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export default function Navbar() {
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  // Show loading state
  if (!mounted) return null

  const isAuthenticated = status === 'authenticated'

  return (
    <nav className="bg-primary border-b border-theme sticky top-0 z-50 transition-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                ClipForge AI
              </span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-secondary hover:text-primary transition-colors"
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
                <Link
                  href="/videos"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-secondary hover:text-primary transition-colors"
                >
                  <VideoCameraIcon className="h-5 w-5 mr-2" />
                  Videos
                </Link>
                <Link
                  href="/clips"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-secondary hover:text-primary transition-colors"
                >
                  <FilmIcon className="h-5 w-5 mr-2" />
                  Clips
                </Link>
                <Link
                  href="/analytics"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-secondary hover:text-primary transition-colors"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Analytics
                </Link>
                <Link
                  href="/settings"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-secondary hover:text-primary transition-colors"
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-2" />
                  Settings
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-tertiary hover:bg-surface-hover transition-theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5 text-yellow-500" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-700" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>{session.user?.email?.split('@')[0] || 'User'}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-secondary hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg bg-tertiary hover:bg-surface-hover transition-theme"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-secondary" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-secondary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-primary border-t border-theme py-4">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/videos"
                  className="block px-4 py-2 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Videos
                </Link>
                <Link
                  href="/clips"
                  className="block px-4 py-2 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Clips
                </Link>
                <Link
                  href="/analytics"
                  className="block px-4 py-2 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <div className="border-t border-theme my-2"></div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:text-red-500 hover:bg-surface-hover rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg mx-4 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}