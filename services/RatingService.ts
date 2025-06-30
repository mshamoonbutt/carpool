import type { Rating, CreateRatingData } from "@/types"

export class RatingService {
  private static STORAGE_KEY = "unipool_ratings"

  static async createRating(data: CreateRatingData): Promise<Rating> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ratings = this.getAllRatings()

        const rating: Rating = {
          id: Date.now().toString(),
          rideId: data.rideId,
          raterId: data.raterId,
          raterName: data.raterName,
          ratedUserId: data.ratedUserId,
          rating: data.rating,
          review: data.review,
          type: data.type,
          createdAt: new Date().toISOString(),
        }

        ratings.push(rating)
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ratings))

        // Update user's overall rating
        this.updateUserRating(data.ratedUserId)

        resolve(rating)
      }, 100)
    })
  }

  static async getUserRatings(userId: string): Promise<Rating[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ratings = this.getAllRatings()
        const userRatings = ratings.filter((rating) => rating.ratedUserId === userId)
        userRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        resolve(userRatings)
      }, 100)
    })
  }

  static async getRideRatings(rideId: string): Promise<Rating[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ratings = this.getAllRatings()
        const rideRatings = ratings.filter((rating) => rating.rideId === rideId)
        resolve(rideRatings)
      }, 100)
    })
  }

  private static updateUserRating(userId: string): void {
    const ratings = this.getAllRatings()
    const userRatings = ratings.filter((r) => r.ratedUserId === userId)

    if (userRatings.length >= 3) {
      const averageRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length

      // Update user in localStorage
      const users = JSON.parse(localStorage.getItem("unipool_users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === userId)

      if (userIndex !== -1) {
        users[userIndex].rating = averageRating
        users[userIndex].rideCount = userRatings.length
        localStorage.setItem("unipool_users", JSON.stringify(users))

        // Update current user if it's the same user
        const currentUser = JSON.parse(localStorage.getItem("unipool_user") || "null")
        if (currentUser && currentUser.id === userId) {
          currentUser.rating = averageRating
          currentUser.rideCount = userRatings.length
          localStorage.setItem("unipool_user", JSON.stringify(currentUser))
        }
      }
    }
  }

  private static getAllRatings(): Rating[] {
    try {
      const ratingsData = localStorage.getItem(this.STORAGE_KEY)
      return ratingsData ? JSON.parse(ratingsData) : []
    } catch {
      return []
    }
  }
}
