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
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig