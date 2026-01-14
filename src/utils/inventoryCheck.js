/**
 * Inventory Check Utility
 * Computes material requirements and checks against available stock
 */

import { mockInventoryItems } from "@/mocks/data/mockInventoryItems"

/**
 * Find inventory item by ID or SKU
 */
export const findInventoryItem = (inventoryItemId, sku) => {
  return mockInventoryItems.find(
    (item) => item.id === parseInt(inventoryItemId) || item.sku === sku
  )
}

/**
 * Get the relevant pieces from an order item (includedItems + selectedAddOns)
 */
export const getRelevantPieces = (orderItem) => {
  const pieces = []

  if (orderItem.includedItems) {
    orderItem.includedItems.forEach((item) => {
      pieces.push(item.piece.toLowerCase())
    })
  }

  if (orderItem.selectedAddOns) {
    orderItem.selectedAddOns.forEach((addon) => {
      pieces.push(addon.piece.toLowerCase())
    })
  }

  return pieces
}

/**
 * Filter BOM items to only include relevant pieces
 */
export const filterBOMByPieces = (bomItems, relevantPieces) => {
  if (!bomItems || !Array.isArray(bomItems)) return []

  return bomItems.filter((item) => {
    const itemPiece = (item.piece || item.section || "").toLowerCase()
    return relevantPieces.includes(itemPiece)
  })
}

/**
 * Compute material requirements from BOM items
 * Returns array of { inventoryItemId, inventoryItemName, inventoryItemSku, requiredQty, availableQty, unit, status }
 */
export const computeMaterialRequirements = (bomItems, quantity = 1) => {
  const requirements = []

  // Group by inventory item to consolidate quantities
  const consolidatedMap = new Map()

  bomItems.forEach((item) => {
    const key = item.inventory_item_id || item.inventoryItemId
    if (!key) return

    const existing = consolidatedMap.get(key)
    const itemQty = parseFloat(item.quantity) || 0

    if (existing) {
      existing.requiredQty += itemQty * quantity
    } else {
      consolidatedMap.set(key, {
        inventoryItemId: key,
        inventoryItemName: item.inventory_item_name || item.inventoryItemName || item.name,
        inventoryItemSku: item.inventory_item_sku || item.inventoryItemSku || item.sku,
        requiredQty: itemQty * quantity,
        unit: item.unit || "Unit",
        piece: item.piece || item.section || "General",
      })
    }
  })

  // Check against inventory
  consolidatedMap.forEach((req) => {
    const inventoryItem = findInventoryItem(req.inventoryItemId, req.inventoryItemSku)
    const availableQty = inventoryItem?.remaining_stock || 0

    requirements.push({
      ...req,
      availableQty,
      shortageQty: Math.max(0, req.requiredQty - availableQty),
      status: availableQty >= req.requiredQty ? "SUFFICIENT" : "SHORTAGE",
    })
  })

  return requirements
}

/**
 * Check if all requirements are met
 */
export const allRequirementsMet = (requirements) => {
  return requirements.every((req) => req.status === "SUFFICIENT")
}
