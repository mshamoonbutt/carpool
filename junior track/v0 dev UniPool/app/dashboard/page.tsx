"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// Tabs imports removed as not currently used
import { Car, Users, Plus, Search, Star, MapPin, Clock, UserIcon, LogOut, AlertCircle, Navigation } from "lucide-react"
import { AuthService } from "@/services/AuthService"
import { RideService } from "@/services/RideService"
import { BookingService } from "@/services/BookingService"
import { mapService } from "@/services/MapService"
import { apiConfig } from "@/utils/apiConfig"
import { CurrentLocation, MapMarker } from "@/types/map"
import dynamic from "next/dynamic"

// Import API Health Indicator with no SSR
const ApiHealthIndicator = dynamic(() => import("@/components/ApiHealthIndicator"), {
  ssr: false,
});

// Dynamic import for map component
const MapboxMap = dynamic(() => import("@/components/map/MapboxMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-muted rounded-lg">
      <div className="text-muted-foreground">Loading map...</div>
    </div>
  )
});

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [myRides, setMyRides] = useState<any[]>([])
  const [myBookings, setMyBookings] = useState<any[]>([])
  const [availableRides, setAvailableRides] = useState<any[]>([])
  const [isApiOnline, setIsApiOnline] = useState(apiConfig.isApiOnline)
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null)
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([])
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
    
    // Check API status
    const checkAndSetApiStatus = async () => {
      try {
        const { checkApiHealth } = await import("@/utils/apiConfig")
        const isOnline = await checkApiHealth()
        setIsApiOnline(isOnline)
      } catch (error) {
        console.error("Failed to check API status:", error)
        setIsApiOnline(false)
      }
    }
    
    checkAndSetApiStatus()
    loadDashboardData(currentUser.id)
    getCurrentLocation()
    
    // Set up an interval to check API status periodically
    const interval = setInterval(checkAndSetApiStatus, 30000)
    return () => clearInterval(interval)
  }, [router])

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true)
      const location = await mapService.getCurrentLocation()
      setCurrentLocation(location)
    } catch (error) {
      console.error("Error getting current location:", error)
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const loadDashboardData = async (userId) => {
    try {
      console.log("Loading dashboard data for user:", userId);
      
      // Load data from API
      const [rides, bookings, available] = await Promise.all([
        RideService.getUserRides(userId),
        BookingService.getUserBookings(userId),
        RideService.getAvailableRides(userId),
      ]);
      
      console.log(`Dashboard data loaded: ${rides.length} rides, ${bookings.length} bookings, ${available.length} available rides`);
      
      setMyRides(rides);
      setMyBookings(bookings);
      
      // Show top 5 available rides, sorted by departure time
      const sortedAvailable = [...available].sort(
        (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
      );
      setAvailableRides(sortedAvailable.slice(0, 5));

      // Update map markers
      updateMapMarkers(sortedAvailable.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }

  const updateMapMarkers = (rides: any[]) => {
    const markers = rides.map((ride, index) => ({
      coordinates: [ride.originLng || 74.331627, ride.originLat || 31.522381],
      title: `${ride.driver?.name || 'Driver'} - ${ride.origin} to ${ride.destination}`,
      color: '#3B82F6',
      description: `Departure: ${new Date(ride.departureTime).toLocaleString()}`
    }));
    setMapMarkers(markers);
  }

  const handleLogout = () => {
    AuthService.logout()
    router.push("/")
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

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-foreground" />
            <span className="text-2xl font-bold text-foreground">UniPool</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* API Status Indicator */}
            <div className="hidden sm:block">
              <ApiHealthIndicator />
            </div>
            
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{user.name}</span>
              {user.rating && user.rideCount >= 3 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-foreground">{user.rating.toFixed(1)}</span>
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
        {/* Offline Mode Warning */}
        {!isApiOnline && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="font-medium text-amber-800">Offline Mode Active</h3>
              <p className="text-amber-700 text-sm">
                You are currently using UniPool in offline mode with local data. Some features may be limited.
              </p>
            </div>
          </div>
        )}
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-foreground" />
                <div>
                  <p className="text-2xl font-bold">{myRides.length}</p>
                  <p className="text-sm text-muted-foreground">My Rides</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-foreground" />
                <div>
                  <p className="text-2xl font-bold">{myBookings.length}</p>
                  <p className="text-sm text-muted-foreground">My Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-foreground" />
                <div>
                  <p className="text-2xl font-bold">
                    {user.rating && user.rideCount >= 3 ? user.rating.toFixed(1) : "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-8 w-8 text-foreground" />
                <div>
                  <p className="text-2xl font-bold">{availableRides.length}</p>
                  <p className="text-sm text-muted-foreground">Available Rides</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Map Widget */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Nearby Rides</span>
                    </CardTitle>
                    <CardDescription>
                      {currentLocation ? 
                        `Your location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 
                        "Enable location to see nearby rides"
                      }
                    </CardDescription>
                  </div>
                  <Button
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>{currentLocation ? 'Update' : 'Enable'} GPS</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <MapboxMap
                    currentLocation={currentLocation}
                    markers={mapMarkers}
                    className="h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => router.push("/rides/search")} 
                  className="w-full justify-start"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find a Ride
                </Button>
                <Button 
                  onClick={() => router.push("/rides/create")} 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Ride
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {myBookings.length === 0 && myRides.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {myBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <Users className="h-4 w-4 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Booked ride to {booking.ride?.destination}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {myRides.slice(0, 3).map((ride) => (
                      <div key={ride.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <Car className="h-4 w-4 text-green-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Posted ride to {ride.destination}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(ride.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available Rides */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Rides</CardTitle>
                <CardDescription>
                  Rides available in your area
                </CardDescription>
              </div>
              <Button 
                onClick={() => router.push("/rides/search")} 
                variant="outline"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {availableRides.length === 0 ? (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No rides available right now</p>
                <Button 
                  onClick={() => router.push("/rides/create")} 
                  className="mt-4"
                >
                  Post a Ride
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRides.map((ride) => (
                  <Card key={ride.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{ride.driver?.name}</h4>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{ride.driver?.rating || 4.5}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">Free</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{ride.origin} → {ride.destination}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(ride.departureTime)} at {formatTime(ride.departureTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{ride.availableSeats} seats available</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(`/rides/${ride.id}`)}
                        className="w-full mt-3"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
