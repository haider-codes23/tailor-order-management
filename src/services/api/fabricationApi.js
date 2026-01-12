/**
 * Fabrication API Service
 * Handles all API calls related to the Fabrication module
 */

import { httpClient } from "@/services/http/httpClient"

const BASE_URL = "/api/fabrication"

/**
 * Get all orders that have items needing custom BOM (FABRICATION_BESPOKE status)
 */
export const getFabricationOrders = async () => {
  const response = await httpClient.get(`${BASE_URL}/orders`)
  return response.data
}

/**
 * Get a specific order with its custom size items for fabrication
 */
export const getFabricationOrder = async (orderId) => {
  const response = await httpClient.get(`${BASE_URL}/orders/${orderId}`)
  return response.data
}

/**
 * Get a specific order item with full details for fabrication
 */
export const getFabricationItem = async (orderId, itemId) => {
  const response = await httpClient.get(`${BASE_URL}/orders/${orderId}/items/${itemId}`)
  return response.data
}

/**
 * Create a custom BOM for an order item
 */
export const createCustomBOM = async (itemId, bomData) => {
  const response = await httpClient.post(`${BASE_URL}/items/${itemId}/custom-bom`, bomData)
  return response.data
}

/**
 * Update a custom BOM for an order item
 */
export const updateCustomBOM = async (itemId, bomData) => {
  const response = await httpClient.put(`${BASE_URL}/items/${itemId}/custom-bom`, bomData)
  return response.data
}

/**
 * Add a BOM item to a custom BOM section
 */
export const addCustomBOMItem = async (itemId, piece, bomItemData) => {
  const response = await httpClient.post(
    `${BASE_URL}/items/${itemId}/custom-bom/pieces/${piece}/items`,
    bomItemData
  )
  return response.data
}

/**
 * Update a BOM item in a custom BOM section
 */
export const updateCustomBOMItem = async (itemId, piece, bomItemId, bomItemData) => {
  const response = await httpClient.put(
    `${BASE_URL}/items/${itemId}/custom-bom/pieces/${piece}/items/${bomItemId}`,
    bomItemData
  )
  return response.data
}

/**
 * Delete a BOM item from a custom BOM section
 */
export const deleteCustomBOMItem = async (itemId, piece, bomItemId) => {
  const response = await httpClient.delete(
    `${BASE_URL}/items/${itemId}/custom-bom/pieces/${piece}/items/${bomItemId}`
  )
  return response.data
}

/**
 * Submit custom BOM and transition order item to INVENTORY_CHECK
 */
export const submitCustomBOM = async (itemId, submittedBy) => {
  const response = await httpClient.post(`${BASE_URL}/items/${itemId}/custom-bom/submit`, {
    submittedBy,
  })
  return response.data
}

export const fabricationApi = {
  getFabricationOrders,
  getFabricationOrder,
  getFabricationItem,
  createCustomBOM,
  updateCustomBOM,
  addCustomBOMItem,
  updateCustomBOMItem,
  deleteCustomBOMItem,
  submitCustomBOM,
}
