"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// This demo page is no longer used - redirect to the main dashboard
export default function DemoPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the main dashboard
    router.replace("/dashboard")
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  )

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Demo Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Welcome to UniPool Demo</CardTitle>
              <CardDescription>
                Experience the full functionality of UniPool by switching between different user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Database className="h-12 w-12 text-black mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Sample Data</h3>
                  <p className="text-sm text-gray-600">
                    Pre-loaded with 6 users, 10+ rides, and authentic ratings to showcase the platform
                  </p>
                </div>
                <div className="text-center">
                  <Users className="h-12 w-12 text-black mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Multi-User Testing</h3>
                  <p className="text-sm text-gray-600">
                    Switch between drivers, riders, and mixed-role users to see different perspectives
                  </p>
                </div>
                <div className="text-center">
                  <Star className="h-12 w-12 text-black mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Full Features</h3>
                  <p className="text-sm text-gray-600">
                    Test ride creation, booking, rating system, and all core functionality
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Switcher */}
            <div>
              <UserSwitcher />
            </div>

            {/* Demo Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Use the Demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Seed Sample Data</p>
                      <p className="text-sm text-gray-600">
                        Click "Seed Sample Data" to populate the app with realistic users and rides
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Switch Users</p>
                      <p className="text-sm text-gray-600">
                        Select different users from the dropdown to experience various roles and perspectives
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Test Features</p>
                      <p className="text-sm text-gray-600">
                        Create rides as drivers, book rides as riders, and explore the rating system
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Multi-Tab Testing</p>
                      <p className="text-sm text-gray-600">
                        Open multiple browser tabs with different users to simulate real-time interactions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <h4 className="font-medium text-blue-900 mb-2">Sample Users Include:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ahmed Hassan (Both Driver & Rider) - 4.8★</li>
                    <li>• Ali Raza (Driver Only) - 4.9★</li>
                    <li>• Fatima Khan (Rider Only) - 4.6★</li>
                    <li>• Dr. Muhammad Tariq (Faculty Driver) - 4.7★</li>
                    <li>• And more with various ratings and ride histories</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
