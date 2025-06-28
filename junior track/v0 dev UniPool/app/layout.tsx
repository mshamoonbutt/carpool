"use client"

import { useEffect } from 'react'
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
        // Initialize database with seed data
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
        {children}
      </body>
    </html>
  )
}