"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

// This demo page redirects to the main dashboard
export default function DemoPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  )
} 