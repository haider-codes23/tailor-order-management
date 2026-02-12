/**
 * Sales Approval API Service - Phase 14 Redesign
 * src/services/api/salesApprovalApi.js
 *
 * Complete rewrite for new ORDER-LEVEL sales workflow:
 * - 3-tab dashboard: Ready for Client | Awaiting Response | Payment Verification
 * - Client approval with screenshot proof
 * - Re-video requests (→ QA)
 * - Alteration requests (→ Production)
 * - Start from scratch (→ Inventory Check)
 * - Order cancellation
 * - Payment verification before dispatch
 *
 * Response unwrapping: httpClient returns response.json() directly.
 * MSW handlers return { success: true, data: {...} }.
 * API services unwrap via `return response.data`.
 */

import { httpClient } from "@/services/http/httpClient"

const BASE_URL = "/sales"

// ============================================================================
// APPROVAL QUEUES (3 Tabs)
// ============================================================================

/**
 * Get orders ready to send to client (Tab 1)
 * Orders in READY_FOR_CLIENT_APPROVAL status — all order items have videos uploaded
 * @returns {Promise} List of orders with their order items and video URLs
 */
export const getApprovalQueue = async () => {
  const response = await httpClient.get(`${BASE_URL}/approval-queue`)
  return response.data
}

/**
 * Get orders awaiting client response (Tab 2)
 * Orders in AWAITING_CLIENT_APPROVAL status — sent to client, waiting for feedback
 * @returns {Promise} List of orders with sent timestamps and video URLs
 */
export const getAwaitingResponse = async () => {
  const response = await httpClient.get(`${BASE_URL}/awaiting-response`)
  return response.data
}

/**
 * Get orders awaiting payment verification (Tab 3)
 * Orders in AWAITING_ACCOUNT_APPROVAL status — client approved, checking payments
 * @returns {Promise} List of orders with payment history and approval screenshots
 */
export const getAwaitingPayment = async () => {
  const response = await httpClient.get(`${BASE_URL}/awaiting-payment`)
  return response.data
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

/**
 * Get sales dashboard statistics
 * @returns {Promise} Stats: readyToSend, awaitingResponse, awaitingPayment
 */
export const getSalesStats = async () => {
  const response = await httpClient.get(`${BASE_URL}/stats`)
  return response.data
}

// ============================================================================
// ORDER DETAILS
// ============================================================================

/**
 * Get order details for sales approval view
 * Includes all order items with videos, payment history, client approval data
 * @param {string} orderId - The order ID
 * @returns {Promise} Full order data with items, payments, approval screenshots
 */
export const getOrderDetails = async (orderId) => {
  const response = await httpClient.get(`${BASE_URL}/order/${orderId}`)
  return response.data
}

// ============================================================================
// ORDER-LEVEL ACTIONS
// ============================================================================

/**
 * Send order to client for approval
 * Moves order from READY_FOR_CLIENT_APPROVAL → AWAITING_CLIENT_APPROVAL
 * All order item videos become visible to the client
 *
 * @param {string} orderId - The order ID
 * @param {Object} data - { sentBy: userId }
 * @returns {Promise} Updated order with new status and sentToClientAt timestamp
 */
export const sendOrderToClient = async (orderId, data) => {
  const response = await httpClient.post(`${BASE_URL}/order/${orderId}/send-to-client`, data)
  return response.data
}

/**
 * Mark order as approved by client
 * Requires screenshot proof of client's approval message
 * Moves order from AWAITING_CLIENT_APPROVAL → AWAITING_ACCOUNT_APPROVAL
 *
 * @param {string} orderId - The order ID
 * @param {Object} data - {
 *   screenshots: [{ name: string, dataUrl: string }],  // Min 1, Max 10
 *   notes: string (optional),
 *   approvedBy: userId
 * }
 * @returns {Promise} Updated order with clientApprovalData
 */
export const markClientApproved = async (orderId, data) => {
  const response = await httpClient.post(`${BASE_URL}/order/${orderId}/client-approved`, data)
  return response.data
}

/**
 * Request a new video from QA
 * Client wants to see certain sections highlighted differently
 * Order stays in AWAITING_CLIENT_APPROVAL; order item gets reVideoRequest data
 * Order item appears in QA Dashboard Tab 2 (Sales Requests)
 *
 * @param {string} orderId - The order ID
 * @param {Object} data - {
 *   orderItemId: string,
 *   sections: [{ name: string, notes: string }],
 *   requestedBy: userId
 * }
 * @returns {Promise} Updated order item with reVideoRequest
 */
export const requestReVideo = async (orderId, data) => {
  const response = await httpClient.post(`${BASE_URL}/order/${orderId}/request-revideo`, data)
  return response.data
}

/**
 * Request alteration for specific sections
 * Client wants physical changes — sections go back to Production Head
 * Selected sections → PRODUCTION_COMPLETED (ready for rework)
 * Order item → ALTERATION_REQUIRED
 *
 * @param {string} orderId - The order ID
 * @param {Object} data - {
 *   sections: [{ orderItemId: string, sectionName: string, notes: string }],
 *   requestedBy: userId
 * }
 * @returns {Promise} Updated order with alteration data
 */
export const requestAlteration = async (orderId, data) => {
  const response = await httpClient.post(`${BASE_URL}/order/${orderId}/request-alteration`, data)
  return response.data
}

/**
 * Cancel order — client rejected
 * Moves order to CANCELLED_BY_CLIENT status
 *
 * @param {string} orderId - The order ID
 * @param {Object} data - { reason: string, cancelledBy: userId }
 * @returns {Promise} Updated order with cancellationData
 */
export const cancelOrder = async (orderId, data) => {
  const response = await httpClient.post(`${BASE_URL}/order/${orderId}/client-rejected`, data)
  return response.data
}

/**
 * Start order from scratch
 * Resets order to INVENTORY_CHECK — full production cycle restarts
 * All order items → INVENTORY_CHECK, all sections → PENDING_INVENTORY_CHECK
 *
 * @param {string} orderId - The order ID
 * @param {Object} data - { confirmedBy: userId, reason: string }
 * @returns {Promise} Updated order reset to inventory check
 */
export const startFromScratch = async (orderId, data) => {
  const response = await httpClient.post(`${BASE_URL}/order/${orderId}/start-from-scratch`, data)
  return response.data
}

/**
 * Verify payments and approve for dispatch
 * Moves order from AWAITING_ACCOUNT_APPROVAL → READY_FOR_DISPATCH
 * Button should be disabled in UI if totalPaid < orderTotal
 *
 * @param {string} orderId - The order ID
 * @param {Object} data - { approvedBy: userId }
 * @returns {Promise} Updated order ready for dispatch
 */
export const approvePayments = async (orderId, data) => {
  const response = await httpClient.post(`${BASE_URL}/order/${orderId}/approve-payments`, data)
  return response.data
}

// ============================================================================
// EXPORT
// ============================================================================

export const salesApprovalApi = {
  // Queues (3 tabs)
  getApprovalQueue,
  getAwaitingResponse,
  getAwaitingPayment,

  // Stats
  getSalesStats,

  // Order Details
  getOrderDetails,

  // Order-Level Actions
  sendOrderToClient,
  markClientApproved,
  requestReVideo,
  requestAlteration,
  cancelOrder,
  startFromScratch,
  approvePayments,
}

export default salesApprovalApi
