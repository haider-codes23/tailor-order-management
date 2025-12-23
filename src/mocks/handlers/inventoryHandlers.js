import { http, HttpResponse } from "msw"
import { mockInventoryItems, mockStockMovements } from "../data/mockInventory"

/**
 * Inventory MSW Handlers
 *
 * These handlers simulate a complete inventory management backend with support for:
 * - Simple items (fabrics, ADA materials) with single stock quantities
 * - Variant items (ready stock) with multiple sizes each having separate stock
 * - Stock movements and transaction history
 * - Low stock alerts based on reorder thresholds
 *
 * The handlers are designed to mirror what a real Laravel/PostgreSQL backend would do,
 * but they run entirely in the browser during development using MSW.
 */

/**
 * Helper function to calculate total stock for variant items
 * For items with variants, we sum up the stock across all sizes
 * For simple items, we just return the remaining_stock value
 */
function calculateTotalStock(item) {
  if (item.has_variants && item.variants) {
    return item.variants.reduce((total, variant) => total + variant.remaining_stock, 0)
  }
  return item.remaining_stock
}

/**
 * Helper function to check if an item is low stock
 * For variant items, we check if ANY variant is below its reorder level
 * For simple items, we check if the total stock is below reorder level
 */
function isLowStock(item) {
  if (item.has_variants && item.variants) {
    return item.variants.some((variant) => variant.remaining_stock < variant.reorder_level)
  }
  return item.remaining_stock < item.reorder_level
}

/**
 * GET /inventory
 *
 * List all inventory items with optional filtering and search
 *
 * Query parameters:
 * - category: Filter by category (FABRIC, MULTI_HEAD, ADA_MATERIAL, etc.)
 * - search: Search by name or SKU (case-insensitive partial match)
 * - low_stock: If "true", return only items below reorder level
 *
 * Returns array of inventory items sorted by name
 */
export const getInventoryList = http.get("/api/inventory", async ({ request }) => {
  console.log("[MSW] GET /api/inventory HIT:", request.url)
  // Simulate network delay for realistic development experience
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Parse query parameters from the URL
  const url = new URL(request.url)
  const categoryRaw = url.searchParams.get("category")
  const category = categoryRaw?.trim()
  const search = url.searchParams.get("search")
  const lowStockFilter = url.searchParams.get("low_stock") === "true"

  // Start with all items and progressively filter
  let filteredItems = [...mockInventoryItems]

  // Filter by category if specified
  // if (category) {
  //   filteredItems = filteredItems.filter((item) => item.category === category)
  // }

  if (category && category.toLowerCase() !== "all") {
    filteredItems = filteredItems.filter((item) => item.category === category)
  }

  // Filter by search term if specified
  // We search across name and SKU fields
  if (search && search.trim() !== "") {
    const searchLower = search.toLowerCase()
    filteredItems = filteredItems.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(searchLower)
      const skuMatch = item.sku.toLowerCase().includes(searchLower)
      return nameMatch || skuMatch
    })
  }

  // Filter by low stock status if requested
  if (lowStockFilter) {
    filteredItems = filteredItems.filter((item) => isLowStock(item))
  }

  // Sort items alphabetically by name for consistent display
  filteredItems.sort((a, b) => a.name.localeCompare(b.name))

  // For each item, add computed fields that the frontend will find useful
  const enrichedItems = filteredItems.map((item) => ({
    ...item,
    total_stock: calculateTotalStock(item),
    is_low_stock: isLowStock(item),
  }))

  return HttpResponse.json({
    success: true,
    data: enrichedItems,
    meta: {
      total: enrichedItems.length,
      filters_applied: {
        category: category || null,
        search: search || null,
        low_stock: lowStockFilter,
      },
    },
  })
})

/**
 * GET /inventory/:id
 *
 * Get detailed information about a single inventory item
 * Includes full variant information for ready stock items
 */
