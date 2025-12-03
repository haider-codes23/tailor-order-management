import { createContext, useContext, useState, useEffect } from "react"
import { setAuthToken, setStoredUser, getStoredUser, clearAuth } from "@/services/http/httpClient"

const AuthContext = createContext(null)

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = getStoredUser()
      const token = localStorage.getItem("authToken")

      if (storedUser && token) {
        setUser(storedUser)
        setIsAuthenticated(true)
      }

      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  /**
   * Login function
   * @param {Object} userData - User data from backend
   * @param {string} token - Access token
   */
  const login = (userData, token) => {
    setAuthToken(token)
    setStoredUser(userData)
    setUser(userData)
    setIsAuthenticated(true)
  }

  /**
   * Logout function
   */
  const logout = () => {
    clearAuth()
    setUser(null)
    setIsAuthenticated(false)

    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  /**
   * Update user data
   */
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates }
    setStoredUser(updatedUser)
    setUser(updatedUser)
  }

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false
    return user.permissions.includes(permission)
  }

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions) => {
    if (!user || !user.permissions) return false
    return permissions.some((permission) => user.permissions.includes(permission))
  }

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions) => {
    if (!user || !user.permissions) return false
    return permissions.every((permission) => user.permissions.includes(permission))
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * useAuth Hook
 * Access auth context from any component
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
