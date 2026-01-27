/**
 * Production React Query Hooks
 * src/hooks/useProduction.js
 *
 * Phase 13: Production Workflow
 * Provides React Query hooks for production-related operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productionApi } from "@/services/api/productionApi"
import { useToast } from "@/hooks/use-toast"

// ============================================================================
// QUERY KEYS
// ============================================================================

export const productionKeys = {
  all: ["production"],

  // Round Robin & Assignment
  roundRobin: () => [...productionKeys.all, "round-robin"],
  readyForAssignment: () => [...productionKeys.all, "ready-for-assignment"],

  // Production Head Dashboard
  myAssignments: (userId) => [...productionKeys.all, "my-assignments", userId],
  orderItemDetails: (orderItemId) => [...productionKeys.all, "order-item", orderItemId, "details"],
  workers: () => [...productionKeys.all, "workers"],

  // Tasks
  sectionTasks: (orderItemId, section) => [...productionKeys.all, "tasks", orderItemId, section],
  sectionTimeline: (orderItemId, section) => [
    ...productionKeys.all,
    "timeline",
    orderItemId,
    section,
  ],

  // Worker Tasks
  workerTasks: (userId) => [...productionKeys.all, "worker-tasks", userId],
}

// ============================================================================
// ROUND ROBIN & ASSIGNMENT QUERIES
// ============================================================================

/**
 * Get current round-robin state
 */