export const getInventoryItem = http.get("/api/inventory/:id", async ({ params }) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const itemId = parseInt(params.id)
  const item = mockInventoryItems.find((i) => i.id === itemId)

  if (!item) {
    return HttpResponse.json(
      {
        success: false,
        error: "Inventory item not found",
        message: `No inventory item exists with ID ${itemId}`,
      },
      { status: 404 }
    )
  }

  // Return item with computed fields
  return HttpResponse.json({
    success: true,
    data: {
      ...item,
      total_stock: calculateTotalStock(item),
      is_low_stock: isLowStock(item),
    },
  })
})

/**
 * POST /inventory
 *
 * Create a new inventory item
 *
 * Request body validation:
 * - name: Required, unique
 * - sku: Required, unique
 * - category: Required, must be valid category
 * - unit: Required
 * - unit_price: Required, positive number
 * - For READY_STOCK/READY_SAMPLE: Must include variants array
 * - For other categories: Must include remaining_stock and reorder_level
 */
export const createInventoryItem = http.post("/api/inventory", async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const data = await request.json()

  // Validation: Check required fields
  if (!data.name || !data.sku || !data.category || !data.unit) {
    return HttpResponse.json(
      {
        success: false,
        error: "Validation failed",
        message: "Missing required fields: name, sku, category, and unit are required",
      },
      { status: 400 }
    )
  }

  // Validation: Check for duplicate SKU
  const duplicateSku = mockInventoryItems.find((item) => item.sku === data.sku)
  if (duplicateSku) {
    return HttpResponse.json(
      {
        success: false,
        error: "Duplicate SKU",
        message: `An item with SKU ${data.sku} already exists`,
      },
      { status: 400 }
    )
  }

  // Validation: Category-specific requirements
  const isReadyStockCategory = data.category === "READY_STOCK" || data.category === "READY_SAMPLE"

  if (
    isReadyStockCategory &&
    (!data.variants || !Array.isArray(data.variants) || data.variants.length === 0)
  ) {
    return HttpResponse.json(
      {
        success: false,
        error: "Validation failed",
        message: "READY_STOCK and READY_SAMPLE items must include at least one size variant",
      },
      { status: 400 }
    )
  }

  if (
    !isReadyStockCategory &&
    (typeof data.remaining_stock !== "number" || typeof data.reorder_level !== "number")
  ) {
    return HttpResponse.json(
      {
        success: false,
        error: "Validation failed",
        message: "Non-variant items must include remaining_stock and reorder_level",
      },
      { status: 400 }
    )
  }

  // Create the new item with generated ID
  const newItem = {
    id: Math.max(...mockInventoryItems.map((i) => i.id)) + 1,
    name: data.name,
    sku: data.sku,
    category: data.category,
    description: data.description || "",
    unit: data.unit,
    unit_price: data.unit_price || 0,
    has_variants: isReadyStockCategory,
    image_url: data.image_url || "/images/inventory/placeholder.jpg",
    vendor_name: data.vendor_name || "",
    vendor_contact: data.vendor_contact || "",
    rack_location: data.rack_location || "",
    notes: data.notes || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Add category-specific fields
  if (isReadyStockCategory) {
    newItem.base_price = data.base_price || 0
    newItem.variants = data.variants.map((variant, index) => ({
      variant_id: index + 1,
      size: variant.size,
      sku: variant.sku || `${data.sku}-${variant.size}`,
      remaining_stock: variant.remaining_stock || 0,
      reorder_level: variant.reorder_level || 1,
      price: variant.price || data.base_price || 0,
      image_url: variant.image_url || data.image_url || "/images/inventory/placeholder.jpg",
    }))
  } else {
    newItem.remaining_stock = data.remaining_stock
    newItem.reorder_level = data.reorder_level
  }

  // Add to mock database
  mockInventoryItems.push(newItem)

  return HttpResponse.json(
    {
      success: true,
      data: newItem,
      message: "Inventory item created successfully",
    },
    { status: 201 }
  )
})

/**
 * PUT /inventory/:id
 *
 * Update an existing inventory item
 * Allows updating all fields except ID and timestamps
 */
