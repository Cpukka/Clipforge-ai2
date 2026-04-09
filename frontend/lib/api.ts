import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

// Use environment variable for API URL - this is critical!
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://clipforge-ai2.onrender.com'

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined")
}

console.log('API Base URL:', API_BASE_URL) // Remove after confirming

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Skip for auth endpoints
    if (config.url?.includes('/api/auth/login') || config.url?.includes('/api/auth/register')) {
      return config
    }
    
    const session = await getSession()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut({ redirect: false })
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)