/**
 * Dispatch React Query Hooks - Phase 15
 * src/hooks/useDispatch.js
 *
 * Queries: dispatch queue, dispatched list, completed list, stats
 * Mutations: dispatch order, complete order
 *
 * All mutations use forced refetch (invalidateQueries + refetchQueries)
 * for immediate UI updates.
 *
 * Invalidation Map:
 * ─────────────────────────────────────────────────────────
 * Dispatch order   → invalidate ['dispatch'], ['orders'], ['sales']
 * Complete order   → invalidate ['dispatch'], ['orders']
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { dispatchApi } from "@/services/api/dispatchApi"
import { salesKeys } from "@/hooks/useSalesApproval"
import { toast } from "sonner"

// ============================================================================
// QUERY KEYS
// ============================================================================

export const dispatchKeys = {
  all: ["dispatch"],
  queue: () => [...dispatchKeys.all, "queue"],
  dispatched: () => [...dispatchKeys.all, "dispatched"],
  completed: () => [...dispatchKeys.all, "completed"],
  stats: () => [...dispatchKeys.all, "stats"],
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook to fetch orders ready for dispatch (Tab 1)
 * Orders in READY_FOR_DISPATCH status
 */
export function useDispatchQueue() {
  return useQuery({
    queryKey: dispatchKeys.queue(),
    queryFn: dispatchApi.getDispatchQueue,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch dispatched orders (Tab 2)
 * Orders in DISPATCHED status
 */
export function useDispatched() {
  return useQuery({
    queryKey: dispatchKeys.dispatched(),
    queryFn: dispatchApi.getDispatched,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch completed orders (Tab 3)
 * Orders in COMPLETED status
 */
export function useCompleted() {
  return useQuery({
    queryKey: dispatchKeys.completed(),
    queryFn: dispatchApi.getCompleted,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch dispatch dashboard stats
 */
export function useDispatchStats() {
  return useQuery({
    queryKey: dispatchKeys.stats(),
    queryFn: dispatchApi.getDispatchStats,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook to dispatch an order with shipping details
 * READY_FOR_DISPATCH → DISPATCHED
 */
export function useDispatchOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, courier, trackingNumber, dispatchDate, notes, dispatchedBy }) =>
      dispatchApi.dispatchOrder(orderId, {
        courier,
        trackingNumber,
        dispatchDate,
        notes,
        dispatchedBy,
      }),

    onSuccess: (data) => {
      const orderNumber = data?.orderNumber || "Order"

      toast.success(`${orderNumber} dispatched!`, {
        description: `Shipped via ${data?.dispatchData?.courier || "courier"} — ${data?.dispatchData?.trackingNumber || ""}`,
      })

      // Invalidate all dispatch queries
      qc.invalidateQueries({ queryKey: dispatchKeys.queue() })
      qc.invalidateQueries({ queryKey: dispatchKeys.dispatched() })
      qc.invalidateQueries({ queryKey: dispatchKeys.stats() })
      qc.invalidateQueries({ queryKey: ["orders"] })
      qc.invalidateQueries({ queryKey: salesKeys.all })

      // Force immediate refetch
      qc.refetchQueries({ queryKey: dispatchKeys.queue() })
      qc.refetchQueries({ queryKey: dispatchKeys.dispatched() })
      qc.refetchQueries({ queryKey: dispatchKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to dispatch order", {
        description: error.message,
      })
    },
  })
}

/**
 * Hook to mark a dispatched order as completed
 * DISPATCHED → COMPLETED
 */
export function useCompleteOrder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, completedBy }) => dispatchApi.completeOrder(orderId, { completedBy }),

    onSuccess: (data) => {
      const orderNumber = data?.orderNumber || "Order"

      toast.success(`${orderNumber} completed!`, {
        description: "Order has been marked as delivered and completed",
      })

      // Invalidate all dispatch queries
      qc.invalidateQueries({ queryKey: dispatchKeys.dispatched() })
      qc.invalidateQueries({ queryKey: dispatchKeys.completed() })
      qc.invalidateQueries({ queryKey: dispatchKeys.stats() })
      qc.invalidateQueries({ queryKey: ["orders"] })

      // Force immediate refetch
      qc.refetchQueries({ queryKey: dispatchKeys.dispatched() })
      qc.refetchQueries({ queryKey: dispatchKeys.completed() })
      qc.refetchQueries({ queryKey: dispatchKeys.stats() })
    },

    onError: (error) => {
      toast.error("Failed to complete order", {
        description: error.message,
      })
    },
  })
}
