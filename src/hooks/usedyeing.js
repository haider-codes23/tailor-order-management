/**
 * Dyeing React Query Hooks
 * src/hooks/useDyeing.js
 *
 * Phase 12.5: Dyeing Department
 * Custom hooks for dyeing workflow with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { dyeingApi } from "@/services/api/dyeingApi"
import { useToast } from "@/hooks/use-toast"

// ============================================================================
// QUERY KEYS
// ============================================================================

export const dyeingKeys = {
  all: ["dyeing"],
  availableTasks: (params) => [...dyeingKeys.all, "available", params],
  myTasks: (userId, params) => [...dyeingKeys.all, "my-tasks", userId, params],
  completedTasks: (params) => [...dyeingKeys.all, "completed", params],
  taskDetails: (orderItemId) => [...dyeingKeys.all, "task", orderItemId],
  stats: (userId) => [...dyeingKeys.all, "stats", userId],
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get available dyeing tasks (sections ready for dyeing)
 */
export function useDyeingAvailableTasks(params = {}) {
  return useQuery({
    queryKey: dyeingKeys.availableTasks(params),
    queryFn: () => dyeingApi.getAvailableTasks(params),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Get current user's accepted dyeing tasks
 */
export function useDyeingMyTasks(userId, params = {}) {
  return useQuery({
    queryKey: dyeingKeys.myTasks(userId, params),
    queryFn: () => dyeingApi.getMyTasks(userId, params),
    enabled: !!userId,
    staleTime: 30 * 1000,
  })
}

/**
 * Get completed dyeing tasks with pagination
 */
export function useDyeingCompletedTasks(params = {}) {
  return useQuery({
    queryKey: dyeingKeys.completedTasks(params),
    queryFn: () => dyeingApi.getCompletedTasks(params),
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Get detailed dyeing task info for an order item
 */
export function useDyeingTaskDetails(orderItemId) {
  return useQuery({
    queryKey: dyeingKeys.taskDetails(orderItemId),
    queryFn: () => dyeingApi.getTaskDetails(orderItemId),
    enabled: !!orderItemId,
  })
}

/**
 * Get dyeing dashboard statistics
 */
export function useDyeingStats(userId = null) {
  return useQuery({
    queryKey: dyeingKeys.stats(userId),
    queryFn: () => dyeingApi.getStats(userId),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute for live stats
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Accept sections for dyeing
 */
export function useAcceptDyeingSections() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ orderItemId, userId, sections }) =>
      dyeingApi.acceptSections(orderItemId, { userId, sections }),
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: dyeingKeys.all })
      queryClient.invalidateQueries({ queryKey: ["orderItems"] })
      queryClient.invalidateQueries({ queryKey: ["order-item", variables.orderItemId] })

      // Force refetch to ensure immediate UI update
      queryClient.refetchQueries({ queryKey: dyeingKeys.availableTasks({}) })
      queryClient.refetchQueries({ queryKey: dyeingKeys.myTasks(variables.userId, {}) })
      queryClient.refetchQueries({ queryKey: dyeingKeys.stats(variables.userId) })

      toast({
        title: "Sections Accepted",
        description: data.message || `Accepted ${variables.sections.length} section(s) for dyeing`,
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to Accept Sections",
        description: error.response?.data?.error || error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}

/**
 * Start dyeing for sections
 */
export function useStartDyeing() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ orderItemId, userId, sections }) =>
      dyeingApi.startDyeing(orderItemId, { userId, sections }),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: dyeingKeys.all })
      queryClient.invalidateQueries({ queryKey: ["orderItems"] })
      queryClient.invalidateQueries({ queryKey: ["order-item", variables.orderItemId] })

      // Force refetch
      queryClient.refetchQueries({ queryKey: dyeingKeys.myTasks(variables.userId, {}) })
      queryClient.refetchQueries({ queryKey: dyeingKeys.taskDetails(variables.orderItemId) })

      toast({
        title: "Dyeing Started",
        description: data.message || `Started dyeing for ${variables.sections.length} section(s)`,
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to Start Dyeing",
        description: error.response?.data?.error || error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}

/**
 * Complete dyeing for sections
 */
export function useCompleteDyeing() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ orderItemId, userId, sections }) =>
      dyeingApi.completeDyeing(orderItemId, { userId, sections }),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: dyeingKeys.all })
      queryClient.invalidateQueries({ queryKey: ["orderItems"] })
      queryClient.invalidateQueries({ queryKey: ["order-item", variables.orderItemId] })

      // Force refetch
      queryClient.refetchQueries({ queryKey: dyeingKeys.myTasks(variables.userId, {}) })
      queryClient.refetchQueries({ queryKey: dyeingKeys.completedTasks({}) })
      queryClient.refetchQueries({ queryKey: dyeingKeys.stats(variables.userId) })

      toast({
        title: "Dyeing Completed",
        description: data.message || `Completed dyeing for ${variables.sections.length} section(s)`,
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to Complete Dyeing",
        description: error.response?.data?.error || error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}

/**
 * Reject sections from dyeing
 */
export function useRejectDyeingSections() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ orderItemId, userId, sections, reasonCode, notes }) =>
      dyeingApi.rejectSections(orderItemId, { userId, sections, reasonCode, notes }),
    onSuccess: (data, variables) => {
      // Invalidate and refetch - this affects many parts of the system
      queryClient.invalidateQueries({ queryKey: dyeingKeys.all })
      queryClient.invalidateQueries({ queryKey: ["orderItems"] })
      queryClient.invalidateQueries({ queryKey: ["order-item", variables.orderItemId] })
      queryClient.invalidateQueries({ queryKey: ["packets"] })
      queryClient.invalidateQueries({ queryKey: ["inventory"] })

      // Force refetch
      queryClient.refetchQueries({ queryKey: dyeingKeys.availableTasks({}) })
      queryClient.refetchQueries({ queryKey: dyeingKeys.myTasks(variables.userId, {}) })
      queryClient.refetchQueries({ queryKey: dyeingKeys.stats(variables.userId) })

      toast({
        title: "Sections Rejected",
        description:
          data.message || `Rejected ${variables.sections.length} section(s). Inventory released.`,
        variant: "destructive",
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to Reject Sections",
        description: error.response?.data?.error || error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}
