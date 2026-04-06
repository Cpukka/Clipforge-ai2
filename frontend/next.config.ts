import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', 'http://localhost:3000'],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  output: 'standalone',
  typescript: {
    // Allow production builds to complete even with type errors
    ignoreBuildErrors: true,
  },
  // eslint option has been removed - use ESLint CLI instead
}

export default nextConfig