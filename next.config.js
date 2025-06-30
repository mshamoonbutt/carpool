/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
  // Skip TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Handle images optimization
  images: {
    domains: ['localhost'],
  },
  // Output configuration for static export (if needed)
  output: 'standalone',
}

module.exports = nextConfig 