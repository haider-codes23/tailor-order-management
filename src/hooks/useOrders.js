/**
 * React Query Hooks for Orders
 * Data fetching and mutations for orders and order items
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  addPayment,
  deletePayment,
  getOrderItemById,
  updateOrderItem,
  addOrderItem,
  deleteOrderItem,
  addTimelineEntry,
  generateOrderForm,
  approveOrderForm,
  updateOrderItemStatus,
} from "@/services/api/ordersApi"

// Query keys
export const orderKeys = {
  all: ["orders"],
  lists: () => [...orderKeys.all, "list"],
  list: (filters) => [...orderKeys.lists(), filters],
  details: () => [...orderKeys.all, "detail"],
  detail: (id) => [...orderKeys.details(), id],
}

export const orderItemKeys = {
  all: ["orderItems"],
  details: () => [...orderItemKeys.all, "detail"],
  detail: (id) => [...orderItemKeys.details(), id],
}

// ==================== ORDERS ====================

/**
 * Hook to fetch orders list with filters
 */
export const useOrders = (filters = {}) => {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => getOrders(filters),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to fetch single order with items
 */
export const useOrder = (orderId) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  })
}

/**
 * Hook to create new order
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

/**
 * Hook to update order
 */
export const useUpdateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, data }) => updateOrder(orderId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) })
    },
  })
}

/**
 * Hook to delete order
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

// ==================== PAYMENTS ====================

/**
 * Hook to add payment to order
 */
export const useAddPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, data }) => addPayment(orderId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

/**
 * Hook to delete payment from order
 */
export const useDeletePayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, paymentId }) => deletePayment(orderId, paymentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

// ==================== ORDER ITEMS ====================

/**
 * Hook to fetch single order item
 */
export const useOrderItem = (itemId) => {
  return useQuery({
    queryKey: orderItemKeys.detail(itemId),
    queryFn: () => getOrderItemById(itemId),
    enabled: !!itemId,
  })
}

/**
 * Hook to update order item
 */
export const useUpdateOrderItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, data }) => updateOrderItem(itemId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderItemKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

/**
 * Hook to add item to order
 */
export const useAddOrderItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, data }) => addOrderItem(orderId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

/**
 * Hook to delete order item
 */
export const useDeleteOrderItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOrderItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

/**
 * Hook to add timeline entry
 */
export const useAddTimelineEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, data }) => addTimelineEntry(itemId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderItemKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) })
    },
  })
}

/**
 * Hook to generate order form for item
 */
export const useGenerateOrderForm = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, data }) => generateOrderForm(itemId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderItemKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

/**
 * Hook to approve order form
 */
export const useApproveOrderForm = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, data }) => approveOrderForm(itemId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderItemKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

/**
 * Hook to update order item status
 */
export const useUpdateOrderItemStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, status, updatedBy }) => updateOrderItemStatus(itemId, status, updatedBy),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderItemKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}
