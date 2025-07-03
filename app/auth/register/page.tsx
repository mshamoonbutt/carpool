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
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { AuthService } from "@/services/AuthService"
import { UniPoolLogo } from "@/components/ui/UniPoolLogo"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "",
    gender: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const handleGenderChange = (value: string) => {
    setFormData(prev => ({ ...prev, gender: value }))
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

    // Gender validation
    if (!formData.gender) {
      setError('Please select your gender')
      return false
    }
    
    // Password validation
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
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
        gender: formData.gender,
        phone: formData.phone,
        password: formData.password
      })

      if (user) {
        setSuccess("Account created successfully! Redirecting to login...")
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Background with Animated Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F23] via-[#1a1a2e] to-[#16213e]"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-[#FFC857]/20 to-[#FFD700]/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-r from-[#FFD700]/15 to-[#FFC857]/15 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-[#FFC857]/10 to-[#FFD700]/10 rounded-full blur-md animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #FFC857 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Glowing Lines */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#FFC857]/30 to-transparent"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFC857]/20 to-transparent"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
        className="relative z-10 w-full max-w-md bg-[#23272f]/90 border-2 border-[#FFC857] shadow-2xl rounded-3xl backdrop-blur-xl p-0"
        style={{ 
          boxShadow: '0 8px 40px 0 #FFD70033, 0 0 100px 0 #FFC85711',
          background: 'linear-gradient(135deg, rgba(35, 39, 47, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)'
        }}
      >
        <div className="flex flex-col items-center pt-8 pb-2">
          <UniPoolLogo size={48} className="mb-2" />
          <span className="text-3xl font-extrabold tracking-tight text-[#FFC857] drop-shadow-lg mb-2">UniPool</span>
        </div>
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl font-bold text-center text-[#FFC857]">Create Your UniPool Account</CardTitle>
          <CardDescription className="text-center text-[#F3F4F6]">
            Join the FCC ride-sharing community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field with Real-time Validation */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#FFC857] font-semibold">FCC Email Address *</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  className={`bg-[#18181B]/80 border-2 rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all ${
                    emailValidation?.isValid 
                      ? 'border-green-500 focus:ring-green-500' 
                      : emailValidation?.error 
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[#FFC857]'
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
                  <CheckCircle className="h-4 w-4 mr-1" /> Valid FCC email
                </div>
              )}
              {emailValidation?.error && (
                <div className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" /> {emailValidation.error}
                </div>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#FFC857] font-semibold">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[#FFC857] font-semibold">I want to *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all text-white">
                  <SelectValue placeholder="Select your role" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e]/95 border-2 border-[#FFC857] rounded-lg shadow-2xl backdrop-blur-xl max-h-60">
                  <SelectItem value="driver" className="text-white hover:bg-[#FFC857]/30 focus:bg-[#FFC857]/30 cursor-pointer py-4 text-base font-medium transition-all duration-200 hover:scale-105">
                    🚗 Offer rides (Driver only)
                  </SelectItem>
                  <SelectItem value="rider" className="text-white hover:bg-[#FFC857]/30 focus:bg-[#FFC857]/30 cursor-pointer py-4 text-base font-medium transition-all duration-200 hover:scale-105">
                    👤 Find rides (Rider only)
                  </SelectItem>
                  <SelectItem value="both" className="text-white hover:bg-[#FFC857]/30 focus:bg-[#FFC857]/30 cursor-pointer py-4 text-base font-medium transition-all duration-200 hover:scale-105">
                    🔄 Both offer and find rides
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender field */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-[#FFC857] font-semibold">Gender *</Label>
              <Select value={formData.gender} onValueChange={handleGenderChange}>
                <SelectTrigger className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all text-white">
                  <SelectValue placeholder="Select gender" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e]/95 border-2 border-[#FFC857] rounded-lg shadow-2xl backdrop-blur-xl max-h-60">
                  <SelectItem value="male" className="text-white hover:bg-[#FFC857]/30 focus:bg-[#FFC857]/30 cursor-pointer py-4 text-base font-medium transition-all duration-200 hover:scale-105">
                    👨 Male
                  </SelectItem>
                  <SelectItem value="female" className="text-white hover:bg-[#FFC857]/30 focus:bg-[#FFC857]/30 cursor-pointer py-4 text-base font-medium transition-all duration-200 hover:scale-105">
                    👩 Female
                  </SelectItem>
                  <SelectItem value="other" className="text-white hover:bg-[#FFC857]/30 focus:bg-[#FFC857]/30 cursor-pointer py-4 text-base font-medium transition-all duration-200 hover:scale-105">
                    🏳️ Other
                  </SelectItem>
                  <SelectItem value="prefer-not-to-say" className="text-white hover:bg-[#FFC857]/30 focus:bg-[#FFC857]/30 cursor-pointer py-4 text-base font-medium transition-all duration-200 hover:scale-105">
                    🤐 Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#FFC857] font-semibold">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0300-1234567"
                className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#FFC857] font-semibold">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password (min. 6 characters)"
                  className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#FFC857]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#FFC857]" />
                  )}
                </button>
              </div>
              <p className="text-xs text-[#F3F4F6]/70">Password must be at least 6 characters</p>
            </div>
            
            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#FFC857] font-semibold">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="bg-[#18181B]/80 border-2 border-[#FFC857] rounded-lg px-4 py-3 text-lg focus:border-[#FFC857] focus:ring-2 focus:ring-[#FFC857] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-[#FFC857]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#FFC857]" />
                  )}
                </button>
              </div>
            </div>

            {/* Error/Success Feedback */}
            {error && (
              <Alert variant="destructive" className="flex items-center gap-2 bg-red-900/20 border-red-500">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <AlertDescription className="text-red-400 font-semibold">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="flex items-center gap-2 bg-green-900/20 border-green-500">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <AlertDescription className="text-green-400 font-semibold">{success}</AlertDescription>
              </Alert>
            )}

            {/* Register Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-[#FFC857] to-[#FFD700] text-[#18181B] font-extrabold text-xl py-4 rounded-full shadow-lg hover:from-[#FFD700] hover:to-[#FFC857] transition-all flex items-center justify-center gap-2 transform hover:scale-105"
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-[#18181B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#18181B" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="#18181B" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}
              {loading ? "Registering..." : "Register"}
            </Button>
            <div className="text-center text-[#FFC857] mt-2">
              Already have an account?{' '}
              <Link href="/auth/login" className="underline hover:text-[#FFD700] font-semibold transition">Login</Link>
            </div>
          </form>
        </CardContent>
      </motion.div>
    </div>
  )
}