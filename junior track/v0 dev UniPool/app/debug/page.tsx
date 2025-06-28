"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthService } from '@/services/AuthService'

export default function DebugPage() {
  const [stats, setStats] = useState({ users: 0, rides: 0, bookings: 0 })
  const [allData, setAllData] = useState<any>({})
  const [currentUser, setCurrentUser] = useState<any>(null)

  const refreshData = () => {
    setStats(AuthService.getDatabaseStats())
    setAllData(AuthService.getAllData())
    setCurrentUser(AuthService.getCurrentUser())
  }

  useEffect(() => {
    refreshData()
  }, [])

  const handleResetDatabase = async () => {
    if (window.confirm('Are you sure you want to reset the database? This will clear all data and reload seed data.')) {
      await AuthService.resetDatabase()
      refreshData()
      alert('Database reset successfully!')
    }
  }

  const downloadData = () => {
    const dataStr = JSON.stringify(allData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'unipool-data-backup.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">UniPool Debug Dashboard</h1>
      
      {/* Database Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
              <div className="text-sm text-gray-600">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.rides}</div>
              <div className="text-sm text-gray-600">Rides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.bookings}</div>
              <div className="text-sm text-gray-600">Bookings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current User */}
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <div className="space-y-2">
              <p><strong>Name:</strong> {currentUser.name}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Role:</strong> {currentUser.role}</p>
              <p><strong>User Type:</strong> {currentUser.userType}</p>
              {currentUser.userType === 'student' && (
                <>
                  <p><strong>Major:</strong> {currentUser.major}</p>
                  <p><strong>Year:</strong> {currentUser.year}</p>
                </>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No user currently logged in</p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={refreshData} variant="outline">
              Refresh Data
            </Button>
            <Button onClick={downloadData} variant="outline">
              Download Data Backup
            </Button>
            <Button onClick={handleResetDatabase} variant="destructive">
              Reset Database
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Raw Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Data (First 5 Users)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(
              {
                users: allData.users?.slice(0, 5) || [],
                rides: allData.rides?.slice(0, 3) || [],
                bookings: allData.bookings?.slice(0, 3) || []
              }, 
              null, 
              2
            )}
          </pre>
        </CardContent>
      </Card>

      {/* Email Validation Test */}
      <Card>
        <CardHeader>
          <CardTitle>Email Validation Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Valid Emails:</strong>
                <ul className="text-green-600 mt-1">
                  <li>✓ test@formanite.fccollege.edu.pk</li>
                  <li>✓ dr.smith@fccollege.edu.pk</li>
                </ul>
              </div>
              <div>
                <strong>Invalid Emails:</strong>
                <ul className="text-red-600 mt-1">
                  <li>✗ test@gmail.com</li>
                  <li>✗ user@othercollege.edu.pk</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}