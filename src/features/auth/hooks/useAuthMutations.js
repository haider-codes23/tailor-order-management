import { useMutation, useQueryClient } from "@tanstack/react-query"
import { loginUser, logoutUser } from "../api/authApi"
import { useAuth } from "./useAuth"

/**
 * React Query Hooks for Authentication Mutations
 * 
 * These hooks wrap the API functions from authApi.js and add React Query's
 * state management capabilities including:
 * - Automatic loading state (mutation.isPending)
 * - Error handling (mutation.error)
 * - Success callbacks (onSuccess)
 * - Error callbacks (onError)
 * - Mutation state (mutation.isSuccess, mutation.isError)
 * 
 * By using React Query, we get consistent state management across all
 * mutations in the application without writing repetitive loading/error code.
 */

/**
 * Hook for logging in a user
 * 
 * Usage in a component:
 * ```
 * const loginMutation = useLogin()
 * 
 * const handleLogin = async (credentials) => {
 *   loginMutation.mutate(credentials)
 * }
 * ```
 * 
 * The mutation provides:
 * - loginMutation.mutate(credentials) - trigger the login
 * - loginMutation.isPending - true while request is in flight
 * - loginMutation.error - error object if request failed
 * - loginMutation.isSuccess - true if request succeeded
 */
export function useLogin() {
  const { login: storeAuthData } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    // The mutation function that gets called when you call mutate()
    mutationFn: loginUser,

    // Called when login succeeds
    onSuccess: (data) => {
      // Store the user and token in auth context (and localStorage)
      storeAuthData(data.user, data.accessToken)

      // Invalidate and refetch any queries that might need the new auth state
      // This ensures the UI updates immediately after login
      queryClient.invalidateQueries({ queryKey: ["auth"] })
    },

    // Called when login fails
    // You can add additional error handling here if needed
    onError: (error) => {
      console.error("Login failed:", error)
      // The component will still receive the error and can display it
      // This is just for additional logging or tracking
    },
  })
}

/**
 * Hook for logging out a user
 * 
 * Usage in a component:
 * ```
 * const logoutMutation = useLogout()
 * 
 * const handleLogout = () => {
 *   logoutMutation.mutate()
 * }
 * ```
 */
export function useLogout() {
  const { logout: clearAuthData } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    // The mutation function
    mutationFn: logoutUser,

    // Called when logout succeeds
    onSuccess: () => {
      // Clear auth data from context and localStorage
      clearAuthData()

      // Clear all React Query caches since user is logging out
      // This prevents showing stale data if another user logs in
      queryClient.clear()
    },

    // Even if the API call fails, we still want to clear local auth
    // because the user clicked logout and expects to be logged out
    onError: (error) => {
      console.error("Logout API call failed, but clearing local auth anyway:", error)
      clearAuthData()
      queryClient.clear()
    },
  })
}
























