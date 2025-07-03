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
import { UniPoolLogo } from "@/components/ui/UniPoolLogo"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { ApiAuthService } from "@/services/ApiAuthService"

// Import API Health Indicator with no SSR
const ApiHealthIndicator = dynamic(() => import("@/components/ApiHealthIndicator"), {
  ssr: false,
});

// Dynamic import for map component
const MapboxMap = dynamic(() => import("@/components/map/MapboxMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#18181B]/80 to-[#23272f]/80 rounded-xl border-2 border-[#FFC857]/30 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFC857]/5 to-transparent"></div>
      
      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center space-y-3">
        <div className="w-12 h-12 border-4 border-[#FFC857]/30 border-t-[#FFC857] rounded-full animate-spin"></div>
        <div className="text-center">
          <div className="text-[#FFC857] font-semibold text-lg">Loading Map</div>
          <div className="text-[#F3F4F6]/60 text-sm">Preparing your ride locations...</div>
        </div>
      </div>
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-[#FFC857]/20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-[#FFD700]/20 rounded-full animate-pulse delay-500"></div>
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
    const fetchUser = async () => {
      try {
        const currentUser = await ApiAuthService.getCurrentUser()
        setUser(currentUser)
        loadDashboardData(currentUser.id)
      } catch (err) {
        router.replace("/auth/login")
      }
    }
    fetchUser()
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
    getCurrentLocation()
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

  const loadDashboardData = async (userId: number) => {
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
    const markers: MapMarker[] = rides.map((ride) => ({
      coordinates: [74.331627, 31.522381] as [number, number], // Default coordinates for now
      title: `${ride.driverName || 'Driver'} - ${ride.pickupArea} to ${ride.destination}`,
      color: '#FFC857',
      description: `Departure: ${new Date(ride.departureTime).toLocaleString()}`
    }))
    setMapMarkers(markers)
  }

  const handleLogout = () => {
    ApiAuthService.logout()
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with Animated Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F23] via-[#1a1a2e] to-[#16213e]"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-[#FFC857]/20 to-[#FFD700]/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-r from-[#FFD700]/15 to-[#FFC857]/15 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-[#FFC857]/10 to-[#FFD700]/10 rounded-full blur-md animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-r from-[#FFD700]/12 to-[#FFC857]/12 rounded-full blur-lg animate-pulse delay-1500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FFC857 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Glowing Lines */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#FFC857]/30 to-transparent"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFC857]/20 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-[#23272f]/90 border-b border-[#FFC857]/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UniPoolLogo size={32} className="text-[#FFC857]" />
            <span className="text-2xl font-extrabold text-[#FFC857] drop-shadow-lg">UniPool</span>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* API Status Indicator */}
            <div className="hidden sm:block">
              <ApiHealthIndicator />
            </div>
            
            <div className="flex items-center space-x-2 bg-[#18181B]/80 px-3 py-2 rounded-lg border border-[#FFC857]/30">
              <UserIcon className="h-5 w-5 text-[#FFC857]" />
              <span className="text-sm font-semibold text-[#F3F4F6]">{user.name}</span>
              {user.rating && user.rideCount >= 3 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />
                  <span className="text-sm text-[#FFC857] font-semibold">{user.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push("/profile")}
              className="border-[#FFC857] text-[#FFC857] hover:bg-[#FFC857] hover:text-[#18181B] transition-all"
            >
              Profile
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-[#FFC857] hover:bg-[#FFC857]/20 transition-all"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Offline Mode Warning */}
        {!isApiOnline && (
          <motion.div 
            className="mb-6 p-4 bg-amber-900/20 border border-amber-500/50 rounded-lg flex items-center gap-3 backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-300">Offline Mode Active</h3>
              <p className="text-amber-200 text-sm">
                You are currently using UniPool in offline mode with local data. Some features may be limited.
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-[#23272f]/90 border-2 border-[#FFC857]/30 backdrop-blur-xl hover:border-[#FFC857]/60 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                  <Car className="h-8 w-8 text-[#18181B]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#FFC857]">{myRides.length}</p>
                  <p className="text-sm text-[#F3F4F6]/70 font-medium">My Rides</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#23272f]/90 border-2 border-[#FFC857]/30 backdrop-blur-xl hover:border-[#FFC857]/60 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                  <Users className="h-8 w-8 text-[#18181B]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#FFC857]">{myBookings.length}</p>
                  <p className="text-sm text-[#F3F4F6]/70 font-medium">My Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#23272f]/90 border-2 border-[#FFC857]/30 backdrop-blur-xl hover:border-[#FFC857]/60 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                  <Star className="h-8 w-8 text-[#18181B]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#FFC857]">
                    {user.rating && user.rideCount >= 3 ? user.rating.toFixed(1) : "N/A"}
                  </p>
                  <p className="text-sm text-[#F3F4F6]/70 font-medium">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#23272f]/90 border-2 border-[#FFC857]/30 backdrop-blur-xl hover:border-[#FFC857]/60 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                  <MapPin className="h-8 w-8 text-[#18181B]" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#FFC857]">{availableRides.length}</p>
                  <p className="text-sm text-[#F3F4F6]/70 font-medium">Available Rides</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content with Map */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Map Widget */}
          <div className="lg:col-span-2">
            <Card className="bg-[#23272f]/90 border-2 border-[#FFC857]/30 backdrop-blur-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                      <MapPin className="h-5 w-5 text-[#18181B]" />
                    </div>
                  <div>
                      <CardTitle className="text-[#FFC857] text-xl font-bold">
                        Nearby Rides
                    </CardTitle>
                      <CardDescription className="text-[#F3F4F6]/70 mt-1">
                      {currentLocation ? 
                          `📍 Your location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 
                          "📍 Enable location to see nearby rides"
                      }
                    </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 border-2 border-[#FFC857] text-[#FFC857] hover:bg-[#FFC857] hover:text-[#18181B] transition-all transform hover:scale-105 shadow-lg"
                  >
                    {isLoadingLocation ? (
                      <div className="w-4 h-4 border-2 border-[#FFC857]/30 border-t-[#FFC857] rounded-full animate-spin"></div>
                    ) : (
                    <Navigation className="h-4 w-4" />
                    )}
                    <span>{currentLocation ? 'Update' : 'Enable'} GPS</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-[450px] rounded-xl overflow-hidden border-2 border-[#FFC857]/30 bg-gradient-to-br from-[#18181B]/80 to-[#23272f]/80">
                  {/* Map Container with Enhanced Styling */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFC857]/5 to-transparent pointer-events-none z-10"></div>
                  
                  {/* Glowing Border Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FFC857]/20 via-transparent to-[#FFD700]/20 pointer-events-none z-5"></div>
                  
                  {/* Map Component */}
                  <div className="relative z-0 h-full w-full">
                  <MapboxMap
                    currentLocation={currentLocation}
                    markers={mapMarkers}
                    className="h-full w-full rounded-xl"
                  />
                  </div>
                  
                  {/* Floating Info Overlay */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="bg-[#23272f]/90 backdrop-blur-xl border border-[#FFC857]/30 rounded-lg px-3 py-2 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#FFC857] rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-[#FFC857]">
                          {mapMarkers.length} rides nearby
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Location Status Overlay */}
                  <div className="absolute bottom-4 right-4 z-20">
                    <div className="bg-[#23272f]/90 backdrop-blur-xl border border-[#FFC857]/30 rounded-lg px-3 py-2 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${currentLocation ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                        <span className="text-xs font-semibold text-[#F3F4F6]">
                          {currentLocation ? 'GPS Active' : 'GPS Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-[#23272f]/90 border-2 border-[#FFC857]/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-[#FFC857]">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => router.push("/rides/search")} 
                  className="w-full justify-start bg-gradient-to-r from-[#FFC857] to-[#FFD700] text-[#18181B] hover:from-[#FFD700] hover:to-[#FFC857] transition-all transform hover:scale-105"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find a Ride
                </Button>
                <Button 
                  onClick={() => router.push("/rides/create")} 
                  variant="outline" 
                  className="w-full justify-start border-[#FFC857] text-[#FFC857] hover:bg-[#FFC857] hover:text-[#18181B] transition-all transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Ride
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-[#23272f]/90 border-2 border-[#FFC857]/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-[#FFC857]">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {myBookings.length === 0 && myRides.length === 0 ? (
                  <p className="text-[#F3F4F6]/50 text-sm">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {myBookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-3 p-3 bg-[#18181B]/50 rounded-lg border border-[#FFC857]/20 hover:border-[#FFC857]/40 transition-all">
                        <div className="p-2 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                          <Users className="h-4 w-4 text-[#18181B]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#F3F4F6] truncate">
                            Booked ride to {booking.ride?.destination}
                          </p>
                          <p className="text-xs text-[#F3F4F6]/60">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {myRides.slice(0, 3).map((ride) => (
                      <div key={ride.id} className="flex items-center space-x-3 p-3 bg-[#18181B]/50 rounded-lg border border-[#FFC857]/20 hover:border-[#FFC857]/40 transition-all">
                        <div className="p-2 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                          <Car className="h-4 w-4 text-[#18181B]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#F3F4F6] truncate">
                            Posted ride to {ride.destination}
                          </p>
                          <p className="text-xs text-[#F3F4F6]/60">
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
        </motion.div>

        {/* Available Rides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-[#23272f]/90 border-2 border-[#FFC857]/30 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                  <CardTitle className="text-[#FFC857]">Available Rides</CardTitle>
                  <CardDescription className="text-[#F3F4F6]/70">
                  Rides available in your area
                </CardDescription>
              </div>
              <Button 
                onClick={() => router.push("/rides/search")} 
                variant="outline"
                  className="border-[#FFC857] text-[#FFC857] hover:bg-[#FFC857] hover:text-[#18181B] transition-all"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {availableRides.length === 0 ? (
              <div className="text-center py-8">
                  <Car className="h-12 w-12 text-[#FFC857]/50 mx-auto mb-4" />
                  <p className="text-[#F3F4F6]/60">No rides available right now</p>
                <Button 
                  onClick={() => router.push("/rides/create")} 
                    className="mt-4 bg-gradient-to-r from-[#FFC857] to-[#FFD700] text-[#18181B] hover:from-[#FFD700] hover:to-[#FFC857] transition-all transform hover:scale-105"
                >
                  Post a Ride
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableRides.map((ride, index) => (
                    <motion.div
                      key={ride.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="cursor-pointer bg-[#18181B]/80 border-2 border-[#FFC857]/30 hover:border-[#FFC857]/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                    <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                        <div>
                              <h4 className="font-semibold text-[#F3F4F6]">{ride.driver?.name}</h4>
                              <div className="flex items-center space-x-1 text-sm">
                                <Star className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />
                                <span className="text-[#FFC857] font-medium">{ride.driver?.rating || 4.5}</span>
                              </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-[#FFC857] to-[#FFD700] text-[#18181B] font-semibold">Free</Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-[#FFC857]" />
                              <span className="text-[#F3F4F6]/80">{ride.pickupArea} → {ride.destination}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-[#FFC857]" />
                              <span className="text-[#F3F4F6]/80">{formatDate(ride.departureTime)} at {formatTime(ride.departureTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-[#FFC857]" />
                              <span className="text-[#F3F4F6]/80">{ride.availableSeats} seats available</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push(`/rides/${ride.id}`)}
                            className="w-full mt-4 bg-gradient-to-r from-[#FFC857] to-[#FFD700] text-[#18181B] hover:from-[#FFD700] hover:to-[#FFC857] transition-all transform hover:scale-105"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                    </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  )
}
