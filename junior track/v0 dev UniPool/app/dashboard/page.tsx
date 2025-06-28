"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, Users, Plus, Search, Star, MapPin, Clock, UserIcon, LogOut } from "lucide-react"
import { AuthService } from "@/services/AuthService"
import { RideService } from "@/services/RideService"
import { BookingService } from "@/services/BookingService"

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [myRides, setMyRides] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [availableRides, setAvailableRides] = useState([])
  const router = useRouter()

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
    loadDashboardData(currentUser.id)
  }, [router])

  const loadDashboardData = async (userId) => {
    try {
      const [rides, bookings, available] = await Promise.all([
        RideService.getUserRides(userId),
        BookingService.getUserBookings(userId),
        RideService.getAvailableRides(userId),
      ])
      setMyRides(rides)
      setMyBookings(bookings)
      setAvailableRides(available.slice(0, 5)) // Show top 5 available rides
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    router.push("/")
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Karachi",
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Karachi",
    })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-black" />
            <span className="text-2xl font-bold text-black">UniPool</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">{user.name}</span>
              {user.rating && user.rideCount >= 3 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{user.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Profile
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-black" />
                <div>
                  <p className="text-2xl font-bold">{myRides.length}</p>
                  <p className="text-sm text-gray-600">My Rides</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-black" />
                <div>
                  <p className="text-2xl font-bold">{myBookings.length}</p>
                  <p className="text-sm text-gray-600">My Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-black" />
                <div>
                  <p className="text-2xl font-bold">
                    {user.rating && user.rideCount >= 3 ? user.rating.toFixed(1) : "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-black" />
                <div>
                  <p className="text-2xl font-bold">{user.rideCount || 0}</p>
                  <p className="text-sm text-gray-600">Total Rides</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          {(user.role === "driver" || user.role === "both") && (
            <Button onClick={() => router.push("/rides/create")} className="bg-black text-white hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Post a Ride
            </Button>
          )}
          {(user.role === "rider" || user.role === "both") && (
            <Button onClick={() => router.push("/rides/search")} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Find a Ride
            </Button>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {(user.role === "driver" || user.role === "both") && <TabsTrigger value="my-rides">My Rides</TabsTrigger>}
            {(user.role === "rider" || user.role === "both") && (
              <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Available Rides */}
            <Card>
              <CardHeader>
                <CardTitle>Available Rides</CardTitle>
                <CardDescription>Recent rides you might be interested in</CardDescription>
              </CardHeader>
              <CardContent>
                {availableRides.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No available rides at the moment</p>
                ) : (
                  <div className="space-y-4">
                    {availableRides.map((ride) => (
                      <div
                        key={ride.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{ride.pickupArea} → FCC</span>
                            <Badge variant="outline">{ride.availableSeats} seats</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {formatDate(ride.departureTime)} at {formatTime(ride.departureTime)}
                              </span>
                            </div>
                            <span>by {ride.driverName}</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => router.push(`/rides/${ride.id}`)} variant="outline">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {(user.role === "driver" || user.role === "both") && (
            <TabsContent value="my-rides" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Posted Rides</CardTitle>
                  <CardDescription>Rides you've created</CardDescription>
                </CardHeader>
                <CardContent>
                  {myRides.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You haven't posted any rides yet</p>
                      <Button onClick={() => router.push("/rides/create")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Ride
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myRides.map((ride) => (
                        <div
                          key={ride.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {ride.pickupArea} → {ride.destination}
                              </span>
                              <Badge variant={ride.status === "active" ? "default" : "secondary"}>{ride.status}</Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatDate(ride.departureTime)} at {formatTime(ride.departureTime)}
                                </span>
                              </div>
                              <span>{ride.availableSeats} seats available</span>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => router.push(`/rides/${ride.id}`)} variant="outline">
                            Manage
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(user.role === "rider" || user.role === "both") && (
            <TabsContent value="my-bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>Rides you've booked</CardDescription>
                </CardHeader>
                <CardContent>
                  {myBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">You haven't booked any rides yet</p>
                      <Button onClick={() => router.push("/rides/search")}>
                        <Search className="h-4 w-4 mr-2" />
                        Find Your First Ride
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {booking.pickupPoint} → {booking.dropoffPoint}
                              </span>
                              <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatDate(booking.departureTime)} at {formatTime(booking.departureTime)}
                                </span>
                              </div>
                              <span>with {booking.driverName}</span>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => router.push(`/rides/${booking.rideId}`)} variant="outline">
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
