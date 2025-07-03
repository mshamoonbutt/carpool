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
import { ApiAuthService, User as ApiUser } from "@/services/ApiAuthService"
import { RatingService } from "@/services/RatingService"
import type { Rating } from "@/types"

export default function ProfilePage() {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    role: "rider" as "driver" | "rider" | "both",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await ApiAuthService.getCurrentUser()
    setUser(currentUser)
    setEditForm({
      name: currentUser.name,
      phone: currentUser.phone,
          role: currentUser.role as "driver" | "rider" | "both",
    })
    loadUserRatings(currentUser.id)
      } catch (err) {
        router.push("/auth/login")
      }
    }
    fetchUser()
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
      const updatedUser = await ApiAuthService.updateCurrentUser(editForm)
      setUser(updatedUser)
      setIsEditing(false)
      setSuccess("Profile updated successfully!")
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 border-b border-border shadow-md sticky top-0 z-10 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}
            className="rounded-full hover:bg-blue-100">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-blue-900 tracking-tight">My Profile</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl flex-1 flex flex-col items-center justify-center">
        {error && (
          <Alert variant="destructive" className="mb-6 w-full max-w-lg">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 w-full max-w-lg border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        <div className="w-full max-w-lg">
          <Card className="shadow-2xl rounded-3xl border-0 bg-white/90">
              <CardHeader>
                <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>Profile Information</span>
                  <Badge className="bg-gradient-to-r from-blue-400 to-purple-400 text-white ml-2 text-xs px-2 py-1 rounded-full shadow">{user.role}</Badge>
                </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 border-blue-200 hover:bg-blue-50"
                  >
                  <Edit className="h-4 w-4 text-blue-500" />
                    <span>{isEditing ? "Cancel" : "Edit"}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 flex items-center justify-center shadow-lg mb-2">
                  <User className="h-16 w-16 text-white" />
                </div>
                <div className="text-lg font-semibold text-blue-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-blue-50 border-blue-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="bg-blue-50 border-blue-200"
                        />
                      </div>
                    <div>
                      <Label>Role</Label>
                      <Select
                        value={editForm.role}
                      onValueChange={(value: "driver" | "rider" | "both") => setEditForm({ ...editForm, role: value })}
                      >
                      <SelectTrigger className="bg-blue-50 border-blue-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="rider">Rider</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  <Button onClick={handleSaveProfile} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg hover:from-blue-600 hover:to-purple-600">
                      Save Changes
                    </Button>
                  </div>
                ) : (
                <div className="space-y-2">
                      <div>
                    <Label className="text-gray-500">Full Name</Label>
                    <div className="text-blue-900 font-medium">{user.name}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Phone Number</Label>
                    <div className="text-blue-900 font-medium">{user.phone}</div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Role</Label>
                    <div className="text-blue-900 font-medium capitalize">{user.role}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
