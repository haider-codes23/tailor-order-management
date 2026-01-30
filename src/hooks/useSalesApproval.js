/**
 * Sales Approval React Query Hooks
 * src/features/sales/hooks/useSalesApproval.js
 *
 * Phase 14: QA + Client Approval + Dispatch
 * React Query hooks for Sales approval operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { salesApprovalApi } from "@/services/api/salesApprovalApi"
import { qaKeys } from "../../src/hooks/useQA"
import { toast } from "sonner"

// ============================================================================
// QUERY KEYS
// ============================================================================

export const salesKeys = {
  all: ["sales"],
  readyForClient: () => [...salesKeys.all, "ready-for-client"],
  awaitingApproval: () => [...salesKeys.all, "awaiting-approval"],
  stats: () => [...salesKeys.all, "stats"],
  orderItem: (orderItemId) => [...salesKeys.all, "order-item", orderItemId],
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch sections ready to send to client
 */
export function useSectionsReadyForClient() {
  return useQuery({
    queryKey: salesKeys.readyForClient(),
    queryFn: salesApprovalApi.getSectionsReadyForClient,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch sections awaiting client response
 */
export function useSectionsAwaitingApproval() {
  return useQuery({
    queryKey: salesKeys.awaitingApproval(),
    queryFn: salesApprovalApi.getSectionsAwaitingApproval,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch sales approval statistics
 */
export function useSalesApprovalStats() {
  return useQuery({
    queryKey: salesKeys.stats(),
    queryFn: salesApprovalApi.getSalesApprovalStats,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch order item approval details
 */
export function useOrderItemApprovalDetails(orderItemId) {
  return useQuery({
    queryKey: salesKeys.orderItem(orderItemId),
    queryFn: () => salesApprovalApi.getOrderItemApprovalDetails(orderItemId),
    enabled: !!orderItemId,
    staleTime: 30 * 1000,
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to send a section to client for approval
 */
export function useSendSectionToClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, sectionName, sentBy }) =>
      salesApprovalApi.sendSectionToClient(orderItemId, sectionName, { sentBy }),

    onSuccess: (data, variables) => {
      const displayName =
        variables.sectionName.charAt(0).toUpperCase() + variables.sectionName.slice(1)

      toast.success(`${displayName} sent to client`, {
        description: "Awaiting client approval.",
      })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: salesKeys.readyForClient() })
      queryClient.invalidateQueries({ queryKey: salesKeys.awaitingApproval() })
      queryClient.invalidateQueries({ queryKey: salesKeys.stats() })
      queryClient.invalidateQueries({ queryKey: salesKeys.orderItem(variables.orderItemId) })
      queryClient.invalidateQueries({ queryKey: qaKeys.readyForClient() })

      // Force refetch
      queryClient.refetchQueries({ queryKey: salesKeys.readyForClient() })
      queryClient.refetchQueries({ queryKey: salesKeys.awaitingApproval() })
    },

    onError: (error) => {
      console.error("Failed to send to client:", error)
      toast.error("Failed to send to client", {
        description: error.message || "Please try again.",
      })
    },
  })
}

/**
 * Hook to mark a section as approved by client
 */
export function useMarkSectionClientApproved() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, sectionName, approvedBy, clientNotes }) =>
      salesApprovalApi.markSectionClientApproved(orderItemId, sectionName, {
        approvedBy,
        clientNotes,
      }),

    onSuccess: (data, variables) => {
      const displayName =
        variables.sectionName.charAt(0).toUpperCase() + variables.sectionName.slice(1)

      if (data.allSectionsApproved) {
        toast.success("All sections approved!", {
          description: "Order item is ready for dispatch.",
        })
      } else {
        toast.success(`${displayName} approved by client`)
      }

      if (data.orderReadyForDispatch) {
        toast.success("Order ready for dispatch!", {
          description: "All items have been approved by client.",
        })
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: salesKeys.awaitingApproval() })
      queryClient.invalidateQueries({ queryKey: salesKeys.stats() })
      queryClient.invalidateQueries({ queryKey: salesKeys.orderItem(variables.orderItemId) })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["dispatch"] })

      // Force refetch
      queryClient.refetchQueries({ queryKey: salesKeys.awaitingApproval() })
      queryClient.refetchQueries({ queryKey: salesKeys.stats() })
    },

    onError: (error) => {
      console.error("Failed to mark as approved:", error)
      toast.error("Failed to mark as approved", {
        description: error.message || "Please try again.",
      })
    },
  })
}

