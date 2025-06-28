import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create context
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check if user is authenticated on load
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`${API_URL}/users/me`)
        setUser(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Auth validation error:', err)
        logout()
        setLoading(false)
      }
    }

    checkAuth()
  }, [token])

  // Login function
  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      })
      
      const { access_token, user: userData } = response.data
      
      setToken(access_token)
      setUser(userData)
      localStorage.setItem('token', access_token)
      
      return userData
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.post(`${API_URL}/register`, userData)
      
      const { access_token, user: newUserData } = response.data
      
      setToken(access_token)
      setUser(newUserData)
      localStorage.setItem('token', access_token)
      
      return newUserData
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(`${API_URL}/users/me`, updates)
      setUser(response.data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.')
      throw err
    }
  }

  // Reset error
  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
