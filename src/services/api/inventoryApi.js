import { httpClient } from "@/services/http/httpClient"

/**
 * Inventory API Service
 *
 * This module provides pure functions for all inventory-related HTTP operations.
 * These functions are framework-agnostic and can be used anywhere in your application,
 * not just in React components. They could work in Node.js scripts, test files,
 * or any JavaScript environment.
 *
 * Design Philosophy:
 * - Each function does ONE thing and does it well
 * - Functions are pure: same inputs always produce same outputs (async)
 * - No side effects beyond HTTP requests
 * - No React dependencies (no hooks, no components, no JSX)
 * - Clear, descriptive names that indicate what HTTP verb and resource they operate on
 *
 * The beauty of this approach is that when you eventually connect to a real backend,
 * you only change the base URL in your httpClient configuration. These functions
 * continue working identically because they just make HTTP requests - they don't
 * care whether MSW or a real Laravel server responds.
 */

/**
 * Get a list of inventory items with optional filtering
 *
 * This function demonstrates how we handle complex query parameters in a clean way.
 * Rather than building query strings manually, we accept an options object and let
 * the httpClient handle the serialization. This makes the function easy to call
 * and easy to test.
 *
 * @param {Object} options - Filtering and search options
 * @param {string} options.category - Filter by category (FABRIC, MULTI_HEAD, etc.)
 * @param {string} options.search - Search term for name or SKU
 * @param {boolean} options.low_stock - If true, return only low stock items
 * @returns {Promise<Array>} Array of inventory items
 *
 * Example usage:
 *   const fabrics = await getInventoryItems({ category: 'FABRIC' })
 *   const searchResults = await getInventoryItems({ search: 'silk' })
 *   const lowStock = await getInventoryItems({ low_stock: true })
 */
export async function getInventoryItems(options = {}) {
  // The httpClient automatically converts the options object into query parameters
  // So { category: 'FABRIC', search: 'silk' } becomes ?category=FABRIC&search=silk
  const response = await httpClient.get("/inventory", { params: options })
  return response
}

/**
 * Get detailed information about a single inventory item
 *
 * This is a simple fetch operation but it demonstrates an important pattern:
 * we accept the item ID as a parameter and interpolate it into the URL path.
 * This is cleaner than making the caller build the URL themselves.
 *
 * The function returns the complete item including all variant information
 * for ready stock items, so the caller gets everything they need in one request.
 *
 * @param {number} itemId - The ID of the inventory item to fetch
 * @returns {Promise<Object>} Complete inventory item with variants if applicable
 *
 * Example usage:
 *   const goldessItem = await getInventoryItem(43)
 *   console.log(goldessItem.variants) // Array of size variants
 */
export async function getInventoryItem(itemId) {
  const response = await httpClient.get(`/inventory/${itemId}`)
  return response
}

/**
 * Create a new inventory item
 *
 * This function handles the complexity of creating both simple items (fabrics)
 * and variant items (ready stock). The caller needs to provide the appropriate
 * structure based on the category they're creating, and the backend validation
 * will ensure everything is correct.
 *
 * For simple items, you provide:
 * - Basic info (name, SKU, category, unit, price)
 * - Stock info (remaining_stock, reorder_level)
 *
 * For variant items (READY_STOCK/READY_SAMPLE), you provide:
 * - Basic info (name, SKU, category, unit, base_price)
 * - Variants array with size-specific info for each variant
 *
 * @param {Object} itemData - Complete data for the new inventory item
 * @returns {Promise<Object>} The created item with generated ID and timestamps
 *
 * Example usage for a fabric:
 *   const newFabric = await createInventoryItem({
 *     name: "Premium Velvet",
 *     sku: "FAB-VELVET-001",
 *     category: "FABRIC",
 *     unit: "Yard",
 *     unit_price: 1200,
 *     remaining_stock: 50,
 *     reorder_level: 20,
 *     image_url: "/images/fabrics/velvet.jpg"
 *   })
 *
 * Example usage for ready stock:
 *   const newReadyStock = await createInventoryItem({
 *     name: "EMERALD DREAM",
 *     sku: "RS-EMERALD-050",
 *     category: "READY_STOCK",
 *     unit: "Piece",
 *     base_price: 38000,
 *     has_variants: true,
 *     variants: [
 *       { size: "S", remaining_stock: 2, reorder_level: 1, price: 38000 },
 *       { size: "M", remaining_stock: 3, reorder_level: 1, price: 38000 },
 *       { size: "L", remaining_stock: 2, reorder_level: 1, price: 38000 },
 *     ],
 *     image_url: "/images/products/emerald-dream.jpg"
 *   })
 */
export async function createInventoryItem(itemData) {
  const response = await httpClient.post("/inventory", itemData)
  return response
}

