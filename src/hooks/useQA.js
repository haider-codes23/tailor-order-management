/**
 * QA React Query Hooks - Phase 14 Redesign
 * src/hooks/useQA.js
 *
 * Complete rewrite for new QA workflow:
 * - Section-level approval/rejection with round tracking
 * - Order Item-level video uploads
 * - Sales re-video request handling
 * 
 * All mutations use forced refetch for immediate UI updates
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { qaApi } from "@/services/api/qaApi"
import { toast } from "sonner"

// ============================================================================
// QUERY KEYS
// ============================================================================

export const qaKeys = {
  all: ["qa"],
  productionQueue: () => [...qaKeys.all, "production-queue"],
  salesRequests: () => [...qaKeys.all, "sales-requests"],
  stats: () => [...qaKeys.all, "stats"],
  orderItem: (orderItemId) => [...qaKeys.all, "order-item", orderItemId],
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch QA Production Queue
 * Order items with sections in QA_PENDING or all sections approved (ready for video)
 */
export function useQAProductionQueue() {
  return useQuery({
    queryKey: qaKeys.productionQueue(),
    queryFn: qaApi.getQAProductionQueue,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch Sales Re-video Requests (Tab 2)
 */
export function useQASalesRequests() {
  return useQuery({
    queryKey: qaKeys.salesRequests(),
    queryFn: qaApi.getSalesRequests,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch QA Dashboard Statistics
 */
export function useQAStats() {
  return useQuery({
    queryKey: qaKeys.stats(),
    queryFn: qaApi.getQAStats,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch Order Item details for QA
 * @param {string} orderItemId - Order item ID
 */
export function useQAOrderItem(orderItemId) {
  return useQuery({
    queryKey: qaKeys.orderItem(orderItemId),
    queryFn: qaApi.getOrderItemForQA(orderItemId),
    enabled: !!orderItemId,
    staleTime: 30 * 1000,
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to approve a section in QA
 * Forced refetch for immediate UI update
 */
export function useApproveSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, sectionName, approvedBy }) =>
      qaApi.approveSection(orderItemId, sectionName, { approvedBy }),

    onSuccess: (data, variables) => {
      const { sectionName } = variables
      const displayName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
      const round = data.data?.round || 1

      toast.success(`${displayName} approved`, {
        description: `Section approved in Round ${round}`,
      })

      // Invalidate and force refetch
      queryClient.invalidateQueries({ queryKey: qaKeys.productionQueue() })
      queryClient.invalidateQueries({ queryKey: qaKeys.stats() })
      queryClient.invalidateQueries({ queryKey: qaKeys.orderItem(variables.orderItemId) })

      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: qaKeys.productionQueue() })
      queryClient.refetchQueries({ queryKey: qaKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to approve section", {
        description: error.response?.data?.error || error.message,
      })
    },
  })
}

/**
 * Hook to reject a section in QA
 * Forced refetch for immediate UI update
 */
export function useRejectSection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, sectionName, rejectedBy, reasonCode, notes }) =>
      qaApi.rejectSection(orderItemId, sectionName, { rejectedBy, reasonCode, notes }),

    onSuccess: (data, variables) => {
      const { sectionName } = variables
      const displayName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
      const round = data.data?.round || 1

      toast.success(`${displayName} rejected`, {
        description: `Section sent back to Production (Round ${round})`,
      })

      // Invalidate and force refetch
      queryClient.invalidateQueries({ queryKey: qaKeys.productionQueue() })
      queryClient.invalidateQueries({ queryKey: qaKeys.stats() })
      queryClient.invalidateQueries({ queryKey: qaKeys.orderItem(variables.orderItemId) })

      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: qaKeys.productionQueue() })
      queryClient.refetchQueries({ queryKey: qaKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to reject section", {
        description: error.response?.data?.error || error.message,
      })
    },
  })
}

/**
 * Hook to upload video for an order item
 * Forced refetch for immediate UI update
 */
export function useUploadOrderItemVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, youtubeUrl, uploadedBy }) =>
      qaApi.uploadOrderItemVideo(orderItemId, { youtubeUrl, uploadedBy }),

    onSuccess: (data, variables) => {
      toast.success("Video uploaded successfully", {
        description: "Order item is now ready for client approval",
      })

      // Invalidate and force refetch
      queryClient.invalidateQueries({ queryKey: qaKeys.productionQueue() })
      queryClient.invalidateQueries({ queryKey: qaKeys.stats() })
      queryClient.invalidateQueries({ queryKey: qaKeys.orderItem(variables.orderItemId) })

      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: qaKeys.productionQueue() })
      queryClient.refetchQueries({ queryKey: qaKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to upload video", {
        description: error.response?.data?.error || error.message,
      })
    },
  })
}

/**
 * Hook to upload re-video for a Sales request
 * Forced refetch for immediate UI update
 */
export function useUploadReVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, youtubeUrl, uploadedBy }) =>
      qaApi.uploadReVideo(orderItemId, { youtubeUrl, uploadedBy }),

    onSuccess: (data, variables) => {
      toast.success("Re-video uploaded successfully", {
        description: "Sales request has been fulfilled",
      })

      // Invalidate and force refetch
      queryClient.invalidateQueries({ queryKey: qaKeys.productionQueue() })
      queryClient.invalidateQueries({ queryKey: qaKeys.salesRequests() })
      queryClient.invalidateQueries({ queryKey: qaKeys.stats() })
      queryClient.invalidateQueries({ queryKey: qaKeys.orderItem(variables.orderItemId) })

      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: qaKeys.productionQueue() })
      queryClient.refetchQueries({ queryKey: qaKeys.salesRequests() })
      queryClient.refetchQueries({ queryKey: qaKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to upload re-video", {
        description: error.response?.data?.error || error.message,
      })
    },
  })
}

/**
 * Hook to send order to Sales
 * Forced refetch for immediate UI update
 */
export function useSendOrderToSales() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, sentBy }) =>
      qaApi.sendOrderToSales(orderId, { sentBy }),

    onSuccess: (data) => {
      const orderNumber = data.data?.orderNumber || "Order"

      toast.success(`${orderNumber} sent to Sales`, {
        description: "Order is now ready for client approval",
      })

      // Invalidate and force refetch
      queryClient.invalidateQueries({ queryKey: qaKeys.productionQueue() })
      queryClient.invalidateQueries({ queryKey: qaKeys.stats() })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["sales"] })

      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: qaKeys.productionQueue() })
      queryClient.refetchQueries({ queryKey: qaKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to send order to Sales", {
        description: error.response?.data?.error || error.message,
      })
    },
  })
}

// ============================================================================
// HELPER EXPORTS
// ============================================================================

export { qaApi }
