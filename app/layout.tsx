"use client"

import React, { useEffect } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize database when the app starts
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Initializing UniPool application...')
      
      try {
        // Check API availability (dynamic import for client-side only)
        const { checkApiHealth } = await import('@/utils/apiConfig')
        const isApiOnline = await checkApiHealth()
        console.log(`🌐 API is ${isApiOnline ? 'online' : 'offline'}. Using ${isApiOnline ? 'backend API' : 'localStorage'}.`)
        
      } catch (error) {
        console.error('❌ Failed to initialize app:', error)
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeApp()
    }
  }, [])

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* API Status Indicator - loaded in dashboard instead */}
        {children}
      </body>
    </html>
  )
}