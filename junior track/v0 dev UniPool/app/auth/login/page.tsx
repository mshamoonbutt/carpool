"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { AuthService } from "@/services/AuthService"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    userType: 'student' | 'faculty' | null;
    error: string | null;
  } | null>(null)

  const router = useRouter()

  // Handle email input change with real-time validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value
    setEmail(emailValue)
    setError("") // Clear previous errors
    
    // Validate email in real-time
    if (emailValue.trim()) {
      const validation = AuthService.validateEmail(emailValue)
      setEmailValidation(validation)
    } else {
      setEmailValidation(null)
    }
  }

  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError("") // Clear previous errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email before submitting
    const emailValidation = AuthService.validateEmail(email)
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email')
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validate password is entered
      if (!password) {
        setError("Password is required");
        setLoading(false);
        return;
      }
      
      const user = await AuthService.login(email, password)
      if (user) {
        setSuccess("Login successful! Redirecting to dashboard...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back to UniPool</CardTitle>
          <CardDescription className="text-center">
            Sign in to your FCC account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field with Real-time Validation */}
            <div className="space-y-2">
              <Label htmlFor="email">FCC Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`${
                    emailValidation?.isValid 
                      ? 'border-green-500 focus:ring-green-500' 
                      : emailValidation?.error 
                        ? 'border-red-500 focus:ring-red-500'
                        : ''
                  }`}
                  placeholder="your.name@formanite.fccollege.edu.pk"
                  required
                />
                {emailValidation?.isValid && (
                  <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
                {emailValidation?.error && (
                  <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                )}
              </div>
              
              {/* Password Field */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Email Validation Feedback */}
              {emailValidation?.isValid && (
                <div className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Valid {emailValidation.userType === 'student' ? 'student' : 'faculty/staff'} email
                </div>
              )}
              
              {emailValidation?.error && (
                <p className="text-sm text-red-600">{emailValidation.error}</p>
              )}
              
              {/* Email Domain Help Text */}
              <p className="text-xs text-muted-foreground">
                Use @formanite.fccollege.edu.pk for students or @fccollege.edu.pk for faculty/staff
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Display */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full btn-fun"
              disabled={loading || !emailValidation?.isValid}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/auth/register" className="font-medium text-foreground hover:underline">
              Create one here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}