export const updateInventoryItem = http.put("/api/inventory/:id", async ({ params, request }) => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const itemId = parseInt(params.id)
  const data = await request.json()

  const itemIndex = mockInventoryItems.findIndex((i) => i.id === itemId)

  if (itemIndex === -1) {
    return HttpResponse.json(
      {
        success: false,
        error: "Not found",
        message: `Inventory item with ID ${itemId} not found`,
      },
      { status: 404 }
    )
  }

  const existingItem = mockInventoryItems[itemIndex]

  // Validation: If SKU is being changed, check for duplicates
  if (data.sku && data.sku !== existingItem.sku) {
    const duplicateSku = mockInventoryItems.find(
      (item) => item.sku === data.sku && item.id !== itemId
    )
    if (duplicateSku) {
      return HttpResponse.json(
        {
          success: false,
          error: "Duplicate SKU",
          message: `An item with SKU ${data.sku} already exists`,
        },
        { status: 400 }
      )
    }
  }

  // Update the item, merging new data with existing data
  const updatedItem = {
    ...existingItem,
    ...data,
    id: itemId, // Ensure ID cannot be changed
    created_at: existingItem.created_at, // Preserve creation date
    updated_at: new Date().toISOString(), // Update modification date
  }

  // Replace in mock database
  mockInventoryItems[itemIndex] = updatedItem

  return HttpResponse.json({
    success: true,
    data: updatedItem,
    message: "Inventory item updated successfully",
  })
})

/**
 * POST /inventory/:id/stock-in
 *
 * Record a stock-in transaction (materials received from vendor)
 *
 * For simple items: Increases remaining_stock
 * For variant items: Increases stock for specified variant_id
 *
 * Request body:
 * - quantity: Required, positive number
 * - variant_id: Required for variant items, specifies which size
 * - reference_number: Optional, PO number or invoice reference
 * - notes: Optional, any additional notes about the transaction
 */
export const recordStockIn = http.post(
  "/api/inventory/:id/stock-in",
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const itemId = parseInt(params.id)
    const data = await request.json()

    const itemIndex = mockInventoryItems.findIndex((i) => i.id === itemId)

    if (itemIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: "Not found",
          message: `Inventory item with ID ${itemId} not found`,
        },
        { status: 404 }
      )
    }

    // Validation: Quantity must be positive
    if (!data.quantity || data.quantity <= 0) {
      return HttpResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: "Quantity must be a positive number",
        },
        { status: 400 }
      )
    }

    const item = mockInventoryItems[itemIndex]
    let newStockLevel = 0

    // Handle variant items (ready stock with sizes)
    if (item.has_variants) {
      // Validation: Must specify which variant
      if (!data.variant_id) {
        return HttpResponse.json(
          {
            success: false,
            error: "Validation failed",
            message: "variant_id is required for items with size variants",
          },
          { status: 400 }
        )
      }

      const variantIndex = item.variants.findIndex((v) => v.variant_id === data.variant_id)

      if (variantIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            error: "Variant not found",
            message: `No variant with ID ${data.variant_id} exists for this item`,
          },
          { status: 404 }
        )
      }

      // Update the specific variant's stock
      item.variants[variantIndex].remaining_stock += data.quantity
      newStockLevel = item.variants[variantIndex].remaining_stock
    } else {
      // Handle simple items (fabrics, ADA materials, etc.)
      item.remaining_stock += data.quantity
      newStockLevel = item.remaining_stock
    }

    // Update the modification timestamp
    item.updated_at = new Date().toISOString()

    // Create a stock movement record for audit trail
    const movement = {
      id: mockStockMovements.length + 1,
      inventory_item_id: itemId,
      variant_id: data.variant_id || null,
      movement_type: "STOCK_IN",
      quantity: data.quantity,
      remaining_stock_after: newStockLevel,
      transaction_date: new Date().toISOString(),
      reference_number: data.reference_number || `AUTO-${Date.now()}`,
      notes: data.notes || "Stock-in transaction",
      performed_by_user_id: 1, // In real system, would be current user ID
      created_at: new Date().toISOString(),
    }

    mockStockMovements.push(movement)

    return HttpResponse.json({
      success: true,
      data: {
        item: item,
        movement: movement,
        new_stock_level: newStockLevel,
      },
      message: `Successfully added ${data.quantity} ${item.unit}${data.quantity > 1 ? "s" : ""} to inventory`,
    })
  }
)

