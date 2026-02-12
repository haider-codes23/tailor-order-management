/**
 * Sales Approval React Query Hooks - Phase 14 Redesign
 * src/hooks/useSalesApproval.js
 *
 * Complete rewrite for new ORDER-LEVEL sales workflow:
 * - 3-tab dashboard queries: approval-queue, awaiting-response, awaiting-payment
 * - Order-level mutations: send-to-client, client-approved, re-video, alteration, etc.
 * - Cross-module invalidation with QA and Production query keys
 * - All mutations use forced refetch for immediate UI updates
 *
 * Invalidation Map (from phase-14-data-flow.md):
 * ─────────────────────────────────────────────────────────
 * Sales sends to client  → invalidate ['sales', 'ready-for-client'], ['sales', 'awaiting-response']
 * Sales approves         → invalidate ['sales', 'awaiting-response'], ['sales', 'awaiting-payment']
 * Sales request re-video → invalidate ['sales', 'awaiting-response'], ['qa', 'sales-requests']
 * Sales request alter    → invalidate ['sales', 'awaiting-response'], ['production', 'my-assignments']
 * Sales approve payments → invalidate ['sales', 'awaiting-payment'], ['dispatch', 'queue']
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { salesApprovalApi } from "@/services/api/salesApprovalApi"
import { qaKeys } from "@/hooks/useQA"
import { toast } from "sonner"

// ============================================================================
// QUERY KEYS
// ============================================================================

export const salesKeys = {
  all: ["sales"],
  approvalQueue: () => [...salesKeys.all, "approval-queue"],
  awaitingResponse: () => [...salesKeys.all, "awaiting-response"],
  awaitingPayment: () => [...salesKeys.all, "awaiting-payment"],
  stats: () => [...salesKeys.all, "stats"],
  order: (orderId) => [...salesKeys.all, "order", orderId],
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch orders ready to send to client (Tab 1)
 * Orders in READY_FOR_CLIENT_APPROVAL status
 */