/**
 * Hook to send all ready sections to client
 */
export function useSendAllSectionsToClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, sentBy }) =>
      salesApprovalApi.sendAllSectionsToClient(orderItemId, { sentBy }),

    onSuccess: (data, variables) => {
      const count = data.updatedSections?.length || 0
      toast.success(`${count} sections sent to client`, {
        description: "Awaiting client approval.",
      })

      queryClient.invalidateQueries({ queryKey: salesKeys.readyForClient() })
      queryClient.invalidateQueries({ queryKey: salesKeys.awaitingApproval() })
      queryClient.invalidateQueries({ queryKey: salesKeys.stats() })
      queryClient.invalidateQueries({ queryKey: salesKeys.orderItem(variables.orderItemId) })
      queryClient.invalidateQueries({ queryKey: qaKeys.readyForClient() })

      queryClient.refetchQueries({ queryKey: salesKeys.readyForClient() })
      queryClient.refetchQueries({ queryKey: salesKeys.awaitingApproval() })
    },

    onError: (error) => {
      console.error("Failed to send all to client:", error)
      toast.error("Failed to send sections to client", {
        description: error.message || "Please try again.",
      })
    },
  })
}

/**
 * Hook to approve all awaiting sections
 */
export function useApproveAllSections() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, approvedBy, clientNotes }) =>
      salesApprovalApi.approveAllSections(orderItemId, { approvedBy, clientNotes }),

    onSuccess: (data, variables) => {
      const count = data.updatedSections?.length || 0

      if (data.allSectionsApproved) {
        toast.success("All sections approved!", {
          description: "Order item is ready for dispatch.",
        })
      } else {
        toast.success(`${count} sections approved by client`)
      }

      if (data.orderReadyForDispatch) {
        toast.success("Order ready for dispatch!", {
          description: "All items have been approved.",
        })
      }

      queryClient.invalidateQueries({ queryKey: salesKeys.awaitingApproval() })
      queryClient.invalidateQueries({ queryKey: salesKeys.stats() })
      queryClient.invalidateQueries({ queryKey: salesKeys.orderItem(variables.orderItemId) })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["dispatch"] })

      queryClient.refetchQueries({ queryKey: salesKeys.awaitingApproval() })
    },

    onError: (error) => {
      console.error("Failed to approve all sections:", error)
      toast.error("Failed to approve sections", {
        description: error.message || "Please try again.",
      })
    },
  })
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to get sections grouped by order item
 */
export function useSectionsGroupedByOrderItem(status = "ready") {
  const readyQuery = useSectionsReadyForClient()
  const awaitingQuery = useSectionsAwaitingApproval()

  const sections = status === "ready" ? readyQuery.data : awaitingQuery.data
  const isLoading = status === "ready" ? readyQuery.isLoading : awaitingQuery.isLoading
  const error = status === "ready" ? readyQuery.error : awaitingQuery.error

  const groupedData = sections
    ? sections.reduce((acc, section) => {
        const key = section.orderItemId
        if (!acc[key]) {
          acc[key] = {
            orderItemId: section.orderItemId,
            orderId: section.orderId,
            orderNumber: section.orderNumber,
            customerName: section.customerName,
            customerPhone: section.customerPhone,
            productName: section.productName,
            fwdDate: section.fwdDate,
            sections: [],
          }
        }
        acc[key].sections.push(section)
        return acc
      }, {})
    : {}

  return {
    data: Object.values(groupedData),
    isLoading,
    error,
  }
}
