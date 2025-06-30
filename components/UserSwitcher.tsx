"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users, Star, RefreshCw, Trash2 } from "lucide-react"
import { SeedDataService } from "@/services/SeedDataService"
import { AuthService } from "@/services/AuthService"
import type { User } from "@/types"

interface UserSwitcherProps {
  onUserSwitch?: () => void
}

export function UserSwitcher({ onUserSwitch }: UserSwitcherProps) {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedUserId, setSelectedUserId] = useState("")
  const router = useRouter()

  useEffect(() => {
    loadUsers()
    setCurrentUser(AuthService.getCurrentUser())
  }, [])

  const loadUsers = () => {
    const allUsers = SeedDataService.getAllUsers()
    setUsers(allUsers)
  }

  const handleSeedData = async () => {
    await SeedDataService.seedDatabase()
    loadUsers()
    window.location.reload() // Refresh to show seeded data
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      SeedDataService.clearAllData()
      setUsers([])
      setCurrentUser(null)
      router.push("/")
    }
  }

  const handleUserSwitch = async () => {
    if (!selectedUserId) return

    const user = await SeedDataService.switchUser(selectedUserId)
    if (user) {
      setCurrentUser(user)
      onUserSwitch?.()
      router.push("/dashboard")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Demo User Switcher</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User */}
        {currentUser && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-gray-600">{currentUser.major}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline">{currentUser.role}</Badge>
                {currentUser.rating && currentUser.rideCount >= 3 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{currentUser.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Switcher */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Switch to User:</label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{user.name}</span>
                    <div className="flex items-center space-x-2 ml-2">
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                      {user.rating && user.rideCount >= 3 && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{user.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleUserSwitch}
            disabled={!selectedUserId}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            Switch User
          </Button>
        </div>

        {/* Demo Controls */}
        <div className="border-t pt-4 space-y-2">
          <Button onClick={handleSeedData} variant="outline" className="w-full bg-transparent" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Seed Sample Data
          </Button>
          <Button onClick={handleClearData} variant="outline" className="w-full bg-transparent" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Demo Mode: Switch between users to test different perspectives
        </div>
      </CardContent>
    </Card>
  )
}