export function useApprovalQueue() {
  return useQuery({
    queryKey: salesKeys.approvalQueue(),
    queryFn: salesApprovalApi.getApprovalQueue,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch orders awaiting client response (Tab 2)
 * Orders in AWAITING_CLIENT_APPROVAL status
 */
export function useAwaitingResponse() {
  return useQuery({
    queryKey: salesKeys.awaitingResponse(),
    queryFn: salesApprovalApi.getAwaitingResponse,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch orders awaiting payment verification (Tab 3)
 * Orders in AWAITING_ACCOUNT_APPROVAL status
 */
export function useAwaitingPayment() {
  return useQuery({
    queryKey: salesKeys.awaitingPayment(),
    queryFn: salesApprovalApi.getAwaitingPayment,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch sales dashboard statistics
 */
export function useSalesStats() {
  return useQuery({
    queryKey: salesKeys.stats(),
    queryFn: salesApprovalApi.getSalesStats,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch order details for sales approval view
 * @param {string} orderId - The order ID
 */
export function useSalesOrderDetails(orderId) {
  return useQuery({
    queryKey: salesKeys.order(orderId),
    queryFn: () => salesApprovalApi.getOrderDetails(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000,
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to send an order to the client for approval
 * READY_FOR_CLIENT_APPROVAL → AWAITING_CLIENT_APPROVAL
 */
export function useSendOrderToClient() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, sentBy }) =>
      salesApprovalApi.sendOrderToClient(orderId, { sentBy }),

    onSuccess: (data) => {
      const orderNumber = data.orderNumber || "Order"

      toast.success(`${orderNumber} sent to client`, {
        description: "Awaiting client response",
      })

      // Invalidate: order moves from Tab 1 → Tab 2
      qc.invalidateQueries({ queryKey: salesKeys.approvalQueue() })
      qc.invalidateQueries({ queryKey: salesKeys.awaitingResponse() })
      qc.invalidateQueries({ queryKey: salesKeys.stats() })
      qc.invalidateQueries({ queryKey: ["orders"] })

      // Force immediate refetch
      qc.refetchQueries({ queryKey: salesKeys.approvalQueue() })
      qc.refetchQueries({ queryKey: salesKeys.awaitingResponse() })
      qc.refetchQueries({ queryKey: salesKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to send order to client", {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to mark an order as approved by client (with screenshot proof)
 * AWAITING_CLIENT_APPROVAL → AWAITING_ACCOUNT_APPROVAL
 */
export function useMarkClientApproved() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, screenshots, notes, approvedBy }) =>
      salesApprovalApi.markClientApproved(orderId, { screenshots, notes, approvedBy }),

    onSuccess: (data) => {
      const orderNumber = data.orderNumber || "Order"

      toast.success(`${orderNumber} — Client approved`, {
        description: "Moved to payment verification",
      })

      // Invalidate: order moves from Tab 2 → Tab 3
      qc.invalidateQueries({ queryKey: salesKeys.awaitingResponse() })
      qc.invalidateQueries({ queryKey: salesKeys.awaitingPayment() })
      qc.invalidateQueries({ queryKey: salesKeys.stats() })
      qc.invalidateQueries({ queryKey: ["orders"] })

      // Force immediate refetch
      qc.refetchQueries({ queryKey: salesKeys.awaitingResponse() })
      qc.refetchQueries({ queryKey: salesKeys.awaitingPayment() })
      qc.refetchQueries({ queryKey: salesKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to record client approval", {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to request a re-video from QA
 * Order stays in AWAITING_CLIENT_APPROVAL; order item gets reVideoRequest
 * Appears in QA Dashboard Tab 2 (Sales Requests)
 */
export function useRequestReVideo() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, orderItemId, sections, requestedBy }) =>
      salesApprovalApi.requestReVideo(orderId, { orderItemId, sections, requestedBy }),

    onSuccess: (data) => {
      const orderNumber = data.orderNumber || "Order"

      toast.success("Re-video requested", {
        description: `${orderNumber} — Request sent to QA team`,
      })

      // Invalidate: order stays in Tab 2, but QA sales-requests updates
      qc.invalidateQueries({ queryKey: salesKeys.awaitingResponse() })
      qc.invalidateQueries({ queryKey: salesKeys.stats() })
      qc.invalidateQueries({ queryKey: qaKeys.salesRequests() })
      qc.invalidateQueries({ queryKey: qaKeys.stats() })
      qc.invalidateQueries({ queryKey: ["orders"] })

      // Force immediate refetch
      qc.refetchQueries({ queryKey: salesKeys.awaitingResponse() })
      qc.refetchQueries({ queryKey: qaKeys.salesRequests() })
      qc.refetchQueries({ queryKey: salesKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to request re-video", {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to request alteration for specific sections
 * Sections go back to Production Head for rework
 * Order item → ALTERATION_REQUIRED
 */
export function useRequestAlteration() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, sections, requestedBy }) =>
      salesApprovalApi.requestAlteration(orderId, { sections, requestedBy }),

    onSuccess: (data) => {
      const orderNumber = data.orderNumber || "Order"

      toast.success("Alteration requested", {
        description: `${orderNumber} — Sections sent back to Production`,
      })

      // Invalidate: order leaves Tab 2, production gets new work
      qc.invalidateQueries({ queryKey: salesKeys.awaitingResponse() })
      qc.invalidateQueries({ queryKey: salesKeys.stats() })
      qc.invalidateQueries({ queryKey: ["production"] })
      qc.invalidateQueries({ queryKey: ["orders"] })

      // Force immediate refetch
      qc.refetchQueries({ queryKey: salesKeys.awaitingResponse() })
      qc.refetchQueries({ queryKey: salesKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to request alteration", {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to cancel an order (client rejected)
 * AWAITING_CLIENT_APPROVAL → CANCELLED_BY_CLIENT
 */
export function useCancelOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, reason, cancelledBy }) =>
      salesApprovalApi.cancelOrder(orderId, { reason, cancelledBy }),

    onSuccess: (data) => {
      const orderNumber = data.orderNumber || "Order"

      toast.success(`${orderNumber} cancelled`, {
        description: "Order has been cancelled by client request",
      })

      // Invalidate: order leaves Tab 2
      qc.invalidateQueries({ queryKey: salesKeys.awaitingResponse() })
      qc.invalidateQueries({ queryKey: salesKeys.stats() })
      qc.invalidateQueries({ queryKey: ["orders"] })

      // Force immediate refetch
      qc.refetchQueries({ queryKey: salesKeys.awaitingResponse() })
      qc.refetchQueries({ queryKey: salesKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to cancel order", {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to start an order from scratch
 * Resets to INVENTORY_CHECK — full production cycle restarts
 */
export function useStartFromScratch() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, confirmedBy, reason }) =>
      salesApprovalApi.startFromScratch(orderId, { confirmedBy, reason }),

    onSuccess: (data) => {
      const orderNumber = data.orderNumber || "Order"

      toast.success(`${orderNumber} reset`, {
        description: "Order will restart from Inventory Check",
      })

      // Invalidate: order leaves sales entirely, goes back to inventory
      qc.invalidateQueries({ queryKey: salesKeys.all })
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: ["inventory"] })

      // Force immediate refetch
      qc.refetchQueries({ queryKey: salesKeys.approvalQueue() })
      qc.refetchQueries({ queryKey: salesKeys.awaitingResponse() })
      qc.refetchQueries({ queryKey: salesKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to reset order", {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to verify payments and approve for dispatch
 * AWAITING_ACCOUNT_APPROVAL → READY_FOR_DISPATCH
 */
export function useApprovePayments() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, approvedBy }) =>
      salesApprovalApi.approvePayments(orderId, { approvedBy }),

    onSuccess: (data) => {
      const orderNumber = data.orderNumber || "Order"

      toast.success(`${orderNumber} — Payments verified`, {
        description: "Order is ready for dispatch",
      })

      // Invalidate: order leaves Tab 3, goes to dispatch
      qc.invalidateQueries({ queryKey: salesKeys.awaitingPayment() })
      qc.invalidateQueries({ queryKey: salesKeys.stats() })
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: ["dispatch"] })

      // Force immediate refetch
      qc.refetchQueries({ queryKey: salesKeys.awaitingPayment() })
      qc.refetchQueries({ queryKey: salesKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to approve payments", {
        description: error.message,
      })
    },
  })
}

// ============================================================================
// HELPER EXPORTS
// ============================================================================

export { salesApprovalApi }