/**
 * GET /inventory/low-stock
 *
 * Get all items that are below their reorder level
 * For variant items, returns the item if ANY variant is low
 *
 * Returns items sorted by how urgently they need reordering
 * (items furthest below threshold appear first)
 */
export const getLowStockItems = http.get("/api/inventory/low-stock", async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Filter for low stock items
  const lowStockItems = mockInventoryItems.filter((item) => isLowStock(item))

  // For each low stock item, calculate how critical the shortage is
  const itemsWithUrgency = lowStockItems.map((item) => {
    let urgencyScore = 0
    let criticalVariants = []

    if (item.has_variants) {
      // For variant items, find which sizes are low
      criticalVariants = item.variants.filter((v) => v.remaining_stock < v.reorder_level)
      // Calculate urgency as percentage below threshold
      urgencyScore = criticalVariants.reduce((score, variant) => {
        const percentageBelow =
          ((variant.reorder_level - variant.remaining_stock) / variant.reorder_level) * 100
        return Math.max(score, percentageBelow)
      }, 0)
    } else {
      // For simple items, calculate how far below threshold
      urgencyScore = ((item.reorder_level - item.remaining_stock) / item.reorder_level) * 100
    }

    return {
      ...item,
      urgency_score: urgencyScore,
      critical_variants: criticalVariants,
      total_stock: calculateTotalStock(item),
    }
  })

  // Sort by urgency - most critical first
  itemsWithUrgency.sort((a, b) => b.urgency_score - a.urgency_score)

  return HttpResponse.json({
    success: true,
    data: itemsWithUrgency,
    meta: {
      total_low_stock_items: itemsWithUrgency.length,
      requires_immediate_attention: itemsWithUrgency.filter((i) => i.urgency_score > 50).length,
    },
  })
})

/**
 * GET /inventory/:id/movements
 *
 * Get stock movement history for a specific inventory item
 * Returns all transactions (stock-in, stock-out, adjustments) sorted by date
 */
export const getStockMovements = http.get("/api/inventory/:id/movements", async ({ params }) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const itemId = parseInt(params.id)

  // Check if item exists
  const item = mockInventoryItems.find((i) => i.id === itemId)
  if (!item) {
    return HttpResponse.json(
      {
        success: false,
        error: "Not found",
        message: `Inventory item with ID ${itemId} not found`,
      },
      { status: 404 }
    )
  }

  // Find all movements for this item
  const movements = mockStockMovements
    .filter((m) => m.inventory_item_id === itemId)
    .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))

  return HttpResponse.json({
    success: true,
    data: {
      item_id: itemId,
      item_name: item.name,
      movements: movements,
    },
    meta: {
      total_movements: movements.length,
    },
  })
})

/**
 * DELETE /inventory/:id
 *
 * Delete an inventory item
 * In a real system, you might want to soft-delete or prevent deletion if item has history
 */
export const deleteInventoryItem = http.delete("/api/inventory/:id", async ({ params }) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const itemId = parseInt(params.id)
  const itemIndex = mockInventoryItems.findIndex((i) => i.id === itemId)

  if (itemIndex === -1) {
    return HttpResponse.json(
      {
        success: false,
        error: "Not found",
        message: `Inventory item with ID ${itemId} not found`,
      },
      { status: 404 }
    )
  }

  // Check if item has any stock movements (indicating it's been used)
  const hasMovements = mockStockMovements.some((m) => m.inventory_item_id === itemId)

  if (hasMovements) {
    return HttpResponse.json(
      {
        success: false,
        error: "Cannot delete",
        message:
          "This item has transaction history and cannot be deleted. Consider marking it inactive instead.",
      },
      { status: 400 }
    )
  }

  // Remove from mock database
  const deletedItem = mockInventoryItems[itemIndex]
  mockInventoryItems.splice(itemIndex, 1)

  return HttpResponse.json({
    success: true,
    data: deletedItem,
    message: "Inventory item deleted successfully",
  })
})