export function useRoundRobinState() {
  return useQuery({
    queryKey: productionKeys.roundRobin(),
    queryFn: productionApi.getRoundRobinState,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Get order items ready for production head assignment
 */
export function useReadyForAssignment() {
  return useQuery({
    queryKey: productionKeys.readyForAssignment(),
    queryFn: productionApi.getReadyForAssignment,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// ============================================================================
// PRODUCTION HEAD DASHBOARD QUERIES
// ============================================================================

/**
 * Get order items assigned to current production head
 */
export function useMyAssignments(userId) {
  return useQuery({
    queryKey: productionKeys.myAssignments(userId || "current"),
    queryFn: () => productionApi.getMyAssignments(userId),
    // Remove enabled check - backend determines user from JWT
    staleTime: 30 * 1000,
  })
}

/**
 * Get order item details for production
 */
export function useProductionOrderItemDetails(orderItemId) {
  return useQuery({
    queryKey: productionKeys.orderItemDetails(orderItemId),
    queryFn: () => productionApi.getOrderItemDetails(orderItemId),
    enabled: !!orderItemId,
    staleTime: 60 * 1000,
  })
}

/**
 * Get list of production workers for assignment
 */
export function useProductionWorkers() {
  return useQuery({
    queryKey: productionKeys.workers(),
    queryFn: productionApi.getWorkers,
    staleTime: 5 * 60 * 1000, // 5 minutes - workers list doesn't change often
  })
}

// ============================================================================
// TASK QUERIES
// ============================================================================

/**
 * Get tasks for a section
 */
export function useSectionTasks(orderItemId, section) {
  return useQuery({
    queryKey: productionKeys.sectionTasks(orderItemId, section),
    queryFn: () => productionApi.getSectionTasks(orderItemId, section),
    enabled: !!orderItemId && !!section,
    staleTime: 30 * 1000,
  })
}

/**
 * Get timeline for a section
 */
export function useSectionTimeline(orderItemId, section) {
  return useQuery({
    queryKey: productionKeys.sectionTimeline(orderItemId, section),
    queryFn: () => productionApi.getSectionTimeline(orderItemId, section),
    enabled: !!orderItemId && !!section,
    staleTime: 30 * 1000,
  })
}

// ============================================================================
// WORKER TASK QUERIES
// ============================================================================

/**
 * Get all tasks assigned to current worker
 */
export function useWorkerTasks(userId) {
  return useQuery({
    queryKey: productionKeys.workerTasks(userId || "current"),
    queryFn: () => productionApi.getWorkerTasks(userId),
    // enabled: !!userId,
    staleTime: 15 * 1000, // Shorter stale time for workers
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Assign production head to an order item
 */
export function useAssignProductionHead() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ orderItemId, assignedBy }) =>
      productionApi.assignProductionHead(orderItemId, { assignedBy }),

    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: productionKeys.readyForAssignment() })
      queryClient.invalidateQueries({ queryKey: productionKeys.roundRobin() })
      queryClient.invalidateQueries({ queryKey: ["orderItems"] })
      queryClient.invalidateQueries({ queryKey: ["order-item", variables.orderItemId] })

      // Force refetch
      queryClient.refetchQueries({ queryKey: productionKeys.readyForAssignment() })
      queryClient.refetchQueries({ queryKey: productionKeys.roundRobin() })

      toast({
        title: "Production Head Assigned",
        description: data.message || "Production head assigned successfully",
      })
    },

    onError: (error) => {
      toast({
        title: "Failed to Assign",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}

/**
 * Create tasks for a section
 */
export function useCreateSectionTasks() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ orderItemId, section, tasks, createdBy }) =>
      productionApi.createSectionTasks(orderItemId, section, { tasks, createdBy }),

    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: productionKeys.sectionTasks(variables.orderItemId, variables.section),
      })
      queryClient.invalidateQueries({
        queryKey: productionKeys.myAssignments(variables.createdBy),
      })
      queryClient.invalidateQueries({ queryKey: productionKeys.workerTasks(null) })
      queryClient.invalidateQueries({ queryKey: ["orderItems"] })

      // Force refetch
      queryClient.refetchQueries({
        queryKey: productionKeys.sectionTasks(variables.orderItemId, variables.section),
      })
      queryClient.refetchQueries({
        queryKey: productionKeys.myAssignments(variables.createdBy),
      })

      toast({
        title: "Tasks Created",
        description: data?.message || `Tasks created for ${variables.section}`,
      })
    },

    onError: (error) => {
      toast({
        title: "Failed to Create Tasks",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}

/**
 * Start production for a section
 */
export function useStartSectionProduction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ orderItemId, section, startedBy }) =>
      productionApi.startSectionProduction(orderItemId, section, { startedBy }),

    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: productionKeys.all })
      queryClient.invalidateQueries({ queryKey: ["orderItems"] })
      queryClient.invalidateQueries({ queryKey: ["order-item", variables.orderItemId] })

      // Force refetch
      queryClient.refetchQueries({
        queryKey: productionKeys.myAssignments(variables.startedBy),
      })
      queryClient.refetchQueries({
        queryKey: productionKeys.sectionTasks(variables.orderItemId, variables.section),
      })
      queryClient.refetchQueries({
        queryKey: productionKeys.sectionTimeline(variables.orderItemId, variables.section),
      })

      toast({
        title: "Production Started",
        description: data?.message || `Production started for ${variables.section}`,
      })
    },

    onError: (error) => {
      toast({
        title: "Failed to Start Production",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}

/**
 * Update task (notes)
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ taskId, updates }) => productionApi.updateTask(taskId, updates),

    onSuccess: (data, variables) => {
      // Invalidate task-related queries
      queryClient.invalidateQueries({ queryKey: productionKeys.all })

      toast({
        title: "Task Updated",
        description: "Task updated successfully",
      })
    },

    onError: (error) => {
      toast({
        title: "Failed to Update Task",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}

/**
 * Start a task (worker action)
 */
export function useStartTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ taskId, userId }) => productionApi.startTask(taskId, { userId }),

    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: productionKeys.workerTasks(variables.userId) })
      queryClient.invalidateQueries({ queryKey: productionKeys.all })
      queryClient.invalidateQueries({ queryKey: ["orderItems"] })

      // Force refetch
      queryClient.refetchQueries({ queryKey: productionKeys.workerTasks(variables.userId) })

      toast({
        title: "Task Started",
        description: data.message || `Started ${data.displayName}`,
      })
    },

    onError: (error) => {
      toast({
        title: "Failed to Start Task",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}

/**
 * Complete a task (worker action)
 */
export function useCompleteTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ taskId, userId }) => productionApi.completeTask(taskId, { userId }),

    onSuccess: (data, variables) => {
      // Invalidate and refetch all production queries
      queryClient.invalidateQueries({ queryKey: productionKeys.all })
      queryClient.invalidateQueries({ queryKey: ["orderItems"] })

      // Force refetch worker tasks
      queryClient.refetchQueries({ queryKey: productionKeys.workerTasks(variables.userId) })

      const title = data.sectionProductionComplete ? "Section Complete!" : "Task Completed"

      toast({
        title,
        description: data.message,
      })
    },

    onError: (error) => {
      toast({
        title: "Failed to Complete Task",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}

/**
 * Send section to QA
 */
export function useSendSectionToQA() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ orderItemId, section, sentBy }) =>
      productionApi.sendSectionToQA(orderItemId, section, { sentBy }),

    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: productionKeys.all })
      queryClient.invalidateQueries({ queryKey: ["orderItems"] })
      queryClient.invalidateQueries({ queryKey: ["order-item", variables.orderItemId] })
      queryClient.invalidateQueries({ queryKey: ["qa"] }) // For QA dashboard

      // Force refetch
      queryClient.refetchQueries({
        queryKey: productionKeys.myAssignments(variables.sentBy),
      })

      toast({
        title: "Sent to QA",
        description: data?.message || `${variables.section} sent to QA`,
      })
    },

    onError: (error) => {
      toast({
        title: "Failed to Send to QA",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    },
  })
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // Query Keys
  productionKeys,

  // Queries
  useRoundRobinState,
  useReadyForAssignment,
  useMyAssignments,
  useProductionOrderItemDetails,
  useProductionWorkers,
  useSectionTasks,
  useSectionTimeline,
  useWorkerTasks,

  // Mutations
  useAssignProductionHead,
  useCreateSectionTasks,
  useStartSectionProduction,
  useUpdateTask,
  useStartTask,
  useCompleteTask,
  useSendSectionToQA,
}
