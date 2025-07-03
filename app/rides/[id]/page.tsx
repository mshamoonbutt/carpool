"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, MapPin, Users, Star, User, Car } from "lucide-react"
import { ApiAuthService } from "@/services/ApiAuthService"
import { RideService } from "@/services/RideService"
import { BookingService } from "@/services/BookingService"
import type { Ride, Booking, User as UserType } from "@/types"

export default function RideDetailsPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [ride, setRide] = useState<Ride | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [bookingForm, setBookingForm] = useState({
    pickupPoint: "",
    dropoffPoint: "Forman Christian College",
    notes: "",
  })
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)

  const router = useRouter()
  const params = useParams()
  const rideId = params.id as string

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
    loadRideDetails()
  }, [router, rideId])

  const loadRideDetails = async () => {
    try {
      const [rideData, bookingsData] = await Promise.all([
        RideService.getRideById(rideId),
        BookingService.getRideBookings(rideId),
      ])

      if (!rideData) {
        setError("Ride not found")
        return
      }

      setRide(rideData)
      setBookings(bookingsData)
    } catch (err) {
      setError("Failed to load ride details")
    } finally {
      setLoading(false)
    }
  }

  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !ride) return

    setBookingLoading(true)
    setError("")

    try {
      await BookingService.createBooking({
        rideId: ride.id,
        riderId: user.id,
        riderName: user.name,
        pickupPoint: bookingForm.pickupPoint,
        dropoffPoint: bookingForm.dropoffPoint,
      })

      // Reload ride details to update available seats
      await loadRideDetails()
      setShowBookingForm(false)
      setBookingForm({ pickupPoint: "", dropoffPoint: "Forman Christian College", notes: "" })
    } catch (err: any) {
      setError(err.message || "Failed to book ride")
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelRide = async () => {
    if (!ride || !confirm("Are you sure you want to cancel this ride? This will notify all booked riders.")) {
      return
    }

    try {
      await RideService.cancelRide(ride.id)
      router.push("/dashboard")
    } catch (err) {
      setError("Failed to cancel ride")
    }
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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Karachi",
    })
  }

  const canBookRide = () => {
    if (!user || !ride) return false
    if (ride.driverId === user.id) return false
    if (ride.availableSeats <= 0) return false
    if (ride.status !== "active") return false
    if (new Date(ride.departureTime) <= new Date()) return false

    // Check if user already booked
    const existingBooking = bookings.find((b) => b.riderId === user.id && b.status === "confirmed")
    return !existingBooking
  }

  const isRideOwner = () => {
    return user && ride && ride.driverId === user.id
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading ride details...</p>
      </div>
    )
  }

  if (error && !ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (!ride) return null

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
            <span className="text-xl font-bold text-black">Ride Details</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Ride Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {ride.pickupArea} → {ride.destination}
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {formatDate(ride.departureTime)} at {formatTime(ride.departureTime)}
                    </CardDescription>
                  </div>
                  <Badge variant={ride.status === "active" ? "default" : "secondary"} className="text-sm">
                    {ride.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Driver Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Driver Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{ride.driverName}</p>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          {ride.driverRating && ride.driverRideCount && ride.driverRideCount >= 3 ? (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>
                                {ride.driverRating.toFixed(1)} ({ride.driverRideCount} rides)
                              </span>
                            </div>
                          ) : (
                            <span>New driver</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ride Details */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Route Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Pickup: {ride.pickupArea}</span>
                    </div>
                    {ride.route && (
                      <div className="ml-6 text-sm text-gray-600">
                        <strong>Route:</strong> {ride.route}
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">Destination: {ride.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Seats */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Seat Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>Available Seats</span>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {ride.availableSeats} / {ride.totalSeats}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {ride.notes && (
                  <div>
                    <h3 className="font-semibold mb-3">Additional Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{ride.notes}</p>
                    </div>
                  </div>
                )}

                {/* Recurring Info */}
                {ride.isRecurring && ride.recurringDays && (
                  <div>
                    <h3 className="font-semibold mb-3">Recurring Ride</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800">This ride repeats on: {ride.recurringDays.join(", ")}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Form */}
            {canBookRide() && (
              <Card>
                <CardHeader>
                  <CardTitle>Book This Ride</CardTitle>
                  <CardDescription>Specify your pickup and drop-off points</CardDescription>
                </CardHeader>
                <CardContent>
                  {!showBookingForm ? (
                    <Button
                      onClick={() => setShowBookingForm(true)}
                      className="w-full bg-black text-white hover:bg-gray-800"
                    >
                      Book This Ride
                    </Button>
                  ) : (
                    <form onSubmit={handleBookRide} className="space-y-4">
                      <div>
                        <Label htmlFor="pickupPoint">Specific Pickup Point</Label>
                        <Input
                          id="pickupPoint"
                          value={bookingForm.pickupPoint}
                          onChange={(e) => setBookingForm({ ...bookingForm, pickupPoint: e.target.value })}
                          placeholder={`Exact location in ${ride.pickupArea}`}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="dropoffPoint">Drop-off Point</Label>
                        <Input
                          id="dropoffPoint"
                          value={bookingForm.dropoffPoint}
                          onChange={(e) => setBookingForm({ ...bookingForm, dropoffPoint: e.target.value })}
                          placeholder="Specific location at FCC"
                          required
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowBookingForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={bookingLoading}
                          className="flex-1 bg-black text-white hover:bg-gray-800"
                        >
                          {bookingLoading ? "Booking..." : "Confirm Booking"}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isRideOwner() ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => router.push(`/rides/${ride.id}/manage`)}
                    >
                      Manage Ride
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={handleCancelRide}>
                      Cancel Ride
                    </Button>
                  </>
                ) : (
                  <>
                    {!canBookRide() && ride.availableSeats <= 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">This ride is fully booked</p>
                      </div>
                    )}
                    {!canBookRide() && new Date(ride.departureTime) <= new Date() && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">This ride has already departed</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Current Bookings */}
            {isRideOwner() && bookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Current Bookings ({bookings.filter((b) => b.status === "confirmed").length} confirmed, {bookings.filter((b) => b.status === "pending").length} pending)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookings
                      .filter((b) => b.status === "confirmed" || b.status === "pending")
                      .map((booking) => (
                        <div key={booking.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{booking.riderName}</div>
                            <Badge variant={
                              booking.status === "confirmed" ? "default" : 
                              booking.status === "pending" ? "outline" : "secondary"
                            }>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {booking.pickupPoint} → {booking.dropoffPoint}
                          </div>
                          
                          {booking.status === "pending" && (
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="default"
                                className="flex-1" 
                                onClick={async () => {
                                  await BookingService.approveBooking(booking.id);
                                  loadRideDetails();
                                }}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1" 
                                onClick={async () => {
                                  await BookingService.rejectBooking(booking.id);
                                  loadRideDetails();
                                }}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ride Status */}
            <Card>
              <CardHeader>
                <CardTitle>Ride Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={ride.status === "active" ? "default" : "secondary"}>{ride.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(ride.createdAt).toLocaleDateString()}</span>
                  </div>
                  {ride.isRecurring && (
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>Recurring</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
