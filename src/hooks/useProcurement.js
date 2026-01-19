import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  fetchProcurementDemands,
  fetchProcurementDemandById,
  updateProcurementDemand,
  deleteProcurementDemand,
  fetchProcurementStats,
  runInventoryCheck,
  rerunSectionInventoryCheck,
} from "../services/api/procurementApi"

import { orderKeys, orderItemKeys } from "./useOrders"

import { toast } from "sonner"

// Query keys
export const procurementKeys = {
  all: ["procurement-demands"],
  lists: () => [...procurementKeys.all, "list"],
  list: (filters) => [...procurementKeys.lists(), filters],
  details: () => [...procurementKeys.all, "detail"],
  detail: (id) => [...procurementKeys.details(), id],
  stats: () => [...procurementKeys.all, "stats"],
}

// Get all procurement demands
export const useProcurementDemands = (params = {}) => {
  return useQuery({
    queryKey: procurementKeys.list(params),
    queryFn: () => fetchProcurementDemands(params),
  })
}

// Get single procurement demand
export const useProcurementDemand = (id) => {
  return useQuery({
    queryKey: procurementKeys.detail(id),
    queryFn: () => fetchProcurementDemandById(id),
    enabled: !!id,
  })
}

// Get procurement stats
export const useProcurementStats = () => {
  return useQuery({
    queryKey: procurementKeys.stats(),
    queryFn: fetchProcurementStats,
  })
}

// Update procurement demand
export const useUpdateProcurementDemand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateProcurementDemand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.all })
      queryClient.refetchQueries({ queryKey: procurementKeys.all, type: "active" })
    },
  })
}

// Delete procurement demand
export const useDeleteProcurementDemand = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => deleteProcurementDemand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: procurementKeys.all })
      queryClient.refetchQueries({ queryKey: procurementKeys.all, type: "active" })
    },
  })
}

// Run inventory check
export const useRunInventoryCheck = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, data }) => runInventoryCheck(orderItemId, data),
    onSuccess: (response, variables) => {
      const itemId = variables.orderItemId
      // Extract orderId from response - handle both wrapped and unwrapped responses
      const orderId = response?.data?.item?.orderId || response?.item?.orderId

      // Invalidate and force refetch order item
      queryClient.invalidateQueries({ queryKey: orderItemKeys.detail(itemId) })
      queryClient.refetchQueries({ queryKey: orderItemKeys.detail(itemId), type: "active" })

      if (orderId) {
        // Invalidate and force refetch order detail
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
        queryClient.refetchQueries({ queryKey: orderKeys.detail(orderId), type: "active" })
      }

      // Invalidate and force refetch order lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.refetchQueries({ queryKey: orderKeys.lists(), type: "active" })

      // Invalidate and force refetch procurement queries
      queryClient.invalidateQueries({ queryKey: procurementKeys.all })
      queryClient.refetchQueries({ queryKey: procurementKeys.all, type: "active" })
    },
  })
}

// Re-run inventory check for sections in AWAITING_MATERIAL status
export const useRerunSectionInventoryCheck = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderItemId, data }) => rerunSectionInventoryCheck(orderItemId, data),
    onSuccess: (response, variables) => {
      const itemId = variables.orderItemId
      const orderId = response?.data?.item?.orderId || response?.item?.orderId

      // Invalidate and force refetch order item
      queryClient.invalidateQueries({ queryKey: orderItemKeys.detail(itemId) })
      queryClient.refetchQueries({ queryKey: orderItemKeys.detail(itemId), type: "active" })

      if (orderId) {
        // Invalidate and force refetch order detail
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
        queryClient.refetchQueries({ queryKey: orderKeys.detail(orderId), type: "active" })
      }

      // Invalidate and force refetch order lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.refetchQueries({ queryKey: orderKeys.lists(), type: "active" })

      // Invalidate and force refetch procurement queries
      queryClient.invalidateQueries({ queryKey: procurementKeys.all })
      queryClient.refetchQueries({ queryKey: procurementKeys.all, type: "active" })

      // Invalidate packet queries
      queryClient.invalidateQueries({ queryKey: ["packet"] })
      queryClient.refetchQueries({ queryKey: ["packet"], type: "active" })

      const result = response?.data || response
      if (result?.passedSections?.length > 0) {
        toast.success(`Inventory check passed for: ${result.passedSections.join(", ")}`)
      } else {
        toast.info("No sections passed inventory check yet")
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to re-run section inventory check")
    },
  })
}
