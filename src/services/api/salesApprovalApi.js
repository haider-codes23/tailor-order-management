/**
 * Sales Approval API Service
 * src/services/api/salesApprovalApi.js
 *
 * Phase 14: QA + Client Approval + Dispatch
 * Handles all API calls related to Sales client approval workflow
 */

import { httpClient } from "@/services/http/httpClient"

const BASE_URL = "/sales"

// ============================================================================
// APPROVAL QUEUE
// ============================================================================

/**
 * Get sections ready for client approval (READY_FOR_CLIENT_APPROVAL status)
 * These are sections where QA has added video links
 * @returns {Promise} List of sections ready to send to client
 */
export const getSectionsReadyForClient = async () => {
  const response = await httpClient.get(`${BASE_URL}/ready-for-client`)
  return response.data
}

/**
 * Get sections awaiting client response (AWAITING_CLIENT_APPROVAL status)
 * These are sections that have been sent to client
 * @returns {Promise} List of sections awaiting client approval
 */
export const getSectionsAwaitingApproval = async () => {
  const response = await httpClient.get(`${BASE_URL}/awaiting-approval`)
  return response.data
}

/**
 * Get sales approval statistics
 * @returns {Promise} Stats: ready to send, awaiting response, approved today
 */
export const getSalesApprovalStats = async () => {
  const response = await httpClient.get(`${BASE_URL}/stats`)
  return response.data
}

// ============================================================================
// ORDER ITEM DETAILS
// ============================================================================

/**
 * Get order item details for client approval view
 * Includes all sections with their status and video links
 * @param {string} orderItemId - The order item ID
 * @returns {Promise} Order item with sections and approval status
 */
export const getOrderItemApprovalDetails = async (orderItemId) => {
  const response = await httpClient.get(`${BASE_URL}/order-item/${orderItemId}`)
  return response.data
}

// ============================================================================
// SECTION ACTIONS
// ============================================================================

/**
 * Send section to client for approval
 * Moves section from READY_FOR_CLIENT_APPROVAL to AWAITING_CLIENT_APPROVAL
 *
 * @param {string} orderItemId - The order item ID
 * @param {string} sectionName - Section name
 * @param {Object} data - { sentBy: userId }
 * @returns {Promise} Updated section status
 */
export const sendSectionToClient = async (orderItemId, sectionName, data) => {
  const response = await httpClient.post(
    `${BASE_URL}/order-item/${orderItemId}/section/${sectionName}/send-to-client`,
    data
  )
  return response.data
}

/**
 * Mark section as approved by client
 * Moves section from AWAITING_CLIENT_APPROVAL to CLIENT_APPROVED
 *
 * @param {string} orderItemId - The order item ID
 * @param {string} sectionName - Section name
 * @param {Object} data - { approvedBy: userId, clientNotes?: string }
 * @returns {Promise} Updated section status + order item status if all approved
 */
export const markSectionClientApproved = async (orderItemId, sectionName, data) => {
  const response = await httpClient.post(
    `${BASE_URL}/order-item/${orderItemId}/section/${sectionName}/client-approved`,
    data
  )
  return response.data
}

// ============================================================================
// BULK ACTIONS
// ============================================================================

/**
 * Send all ready sections of an order item to client
 * @param {string} orderItemId - The order item ID
 * @param {Object} data - { sentBy: userId }
 * @returns {Promise} Updated sections
 */
export const sendAllSectionsToClient = async (orderItemId, data) => {
  const response = await httpClient.post(
    `${BASE_URL}/order-item/${orderItemId}/send-all-to-client`,
    data
  )
  return response.data
}

/**
 * Mark all awaiting sections as approved by client
 * @param {string} orderItemId - The order item ID
 * @param {Object} data - { approvedBy: userId, clientNotes?: string }
 * @returns {Promise} Updated sections + order item status
 */
export const approveAllSections = async (orderItemId, data) => {
  const response = await httpClient.post(`${BASE_URL}/order-item/${orderItemId}/approve-all`, data)
  return response.data
}

// ============================================================================
// EXPORT
// ============================================================================

export const salesApprovalApi = {
  // Queue
  getSectionsReadyForClient,
  getSectionsAwaitingApproval,
  getSalesApprovalStats,

  // Order Item Details
  getOrderItemApprovalDetails,

  // Section Actions
  sendSectionToClient,
  markSectionClientApproved,

  // Bulk Actions
  sendAllSectionsToClient,
  approveAllSections,
}

export default salesApprovalApi
