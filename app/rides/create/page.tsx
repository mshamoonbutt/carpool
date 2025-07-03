"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Car, MapPin, Clock, Users, Calendar, Route, MessageSquare, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { ApiAuthService } from "@/services/ApiAuthService"
import { RideService } from "@/services/RideService"
import { LAHORE_AREAS } from "@/constants/locations"
import { UniPoolLogo } from "@/components/ui/UniPoolLogo"
import { motion } from "framer-motion"

export default function CreateRidePage() {
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    pickupArea: "",
    customPickupArea: "",
    destination: "Forman Christian College",
    departureDate: "",
    departureTime: "",
    totalSeats: "4",
    route: "",
    notes: "",
    isRecurring: false,
    recurringDays: [] as string[],
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await ApiAuthService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        router.push("/auth/login")
      }
    }
    fetchUser()

    // Set default date to tomorrow
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    setFormData((prev) => ({
      ...prev,
      departureDate: tomorrow.toISOString().split("T")[0],
    }))

    // Check API status
    checkApiStatus()
  }, [router])

  const checkApiStatus = async () => {
    try {
      setApiStatus('checking')
      // Test API connection by trying to fetch rides
      await RideService.getRides()
      setApiStatus('online')
    } catch (error) {
      console.error("API status check failed:", error)
      setApiStatus('offline')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate time (6 AM - 10 PM)
    const [hours] = formData.departureTime.split(":").map(Number)
    if (hours < 6 || hours > 22) {
      setError("Rides are only allowed between 6:00 AM and 10:00 PM for safety reasons")
      return
    }

    // Validate date (not in the past)
    const departureDateTime = new Date(`${formData.departureDate}T${formData.departureTime}`)
    if (departureDateTime <= new Date()) {
      setError("Departure time must be in the future")
      return
    }

    const pickupArea = formData.pickupArea === "other" ? formData.customPickupArea : formData.pickupArea
    if (!pickupArea) {
      setError("Please specify pickup area")
      return
    }

    setLoading(true)

    try {
      // Build route description
      const routeDescription = formData.notes 
        ? `${formData.route ? formData.route + '. ' : ''}${formData.notes}`
        : formData.route || '';
        
      const rideData = {
        driverId: user.id,
        driverName: user.name,
        pickupArea,
        destination: formData.destination,
        departureTime: departureDateTime.toISOString(),
        totalSeats: Number.parseInt(formData.totalSeats),
        route: formData.route,
        notes: routeDescription,
        isRecurring: formData.isRecurring,
        recurringDays: formData.recurringDays,
      }

      console.log("Submitting ride data:", rideData);
      await RideService.createRide(rideData)
      
      console.log("Ride created successfully!");
      setSuccess("Ride posted successfully! Redirecting to dashboard...")
      setTimeout(() => {
      router.push("/dashboard")
      }, 2000)
    } catch (err: any) {
      console.error("Ride creation error:", err);
      
      // Show a more specific error message
      if (err.message.includes("token") || err.message.includes("log in")) {
        setError("Please log in again to post a ride.")
      } else if (err.message.includes("driver")) {
        setError("Only drivers can create rides. Please update your profile.")
      } else {
        setError(err.message || "Failed to create ride. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRecurringDayChange = (day: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      recurringDays: checked ? [...prev.recurringDays, day] : prev.recurringDays.filter((d) => d !== day),
    }))
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button 
              variant="ghost" 
              onClick={() => router.push("/dashboard")}
              className="text-[#FFC857] hover:bg-[#FFC857]/20 transition-all"
            >
            <ArrowLeft className="h-4 w-4" />
          </Button>
            <div className="flex items-center space-x-3">
              <UniPoolLogo size={32} className="text-[#FFC857]" />
              <span className="text-xl font-bold text-[#FFC857]">Post a Ride</span>
          </div>
          </motion.div>
          
          {/* API Status Indicator */}
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={`w-2 h-2 rounded-full ${
              apiStatus === 'online' ? 'bg-green-400' : 
              apiStatus === 'offline' ? 'bg-red-400' : 'bg-amber-400'
            }`}></div>
            <span className="text-sm text-[#F3F4F6]/70">
              {apiStatus === 'online' ? 'API Online' : 
               apiStatus === 'offline' ? 'API Offline' : 'Checking API...'}
            </span>
          </motion.div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-[#23272f]/90 border-2 border-[#FFC857]/30 backdrop-blur-xl shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-full">
                  <Car className="h-8 w-8 text-[#18181B]" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-[#FFC857]">Create New Ride</CardTitle>
              <CardDescription className="text-[#F3F4F6]/70 text-lg">
                Share your ride with fellow FCC students and help build our community
              </CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* API Status Warning */}
                {apiStatus === 'offline' && (
                  <Alert className="bg-red-900/20 border-red-500">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <AlertDescription className="text-red-400">
                      API is currently offline. Please check your connection and try again.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Success Message */}
                {success && (
                  <Alert className="bg-green-900/20 border-green-500">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <AlertDescription className="text-green-400 font-semibold">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Error Message */}
              {error && (
                  <Alert className="bg-red-900/20 border-red-500">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <AlertDescription className="text-red-400 font-semibold">{error}</AlertDescription>
                </Alert>
              )}

                {/* Pickup Location Section */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                      <MapPin className="h-5 w-5 text-[#18181B]" />
                    </div>
                    <Label className="text-lg font-semibold text-[#FFC857]">Pickup Location</Label>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="pickupArea" className="text-[#FFC857] font-semibold">Pickup Area *</Label>
                  <Select
                    value={formData.pickupArea}
                    onValueChange={(value) => setFormData({ ...formData, pickupArea: value })}
                  >
                        <SelectTrigger className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all">
                          <SelectValue placeholder="Select pickup area" className="text-white" />
                    </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e]/95 border-2 border-[#FFC857] rounded-lg shadow-2xl backdrop-blur-xl max-h-60">
                      {LAHORE_AREAS.map((area) => (
                            <SelectItem key={area} value={area} className="text-white hover:bg-[#FFC857]/30 focus:bg-[#FFC857]/30 cursor-pointer py-4 text-base font-medium transition-all duration-200 hover:scale-105">
                              📍 {area}
                        </SelectItem>
                      ))}
                          <SelectItem value="other" className="text-white hover:bg-[#FFC857]/30 focus:bg-[#FFC857]/30 cursor-pointer py-4 text-base font-medium transition-all duration-200 hover:scale-105">
                            ✨ Other (specify below)
                          </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.pickupArea === "other" && (
                      <div className="space-y-2">
                        <Label htmlFor="customPickupArea" className="text-[#FFC857] font-semibold">Custom Pickup Area *</Label>
                    <Input
                      id="customPickupArea"
                      value={formData.customPickupArea}
                      onChange={(e) => setFormData({ ...formData, customPickupArea: e.target.value })}
                      placeholder="Enter your pickup area"
                          className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all"
                      required
                    />
                  </div>
                )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="route" className="text-[#FFC857] font-semibold">Route Description (Optional)</Label>
                  <Textarea
                    id="route"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    placeholder="Describe your route or areas you'll pass through (e.g., DHA Phase 4 → Main Boulevard → FCC)"
                      rows={3}
                      className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all resize-none"
                  />
                </div>
                </motion.div>

                {/* Destination Section */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                      <MapPin className="h-5 w-5 text-[#18181B]" />
              </div>
                    <Label className="text-lg font-semibold text-[#FFC857]">Destination</Label>
                </div>
                <Select
                  value={formData.destination}
                  onValueChange={(value) => setFormData({ ...formData, destination: value })}
                >
                    <SelectTrigger className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all">
                      <SelectValue className="text-white" />
                  </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e]/95 border-2 border-[#FFC857] rounded-lg shadow-2xl backdrop-blur-xl">
                      <SelectItem value="Forman Christian College" className="text-white hover:bg-[#FFC857]/30 focus:bg-[#FFC857]/30 cursor-pointer py-4 text-base font-medium transition-all duration-200 hover:scale-105">
                        🎓 Forman Christian College
                      </SelectItem>
                  </SelectContent>
                </Select>
                </motion.div>

                {/* Date and Time Section */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                      <Clock className="h-5 w-5 text-[#18181B]" />
              </div>
                    <Label className="text-lg font-semibold text-[#FFC857]">Departure Time</Label>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="departureDate" className="text-[#FFC857] font-semibold">Date *</Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                        className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all"
                      required
                    />
                  </div>
                    <div className="space-y-2">
                      <Label htmlFor="departureTime" className="text-[#FFC857] font-semibold">Time *</Label>
                    <Input
                      id="departureTime"
                      type="time"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                        className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all"
                      required
                    />
                  </div>
                </div>
                  <p className="text-sm text-[#F3F4F6]/60 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <span>Rides are only allowed between 6:00 AM and 10:00 PM for safety</span>
                  </p>
                </motion.div>

                {/* Seats Section */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                      <Users className="h-5 w-5 text-[#18181B]" />
              </div>
                    <Label className="text-lg font-semibold text-[#FFC857]">Available Seats</Label>
                </div>
                <Select
                  value={formData.totalSeats}
                  onValueChange={(value) => setFormData({ ...formData, totalSeats: value })}
                >
                    <SelectTrigger className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all">
                      <SelectValue className="text-white" />
                  </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e]/95 border-2 border-[#FFC857] rounded-lg shadow-2xl backdrop-blur-xl">
                      {[1, 2, 3, 4, 5, 6].map((seats) => (
                        <SelectItem key={seats} value={seats.toString()} className="text-white hover:bg-[#FFC857]/30 focus:bg-[#FFC857]/30 cursor-pointer py-4 text-base font-medium transition-all duration-200 hover:scale-105">
                          💺 {seats} {seats === 1 ? 'seat' : 'seats'}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                </motion.div>

                {/* Recurring Ride Section */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                      <Calendar className="h-5 w-5 text-[#18181B]" />
                    </div>
                    <Label className="text-lg font-semibold text-[#FFC857]">Recurring Ride</Label>
              </div>

              <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-[#18181B]/50 rounded-lg border border-[#FFC857]/20">
                  <Checkbox
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: !!checked })}
                        className="border-[#FFC857] data-[state=checked]:bg-[#FFC857] data-[state=checked]:border-[#FFC857]"
                  />
                      <Label htmlFor="isRecurring" className="text-[#F3F4F6] font-medium">Make this a recurring ride</Label>
                </div>

                {formData.isRecurring && (
                      <motion.div 
                        className="space-y-4 p-4 bg-[#18181B]/50 rounded-lg border border-[#FFC857]/20"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <Label className="text-[#FFC857] font-semibold block">Repeat on:</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={formData.recurringDays.includes(day)}
                            onCheckedChange={(checked) => handleRecurringDayChange(day, !!checked)}
                                className="border-[#FFC857] data-[state=checked]:bg-[#FFC857] data-[state=checked]:border-[#FFC857]"
                          />
                              <Label htmlFor={day} className="text-[#F3F4F6] text-sm">
                                {day.slice(0, 3)}
                          </Label>
                        </div>
                      ))}
                    </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Notes Section */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-[#FFC857] to-[#FFD700] rounded-lg">
                      <MessageSquare className="h-5 w-5 text-[#18181B]" />
                    </div>
                    <Label className="text-lg font-semibold text-[#FFC857]">Additional Notes</Label>
              </div>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional information for riders (e.g., preferred pickup points, contact preferences, special requirements)"
                    rows={4}
                    className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all resize-none"
                />
                </motion.div>

                {/* Submit Buttons */}
                <motion.div 
                  className="flex space-x-4 pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push("/dashboard")} 
                    className="flex-1 border-2 border-[#FFC857] text-[#FFC857] hover:bg-[#FFC857] hover:text-[#18181B] transition-all transform hover:scale-105"
                  >
                  Cancel
                </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || apiStatus === 'offline'} 
                    className="flex-1 bg-gradient-to-r from-[#FFC857] to-[#FFD700] text-[#18181B] font-extrabold text-lg py-4 rounded-full shadow-lg hover:from-[#FFD700] hover:to-[#FFC857] transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating Ride...
                      </>
                    ) : (
                      <>
                        <Car className="h-5 w-5" />
                        Post Ride
                      </>
                    )}
                </Button>
                </motion.div>
            </form>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  )
}
