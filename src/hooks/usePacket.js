/**
 * usePacket.js - React Query Hooks for Packet Workflow
 * Phase 12: Packet Creation and Verification
 *
 * All mutation hooks include forced refetch after invalidation
 * to ensure immediate UI updates.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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

const packetApi = {
  /**
   * Get all packets with optional filters
   */
  getPackets: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status) params.append("status", filters.status)
    if (filters.assignedTo) params.append("assignedTo", filters.assignedTo)

    const response = await fetch(`/api/packets?${params}`)
    if (!response.ok) throw new Error("Failed to fetch packets")
    return response.json()
  },

  /**
   * Get packets assigned to current user (fabrication team)
   */
  /**
   * Get packets assigned to current user (fabrication team)
   * @param {string} userId - User ID
   * @param {string|null} status - Optional status filter
   * @param {Object} dateFilters - Optional date filters
   * @param {string} dateFilters.dateFrom - Start date (ISO string)
   * @param {string} dateFilters.dateTo - End date (ISO string)
   * @param {string} dateFilters.filterType - Type of date filter ('created' | 'fwd' | 'productionShipping')
   */
  getMyTasks: async (userId, status = null, dateFilters = {}) => {
    const params = new URLSearchParams()
    params.append("userId", userId)
    if (status) params.append("status", status)

    // Add date filter params
    if (dateFilters.dateFrom) params.append("dateFrom", dateFilters.dateFrom)
    if (dateFilters.dateTo) params.append("dateTo", dateFilters.dateTo)
    if (dateFilters.filterType) params.append("filterType", dateFilters.filterType)

    const response = await fetch(`/api/packets/my-tasks?${params}`)
    if (!response.ok) throw new Error("Failed to fetch my packet tasks")
    return response.json()
  },

  /**
   * Get packets awaiting verification (production head)
   */
  getCheckQueue: async () => {
    const response = await fetch("/api/packets/check-queue")
    if (!response.ok) throw new Error("Failed to fetch packet check queue")
    return response.json()
  },

  /**
   * Get packet for a specific order item
   */
  getPacket: async (orderItemId) => {
    const response = await fetch(`/api/order-items/${orderItemId}/packet`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error("Failed to fetch packet")
    }
    return response.json()
  },

  /**
   * Assign packet to fabrication team member
   */
  assignPacket: async ({ orderItemId, assignToUserId, assignedByUserId }) => {
    const response = await fetch(`/api/order-items/${orderItemId}/packet/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignToUserId, assignedByUserId }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Failed to assign packet")
    return data
  },

  /**
   * Start picking materials for packet
   */
  startPacket: async ({ orderItemId, userId }) => {
    const response = await fetch(`/api/order-items/${orderItemId}/packet/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Failed to start packet")
    return data
  },

  /**
   * Mark a pick list item as picked
   */
  pickItem: async ({ orderItemId, pickItemId, pickedQty, userId, notes }) => {
    const response = await fetch(`/api/order-items/${orderItemId}/packet/pick-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pickItemId, pickedQty, userId, notes }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Failed to pick item")
    return data
  },

  /**
   * Mark packet as complete
   */
  completePacket: async ({ orderItemId, userId, notes }) => {
    const response = await fetch(`/api/order-items/${orderItemId}/packet/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, notes }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Failed to complete packet")
    return data
  },

  /**
   * Approve packet (production head)
   */
  approvePacket: async ({ orderItemId, userId, isReadyStock, notes }) => {
    const response = await fetch(`/api/order-items/${orderItemId}/packet/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isReadyStock, notes }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Failed to approve packet")
    return data
  },

  /**
   * Reject packet (production head)
   */
  rejectPacket: async ({ orderItemId, userId, reasonCode, reason, notes }) => {
    const response = await fetch(`/api/order-items/${orderItemId}/packet/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reasonCode, reason, notes }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Failed to reject packet")
    return data
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

      toast.success(data.message || "Packet completed - awaiting verification")
    },

    onError: (error) => {
      toast.error(error.message || "Failed to complete packet")
    },
  })
}

/**
 * useApprovePacket - Production head approves packet
 */
export function useApprovePacket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: packetApi.approvePacket,

    onSuccess: (data, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: packetKeys.detail(variables.orderItemId) })
      queryClient.invalidateQueries({ queryKey: packetKeys.checkQueue() })
      queryClient.invalidateQueries({ queryKey: packetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ["orderItems", "detail", variables.orderItemId] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })

      // Force immediate refetch
      queryClient.refetchQueries({
        queryKey: packetKeys.detail(variables.orderItemId),
        exact: true,
      })
      queryClient.refetchQueries({ queryKey: packetKeys.checkQueue() })
      queryClient.refetchQueries({
        queryKey: ["orderItems", "detail", variables.orderItemId],
      })

      toast.success(data.message || "Packet approved")
    },

    onError: (error) => {
      toast.error(error.message || "Failed to approve packet")
    },
  })
}

/**
 * useRejectPacket - Production head rejects packet
 */
export function useRejectPacket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: packetApi.rejectPacket,

    onSuccess: (data, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: packetKeys.detail(variables.orderItemId) })
      queryClient.invalidateQueries({ queryKey: packetKeys.checkQueue() })
      queryClient.invalidateQueries({ queryKey: packetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ["orderItems", "detail", variables.orderItemId] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })

      // Force immediate refetch
      queryClient.refetchQueries({
        queryKey: packetKeys.detail(variables.orderItemId),
        exact: true,
      })
      queryClient.refetchQueries({ queryKey: packetKeys.checkQueue() })
      queryClient.refetchQueries({
        queryKey: ["orderItems", "detail", variables.orderItemId],
      })

      toast.warning(data.message || "Packet rejected - sent back for correction")
    },

    onError: (error) => {
      toast.error(error.message || "Failed to reject packet")
    },
  })
}
