/**
 * usePacket.js - React Query Hooks for Packet Workflow
 * Phase 12: Packet Creation and Verification
 *
 * All mutation hooks include forced refetch after invalidation
 * to ensure immediate UI updates.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { httpClient } from "@/services/http/httpClient"
// ============================================================================
// QUERY KEYS
// ============================================================================

export const packetKeys = {
  all: ["packets"],
  lists: () => [...packetKeys.all, "list"],
  list: (filters) => [...packetKeys.lists(), filters],
  myTasks: (userId, dateFilters = {}) => [...packetKeys.all, "my-tasks", userId, dateFilters],
  checkQueue: () => [...packetKeys.all, "check-queue"],
  detail: (orderItemId) => [...packetKeys.all, "detail", orderItemId],
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

// ============================================================================
// API FUNCTIONS (using httpClient instead of raw fetch)
// ============================================================================

const packetApi = {
  getPackets: async (filters = {}) => {
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.assignedTo) params.assignedTo = filters.assignedTo
    return httpClient.get("/packets", { params })
  },

  getMyTasks: async (userId, status = null, dateFilters = {}) => {
    const params = { userId }
    if (status) params.status = status
    if (dateFilters.startDate) params.startDate = dateFilters.startDate
    if (dateFilters.endDate) params.endDate = dateFilters.endDate
    return httpClient.get("/packets/my-tasks", { params })
  },

  getCheckQueue: async () => {
    return httpClient.get("/packets/check-queue")
  },

  getPacket: async (orderItemId) => {
    return httpClient.get(`/order-items/${orderItemId}/packet`)
  },

  assignPacket: async ({ orderItemId, assignToUserId, assignedByUserId }) => {
    return httpClient.post(`/order-items/${orderItemId}/packet/assign`, {
      assignToUserId,
      assignedByUserId,
    })
  },

  startPacket: async ({ orderItemId, userId }) => {
    return httpClient.post(`/order-items/${orderItemId}/packet/start`, { userId })
  },

  pickItem: async ({ orderItemId, pickItemId, pickedQty, userId, notes }) => {
    return httpClient.post(`/order-items/${orderItemId}/packet/pick-item`, {
      pickItemId,
      pickedQty,
      userId,
      notes,
    })
  },

  completePacket: async ({ orderItemId, userId, notes }) => {
    return httpClient.post(`/order-items/${orderItemId}/packet/complete`, {
      userId,
      notes,
    })
  },
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * usePackets - Get all packets with filters
 */
export function usePackets(filters = {}) {
  return useQuery({
    queryKey: packetKeys.list(filters),
    queryFn: () => packetApi.getPackets(filters),
  })
}

/**
 * useMyPacketTasks - Get packets assigned to current user
 */
/**
 * useMyPacketTasks - Get packets assigned to current user
 * @param {string} userId - User ID
 * @param {string|null} status - Optional status filter
 * @param {Object} dateFilters - Optional date filters
 */
export function useMyPacketTasks(userId, status = null, dateFilters = {}) {
  return useQuery({
    queryKey: packetKeys.myTasks(userId, dateFilters),
    queryFn: () => packetApi.getMyTasks(userId, status, dateFilters),
    enabled: !!userId,
  })
}

/**
 * usePacketCheckQueue - Get packets awaiting verification
 */
export function usePacketCheckQueue() {
  return useQuery({
    queryKey: packetKeys.checkQueue(),
    queryFn: packetApi.getCheckQueue,
  })
}

/**
 * usePacket - Get packet for a specific order item
 */
export function usePacket(orderItemId) {
  return useQuery({
    queryKey: packetKeys.detail(orderItemId),
    queryFn: () => packetApi.getPacket(orderItemId),
    enabled: !!orderItemId,
  })
}

// ============================================================================
// MUTATION HOOKS (with forced refetch)
// ============================================================================

/**
 * useAssignPacket - Assign packet to fabrication team member
 */
export function useAssignPacket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: packetApi.assignPacket,

    onSuccess: (data, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: packetKeys.detail(variables.orderItemId) })
      queryClient.invalidateQueries({ queryKey: packetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: packetKeys.myTasks(variables.assignToUserId) })
      queryClient.invalidateQueries({ queryKey: ["orderItems", "detail", variables.orderItemId] })

      // Force immediate refetch
      queryClient.refetchQueries({
        queryKey: packetKeys.detail(variables.orderItemId),
        exact: true,
      })
      queryClient.refetchQueries({
        queryKey: packetKeys.myTasks(variables.assignToUserId),
      })

      toast.success(data.message || "Packet assigned successfully")
    },

    onError: (error) => {
      toast.error(error.message || "Failed to assign packet")
    },
  })
}

/**
 * useStartPacket - Start picking materials
 */
export function useStartPacket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: packetApi.startPacket,

    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: packetKeys.detail(variables.orderItemId) })
      queryClient.invalidateQueries({ queryKey: packetKeys.myTasks(variables.userId) })

      queryClient.refetchQueries({
        queryKey: packetKeys.detail(variables.orderItemId),
        exact: true,
      })
      queryClient.refetchQueries({
        queryKey: packetKeys.myTasks(variables.userId),
      })

      toast.success(data.message || "Packet started")
    },

    onError: (error) => {
      toast.error(error.message || "Failed to start packet")
    },
  })
}

/**
 * usePickItem - Mark pick list item as picked
 */
export function usePickItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: packetApi.pickItem,

    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: packetKeys.detail(variables.orderItemId) })

      queryClient.refetchQueries({
        queryKey: packetKeys.detail(variables.orderItemId),
        exact: true,
      })

      toast.success(data.message || "Item picked")
    },

    onError: (error) => {
      toast.error(error.message || "Failed to mark item as picked")
    },
  })
}

/**
 * useCompletePacket - Mark packet as complete
 */
export function useCompletePacket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: packetApi.completePacket,

    onSuccess: (data, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: packetKeys.detail(variables.orderItemId) })
      queryClient.invalidateQueries({ queryKey: packetKeys.myTasks(variables.userId) })
      queryClient.invalidateQueries({ queryKey: packetKeys.checkQueue() })
      queryClient.invalidateQueries({ queryKey: ["orderItems", "detail", variables.orderItemId] })

      // Force immediate refetch
      queryClient.refetchQueries({
        queryKey: packetKeys.detail(variables.orderItemId),
        exact: true,
      })
      queryClient.refetchQueries({ queryKey: packetKeys.checkQueue() })
      queryClient.refetchQueries({
        queryKey: ["orderItems", "detail", variables.orderItemId],
      })

      toast.success(data.message || "Packet completed — sections sent to dyeing")
    },

    onError: (error) => {
      toast.error(error.message || "Failed to complete packet")
    },
  })
}
