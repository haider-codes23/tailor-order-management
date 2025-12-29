/**
 * Orders API Service
 * HTTP functions for order-related endpoints
 */

import { httpClient } from "@/services/http/httpClient"

// ==================== ORDERS ====================

/**
 * Get list of orders with optional filters
 */
export const getOrders = async (params = {}) => {
  const searchParams = new URLSearchParams()

  if (params.search) searchParams.set("search", params.search)
  if (params.status) searchParams.set("status", params.status)
  if (params.source) searchParams.set("source", params.source)
  if (params.urgent) searchParams.set("urgent", params.urgent)
  if (params.consultantId) searchParams.set("consultantId", params.consultantId)
  if (params.page) searchParams.set("page", params.page.toString())
  if (params.limit) searchParams.set("limit", params.limit.toString())

  const query = searchParams.toString()
  const url = query ? `/orders?${query}` : "/orders"

  return httpClient.get(url)
}

/**
 * Get single order by ID with items
 */
export const getOrderById = async (orderId) => {
  return httpClient.get(`/orders/${orderId}`)
}

/**
 * Create new order (manual)
 */
export const createOrder = async (orderData) => {
  return httpClient.post("/orders", orderData)
}

/**
 * Update order
 */
export const updateOrder = async (orderId, orderData) => {
  return httpClient.put(`/orders/${orderId}`, orderData)
}

/**
 * Delete order
 */
export const deleteOrder = async (orderId) => {
  return httpClient.delete(`/orders/${orderId}`)
}

// ==================== PAYMENTS ====================

/**
 * Add payment to order
 */
export const addPayment = async (orderId, paymentData) => {
  return httpClient.post(`/orders/${orderId}/payments`, paymentData)
}

/**
 * Delete payment from order
 */
export const deletePayment = async (orderId, paymentId) => {
  return httpClient.delete(`/orders/${orderId}/payments/${paymentId}`)
}

// ==================== ORDER ITEMS ====================

/**
 * Get single order item by ID
 */
export const getOrderItemById = async (itemId) => {
  return httpClient.get(`/order-items/${itemId}`)
}

/**
 * Update order item
 */
export const updateOrderItem = async (itemId, itemData) => {
  return httpClient.put(`/order-items/${itemId}`, itemData)
}

/**
 * Add item to existing order
 */
export const addOrderItem = async (orderId, itemData) => {
  return httpClient.post(`/orders/${orderId}/items`, itemData)
}

/**
 * Delete order item
 */
export const deleteOrderItem = async (itemId) => {
  return httpClient.delete(`/order-items/${itemId}`)
}

/**
 * Add timeline entry to order item
 */
export const addTimelineEntry = async (itemId, entryData) => {
  return httpClient.post(`/order-items/${itemId}/timeline`, entryData)
}

/**
 * Generate order form for item
 */
export const generateOrderForm = async (itemId, formData) => {
  return httpClient.post(`/order-items/${itemId}/generate-form`, formData)
}

/**
 * Mark order form as approved by customer
 */
export const approveOrderForm = async (itemId, approvalData) => {
  return httpClient.post(`/order-items/${itemId}/approve-form`, approvalData)
}

/**
 * Update order item status
 */
export const updateOrderItemStatus = async (itemId, status, updatedBy) => {
  return httpClient.put(`/order-items/${itemId}`, { status, updatedBy })
}
