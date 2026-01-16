/**
 * useAuthMutations.js - UPDATED VERSION
 * 
 * FIX: Added useNavigate for soft redirect after logout
 * This prevents hard page refresh which was clearing MSW in-memory data
 */

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { loginUser, logoutUser } from "../api/authApi"
import { useAuth } from "./useAuth"

/**
 * Hook for logging in a user
 */
export function useLogin() {
  const { login: storeAuthData } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      // Store the user and token in auth context (and localStorage)
      storeAuthData(data.user, data.accessToken)

      // Invalidate and refetch any queries that might need the new auth state
      queryClient.invalidateQueries({ queryKey: ["auth"] })

      // Navigate to dashboard using React Router (soft navigation)
      navigate("/")
    },

    onError: (error) => {
      console.error("Login failed:", error)
    },
  })
}

/**
 * Hook for logging out a user
 * 
 * UPDATED: Now uses React Router navigate() for soft redirect
 * instead of window.location.href which caused hard refresh
 */
export function useLogout() {
  const { logout: clearAuthData } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logoutUser,

    onSuccess: () => {
      // Clear auth data from context and localStorage
      clearAuthData()

      // Clear all React Query caches since user is logging out
      // This prevents showing stale data if another user logs in
      queryClient.clear()

      // UPDATED: Use React Router navigate instead of window.location.href
      // This prevents hard page refresh and preserves MSW in-memory data
      navigate("/login")
    },

    // Even if the API call fails, we still want to clear local auth
    onError: (error) => {
      console.error("Logout API call failed, but clearing local auth anyway:", error)
      clearAuthData()
      queryClient.clear()

      // Still navigate to login even on error
      navigate("/login")
    },
  })
}