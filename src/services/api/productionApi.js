/**
 * Production API Service
 * src/services/api/productionApi.js
 *
 * Phase 13: Production Workflow
 * Handles all API calls related to the Production module
 */

import { httpClient } from "@/services/http/httpClient"

const BASE_URL = "/production"

// ============================================================================
// ROUND ROBIN & ASSIGNMENT
// ============================================================================

/**
 * Get current round-robin state
 * @returns {Promise} Round-robin state with next production head info
 */
export const getRoundRobinState = async () => {
  const response = await httpClient.get(`${BASE_URL}/round-robin-state`)
  return response.data
}

/**
 * Get order items ready for production head assignment
 * @returns {Promise} List of order items with sections ready for production
 */
export const getReadyForAssignment = async () => {
  const response = await httpClient.get(`${BASE_URL}/ready-for-assignment`)
  return response.data
}

/**
 * Assign production head to an order item using round-robin
 * @param {string} orderItemId - The order item ID
 * @param {Object} data - { assignedBy: userId }
 * @returns {Promise} Assignment details
 */
export const assignProductionHead = async (orderItemId, data) => {
  const response = await httpClient.post(`${BASE_URL}/assign-head/${orderItemId}`, data)
  return response.data
}

// ============================================================================
// PRODUCTION HEAD DASHBOARD
// ============================================================================

/**
 * Get order items assigned to current production head
 * @param {string} userId - Production head user ID
 * @returns {Promise} List of assigned order items with section details
 */
export const getMyAssignments = async (userId) => {
  const response = await httpClient.get(`${BASE_URL}/my-assignments`, {
    params: { userId },
  })
  return response.data
}

/**
 * Get order item details for production (sanitized view)
 * @param {string} orderItemId - The order item ID
 * @returns {Promise} Production-friendly order details
 */
export const getOrderItemDetails = async (orderItemId) => {
  const response = await httpClient.get(`${BASE_URL}/order-item/${orderItemId}/details`)
  return response.data
}

/**
 * Get list of active production workers
 * @returns {Promise} List of workers for assignment dropdown
 */
export const getWorkers = async () => {
  const response = await httpClient.get(`${BASE_URL}/workers`)
  return response.data
}

// ============================================================================
// TASK MANAGEMENT
// ============================================================================

/**
 * Create tasks for a section (bulk creation)
 * @param {string} orderItemId - The order item ID
 * @param {string} section - Section name (e.g., "Shirt")
 * @param {Object} data - { tasks: Array, createdBy: userId }
 * @returns {Promise} Created tasks
 */
export const createSectionTasks = async (orderItemId, section, data) => {
  const response = await httpClient.post(
    `${BASE_URL}/order-item/${orderItemId}/section/${section}/tasks`,
    data
  )
  return response.data
}

/**
 * Get all tasks for a section
 * @param {string} orderItemId - The order item ID
 * @param {string} section - Section name
 * @returns {Promise} List of tasks for the section
 */
export const getSectionTasks = async (orderItemId, section) => {
  const response = await httpClient.get(
    `${BASE_URL}/order-item/${orderItemId}/section/${section}/tasks`
  )
  return response.data
}

/**
 * Start production for a section (after tasks created)
 * @param {string} orderItemId - The order item ID
 * @param {string} section - Section name
 * @param {Object} data - { startedBy: userId }
 * @returns {Promise} Updated section status
 */
export const startSectionProduction = async (orderItemId, section, data) => {
  const response = await httpClient.post(
    `${BASE_URL}/order-item/${orderItemId}/section/${section}/start`,
    data
  )
  return response.data
}

/**
 * Update task (notes only, if not started)
 * @param {string} taskId - The task ID
 * @param {Object} updates - { notes: string }
 * @returns {Promise} Updated task
 */
export const updateTask = async (taskId, updates) => {
  const response = await httpClient.put(`${BASE_URL}/tasks/${taskId}`, updates)
  return response.data
}

// ============================================================================
// WORKER TASKS
// ============================================================================

/**
 * Get all tasks assigned to current worker
 * @param {string} userId - Worker user ID
 * @returns {Promise} Tasks grouped by status with blocking info
 */
export const getWorkerTasks = async (userId) => {
  const response = await httpClient.get(`${BASE_URL}/worker/my-tasks`, {
    params: { userId },
  })
  return response.data
}

/**
 * Start a task
 * @param {string} taskId - The task ID
 * @param {Object} data - { userId }
 * @returns {Promise} Updated task
 */
export const startTask = async (taskId, data) => {
  const response = await httpClient.post(`${BASE_URL}/tasks/${taskId}/start`, data)
  return response.data
}

/**
 * Complete a task
 * @param {string} taskId - The task ID
 * @param {Object} data - { userId }
 * @returns {Promise} Completed task with next task info
 */
export const completeTask = async (taskId, data) => {
  const response = await httpClient.post(`${BASE_URL}/tasks/${taskId}/complete`, data)
  return response.data
}

/**
 * Get task timeline for a section
 * @param {string} orderItemId - The order item ID
 * @param {string} section - Section name
 * @returns {Promise} Timeline with all tasks and their status
 */
export const getSectionTimeline = async (orderItemId, section) => {
  const response = await httpClient.get(
    `${BASE_URL}/order-item/${orderItemId}/section/${section}/timeline`
  )
  return response.data
}

// ============================================================================
// SECTION COMPLETION
// ============================================================================

/**
 * Send section to QA (move from PRODUCTION_COMPLETED to QA_PENDING)
 * @param {string} orderItemId - The order item ID
 * @param {string} section - Section name
 * @param {Object} data - { sentBy: userId }
 * @returns {Promise} Updated section status
 */
export const sendSectionToQA = async (orderItemId, section, data) => {
  const response = await httpClient.post(
    `${BASE_URL}/order-item/${orderItemId}/section/${section}/send-to-qa`,
    data
  )
  return response.data
}

// ============================================================================
// EXPORT
// ============================================================================

export const productionApi = {
  // Round Robin & Assignment
  getRoundRobinState,
  getReadyForAssignment,
  assignProductionHead,

  // Production Head Dashboard
  getMyAssignments,
  getOrderItemDetails,
  getWorkers,

  // Task Management
  createSectionTasks,
  getSectionTasks,
  startSectionProduction,
  updateTask,

  // Worker Tasks
  getWorkerTasks,
  startTask,
  completeTask,
  getSectionTimeline,

  // Section Completion
  sendSectionToQA,
}

export default productionApi
