import { httpClient } from "@/services/http/httpClient"

/**
 * Products API Service - WITH SIZE SUPPORT
 *
 * Updated to support size-based BOMs where each product size (XS, S, M, L, XL, XXL, CUSTOM)
 * has its own independent BOMs and version history.
 */

// ==================== PRODUCTS ====================

/**
 * Get all products with optional filters
 */
export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams()

  if (filters.search) params.append("search", filters.search)
  if (filters.category) params.append("category", filters.category)
  if (filters.active !== undefined) params.append("active", filters.active.toString())

  const queryString = params.toString()
  const url = queryString ? `/products?${queryString}` : "/products"

  const response = await httpClient.get(url)
  return response
}

/**
 * Get a single product by ID
 */
export const getProduct = async (productId) => {
  const response = await httpClient.get(`/products/${productId}`)
  return response
}

/**
 * Create a new product
 */
export const createProduct = async (productData) => {
  const response = await httpClient.post("/products", productData)
  return response
}

/**
 * Update an existing product
 */
export const updateProduct = async (productId, updates) => {
  const response = await httpClient.put(`/products/${productId}`, updates)
  return response
}

/**
 * Delete a product
 */
export const deleteProduct = async (productId) => {
  const response = await httpClient.delete(`/products/${productId}`)
  return response
}

// ==================== BOMs (SIZE-BASED) ====================

/**
 * Get all BOMs for a product, optionally filtered by size
 * 
 * @param {string} productId - Product ID
 * @param {string} [size] - Optional size filter (XS, S, M, L, XL, XXL, CUSTOM)
 * @returns {Promise} Response with BOMs array and available_sizes
 * 
 * Examples:
 * - getProductBOMs("prod_1") → All BOMs for product (all sizes)
 * - getProductBOMs("prod_1", "M") → Only Size M BOMs
 */
export const getProductBOMs = async (productId, size = null) => {
  let url = `/products/${productId}/boms`
  
  if (size) {
    url += `?size=${size}`
  }
  
  const response = await httpClient.get(url)
  return response
}

/**
 * Get active BOM(s) for a product
 * 
 * NEW BEHAVIOR:
 * - If size is provided: Returns single active BOM for that size
 * - If size is NOT provided: Returns all active BOMs (one per size)
 * 
 * @param {string} productId - Product ID
 * @param {string} [size] - Optional size (XS, S, M, L, XL, XXL, CUSTOM)
 * @returns {Promise} Active BOM(s) with items
 * 
 * Examples:
 * - getActiveBOM("prod_1", "M") → Active BOM for Size M only
 * - getActiveBOM("prod_1") → All active BOMs (array)
 */
export const getActiveBOM = async (productId, size = null) => {
  let url = `/products/${productId}/boms/active`
  
  if (size) {
    url += `?size=${size}`
  }
  
  const response = await httpClient.get(url)
  return response
}

/**
 * Get a specific BOM by ID (with items)
 */
export const getBOM = async (bomId) => {
  const response = await httpClient.get(`/boms/${bomId}`)
  return response
}

/**
 * Create a new BOM for a product
 * 
 * NEW REQUIREMENT: bomData must include `size` field
 * 
 * @param {string} productId - Product ID
 * @param {Object} bomData - BOM data
 * @param {string} bomData.size - REQUIRED: Size code (XS, S, M, L, XL, XXL, CUSTOM)
 * @param {string} [bomData.name] - Optional: Auto-generated if not provided
 * @param {boolean} [bomData.is_active] - Optional: Default false
 * @param {string} [bomData.notes] - Optional: Notes
 * 
 * Example:
 * createBOM("prod_1", {
 *   size: "M",
 *   notes: "Medium size BOM",
 *   is_active: true
 * })
 * // Creates: "Size M - Version 1"
 */
export const createBOM = async (productId, bomData) => {
  const response = await httpClient.post(`/products/${productId}/boms`, bomData)
  return response
}

/**
 * Update a BOM
 * 
 * NOTE: Cannot change `size` or `version` after creation
 * Activating a BOM will deactivate other BOMs for the SAME product+size only
 */
export const updateBOM = async (bomId, updates) => {
  const response = await httpClient.put(`/boms/${bomId}`, updates)
  return response
}

/**
 * Delete a BOM (must be inactive)
 */
export const deleteBOM = async (bomId) => {
  const response = await httpClient.delete(`/boms/${bomId}`)
  return response
}

// ==================== BOM ITEMS ====================

/**
 * Get all items for a BOM
 */
export const getBOMItems = async (bomId) => {
  const response = await httpClient.get(`/boms/${bomId}/items`)
  return response
}

/**
 * Add an item to a BOM
 */
export const createBOMItem = async (bomId, itemData) => {
  const response = await httpClient.post(`/boms/${bomId}/items`, itemData)
  return response
}

/**
 * Update a BOM item
 */
export const updateBOMItem = async (bomId, itemId, updates) => {
  const response = await httpClient.put(`/boms/${bomId}/items/${itemId}`, updates)
  return response
}

/**
 * Delete a BOM item
 */
export const deleteBOMItem = async (bomId, itemId) => {
  const response = await httpClient.delete(`/boms/${bomId}/items/${itemId}`)
  return response
}