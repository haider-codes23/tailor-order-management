/**
 * Dispatch API Service - Phase 15
 * src/services/api/dispatchApi.js
 *
 * Handles all API calls for the Dispatch module.
 * Pattern: httpClient returns full response, we unwrap with response.data
 */

import { httpClient } from "@/services/http/httpClient"

const BASE_URL = "/dispatch"

/**
 * Get orders ready for dispatch (READY_FOR_DISPATCH status)
 * @returns {Promise<Array>} List of orders ready for dispatch
 */
export const getDispatchQueue = async () => {
  const response = await httpClient.get(`${BASE_URL}/queue`)
  return response.data
}

/**
 * Get dispatched orders (DISPATCHED status)
 * @returns {Promise<Array>} List of dispatched orders
 */
export const getDispatched = async () => {
  const response = await httpClient.get(`${BASE_URL}/dispatched`)
  return response.data
}

/**
 * Get completed orders (COMPLETED status)
 * @returns {Promise<Array>} List of completed orders
 */
export const getCompleted = async () => {
  const response = await httpClient.get(`${BASE_URL}/completed`)
  return response.data
}

/**
 * Get dispatch dashboard statistics
 * @returns {Promise<Object>} Stats object
 */
export const getDispatchStats = async () => {
  const response = await httpClient.get(`${BASE_URL}/stats`)
  return response.data
}

/**
 * Dispatch an order with shipping details
 * READY_FOR_DISPATCH → DISPATCHED
 *
 * @param {string} orderId - The order ID
 * @param {Object} data - Shipping details
 * @param {string} data.courier - Courier service name
 * @param {string} data.trackingNumber - Tracking/shipping number
 * @param {string} data.dispatchDate - Date of dispatch (YYYY-MM-DD)
 * @param {string} [data.notes] - Optional shipping notes
 * @param {string|number} data.dispatchedBy - User ID who dispatched
 * @returns {Promise<Object>} Updated order data
 */
export const dispatchOrder = async (orderId, data) => {
  const response = await httpClient.post(`${BASE_URL}/order/${orderId}/dispatch`, data)
  return response.data
}

/**
 * Mark a dispatched order as completed
 * DISPATCHED → COMPLETED
 *
 * @param {string} orderId - The order ID
 * @param {Object} data - { completedBy: userId }
 * @returns {Promise<Object>} Updated order data
 */
export const completeOrder = async (orderId, data) => {
  const response = await httpClient.post(`${BASE_URL}/order/${orderId}/complete`, data)
  return response.data
}

// ============================================================================
// EXPORT
// ============================================================================

export const dispatchApi = {
  getDispatchQueue,
  getDispatched,
  getCompleted,
  getDispatchStats,
  dispatchOrder,
  completeOrder,
}

export default dispatchApi
