"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Search, MapPin, Clock, Star, User } from "lucide-react"
import { AuthService } from "@/services/AuthService"
import { RideService } from "@/services/RideService"
import { LAHORE_AREAS } from "@/constants/locations"
import type { Ride } from "@/types"

export default function SearchRidesPage() {
  const [user, setUser] = useState(null)
  const [searchFilters, setSearchFilters] = useState({
    pickupArea: "Any area",
    destination: "Forman Christian College",
    date: "",
    timeWindow: "30", // minutes
  })
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    if (currentUser.role === "driver") {
      router.push("/dashboard")
      return
    }
    setUser(currentUser)

    // Set default date to today
    const today = new Date()
    setSearchFilters((prev) => ({
      ...prev,
      date: today.toISOString().split("T")[0],
    }))

    // Load initial rides
    loadRides()
  }, [router])

  const loadRides = async (filters = searchFilters) => {
    setLoading(true)
    setError("")

    try {
      const availableRides = await RideService.searchRides(filters)
      setRides(availableRides)
    } catch (err) {
      setError("Failed to load rides. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadRides(searchFilters)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Karachi",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Karachi",
    })
  }

  const getRatingDisplay = (rating: number | undefined, rideCount: number) => {
    if (!rating || rideCount < 3) {
      return <span className="text-sm text-gray-500">New driver</span>
    }
    return (
      <div className="flex items-center space-x-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Search className="h-6 w-6 text-black" />
            <span className="text-xl font-bold text-black">Find a Ride</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Rides</CardTitle>
            <CardDescription>Find rides that match your schedule and location</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="pickupArea">Pickup Area</Label>
                  <Select
                    value={searchFilters.pickupArea}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, pickupArea: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any area">Any area</SelectItem>
                      {LAHORE_AREAS.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Select
                    value={searchFilters.destination}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, destination: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Forman Christian College">Forman Christian College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={searchFilters.date}
                    onChange={(e) => setSearchFilters({ ...searchFilters, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="timeWindow">Time Flexibility</Label>
                  <Select
                    value={searchFilters.timeWindow}
                    onValueChange={(value) => setSearchFilters({ ...searchFilters, timeWindow: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">±15 minutes</SelectItem>
                      <SelectItem value="30">±30 minutes</SelectItem>
                      <SelectItem value="60">±1 hour</SelectItem>
                      <SelectItem value="120">±2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-gray-800">
                {loading ? "Searching..." : "Search Rides"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Searching for rides...</p>
            </div>
          ) : rides.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No rides found matching your criteria</p>
                <p className="text-sm text-gray-400">Try adjusting your search filters or check back later</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Available Rides ({rides.length})</h2>
              </div>

              <div className="space-y-4">
                {rides.map((ride) => (
                  <Card key={ride.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Route */}
                          <div className="flex items-center space-x-2 mb-3">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <span className="font-semibold text-lg">
                              {ride.pickupArea} → {ride.destination}
                            </span>
                            <Badge variant="outline">{ride.availableSeats} seats</Badge>
                          </div>

                          {/* Time */}
                          <div className="flex items-center space-x-2 mb-3">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">
                              {formatDate(ride.departureTime)} at {formatTime(ride.departureTime)}
                            </span>
                          </div>

                          {/* Driver Info */}
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">{ride.driverName}</span>
                            </div>
                            {getRatingDisplay(ride.driverRating, ride.driverRideCount || 0)}
                          </div>

                          {/* Route Description */}
                          {ride.route && (
                            <div className="text-sm text-gray-600 mb-3">
                              <strong>Route:</strong> {ride.route}
                            </div>
                          )}

                          {/* Notes */}
                          {ride.notes && (
                            <div className="text-sm text-gray-600">
                              <strong>Notes:</strong> {ride.notes}
                            </div>
                          )}
                        </div>

                        <div className="ml-6">
                          <Button
                            onClick={() => router.push(`/rides/${ride.id}`)}
                            className="bg-black text-white hover:bg-gray-800"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
