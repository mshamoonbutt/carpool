"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, AlertCircle } from "lucide-react"
import { AuthService } from "@/services/AuthService"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "",
    major: "",
    year: "",
    phone: ""
  })
  
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    userType: 'student' | 'faculty' | null;
    error: string | null;
  } | null>(null)

  const router = useRouter()

  // Handle email input change with real-time validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setFormData(prev => ({ ...prev, email }))
    setError("") // Clear general errors
    
    // Validate email in real-time
    if (email.trim()) {
      const validation = AuthService.validateEmail(email)
      setEmailValidation(validation)
    } else {
      setEmailValidation(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("") // Clear errors when user starts typing
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }))
    setError("")
  }

  const handleYearChange = (value: string) => {
    setFormData(prev => ({ ...prev, year: value }))
    setError("")
  }

  const validateForm = () => {
    // Email validation
    const emailValidation = AuthService.validateEmail(formData.email)
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email')
      return false
    }

    // Required fields
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }

    if (!formData.role) {
      setError('Please select your role')
      return false
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return false
    }

    // Phone validation (basic)
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      setError('Please enter a valid phone number')
      return false
    }

    // Student-specific validation
    if (emailValidation.isValid && emailValidation.userType === 'student') {
      if (!formData.year) {
        setError('Year is required for students')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const user = await AuthService.register({
        email: formData.email,
        name: formData.name,
        role: formData.role as 'driver' | 'rider' | 'both',
        major: "N/A", // Set to N/A as we're removing the major field
        year: formData.year,
        phone: formData.phone
      })

      if (user) {
        setSuccess("Account created successfully! Redirecting to dashboard...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Your UniPool Account</CardTitle>
          <CardDescription className="text-center">
            Join the FCC ride-sharing community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field with Real-time Validation */}
            <div className="space-y-2">
              <Label htmlFor="email">FCC Email Address *</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
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
              <p className="text-xs text-gray-500">
                Use @formanite.fccollege.edu.pk for students or @fccollege.edu.pk for faculty/staff
              </p>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">I want to *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">Offer rides (Driver only)</SelectItem>
                  <SelectItem value="rider">Find rides (Rider only)</SelectItem>
                  <SelectItem value="both">Both offer and find rides</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student-specific fields */}
            {emailValidation?.userType === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year *</Label>
                  <Select value={formData.year} onValueChange={handleYearChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0300-1234567"
                required
              />
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
              className="w-full"
              disabled={loading || !emailValidation?.isValid}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/login" className="font-medium text-black hover:underline">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}