/**
 * Users React Query Hooks
 *
 * These hooks provide a clean interface to interact with the Users API.
 * They handle loading states, caching, mutations, and automatic refetching.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as usersApi from "../services/api/usersApi"
import { toast } from "sonner"

/**
 * Query Keys
 * These keys are used for caching and invalidation
 */
export const userKeys = {
  all: ["users"],
  lists: () => [...userKeys.all, "list"],
  list: (filters) => [...userKeys.lists(), filters],
  details: () => [...userKeys.all, "detail"],
  detail: (id) => [...userKeys.details(), id],
}

// ==================== QUERIES ====================

/**
 * Get all users with optional filters
 * @param {Object} filters - { role, is_active, search }
 */
export function useUsers(filters = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => usersApi.getUsers(filters),
    staleTime: 30000, // Consider data fresh for 30 seconds
  })
}

/**
 * Get a single user by ID
 * @param {number|string} userId
 */
export function useUser(userId) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => usersApi.getUserById(userId),
    enabled: !!userId, // Only run if userId exists
    staleTime: 30000,
  })
}

// ==================== MUTATIONS ====================

/**
 * Create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData) => usersApi.createUser(userData),
    onSuccess: (data) => {
      // Invalidate all user lists to refetch with new user
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })

      toast.success("User created successfully")
      console.log("✅ User created:", data.data.name)
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to create user"
      toast.error(message)
      console.error("❌ Failed to create user:", error)
    },
  })
}

/**
 * Update an existing user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, updates }) => usersApi.updateUser(userId, updates),
    onSuccess: (data) => {
      const user = data.data

      // Invalidate the specific user detail
      queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) })

      // Invalidate all user lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })

      // Force refetch
      queryClient.refetchQueries({ queryKey: userKeys.detail(user.id) })
      queryClient.refetchQueries({ queryKey: userKeys.lists() })

      toast.success("User updated successfully")
      console.log("✅ User updated:", user.name)
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to update user"
      toast.error(message)
      console.error("❌ Failed to update user:", error)
    },
  })
}

/**
 * Delete (deactivate) a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId) => usersApi.deleteUser(userId),
    onSuccess: (data, userId) => {
      // Invalidate the specific user detail
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) })

      // Invalidate all user lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })

      // Force refetch
      queryClient.refetchQueries({ queryKey: userKeys.detail(userId) })
      queryClient.refetchQueries({ queryKey: userKeys.lists() })

      toast.success("User deactivated successfully")
      console.log("✅ User deactivated:", userId)
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to deactivate user"
      toast.error(message)
      console.error("❌ Failed to deactivate user:", error)
    },
  })
}

/**
 * Activate a user
 */
export function useActivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId) => usersApi.activateUser(userId),
    onSuccess: (data) => {
      const user = data.data

      // Invalidate the specific user detail
      queryClient.invalidateQueries({ queryKey: userKeys.detail(user.id) })

      // Invalidate all user lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })

      // Force refetch
      queryClient.refetchQueries({ queryKey: userKeys.detail(user.id) })
      queryClient.refetchQueries({ queryKey: userKeys.lists() })

      toast.success("User activated successfully")
      console.log("✅ User activated:", user.name)
    },
    onError: (error) => {
      const message = error.response?.data?.error || "Failed to activate user"
      toast.error(message)
      console.error("❌ Failed to activate user:", error)
    },
  })
}