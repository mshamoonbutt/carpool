import type { Booking, CreateBookingData } from "@/types"
import { RideService } from "./RideService"

export class BookingService {
  private static STORAGE_KEY = "unipool_bookings"

  static async createBooking(data: CreateBookingData): Promise<Booking> {
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        try {
          const bookings = this.getAllBookings()

          // Check if ride exists and has available seats
          const ride = await RideService.getRideById(data.rideId)
          if (!ride) {
            reject(new Error("Ride not found"))
            return
          }

          if (ride.availableSeats <= 0) {
            reject(new Error("No seats available"))
            return
          }

          // Check if user already booked this ride
          const existingBooking = bookings.find((b) => b.rideId === data.rideId && b.riderId === data.riderId)

          if (existingBooking) {
            reject(new Error("You have already booked this ride"))
            return
          }

          // Create booking
          const booking: Booking = {
            id: Date.now().toString(),
            rideId: data.rideId,
            riderId: data.riderId,
            riderName: data.riderName,
            pickupPoint: data.pickupPoint,
            dropoffPoint: data.dropoffPoint,
            departureTime: ride.departureTime,
            driverName: ride.driverName,
            status: "confirmed",
            createdAt: new Date().toISOString(),
          }

          bookings.push(booking)
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings))

          // Update ride available seats
          await RideService.updateRide(data.rideId, {
            availableSeats: ride.availableSeats - 1,
          })

          resolve(booking)
        } catch (error) {
          reject(error)
        }
      }, 100)
    })
  }

  static async getUserBookings(userId: string): Promise<Booking[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const bookings = this.getAllBookings()
        const userBookings = bookings.filter((booking) => booking.riderId === userId)
        userBookings.sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime())
        resolve(userBookings)
      }, 100)
    })
  }

  static async getRideBookings(rideId: string): Promise<Booking[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const bookings = this.getAllBookings()
        const rideBookings = bookings.filter((booking) => booking.rideId === rideId)
        resolve(rideBookings)
      }, 100)
    })
  }

  static async cancelBooking(bookingId: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const bookings = this.getAllBookings()
        const index = bookings.findIndex((b) => b.id === bookingId)

        if (index !== -1) {
          const booking = bookings[index]

          // Check if cancellation is allowed (1 hour before departure)
          const departureTime = new Date(booking.departureTime)
          const now = new Date()
          const hoursDiff = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60)

          if (hoursDiff < 1) {
            // Late cancellation - update status but don't remove
            bookings[index].status = "cancelled_late"
          } else {
            // Normal cancellation
            bookings[index].status = "cancelled"
          }

          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings))

          // Update ride available seats
          const ride = await RideService.getRideById(booking.rideId)
          if (ride) {
            await RideService.updateRide(booking.rideId, {
              availableSeats: ride.availableSeats + 1,
            })
          }

          resolve(true)
        } else {
          resolve(false)
        }
      }, 100)
    })
  }

  private static getAllBookings(): Booking[] {
    try {
      const bookingsData = localStorage.getItem(this.STORAGE_KEY)
      return bookingsData ? JSON.parse(bookingsData) : []
    } catch {
      return []
    }
  }
}