/**
 * POST /inventory/:id/stock-out
 *
 * Record a stock-out transaction (materials consumed in production)
 *
 * For simple items: Decreases remaining_stock
 * For variant items: Decreases stock for specified variant_id
 *
 * Request body:
 * - quantity: Required, positive number
 * - variant_id: Required for variant items
 * - reference_number: Optional, production order reference
 * - notes: Optional, notes about consumption
 */
export const recordStockOut = http.post(
  "/api/inventory/:id/stock-out",
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const itemId = parseInt(params.id)
    const data = await request.json()

    const itemIndex = mockInventoryItems.findIndex((i) => i.id === itemId)

    if (itemIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: "Not found",
          message: `Inventory item with ID ${itemId} not found`,
        },
        { status: 404 }
      )
    }

    // Validation: Quantity must be positive
    if (!data.quantity || data.quantity <= 0) {
      return HttpResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: "Quantity must be a positive number",
        },
        { status: 400 }
      )
    }

    const item = mockInventoryItems[itemIndex]
    let newStockLevel = 0
    let insufficientStock = false

    // Handle variant items (ready stock with sizes)
    if (item.has_variants) {
      if (!data.variant_id) {
        return HttpResponse.json(
          {
            success: false,
            error: "Validation failed",
            message: "variant_id is required for items with size variants",
          },
          { status: 400 }
        )
      }

      const variantIndex = item.variants.findIndex((v) => v.variant_id === data.variant_id)

      if (variantIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            error: "Variant not found",
            message: `No variant with ID ${data.variant_id} exists for this item`,
          },
          { status: 404 }
        )
      }

      // Check if sufficient stock exists
      if (item.variants[variantIndex].remaining_stock < data.quantity) {
        return HttpResponse.json(
          {
            success: false,
            error: "Insufficient stock",
            message: `Only ${item.variants[variantIndex].remaining_stock} ${item.unit} available, cannot deduct ${data.quantity}`,
          },
          { status: 400 }
        )
      }

      // Deduct the stock
      item.variants[variantIndex].remaining_stock -= data.quantity
      newStockLevel = item.variants[variantIndex].remaining_stock
    } else {
      // Handle simple items
      // Check if sufficient stock exists
      if (item.remaining_stock < data.quantity) {
        return HttpResponse.json(
          {
            success: false,
            error: "Insufficient stock",
            message: `Only ${item.remaining_stock} ${item.unit} available, cannot deduct ${data.quantity}`,
          },
          { status: 400 }
        )
      }

      // Deduct the stock
      item.remaining_stock -= data.quantity
      newStockLevel = item.remaining_stock
    }

    // Update modification timestamp
    item.updated_at = new Date().toISOString()

    // Create a stock movement record
    const movement = {
      id: mockStockMovements.length + 1,
      inventory_item_id: itemId,
      variant_id: data.variant_id || null,
      movement_type: "STOCK_OUT",
      quantity: data.quantity,
      remaining_stock_after: newStockLevel,
      transaction_date: new Date().toISOString(),
      reference_number: data.reference_number || `AUTO-${Date.now()}`,
      notes: data.notes || "Stock-out transaction",
      performed_by_user_id: 1,
      created_at: new Date().toISOString(),
    }

    mockStockMovements.push(movement)

    return HttpResponse.json({
      success: true,
      data: {
        item: item,
        movement: movement,
        new_stock_level: newStockLevel,
      },
      message: `Successfully deducted ${data.quantity} ${item.unit}${data.quantity > 1 ? "s" : ""} from inventory`,
    })
  }
)

// Export all handlers as an array
export const inventoryHandlers = [
  getInventoryList,
  getLowStockItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  recordStockIn,
  recordStockOut,
  getStockMovements,
  deleteInventoryItem,
]
