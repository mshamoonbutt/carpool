"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, Star, Car, Users, Edit } from "lucide-react"
import { AuthService } from "@/services/AuthService"
import { RatingService } from "@/services/RatingService"
import type { User as UserType, Rating } from "@/types"

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    major: "",
    year: "",
    role: "rider" as "driver" | "rider" | "both",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) {
      router.push("/auth/login")
      return
    }
    setUser(currentUser)
    setEditForm({
      name: currentUser.name,
      phone: currentUser.phone,
      major: currentUser.major,
      year: currentUser.year,
      role: currentUser.role,
    })
    loadUserRatings(currentUser.id)
  }, [router])

  const loadUserRatings = async (userId: string) => {
    try {
      const userRatings = await RatingService.getUserRatings(userId)
      setRatings(userRatings)
    } catch (error) {
      console.error("Error loading ratings:", error)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setError("")
    setSuccess("")

    try {
      const updatedUser = {
        ...user,
        ...editForm,
      }

      AuthService.updateUser(updatedUser)
      setUser(updatedUser)
      setIsEditing(false)
      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError("Failed to update profile")
    }
  }

  const getAverageRating = (type: "driver" | "rider") => {
    const typeRatings = ratings.filter((r) => r.type === type)
    if (typeRatings.length === 0) return null
    const sum = typeRatings.reduce((acc, r) => acc + r.rating, 0)
    return sum / typeRatings.length
  }

  const getRatingCount = (type: "driver" | "rider") => {
    return ratings.filter((r) => r.type === type).length
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
            <User className="h-6 w-6 text-black" />
            <span className="text-xl font-bold text-black">My Profile</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>{isEditing ? "Cancel" : "Edit"}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="major">Major/Department</Label>
                        <Input
                          id="major"
                          value={editForm.major}
                          onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Select
                          value={editForm.year}
                          onValueChange={(value) => setEditForm({ ...editForm, year: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1st Year">1st Year</SelectItem>
                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                            <SelectItem value="3rd Year">3rd Year</SelectItem>
                            <SelectItem value="4th Year">4th Year</SelectItem>
                            <SelectItem value="Graduate">Graduate</SelectItem>
                            <SelectItem value="Faculty">Faculty</SelectItem>
                            <SelectItem value="Staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Role</Label>
                      <Select
                        value={editForm.role}
                        onValueChange={(value: "driver" | "rider" | "both") =>
                          setEditForm({ ...editForm, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rider">Find rides (Rider only)</SelectItem>
                          <SelectItem value="driver">Offer rides (Driver only)</SelectItem>
                          <SelectItem value="both">Both offer and find rides</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleSaveProfile} className="bg-black text-white hover:bg-gray-800">
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Name</Label>
                        <p className="text-lg">{user.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                        <p className="text-lg">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Phone</Label>
                        <p className="text-lg">{user.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Role</Label>
                        <Badge variant="outline" className="text-sm">
                          {user.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Major</Label>
                        <p className="text-lg">{user.major}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Year</Label>
                        <p className="text-lg">{user.year}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                      <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>What others are saying about you</CardDescription>
              </CardHeader>
              <CardContent>
                {ratings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {ratings.slice(0, 5).map((rating) => (
                      <div key={rating.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{rating.raterName}</span>
                            <Badge variant="outline" className="text-xs">
                              {rating.type}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{rating.rating}</span>
                          </div>
                        </div>
                        {rating.review && <p className="text-sm text-gray-600">{rating.review}</p>}
                        <p className="text-xs text-gray-400 mt-2">{new Date(rating.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Rating Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {user.rating && user.rideCount >= 3 ? user.rating.toFixed(1) : "N/A"}
                  </div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">Overall Rating</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {user.rideCount < 3 ? "Complete 3 rides to see rating" : `Based on ${user.rideCount} rides`}
                  </p>
                </div>

                {(user.role === "driver" || user.role === "both") && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">As Driver</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{getAverageRating("driver")?.toFixed(1) || "N/A"}</div>
                        <div className="text-xs text-gray-500">{getRatingCount("driver")} reviews</div>
                      </div>
                    </div>
                  </div>
                )}

                {(user.role === "rider" || user.role === "both") && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">As Rider</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{getAverageRating("rider")?.toFixed(1) || "N/A"}</div>
                        <div className="text-xs text-gray-500">{getRatingCount("rider")} reviews</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Rides</span>
                  <span className="font-medium">{user.rideCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Reviews Given</span>
                  <span className="font-medium">{ratings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Account Type</span>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
