import type { User, Ride, Rating } from "@/types"

export class SeedDataService {
  static async seedDatabase(): Promise<void> {
    // Check if data already exists
    const existingUsers = JSON.parse(localStorage.getItem("unipool_users") || "[]")
    if (existingUsers.length > 0) {
      console.log("Seed data already exists")
      return
    }

    console.log("Seeding database with sample data...")

    // Sample users
    const sampleUsers = [
      {
        id: "user1",
        name: "Ahmed Hassan",
        email: "ahmed.hassan@formanite.fccollege.edu.pk",
        phone: "+92 300 1234567",
        major: "Computer Science",
        year: "3rd Year",
        role: "both" as const,
        rating: 4.8,
        rideCount: 15,
        createdAt: "2024-01-15T10:00:00.000Z",
      },
      {
        id: "user2",
        name: "Fatima Khan",
        email: "fatima.khan@formanite.fccollege.edu.pk",
        phone: "+92 301 2345678",
        major: "Business Administration",
        year: "2nd Year",
        role: "rider" as const,
        rating: 4.6,
        rideCount: 8,
        createdAt: "2024-01-20T10:00:00.000Z",
      },
      {
        id: "user3",
        name: "Ali Raza",
        email: "ali.raza@formanite.fccollege.edu.pk",
        phone: "+92 302 3456789",
        major: "Engineering",
        year: "4th Year",
        role: "driver" as const,
        rating: 4.9,
        rideCount: 22,
        createdAt: "2024-01-25T10:00:00.000Z",
      },
      {
        id: "user4",
        name: "Sara Ahmad",
        email: "sara.ahmad@formanite.fccollege.edu.pk",
        phone: "+92 303 4567890",
        major: "Psychology",
        year: "1st Year",
        role: "rider" as const,
        rating: 4.4,
        rideCount: 5,
        createdAt: "2024-02-01T10:00:00.000Z",
      },
      {
        id: "user5",
        name: "Dr. Muhammad Tariq",
        email: "m.tariq@fccollege.edu.pk",
        phone: "+92 304 5678901",
        major: "Faculty - Computer Science",
        year: "Faculty",
        role: "driver" as const,
        rating: 4.7,
        rideCount: 12,
        createdAt: "2024-02-05T10:00:00.000Z",
      },
      {
        id: "user6",
        name: "Zainab Sheikh",
        email: "zainab.sheikh@formanite.fccollege.edu.pk",
        phone: "+92 305 6789012",
        major: "Economics",
        year: "3rd Year",
        role: "both" as const,
        rating: 4.5,
        rideCount: 9,
        createdAt: "2024-02-10T10:00:00.000Z",
      },
    ]

    // Save users
    localStorage.setItem("unipool_users", JSON.stringify(sampleUsers))

    // Sample rides
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(8, 0, 0, 0)

    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)
    dayAfter.setHours(9, 30, 0, 0)

    const sampleRides: Ride[] = [
      {
        id: "ride1",
        driverId: "user1",
        driverName: "Ahmed Hassan",
        driverRating: 4.8,
        driverRideCount: 15,
        pickupArea: "DHA Phase 5",
        destination: "Forman Christian College",
        departureTime: tomorrow.toISOString(),
        totalSeats: 4,
        availableSeats: 2,
        route: "DHA Phase 5 → Main Boulevard → Jail Road → FCC",
        notes: "Prefer pickup near Phase 5 commercial area",
        status: "active",
        isRecurring: true,
        recurringDays: ["Monday", "Wednesday", "Friday"],
        createdAt: "2024-12-20T10:00:00.000Z",
      },
      {
        id: "ride2",
        driverId: "user3",
        driverName: "Ali Raza",
        driverRating: 4.9,
        driverRideCount: 22,
        pickupArea: "Gulberg III",
        destination: "Forman Christian College",
        departureTime: dayAfter.toISOString(),
        totalSeats: 3,
        availableSeats: 1,
        route: "Gulberg III → Liberty → Jail Road → FCC",
        notes: "Regular morning commute, very punctual",
        status: "active",
        isRecurring: false,
        createdAt: "2024-12-21T10:00:00.000Z",
      },
      {
        id: "ride3",
        driverId: "user5",
        driverName: "Dr. Muhammad Tariq",
        driverRating: 4.7,
        driverRideCount: 12,
        pickupArea: "Model Town",
        destination: "Forman Christian College",
        departureTime: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        totalSeats: 2,
        availableSeats: 2,
        route: "Model Town → Canal Road → FCC",
        notes: "Faculty member, quiet ride preferred",
        status: "active",
        isRecurring: true,
        recurringDays: ["Tuesday", "Thursday"],
        createdAt: "2024-12-22T10:00:00.000Z",
      },
      {
        id: "ride4",
        driverId: "user6",
        driverName: "Zainab Sheikh",
        driverRating: 4.5,
        driverRideCount: 9,
        pickupArea: "Johar Town",
        destination: "Forman Christian College",
        departureTime: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        totalSeats: 4,
        availableSeats: 3,
        route: "Johar Town → Emporium Mall → Canal Road → FCC",
        notes: "Can pick up from multiple points in Johar Town",
        status: "active",
        isRecurring: false,
        createdAt: "2024-12-23T10:00:00.000Z",
      },
    ]

    localStorage.setItem("unipool_rides", JSON.stringify(sampleRides))

    // Sample ratings
    const sampleRatings: Rating[] = [
      {
        id: "rating1",
        rideId: "ride1",
        raterId: "user2",
        raterName: "Fatima Khan",
        ratedUserId: "user1",
        rating: 5,
        review: "Excellent driver, very punctual and friendly!",
        type: "driver",
        createdAt: "2024-12-15T10:00:00.000Z",
      },
      {
        id: "rating2",
        rideId: "ride2",
        raterId: "user4",
        raterName: "Sara Ahmad",
        ratedUserId: "user3",
        rating: 5,
        review: "Safe driving and great conversation. Highly recommend!",
        type: "driver",
        createdAt: "2024-12-16T10:00:00.000Z",
      },
      {
        id: "rating3",
        rideId: "ride1",
        raterId: "user1",
        raterName: "Ahmed Hassan",
        ratedUserId: "user2",
        rating: 4,
        review: "Good passenger, on time and respectful.",
        type: "rider",
        createdAt: "2024-12-15T11:00:00.000Z",
      },
      {
        id: "rating4",
        rideId: "ride3",
        raterId: "user6",
        raterName: "Zainab Sheikh",
        ratedUserId: "user5",
        rating: 5,
        review: "Professional and courteous. Great ride with Dr. Tariq!",
        type: "driver",
        createdAt: "2024-12-17T10:00:00.000Z",
      },
    ]

    localStorage.setItem("unipool_ratings", JSON.stringify(sampleRatings))

    console.log("Sample data seeded successfully!")
  }

  static clearAllData(): void {
    localStorage.removeItem("unipool_users")
    localStorage.removeItem("unipool_rides")
    localStorage.removeItem("unipool_bookings")
    localStorage.removeItem("unipool_ratings")
    localStorage.removeItem("unipool_user")
    console.log("All data cleared!")
  }

  static async switchUser(userId: string): Promise<User | null> {
    const users = JSON.parse(localStorage.getItem("unipool_users") || "[]")
    const user = users.find((u: User) => u.id === userId)

    if (user) {
      localStorage.setItem("unipool_user", JSON.stringify(user))
      return user
    }

    return null
  }

  static getAllUsers(): User[] {
    return JSON.parse(localStorage.getItem("unipool_users") || "[]")
  }
}
