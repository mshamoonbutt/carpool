"use client"

import React, { useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'
import { AuthService } from '@/services/AuthService'
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
        // Check API availability
        const { checkApiHealth, apiConfig } = require('@/utils/apiConfig')
        const isApiOnline = await checkApiHealth()
        console.log(`🌐 API is ${isApiOnline ? 'online' : 'offline'}. Using ${isApiOnline ? 'backend API' : 'localStorage'}.`)
        
        // Initialize database with seed data (fallback)
        await AuthService.initializeDatabase()
        
        // Log database stats
        const stats = AuthService.getDatabaseStats()
        console.log('📊 Database stats:', stats)
        
        // Check if user is already logged in
        const currentUser = AuthService.getCurrentUser()
        if (currentUser) {
          console.log('👤 Current user:', currentUser.email)
        } else {
          console.log('👤 No user currently logged in')
        }
        
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