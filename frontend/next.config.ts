import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Remove allowedDevOrigins for production
  // allowedDevOrigins only needed for development
  
  output: 'standalone', // Better for production deployments
  
  // Compress responses
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  
  // Remove logging in production
  logging: process.env.NODE_ENV === 'development' ? {
    fetches: {
      fullUrl: true,
    },
  } : undefined,
}

export default nextConfig