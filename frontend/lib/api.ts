import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

const API_BASE_URL = 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  async (config) => {
    // Skip adding token for login and register endpoints
    if (config.url?.includes('/api/auth/login') || config.url?.includes('/api/auth/register')) {
      return config
    }
    
    const session = await getSession()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Invalidate session and send user to login with minimal loop risk
      await signOut({ callbackUrl: '/login' })
    }
    return Promise.reject(error)
  }
)