"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, Star, MapPin } from "lucide-react"
import { AuthService } from "@/services/AuthService"

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = AuthService.getCurrentUser()
    setIsLoggedIn(!!user)
  }, [])

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    } else {
      router.push("/auth/login")
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-black" />
            <span className="text-2xl font-bold text-black">UniPool</span>
          </div>
          <div className="space-x-4">
            {isLoggedIn ? (
              <>
                <Button onClick={() => router.push("/dashboard")} variant="outline">
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => router.push("/auth/login")} variant="outline">
                  Login
                </Button>
                <Button onClick={() => router.push("/auth/register")}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-black mb-6">Campus Ride Sharing Made Simple</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with fellow students for safe, convenient rides to and from Forman Christian College. Share costs,
            reduce traffic, and build community.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="bg-black text-white hover:bg-gray-800">
            Get Started
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-black mb-12">Why Choose UniPool?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-gray-200">
              <CardHeader>
                <Users className="h-12 w-12 text-black mb-4" />
                <CardTitle>Student Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with verified FCC students and faculty. Build trust through our rating system.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <MapPin className="h-12 w-12 text-black mb-4" />
                <CardTitle>Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI-powered route matching finds the best rides based on your schedule and location.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <Star className="h-12 w-12 text-black mb-4" />
                <CardTitle>Safety First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Verified university emails, mutual ratings, and community guidelines ensure safe rides.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-black mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-black mb-4">For Drivers</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    1
                  </span>
                  Post your ride with pickup area, destination, and departure time
                </li>
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    2
                  </span>
                  Set recurring rides for your regular schedule
                </li>
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    3
                  </span>
                  Accept ride requests and coordinate pickup details
                </li>
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    4
                  </span>
                  Complete the ride and rate your passengers
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black mb-4">For Riders</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    1
                  </span>
                  Search for rides by area, destination, and time
                </li>
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    2
                  </span>
                  Request to join rides with your specific pickup point
                </li>
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    3
                  </span>
                  Get confirmation and coordinate with your driver
                </li>
                <li className="flex items-start">
                  <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">
                    4
                  </span>
                  Enjoy your ride and rate your driver
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Car className="h-6 w-6" />
            <span className="text-xl font-bold">UniPool</span>
          </div>
          <p className="text-gray-400">Connecting FCC students through safe, convenient ride sharing</p>
        </div>
      </footer>
    </div>
  )
}
