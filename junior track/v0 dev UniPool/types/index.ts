export interface User {
  id: string
  name: string
  email: string
  phone: string
  major: string
  year: string
  role: "driver" | "rider" | "both"
  rating?: number
  rideCount: number
  createdAt: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  major: string
  year: string
  role: "driver" | "rider" | "both"
}

export interface Ride {
  id: string
  driverId: string
  driverName: string
  driverRating?: number
  driverRideCount?: number
  pickupArea: string
  destination: string
  departureTime: string
  totalSeats: number
  availableSeats: number
  route?: string
  notes?: string
  status: "active" | "completed" | "cancelled"
  isRecurring: boolean
  recurringDays?: string[]
  createdAt: string
}

export interface CreateRideData {
  driverId: string
  driverName: string
  pickupArea: string
  destination: string
  departureTime: string
  totalSeats: number
  route?: string
  notes?: string
  isRecurring: boolean
  recurringDays: string[]
}

export interface Booking {
  id: string
  rideId: string
  riderId: string
  riderName: string
  pickupPoint: string
  dropoffPoint: string
  departureTime: string
  driverName: string
  status: "confirmed" | "cancelled" | "cancelled_late" | "completed"
  createdAt: string
}

export interface CreateBookingData {
  rideId: string
  riderId: string
  riderName: string
  pickupPoint: string
  dropoffPoint: string
}

export interface Rating {
  id: string
  rideId: string
  raterId: string
  raterName: string
  ratedUserId: string
  rating: number
  review?: string
  type: "driver" | "rider"
  createdAt: string
}

export interface CreateRatingData {
  rideId: string
  raterId: string
  raterName: string
  ratedUserId: string
  rating: number
  review?: string
  type: "driver" | "rider"
}
