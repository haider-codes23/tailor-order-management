/**
 * Shopify API Service — Phase 15
 * src/services/api/shopifyApi.js
 *
 * Handles all API calls for the Shopify integration module.
 * Pattern: httpClient returns full response, we unwrap with response.data
 */

import { httpClient } from "@/services/http/httpClient"

const BASE_URL = "/shopify"

// ============================================================================
// SETTINGS & CONNECTION (Admin only)
// ============================================================================

/**
 * Get Shopify integration settings & status
 * @returns {Promise<Object>} Settings with config status, webhook state, sync stats
 */
export const getSettings = async () => {
  const response = await httpClient.get(`${BASE_URL}/settings`)
  return response.data
}

/**
 * Test Shopify API connection
 * @returns {Promise<Object>} Shop info if successful
 */
export const testConnection = async () => {
  const response = await httpClient.post(`${BASE_URL}/test-connection`)
  return response.data
}

/**
 * Register webhooks with Shopify
 * @param {string} baseUrl - Backend public URL (e.g., ngrok URL)
 * @returns {Promise<Object>} Registration results
 */
export const registerWebhooks = async (baseUrl) => {
  const response = await httpClient.post(`${BASE_URL}/webhooks/register`, { baseUrl })
  return response.data
}

/**
 * Sync products from Shopify store into internal system
 * @returns {Promise<Object>} Sync summary (created, linked, skipped)
 */
export const syncProducts = async () => {
  const response = await httpClient.post(`${BASE_URL}/sync-products`)
  return response.data
}

// ============================================================================
// SHOPIFY ORDERS (View & Import)
// ============================================================================

/**
 * List orders from Shopify store (proxy via backend)
 * @param {Object} [params] - Query filters
 * @param {number} [params.limit] - Number of orders (default 50)
 * @param {string} [params.status] - Shopify order status filter
 * @param {string} [params.financial_status] - paid, pending, etc.
 * @param {string} [params.fulfillment_status] - fulfilled, unfulfilled, etc.
 * @returns {Promise<Object>} { orders: [...], count: N }
 */
export const listShopifyOrders = async (params = {}) => {
  const response = await httpClient.get(`${BASE_URL}/orders`, { params })
  return response.data
}

/**
 * Import a Shopify order into the internal system
 * @param {string} shopifyOrderId - The Shopify order ID
 * @returns {Promise<Object>} { order, readyStockResult }
 */
export const importShopifyOrder = async (shopifyOrderId) => {
  const response = await httpClient.post(`${BASE_URL}/orders/${shopifyOrderId}/import`)
  return response.data
}

// ============================================================================
// OUTBOUND SYNC (Phase 15 — new)
// ============================================================================

/**
 * Sync a manual internal order to Shopify (creates draft order → real order)
 * @param {string} orderId - Internal order UUID
 * @returns {Promise<Object>} { shopifyOrderId, shopifyOrderNumber, syncStatus, ... }
 */
export const syncOrderToShopify = async (orderId) => {
  const response = await httpClient.post(`${BASE_URL}/orders/${orderId}/sync-to-shopify`)
  return response.data
}

/**
 * Sync fulfillment/tracking info to Shopify after dispatch
 * @param {string} orderId - Internal order UUID
 * @returns {Promise<Object>} { success, fulfillmentId, courier, trackingNumber, ... }
 */
export const syncFulfillmentToShopify = async (orderId) => {
  const response = await httpClient.post(`${BASE_URL}/orders/${orderId}/sync-fulfillment`)
  return response.data
}

// ============================================================================
// EXPORT
// ============================================================================

export const shopifyApi = {
  getSettings,
  testConnection,
  registerWebhooks,
  syncProducts,
  listShopifyOrders,
  importShopifyOrder,
  syncOrderToShopify,
  syncFulfillmentToShopify,
}

export default shopifyApi