/**
 * Update an existing inventory item
 *
 * This function allows you to update any field of an inventory item except
 * the ID and creation timestamp. You can do partial updates - only include
 * the fields you want to change. The backend will merge your changes with
 * the existing data.
 *
 * A common use case is updating stock levels, vendor information, or pricing
 * as your business operations evolve. You might also update the image_url
 * when you get better product photography.
 *
 * @param {number} itemId - ID of the item to update
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<Object>} The updated item
 *
 * Example usage to update vendor:
 *   await updateInventoryItem(5, {
 *     vendor_name: "New Silk Supplier Ltd",
 *     vendor_contact: "+92-300-9998888",
 *     notes: "Changed vendor due to better pricing"
 *   })
 *
 * Example usage to update a variant's stock (for ready stock items):
 *   await updateInventoryItem(43, {
 *     variants: [
 *       { variant_id: 1, size: "S", remaining_stock: 5, reorder_level: 1 },
 *       { variant_id: 2, size: "M", remaining_stock: 3, reorder_level: 1 },
 *     ]
 *   })
 */
export async function updateInventoryItem(itemId, updates) {
  const response = await httpClient.put(`/inventory/${itemId}`, updates)
  return response
}

/**
 * Record a stock-in transaction (materials received from vendor)
 *
 * This function is more complex because it needs to handle both simple items
 * and variant items differently. For simple items like fabrics, you just specify
 * the quantity received. For variant items like ready stock, you must also specify
 * which size variant you're adding stock to.
 *
 * The function creates two important effects:
 * 1. It increases the stock quantity for the item (or specific variant)
 * 2. It creates a permanent audit trail record in the stock movements table
 *
 * This audit trail is crucial for business operations. If there's ever a dispute
 * with a vendor about how much material was delivered, or if you need to trace
 * quality issues back to a specific batch, the movement records provide that history.
 *
 * @param {number} itemId - ID of the inventory item
 * @param {Object} stockData - Details about the stock-in transaction
 * @param {number} stockData.quantity - Amount received (in item's unit)
 * @param {number} stockData.variant_id - Required for variant items, specifies which size
 * @param {string} stockData.reference_number - Optional, PO or invoice number
 * @param {string} stockData.notes - Optional, any notes about this shipment
 * @returns {Promise<Object>} Result with updated item and movement record
 *
 * Example usage for fabric (simple item):
 *   await recordStockIn(1, {
 *     quantity: 50,
 *     reference_number: "PO-2024-0089",
 *     notes: "Received 50 yards of Tissue Silk, Invoice #SH-5678"
 *   })
 *
 * Example usage for ready stock (variant item):
 *   await recordStockIn(43, {
 *     quantity: 3,
 *     variant_id: 2, // Size M
 *     reference_number: "PROD-COMPLETE-120",
 *     notes: "Completed production of GOLDESS size M, moved to ready stock"
 *   })
 */
export async function recordStockIn(itemId, stockData) {
  const response = await httpClient.post(`/inventory/${itemId}/stock-in`, stockData)
  return response
}

/**
 * Get all items that are below their reorder threshold
 *
 * This function returns a prioritized list of items that need to be reordered.
 * The backend calculates an urgency score for each low stock item, so the most
 * critical items appear first in the list. This helps your purchaser know what
 * to order first when they have limited budget or vendor capacity.
 *
 * For variant items (ready stock), if ANY size is low, the entire item appears
 * in the results with details about which specific sizes need restocking.
 *
 * @returns {Promise<Array>} Array of low stock items sorted by urgency
 *
 * Example usage:
 *   const criticalItems = await getLowStockItems()
 *   criticalItems.forEach(item => {
 *     console.log(`${item.name}: ${item.urgency_score}% below threshold`)
 *     if (item.critical_variants) {
 *       console.log(`  Critical sizes: ${item.critical_variants.map(v => v.size).join(', ')}`)
 *     }
 *   })
 */
export async function getLowStockItems() {
  const response = await httpClient.get("/inventory/low-stock")
  return response
}

/**
 * Get stock movement history for an inventory item
 *
 * This function retrieves the complete transaction history for an item, showing
 * every stock-in, stock-out, and adjustment that has occurred. The movements are
 * sorted by date with most recent first, so you can see the current state and
 * trace back through time.
 *
 * This is essential for troubleshooting inventory discrepancies, understanding
 * consumption patterns, and maintaining accountability. Each movement record
 * includes who performed it, when it happened, how much was involved, and any
 * notes they added.
 *
 * @param {number} itemId - ID of the inventory item
 * @returns {Promise<Object>} Object containing item info and movements array
 *
 * Example usage:
 *   const history = await getStockMovements(13) // Champagne Karti
 *   console.log(`Total transactions: ${history.movements.length}`)
 *   history.movements.forEach(movement => {
 *     console.log(`${movement.transaction_date}: ${movement.movement_type} ${movement.quantity}g`)
 *   })
 */
