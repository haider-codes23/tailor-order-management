/**
 * Fabrication React Query Hooks
 * Handles all data fetching and mutations for the Fabrication module
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getFabricationOrders,
  getFabricationOrder,
  getFabricationItem,
  createCustomBOM,
  updateCustomBOM,
  addCustomBOMItem,
  updateCustomBOMItem,
  deleteCustomBOMItem,
  submitCustomBOM,
} from "@/services/api/fabricationApi"

// Query Keys
export const fabricationKeys = {
  all: ["fabrication"],
  orders: () => [...fabricationKeys.all, "orders"],
  order: (orderId) => [...fabricationKeys.all, "order", orderId],
  item: (orderId, itemId) => [...fabricationKeys.all, "item", orderId, itemId],
}

// Also need to invalidate order keys when BOM is submitted
export const orderKeys = {
  all: ["orders"],
  lists: () => [...orderKeys.all, "list"],
  detail: (id) => [...orderKeys.all, "detail", id],
}

export const orderItemKeys = {
  all: ["orderItems"],
  detail: (id) => [...orderItemKeys.all, "detail", id],
}

/**
 * Hook to fetch all orders with items needing custom BOM
 */
export const useFabricationOrders = () => {
  return useQuery({
    queryKey: fabricationKeys.orders(),
    queryFn: getFabricationOrders,
    staleTime: 0, // 30 seconds
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch a specific order for fabrication
 */
export const useFabricationOrder = (orderId) => {
  return useQuery({
    queryKey: fabricationKeys.order(orderId),
    queryFn: () => getFabricationOrder(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to fetch a specific order item for fabrication
 */
export const useFabricationItem = (orderId, itemId) => {
  return useQuery({
    queryKey: fabricationKeys.item(orderId, itemId),
    queryFn: () => getFabricationItem(orderId, itemId),
    enabled: !!orderId && !!itemId,
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to create a custom BOM
 */
export const useCreateCustomBOM = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, bomData }) => createCustomBOM(itemId, bomData),
    onSuccess: (data, variables) => {
      toast.success("Custom BOM created successfully")

      // Invalidate and refetch fabrication queries
      queryClient.invalidateQueries({ queryKey: fabricationKeys.all })
      queryClient.refetchQueries({ queryKey: fabricationKeys.all })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create custom BOM")
    },
  })
}

/**
 * Hook to update a custom BOM
 */
export const useUpdateCustomBOM = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, bomData }) => updateCustomBOM(itemId, bomData),
    onSuccess: (data, variables) => {
      toast.success("Custom BOM updated successfully")

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: fabricationKeys.all })
      queryClient.refetchQueries({ queryKey: fabricationKeys.all })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update custom BOM")
    },
  })
}

/**
 * Hook to add a BOM item to a section
 */
export const useAddCustomBOMItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, piece, bomItemData }) => addCustomBOMItem(itemId, piece, bomItemData),
    onSuccess: (data, variables) => {
      toast.success("Material added successfully")

      // Invalidate and refetch the specific item
      queryClient.invalidateQueries({ queryKey: fabricationKeys.all })
      queryClient.refetchQueries({ queryKey: fabricationKeys.all })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add material")
    },
  })
}

/**
 * Hook to update a BOM item
 */
export const useUpdateCustomBOMItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, piece, bomItemId, bomItemData }) =>
      updateCustomBOMItem(itemId, piece, bomItemId, bomItemData),
    onSuccess: (data, variables) => {
      toast.success("Material updated successfully")

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: fabricationKeys.all })
      queryClient.refetchQueries({ queryKey: fabricationKeys.all })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update material")
    },
  })
}

/**
 * Hook to delete a BOM item
 */
export const useDeleteCustomBOMItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, piece, bomItemId }) => deleteCustomBOMItem(itemId, piece, bomItemId),
    onSuccess: (data, variables) => {
      toast.success("Material removed successfully")

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: fabricationKeys.all })
      queryClient.refetchQueries({ queryKey: fabricationKeys.all })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove material")
    },
  })
}

/**
 * Hook to submit custom BOM and transition to INVENTORY_CHECK
 */
export const useSubmitCustomBOM = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, submittedBy }) => submitCustomBOM(itemId, submittedBy),
    onSuccess: (data, variables) => {
      toast.success("Custom BOM submitted successfully! Order item moved to Inventory Check.")

      // Invalidate fabrication queries
      queryClient.invalidateQueries({ queryKey: fabricationKeys.all })
      queryClient.refetchQueries({ queryKey: fabricationKeys.all })

      // Also invalidate order queries since status changed
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      queryClient.refetchQueries({ queryKey: orderKeys.lists() })

      // Invalidate the specific order item
      queryClient.invalidateQueries({ queryKey: orderItemKeys.detail(variables.itemId) })
      queryClient.refetchQueries({ queryKey: orderItemKeys.detail(variables.itemId) })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit custom BOM")
    },
  })
}
