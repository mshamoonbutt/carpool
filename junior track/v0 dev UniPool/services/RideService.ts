import type { Ride, CreateRideData } from "@/types"

export class RideService {
  private static STORAGE_KEY = "unipool_rides"

  static async createRide(data: CreateRideData): Promise<Ride> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides()

        if (data.isRecurring && data.recurringDays.length > 0) {
          // Create rides for the next 7 days
          const createdRides: Ride[] = []
          const startDate = new Date(data.departureTime)

          for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate)
            currentDate.setDate(startDate.getDate() + i)

            const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" })

            if (data.recurringDays.includes(dayName)) {
              const ride: Ride = {
                id: `${Date.now()}-${i}`,
                driverId: data.driverId,
                driverName: data.driverName,
                pickupArea: data.pickupArea,
                destination: data.destination,
                departureTime: currentDate.toISOString(),
                totalSeats: data.totalSeats,
                availableSeats: data.totalSeats,
                route: data.route,
                notes: data.notes,
                status: "active",
                isRecurring: true,
                recurringDays: data.recurringDays,
                createdAt: new Date().toISOString(),
              }

              rides.push(ride)
              createdRides.push(ride)
            }
          }

          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rides))
          resolve(createdRides[0]) // Return first created ride
        } else {
          // Create single ride
          const ride: Ride = {
            id: Date.now().toString(),
            driverId: data.driverId,
            driverName: data.driverName,
            pickupArea: data.pickupArea,
            destination: data.destination,
            departureTime: data.departureTime,
            totalSeats: data.totalSeats,
            availableSeats: data.totalSeats,
            route: data.route,
            notes: data.notes,
            status: "active",
            isRecurring: false,
            createdAt: new Date().toISOString(),
          }

          rides.push(ride)
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rides))
          resolve(ride)
        }
      }, 100)
    })
  }

  static async getRides(filters: any = {}): Promise<Ride[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let rides = this.getAllRides()

        // Filter active rides only
        rides = rides.filter((ride) => ride.status === "active")

        // Filter by date if provided
        if (filters.date) {
          const filterDate = new Date(filters.date).toDateString()
          rides = rides.filter((ride) => new Date(ride.departureTime).toDateString() === filterDate)
        }

        // Filter by pickup area if provided
        if (filters.pickupArea) {
          rides = rides.filter((ride) => ride.pickupArea.toLowerCase().includes(filters.pickupArea.toLowerCase()))
        }

        // Sort by departure time
        rides.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())

        resolve(rides)
      }, 100)
    })
  }

  static async searchRides(filters: any): Promise<Ride[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let rides = this.getAllRides()

        // Filter active rides with available seats
        rides = rides.filter(
          (ride) => ride.status === "active" && ride.availableSeats > 0 && new Date(ride.departureTime) > new Date(),
        )

        // Filter by pickup area
        if (filters.pickupArea) {
          rides = rides.filter((ride) => ride.pickupArea.toLowerCase().includes(filters.pickupArea.toLowerCase()))
        }

        // Filter by destination
        if (filters.destination) {
          rides = rides.filter((ride) => ride.destination === filters.destination)
        }

        // Filter by date
        if (filters.date) {
          const filterDate = new Date(filters.date).toDateString()
          rides = rides.filter((ride) => new Date(ride.departureTime).toDateString() === filterDate)
        }

        // Filter by time window
        if (filters.timeWindow && filters.time) {
          const targetTime = new Date(`${filters.date}T${filters.time}`)
          const windowMinutes = Number.parseInt(filters.timeWindow)

          rides = rides.filter((ride) => {
            const rideTime = new Date(ride.departureTime)
            const timeDiff = Math.abs(rideTime.getTime() - targetTime.getTime()) / (1000 * 60)
            return timeDiff <= windowMinutes
          })
        }

        // Sort by rating (high to low), then by time proximity
        rides.sort((a, b) => {
          const aRating = a.driverRating || 0
          const bRating = b.driverRating || 0

          if (aRating !== bRating) {
            return bRating - aRating
          }

          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
        })

        resolve(rides)
      }, 100)
    })
  }

  static async getUserRides(userId: string): Promise<Ride[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides()
        const userRides = rides.filter((ride) => ride.driverId === userId)
        userRides.sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime())
        resolve(userRides)
      }, 100)
    })
  }

  static async getAvailableRides(excludeUserId: string): Promise<Ride[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides()
        const availableRides = rides.filter(
          (ride) =>
            ride.driverId !== excludeUserId &&
            ride.status === "active" &&
            ride.availableSeats > 0 &&
            new Date(ride.departureTime) > new Date(),
        )

        // Sort by departure time
        availableRides.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())

        resolve(availableRides)
      }, 100)
    })
  }

  static async getRideById(rideId: string): Promise<Ride | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides()
        const ride = rides.find((r) => r.id === rideId)
        resolve(ride || null)
      }, 100)
    })
  }

  static async updateRide(rideId: string, updates: Partial<Ride>): Promise<Ride | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides()
        const index = rides.findIndex((r) => r.id === rideId)

        if (index !== -1) {
          rides[index] = { ...rides[index], ...updates }
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rides))
          resolve(rides[index])
        } else {
          resolve(null)
        }
      }, 100)
    })
  }

  static async cancelRide(rideId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides()
        const index = rides.findIndex((r) => r.id === rideId)

        if (index !== -1) {
          rides[index].status = "cancelled"
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rides))
          resolve(true)
        } else {
          resolve(false)
        }
      }, 100)
    })
  }

  private static getAllRides(): Ride[] {
    try {
      const ridesData = localStorage.getItem(this.STORAGE_KEY)
      return ridesData ? JSON.parse(ridesData) : []
    } catch {
      return []
    }
  }
}