export async function getStockMovements(itemId) {
  const response = await httpClient.get(`/inventory/${itemId}/movements`)
  return response
}

/**
 * Delete an inventory item
 *
 * This function removes an item from inventory entirely. In a real system, you
 * would typically want to prevent deletion if the item has any transaction history
 * or is referenced in BOMs or orders. Instead, you might mark it as inactive.
 *
 * The backend validation prevents deletion of items with history, ensuring you
 * never lose audit trail information.
 *
 * @param {number} itemId - ID of the item to delete
 * @returns {Promise<Object>} The deleted item data
 *
 * Example usage:
 *   await deleteInventoryItem(99)
 *
 * Note: This will fail if the item has any transaction history. Consider adding
 * an 'is_active' field and doing soft deletes instead for production use.
 */
export async function deleteInventoryItem(itemId) {
  const response = await httpClient.delete(`/inventory/${itemId}`)
  return response
}

/**
 * Check stock availability for a specific item and quantity
 *
 * This is a utility function that's useful for order processing. Before accepting
 * an order, you want to verify that sufficient stock exists. For variant items,
 * you need to check the specific size variant requested.
 *
 * This function could be expanded in the future to do bulk availability checks
 * for entire BOMs or order lists.
 *
 * @param {number} itemId - ID of the inventory item
 * @param {number} quantityNeeded - Amount required
 * @param {number} variantId - Optional, for variant items specify which size
 * @returns {Promise<Object>} Object with available flag and stock info
 *
 * Example usage:
 *   const check = await checkStockAvailability(43, 2, 2) // GOLDESS size M, qty 2
 *   if (check.data.available) {
 *     console.log("Can fulfill order")
 *   } else {
 *     console.log(`Only ${check.data.current_stock} available, need ${quantityNeeded}`)
 *   }
 */
export async function checkStockAvailability(itemId, quantityNeeded, variantId = null) {
  // This endpoint doesn't exist yet in our handlers, but shows how you'd extend the API
  // For now, we can implement this client-side by fetching the item and checking stock
  const item = await getInventoryItem(itemId)

  let currentStock = 0
  let available = false

  if (item.data.has_variants && variantId) {
    const variant = item.data.variants.find((v) => v.variant_id === variantId)
    if (variant) {
      currentStock = variant.remaining_stock
      available = currentStock >= quantityNeeded
    }
  } else if (!item.data.has_variants) {
    currentStock = item.data.remaining_stock
    available = currentStock >= quantityNeeded
  }

  return {
    success: true,
    data: {
      available: available,
      current_stock: currentStock,
      quantity_needed: quantityNeeded,
      shortage: available ? 0 : quantityNeeded - currentStock,
    },
  }
}
/**
 * Record a stock-out transaction (materials consumed in production)
 *
 * This function handles recording when materials are consumed, typically
 * in production processes. For variant items, you must specify which size
 * variant is being consumed.
 *
 * The function validates that sufficient stock exists before allowing the
 * deduction. If insufficient stock exists, the API returns an error.
 *
 * @param {number} itemId - The ID of the inventory item
 * @param {Object} stockData - Details about the stock-out transaction
 * @param {number} stockData.quantity - Amount consumed (in item's unit)
 * @param {number} stockData.variant_id - Required for variant items, specifies which size
 * @param {string} stockData.reference_number - Optional, production order reference
 * @param {string} stockData.notes - Optional, notes about consumption
 * @returns {Promise<Object>} Result with updated item and movement record
 *
 * Example usage for fabric (simple item):
 *   await recordStockOut(1, {
 *     quantity: 2.5,
 *     reference_number: "PROD-ORDER-089",
 *     notes: "Used in GOLDESS production batch, cutting for 3 shirts"
 *   })
 *
 * Example usage for ready stock (variant item):
 *   await recordStockOut(43, {
 *     quantity: 1,
 *     variant_id: 2, // Size M
 *     reference_number: "SALE-ORDER-156",
 *     notes: "Sold to customer via website order"
 *   })
 */
export async function recordStockOut(itemId, stockData) {
  const response = await httpClient.post(`/inventory/${itemId}/stock-out`, stockData)
  return response
}

/**
 * Barrel export for convenient importing
 *
 * This allows other parts of your app to import multiple functions at once:
 * import { getInventoryItems, recordStockIn } from '@/services/api/inventoryApi'
 *
 * Or to import the entire module as a namespace:
 * import * as inventoryApi from '@/services/api/inventoryApi'
 * Then use: inventoryApi.getInventoryItems()
 */
export const inventoryApi = {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  recordStockIn,
  recordStockOut,
  getLowStockItems,
  getStockMovements,
  deleteInventoryItem,
  checkStockAvailability,
}
