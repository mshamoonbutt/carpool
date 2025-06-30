/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
  // Optimize for production
  swcMinify: true,
  // Handle images optimization
  images: {
    domains: ['localhost'],
  },
  // Output configuration for static export (if needed)
  output: 'standalone',
}

module.exports = nextConfig 