/**
 * Dyeing API Service
 * src/services/api/dyeingApi.js
 *
 * Phase 12.5: Dyeing Department
 * Handles all API calls related to the Dyeing module
 */

import { httpClient } from "@/services/http/httpClient"

const BASE_URL = "/dyeing"

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get available dyeing tasks (sections ready for dyeing, not yet accepted)
 * @param {Object} params - Query params: sortBy, sortOrder, priority
 */
export const getAvailableTasks = async (params = {}) => {
  const queryParams = new URLSearchParams()
  if (params.sortBy) queryParams.append("sortBy", params.sortBy)
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder)
  if (params.priority) queryParams.append("priority", params.priority)

  const queryString = queryParams.toString()
  const url = `${BASE_URL}/available-tasks${queryString ? `?${queryString}` : ""}`

  const response = await httpClient.get(url)
  return response.data
}

/**
 * Get current user's accepted dyeing tasks
 * @param {string} userId - The user ID
 * @param {Object} params - Query params: sortBy, sortOrder
 */
export const getMyTasks = async (userId, params = {}) => {
  const queryParams = new URLSearchParams()
  queryParams.append("userId", userId)
  if (params.sortBy) queryParams.append("sortBy", params.sortBy)
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder)

  const response = await httpClient.get(`${BASE_URL}/my-tasks?${queryParams.toString()}`)
  return response.data
}

/**
 * Get completed dyeing tasks with pagination and filters
 * @param {Object} params - Query params: userId, page, limit, startDate, endDate
 * 
 * NOTE: This function returns the full response including meta for pagination
 */
export const getCompletedTasks = async (params = {}) => {
  const queryParams = new URLSearchParams()
  if (params.userId) queryParams.append("userId", params.userId)
  if (params.page) queryParams.append("page", params.page)
  if (params.limit) queryParams.append("limit", params.limit)
  if (params.startDate) queryParams.append("startDate", params.startDate)
  if (params.endDate) queryParams.append("endDate", params.endDate)

  const queryString = queryParams.toString()
  const url = `${BASE_URL}/completed-tasks${queryString ? `?${queryString}` : ""}`

  const response = await httpClient.get(url)

  // Return full response with meta for pagination
  // The handler returns: { success: true, data: [...], meta: {...} }
  // We need to preserve meta for pagination
  return {
    tasks: response.data,
    meta: response.meta,
  }
}

/**
 * Get detailed dyeing task info for an order item
 * @param {string} orderItemId - The order item ID
 */
export const getTaskDetails = async (orderItemId) => {
  const response = await httpClient.get(`${BASE_URL}/task/${orderItemId}`)
  return response.data
}

/**
 * Get dyeing dashboard statistics
 * @param {string} userId - Optional user ID for user-specific stats
 */
export const getStats = async (userId = null) => {
  const url = userId ? `${BASE_URL}/stats?userId=${userId}` : `${BASE_URL}/stats`
  const response = await httpClient.get(url)
  return response.data
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Accept sections for dyeing
 * @param {string} orderItemId - The order item ID
 * @param {Object} data - { userId, sections: string[] }
 */
export const acceptSections = async (orderItemId, data) => {
  const response = await httpClient.post(`${BASE_URL}/task/${orderItemId}/accept`, data)
  return response.data
}

/**
 * Start dyeing for sections
 * @param {string} orderItemId - The order item ID
 * @param {Object} data - { userId, sections: string[] }
 */
export const startDyeing = async (orderItemId, data) => {
  const response = await httpClient.post(`${BASE_URL}/task/${orderItemId}/start`, data)
  return response.data
}

/**
 * Complete dyeing for sections
 * @param {string} orderItemId - The order item ID
 * @param {Object} data - { userId, sections: string[] }
 */
export const completeDyeing = async (orderItemId, data) => {
  const response = await httpClient.post(`${BASE_URL}/task/${orderItemId}/complete`, data)
  return response.data
}

/**
 * Reject sections from dyeing
 * @param {string} orderItemId - The order item ID
 * @param {Object} data - { userId, sections: string[], reasonCode?: string, notes: string }
 */
export const rejectSections = async (orderItemId, data) => {
  const response = await httpClient.post(`${BASE_URL}/task/${orderItemId}/reject`, data)
  return response.data
}

// ============================================================================
// EXPORT
// ============================================================================

export const dyeingApi = {
  // Queries
  getAvailableTasks,
  getMyTasks,
  getCompletedTasks,
  getTaskDetails,
  getStats,
  // Mutations
  acceptSections,
  startDyeing,
  completeDyeing,
  rejectSections,
}

export default dyeingApi
