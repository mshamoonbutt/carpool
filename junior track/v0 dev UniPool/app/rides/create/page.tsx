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
import { ArrowLeft, Car, MapPin, Clock, Users } from "lucide-react"
import { AuthService } from "@/services/AuthService"
import { RideService } from "@/services/RideService"
import { LAHORE_AREAS } from "@/constants/locations"

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
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    if (currentUser.role === "rider") {
      router.push("/dashboard")
      return
    }
    setUser(currentUser)

    // Set default date to today
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    setFormData((prev) => ({
      ...prev,
      departureDate: tomorrow.toISOString().split("T")[0],
    }))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

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
        notes: routeDescription, // Send notes as description field to API
        isRecurring: formData.isRecurring,
        recurringDays: formData.recurringDays,
      }

      console.log("Submitting ride data:", rideData);
      await RideService.createRide(rideData)
      
      console.log("Ride created successfully!");
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Ride creation error:", err);
      
      // Show a more specific error message
      if (err.message.includes("token") || err.message.includes("log in")) {
        setError("Please log in again to post a ride.");
      } else if (err.message.includes("driver")) {
        setError("Only drivers can create rides. Please update your profile.");
      } else {
        setError(err.message || "Failed to create ride. Please try again.");
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-black" />
            <span className="text-xl font-bold text-black">Post a Ride</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Ride</CardTitle>
            <CardDescription>Share your ride with fellow FCC students and help build our community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Pickup Location */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <Label className="text-base font-medium">Pickup Location</Label>
                </div>

                <div>
                  <Label htmlFor="pickupArea">Pickup Area</Label>
                  <Select
                    value={formData.pickupArea}
                    onValueChange={(value) => setFormData({ ...formData, pickupArea: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pickup area" />
                    </SelectTrigger>
                    <SelectContent>
                      {LAHORE_AREAS.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">Other (specify below)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.pickupArea === "other" && (
                  <div>
                    <Label htmlFor="customPickupArea">Custom Pickup Area</Label>
                    <Input
                      id="customPickupArea"
                      value={formData.customPickupArea}
                      onChange={(e) => setFormData({ ...formData, customPickupArea: e.target.value })}
                      placeholder="Enter your pickup area"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="route">Route (Optional)</Label>
                  <Textarea
                    id="route"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    placeholder="Describe your route or areas you'll pass through (e.g., DHA Phase 4 → Main Boulevard → FCC)"
                    rows={2}
                  />
                </div>
              </div>

              {/* Destination */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <Label className="text-base font-medium">Destination</Label>
                </div>
                <Select
                  value={formData.destination}
                  onValueChange={(value) => setFormData({ ...formData, destination: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Forman Christian College">Forman Christian College</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <Label className="text-base font-medium">Departure Time</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departureDate">Date</Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="departureTime">Time</Label>
                    <Input
                      id="departureTime"
                      type="time"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">Rides are only allowed between 6:00 AM and 10:00 PM for safety</p>
              </div>

              {/* Seats */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <Label className="text-base font-medium">Available Seats</Label>
                </div>
                <Select
                  value={formData.totalSeats}
                  onValueChange={(value) => setFormData({ ...formData, totalSeats: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 seat</SelectItem>
                    <SelectItem value="2">2 seats</SelectItem>
                    <SelectItem value="3">3 seats</SelectItem>
                    <SelectItem value="4">4 seats</SelectItem>
                    <SelectItem value="5">5 seats</SelectItem>
                    <SelectItem value="6">6 seats</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recurring Ride */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: !!checked })}
                  />
                  <Label htmlFor="isRecurring">Make this a recurring ride</Label>
                </div>

                {formData.isRecurring && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Repeat on:</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={formData.recurringDays.includes(day)}
                            onCheckedChange={(checked) => handleRecurringDayChange(day, !!checked)}
                          />
                          <Label htmlFor={day} className="text-sm">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information for riders (e.g., preferred pickup points, contact preferences)"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-black text-white hover:bg-gray-800">
                  {loading ? "Creating Ride..." : "Post Ride"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
