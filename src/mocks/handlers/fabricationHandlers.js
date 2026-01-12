/**
 * Fabrication MSW Handlers
 * Handles all mock API endpoints for the Fabrication module
 */

import { http, HttpResponse } from "msw"
import { mockOrders, mockOrderItems } from "../data/mockOrders"
import { ORDER_ITEM_STATUS, SIZE_TYPE } from "@/constants/orderConstants"

const BASE_URL = "/api/fabrication"

// Helper to generate unique IDs
const generateId = () => `cbom-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const fabricationHandlers = [
  /**
   * GET /api/fabrication/orders
   * Get all orders that have at least one item in FABRICATION_BESPOKE status
   */
  http.get(`${BASE_URL}/orders`, () => {
    // Find all orders that have custom size items in FABRICATION_BESPOKE status
    const fabricationOrders = mockOrders
      .filter((order) => {
        const orderItems = mockOrderItems.filter((item) => item.orderId === order.id)
        return orderItems.some(
          (item) =>
            item.sizeType === SIZE_TYPE.CUSTOM &&
            item.status === ORDER_ITEM_STATUS.FABRICATION_BESPOKE
        )
      })
      .map((order) => {
        const orderItems = mockOrderItems.filter((item) => item.orderId === order.id)
        const customItems = orderItems.filter(
          (item) =>
            item.sizeType === SIZE_TYPE.CUSTOM &&
            item.status === ORDER_ITEM_STATUS.FABRICATION_BESPOKE
        )
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          consultantName: order.consultantName,
          productionShippingDate: order.productionShippingDate,
          customItemsCount: customItems.length,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        }
      })

    return HttpResponse.json({
      success: true,
      data: fabricationOrders,
    })
  }),

  /**
   * GET /api/fabrication/orders/:orderId
   * Get a specific order with only its custom size items for fabrication
   */
  http.get(`${BASE_URL}/orders/:orderId`, ({ params }) => {
    const { orderId } = params

    const order = mockOrders.find((o) => o.id === orderId)
    if (!order) {
      return HttpResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get only custom size items for this order
    const customItems = mockOrderItems
      .filter((item) => item.orderId === orderId && item.sizeType === SIZE_TYPE.CUSTOM)
      .map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        productSku: item.productSku,
        size: item.size,
        quantity: item.quantity,
        status: item.status,
        customBOM: item.customBOM || null,
        hasBOM: !!item.customBOM,
        includedItems: item.includedItems,
        selectedAddOns: item.selectedAddOns,
      }))

    return HttpResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        consultantName: order.consultantName,
        productionInCharge: order.productionInCharge,
        productionShippingDate: order.productionShippingDate,
        clientHeight: order.clientHeight,
        createdAt: order.createdAt,
        items: customItems,
      },
    })
  }),

  /**
   * GET /api/fabrication/orders/:orderId/items/:itemId
   * Get full details of a specific order item for fabrication (includes order form data)
   */
  http.get(`${BASE_URL}/orders/:orderId/items/:itemId`, ({ params }) => {
    const { orderId, itemId } = params

    const order = mockOrders.find((o) => o.id === orderId)
    if (!order) {
      return HttpResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const item = mockOrderItems.find((i) => i.id === itemId && i.orderId === orderId)
    if (!item) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    // Return full item details along with relevant order info
    return HttpResponse.json({
      success: true,
      data: {
        // Order info (for display)
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          consultantName: order.consultantName,
          productionInCharge: order.productionInCharge,
          productionShippingDate: order.productionShippingDate,
          clientHeight: order.clientHeight,
          createdAt: order.createdAt,
          notes: order.notes,
        },
        // Full item details
        item: {
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          productSku: item.productSku,
          sizeType: item.sizeType,
          size: item.size,
          quantity: item.quantity,
          status: item.status,
          // Customizations
          style: item.style,
          color: item.color,
          fabric: item.fabric,
          // Measurements
          measurementCategories: item.measurementCategories,
          measurements: item.measurements,
          // What's included
          includedItems: item.includedItems,
          selectedAddOns: item.selectedAddOns,
          // Order form data
          orderForm: item.orderForm,
          orderFormGenerated: item.orderFormGenerated,
          orderFormApproved: item.orderFormApproved,
          // Custom BOM
          customBOM: item.customBOM || null,
          // Timeline
          timeline: item.timeline,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      },
    })
  }),

  /**
   * POST /api/fabrication/items/:itemId/custom-bom
   * Create a new custom BOM for an order item
   */
  http.post(`${BASE_URL}/items/:itemId/custom-bom`, async ({ params, request }) => {
    const { itemId } = params
    const data = await request.json()

    const itemIndex = mockOrderItems.findIndex((i) => i.id === itemId)
    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const item = mockOrderItems[itemIndex]

    // Validate item is in correct status
    if (item.status !== ORDER_ITEM_STATUS.FABRICATION_BESPOKE) {
      return HttpResponse.json(
        { error: "Custom BOM can only be created for items in FABRICATION_BESPOKE status" },
        { status: 400 }
      )
    }

    // Check if custom BOM already exists
    if (item.customBOM) {
      return HttpResponse.json(
        { error: "Custom BOM already exists for this item. Use PUT to update." },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Derive pieces from includedItems and selectedAddOns
    const pieces = [
      ...item.includedItems.map((i) => i.piece),
      ...item.selectedAddOns.map((a) => a.piece),
    ]

    // Create the custom BOM structure
    const customBOM = {
      id: `custom-bom-${itemId}`,
      orderItemId: itemId,
      pieces: pieces,
      items: data.items || [], // BOM items array
      createdAt: now,
      createdBy: data.createdBy || "System",
      updatedAt: now,
      updatedBy: data.createdBy || "System",
    }

    mockOrderItems[itemIndex].customBOM = customBOM
    mockOrderItems[itemIndex].updatedAt = now

    // Add timeline entry
    mockOrderItems[itemIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: "Custom BOM created",
      user: data.createdBy || "System",
      timestamp: now,
    })

    return HttpResponse.json({
      success: true,
      data: mockOrderItems[itemIndex],
    })
  }),

  /**
   * PUT /api/fabrication/items/:itemId/custom-bom
   * Update an existing custom BOM
   */
  http.put(`${BASE_URL}/items/:itemId/custom-bom`, async ({ params, request }) => {
    const { itemId } = params
    const data = await request.json()

    const itemIndex = mockOrderItems.findIndex((i) => i.id === itemId)
    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const item = mockOrderItems[itemIndex]

    // Validate item is in correct status (can only edit in FABRICATION_BESPOKE)
    if (item.status !== ORDER_ITEM_STATUS.FABRICATION_BESPOKE) {
      return HttpResponse.json(
        { error: "Custom BOM can only be edited while item is in FABRICATION_BESPOKE status" },
        { status: 400 }
      )
    }

    if (!item.customBOM) {
      return HttpResponse.json(
        { error: "No custom BOM exists for this item. Use POST to create." },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Update the custom BOM
    mockOrderItems[itemIndex].customBOM = {
      ...item.customBOM,
      items: data.items || item.customBOM.items,
      updatedAt: now,
      updatedBy: data.updatedBy || "System",
    }
    mockOrderItems[itemIndex].updatedAt = now

    return HttpResponse.json({
      success: true,
      data: mockOrderItems[itemIndex],
    })
  }),

  /**
   * POST /api/fabrication/items/:itemId/custom-bom/pieces/:piece/items
   * Add a BOM item to a specific piece section
   */
  http.post(
    `${BASE_URL}/items/:itemId/custom-bom/pieces/:piece/items`,
    async ({ params, request }) => {
      const { itemId, piece } = params
      const data = await request.json()

      const itemIndex = mockOrderItems.findIndex((i) => i.id === itemId)
      if (itemIndex === -1) {
        return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
      }

      const item = mockOrderItems[itemIndex]

      // Validate status
      if (item.status !== ORDER_ITEM_STATUS.FABRICATION_BESPOKE) {
        return HttpResponse.json(
          { error: "Cannot modify BOM - item is not in FABRICATION_BESPOKE status" },
          { status: 400 }
        )
      }

      const now = new Date().toISOString()

      // Initialize customBOM if it doesn't exist
      if (!item.customBOM) {
        const pieces = [
          ...item.includedItems.map((i) => i.piece),
          ...item.selectedAddOns.map((a) => a.piece),
        ]
        mockOrderItems[itemIndex].customBOM = {
          id: `custom-bom-${itemId}`,
          orderItemId: itemId,
          pieces: pieces,
          items: [],
          createdAt: now,
          createdBy: data.addedBy || "System",
          updatedAt: now,
          updatedBy: data.addedBy || "System",
        }
      }

      // Create new BOM item
      const newBOMItem = {
        id: generateId(),
        piece: piece,
        inventory_item_id: data.inventory_item_id,
        inventory_item_name: data.inventory_item_name || "",
        inventory_item_sku: data.inventory_item_sku || "",
        quantity: parseFloat(data.quantity),
        unit: data.unit,
        notes: data.notes || "",
        createdAt: now,
      }

      mockOrderItems[itemIndex].customBOM.items.push(newBOMItem)
      mockOrderItems[itemIndex].customBOM.updatedAt = now
      mockOrderItems[itemIndex].customBOM.updatedBy = data.addedBy || "System"
      mockOrderItems[itemIndex].updatedAt = now

      return HttpResponse.json({
        success: true,
        data: {
          item: mockOrderItems[itemIndex],
          bomItem: newBOMItem,
        },
      })
    }
  ),

  /**
   * PUT /api/fabrication/items/:itemId/custom-bom/pieces/:piece/items/:bomItemId
   * Update a specific BOM item
   */
  http.put(
    `${BASE_URL}/items/:itemId/custom-bom/pieces/:piece/items/:bomItemId`,
    async ({ params, request }) => {
      const { itemId, piece, bomItemId } = params
      const data = await request.json()

      const itemIndex = mockOrderItems.findIndex((i) => i.id === itemId)
      if (itemIndex === -1) {
        return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
      }

      const item = mockOrderItems[itemIndex]

      // Validate status
      if (item.status !== ORDER_ITEM_STATUS.FABRICATION_BESPOKE) {
        return HttpResponse.json(
          { error: "Cannot modify BOM - item is not in FABRICATION_BESPOKE status" },
          { status: 400 }
        )
      }

      if (!item.customBOM) {
        return HttpResponse.json({ error: "No custom BOM exists" }, { status: 404 })
      }

      const bomItemIndex = item.customBOM.items.findIndex(
        (bi) => bi.id === bomItemId && bi.piece === piece
      )
      if (bomItemIndex === -1) {
        return HttpResponse.json({ error: "BOM item not found" }, { status: 404 })
      }

      const now = new Date().toISOString()

      // Update the BOM item
      mockOrderItems[itemIndex].customBOM.items[bomItemIndex] = {
        ...item.customBOM.items[bomItemIndex],
        inventory_item_id: data.inventory_item_id,
        inventory_item_name: data.inventory_item_name || "",
        inventory_item_sku: data.inventory_item_sku || "",
        quantity: parseFloat(data.quantity),
        unit: data.unit,
        notes: data.notes || "",
        updatedAt: now,
      }
      mockOrderItems[itemIndex].customBOM.updatedAt = now
      mockOrderItems[itemIndex].customBOM.updatedBy = data.updatedBy || "System"
      mockOrderItems[itemIndex].updatedAt = now

      return HttpResponse.json({
        success: true,
        data: mockOrderItems[itemIndex],
      })
    }
  ),

  /**
   * DELETE /api/fabrication/items/:itemId/custom-bom/pieces/:piece/items/:bomItemId
   * Delete a specific BOM item
   */
  http.delete(
    `${BASE_URL}/items/:itemId/custom-bom/pieces/:piece/items/:bomItemId`,
    ({ params }) => {
      const { itemId, piece, bomItemId } = params

      const itemIndex = mockOrderItems.findIndex((i) => i.id === itemId)
      if (itemIndex === -1) {
        return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
      }

      const item = mockOrderItems[itemIndex]

      // Validate status
      if (item.status !== ORDER_ITEM_STATUS.FABRICATION_BESPOKE) {
        return HttpResponse.json(
          { error: "Cannot modify BOM - item is not in FABRICATION_BESPOKE status" },
          { status: 400 }
        )
      }

      if (!item.customBOM) {
        return HttpResponse.json({ error: "No custom BOM exists" }, { status: 404 })
      }

      const bomItemIndex = item.customBOM.items.findIndex(
        (bi) => bi.id === bomItemId && bi.piece === piece
      )
      if (bomItemIndex === -1) {
        return HttpResponse.json({ error: "BOM item not found" }, { status: 404 })
      }

      const now = new Date().toISOString()

      // Remove the BOM item
      mockOrderItems[itemIndex].customBOM.items.splice(bomItemIndex, 1)
      mockOrderItems[itemIndex].customBOM.updatedAt = now
      mockOrderItems[itemIndex].updatedAt = now

      return HttpResponse.json({
        success: true,
        data: mockOrderItems[itemIndex],
      })
    }
  ),

  /**
   * POST /api/fabrication/items/:itemId/custom-bom/submit
   * Submit custom BOM and transition order item to INVENTORY_CHECK
   */
  http.post(`${BASE_URL}/items/:itemId/custom-bom/submit`, async ({ params, request }) => {
    const { itemId } = params
    const data = await request.json()

    const itemIndex = mockOrderItems.findIndex((i) => i.id === itemId)
    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const item = mockOrderItems[itemIndex]

    // Validate status
    if (item.status !== ORDER_ITEM_STATUS.FABRICATION_BESPOKE) {
      return HttpResponse.json(
        { error: "Item is not in FABRICATION_BESPOKE status" },
        { status: 400 }
      )
    }

    // Validate custom BOM exists and has items
    if (!item.customBOM || !item.customBOM.items || item.customBOM.items.length === 0) {
      return HttpResponse.json(
        { error: "Custom BOM must have at least one item before submitting" },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Transition to INVENTORY_CHECK
    mockOrderItems[itemIndex].status = ORDER_ITEM_STATUS.INVENTORY_CHECK
    mockOrderItems[itemIndex].customBOM.submittedAt = now
    mockOrderItems[itemIndex].customBOM.submittedBy = data.submittedBy || "System"
    mockOrderItems[itemIndex].updatedAt = now

    // Add timeline entry
    mockOrderItems[itemIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: "Custom BOM submitted - Ready for inventory check",
      user: data.submittedBy || "System",
      timestamp: now,
    })

    // Update parent order status if needed
    const order = mockOrders.find((o) => o.id === item.orderId)
    if (order) {
      order.updatedAt = now
    }

    return HttpResponse.json({
      success: true,
      data: mockOrderItems[itemIndex],
    })
  }),
]
