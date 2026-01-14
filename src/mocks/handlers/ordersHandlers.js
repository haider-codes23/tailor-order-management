import { http, HttpResponse } from "msw"
import {
  mockOrders,
  mockOrderItems,
  getOrderById,
  getOrderItemById,
  getOrderItemsByOrderId,
  getOrderWithItems,
  generateOrderNumber,
  generateOrderId,
  generateOrderItemId,
  generatePaymentId,
  generateTimelineId,
  calculateRemainingAmount,
  getOrderStatusSummary,
} from "../data/mockOrders"
import {
  ORDER_ITEM_STATUS,
  ORDER_SOURCE,
  PAYMENT_STATUS,
  SIZE_TYPE,
  CUSTOMIZATION_TYPE,
} from "@/constants/orderConstants"
import { mockProducts, getActiveBOM, getBOMItems } from "../data/mockProducts"

import { mockInventoryItems } from "../data/mockInventory"
import {
  mockProcurementDemands,
  generateProcurementDemandId,
  deleteProcurementDemandsByOrderItem,
} from "../data/mockProcurementDemands"

const BASE_URL = "/api"

export const ordersHandlers = [
  http.get(`${BASE_URL}/orders`, ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get("search")?.toLowerCase() || ""
    const status = url.searchParams.get("status")
    const source = url.searchParams.get("source")
    const urgent = url.searchParams.get("urgent")
    const consultantId = url.searchParams.get("consultantId")
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")

    let filtered = [...mockOrders]

    if (search) {
      filtered = filtered.filter(
        (o) =>
          o.customerName.toLowerCase().includes(search) ||
          o.orderNumber.toLowerCase().includes(search)
      )
    }

    if (status) {
      filtered = filtered.filter((o) => {
        const items = getOrderItemsByOrderId(o.id)
        return items.some((item) => item.status === status)
      })
    }

    if (source) {
      filtered = filtered.filter((o) => o.source === source)
    }

    if (urgent) {
      filtered = filtered.filter((o) => o.urgent === urgent)
    }

    if (consultantId) {
      filtered = filtered.filter((o) => o.consultantId === consultantId)
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginated = filtered.slice(startIndex, startIndex + limit)

    const ordersWithComputed = paginated.map((order) => ({
      ...order,
      remainingAmount: calculateRemainingAmount(order),
      statusSummary: getOrderStatusSummary(order.id),
      itemCount: order.itemIds.length,
    }))

    return HttpResponse.json({
      orders: ordersWithComputed,
      pagination: { page, limit, total, totalPages },
    })
  }),

  http.get(`${BASE_URL}/orders/:id`, ({ params }) => {
    const order = getOrderWithItems(params.id)
    if (!order) {
      return HttpResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return HttpResponse.json({
      ...order,
      remainingAmount: calculateRemainingAmount(order),
      statusSummary: getOrderStatusSummary(order.id),
    })
  }),

  http.post(`${BASE_URL}/orders`, async ({ request }) => {
    const data = await request.json()
    const now = new Date().toISOString()

    const newOrder = {
      id: generateOrderId(),
      orderNumber: generateOrderNumber(),
      source: ORDER_SOURCE.MANUAL,
      shopifyOrderId: null,
      customerName: data.customerName,
      destination: data.destination,
      address: data.address,
      clientHeight: data.clientHeight,
      modesty: data.modesty || "NO",
      consultantId: data.consultantId,
      consultantName: data.consultantName,
      productionInchargeId: data.productionInchargeId || null,
      productionInchargeName: data.productionInchargeName || null,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      totalAmount: data.totalAmount || 0,
      payments: [],
      paymentStatus: "PENDING",
      fwdDate: data.fwdDate || now.split("T")[0],
      productionShippingDate: data.productionShippingDate || null,
      actualShippingDate: null,
      preTrackingId: null,
      urgent: data.urgent || null,
      notes: data.notes || "",
      orderFormLink: null,
      itemIds: [],
      createdAt: now,
      updatedAt: now,
    }

    if (data.items && data.items.length > 0) {
      data.items.forEach((itemData) => {
        const newItem = {
          id: generateOrderItemId(),
          orderId: newOrder.id,
          productId: itemData.productId,
          productName: itemData.productName,
          productImage: itemData.productImage,
          productSku: itemData.productSku,
          sizeType: itemData.sizeType,
          size: itemData.size,
          quantity: itemData.quantity || 1,
          includedItems: itemData.includedItems || [],
          selectedAddOns: itemData.selectedAddOns || [],
          status: ORDER_ITEM_STATUS.RECEIVED,
          style: { type: "original", details: {}, attachments: [], image: null },
          color: { type: "original", details: "", attachments: [], image: null },
          fabric: { type: "original", details: "", attachments: [], image: null },
          measurementCategories: [],
          measurements: {},
          orderFormGenerated: false,
          orderFormApproved: false,
          orderForm: null,
          orderFormVersions: [],
          timeline: [
            {
              id: generateTimelineId(),
              action: "Order item created",
              user: data.consultantName || "System",
              timestamp: now,
            },
          ],
          createdAt: now,
          updatedAt: now,
        }
        mockOrderItems.push(newItem)
        newOrder.itemIds.push(newItem.id)
      })
    }

    mockOrders.push(newOrder)
    return HttpResponse.json(
      { success: true, data: getOrderWithItems(newOrder.id) },
      { status: 201 }
    )
  }),

  http.put(`${BASE_URL}/orders/:id`, async ({ params, request }) => {
    const data = await request.json()
    const orderIndex = mockOrders.findIndex((o) => o.id === params.id)
    if (orderIndex === -1) {
      return HttpResponse.json({ error: "Order not found" }, { status: 404 })
    }
    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({ success: true, data: getOrderWithItems(params.id) })
  }),

  http.delete(`${BASE_URL}/orders/:id`, ({ params }) => {
    const orderIndex = mockOrders.findIndex((o) => o.id === params.id)
    if (orderIndex === -1) {
      return HttpResponse.json({ error: "Order not found" }, { status: 404 })
    }
    const order = mockOrders[orderIndex]
    order.itemIds.forEach((itemId) => {
      const itemIndex = mockOrderItems.findIndex((i) => i.id === itemId)
      if (itemIndex !== -1) mockOrderItems.splice(itemIndex, 1)
    })
    mockOrders.splice(orderIndex, 1)
    return HttpResponse.json({ success: true })
  }),

  http.post(`${BASE_URL}/orders/:id/payments`, async ({ params, request }) => {
    const data = await request.json()
    const orderIndex = mockOrders.findIndex((o) => o.id === params.id)
    if (orderIndex === -1) {
      return HttpResponse.json({ error: "Order not found" }, { status: 404 })
    }
    const newPayment = {
      id: generatePaymentId(),
      amount: data.amount,
      receiptUrl: data.receiptUrl || null,
      createdAt: new Date().toISOString(),
    }
    mockOrders[orderIndex].payments.push(newPayment)
    mockOrders[orderIndex].updatedAt = new Date().toISOString()
    const totalPaid = mockOrders[orderIndex].payments.reduce((sum, p) => sum + p.amount, 0)
    if (totalPaid >= mockOrders[orderIndex].totalAmount) {
      mockOrders[orderIndex].paymentStatus =
        totalPaid > mockOrders[orderIndex].totalAmount ? "EXTRA_PAID" : "PAID"
    }
    return HttpResponse.json({ success: true, data: getOrderWithItems(params.id) })
  }),

  http.delete(`${BASE_URL}/orders/:orderId/payments/:paymentId`, ({ params }) => {
    const orderIndex = mockOrders.findIndex((o) => o.id === params.orderId)
    if (orderIndex === -1) {
      return HttpResponse.json({ error: "Order not found" }, { status: 404 })
    }
    const paymentIndex = mockOrders[orderIndex].payments.findIndex((p) => p.id === params.paymentId)
    if (paymentIndex === -1) {
      return HttpResponse.json({ error: "Payment not found" }, { status: 404 })
    }
    mockOrders[orderIndex].payments.splice(paymentIndex, 1)
    mockOrders[orderIndex].updatedAt = new Date().toISOString()
    const totalPaid = mockOrders[orderIndex].payments.reduce((sum, p) => sum + p.amount, 0)
    mockOrders[orderIndex].paymentStatus =
      totalPaid >= mockOrders[orderIndex].totalAmount
        ? totalPaid > mockOrders[orderIndex].totalAmount
          ? "EXTRA_PAID"
          : "PAID"
        : "PENDING"
    return HttpResponse.json({ success: true, data: getOrderWithItems(params.orderId) })
  }),

  http.get(`${BASE_URL}/order-items/:id`, ({ params }) => {
    const item = getOrderItemById(params.id)
    if (!item) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }
    return HttpResponse.json({ success: true, data: item })
  }),

  http.put(`${BASE_URL}/order-items/:id`, async ({ params, request }) => {
    const data = await request.json()
    const itemIndex = mockOrderItems.findIndex((i) => i.id === params.id)
    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }
    const now = new Date().toISOString()
    const oldStatus = mockOrderItems[itemIndex].status
    mockOrderItems[itemIndex] = { ...mockOrderItems[itemIndex], ...data, updatedAt: now }
    if (data.status && data.status !== oldStatus) {
      mockOrderItems[itemIndex].timeline.push({
        id: generateTimelineId(),
        action: `Status changed to ${data.status}`,
        user: data.updatedBy || "System",
        timestamp: now,
      })
    }
    return HttpResponse.json({ success: true, data: mockOrderItems[itemIndex] })
  }),

  http.post(`${BASE_URL}/order-items/:id/timeline`, async ({ params, request }) => {
    const data = await request.json()
    const itemIndex = mockOrderItems.findIndex((i) => i.id === params.id)
    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }
    mockOrderItems[itemIndex].timeline.push({
      id: generateTimelineId(),
      action: data.action,
      user: data.user,
      timestamp: new Date().toISOString(),
    })
    mockOrderItems[itemIndex].updatedAt = new Date().toISOString()
    return HttpResponse.json({ success: true, data: mockOrderItems[itemIndex] })
  }),

  http.post(`${BASE_URL}/orders/:id/items`, async ({ params, request }) => {
    const data = await request.json()
    const orderIndex = mockOrders.findIndex((o) => o.id === params.id)
    if (orderIndex === -1) {
      return HttpResponse.json({ error: "Order not found" }, { status: 404 })
    }
    const now = new Date().toISOString()
    const newItem = {
      id: generateOrderItemId(),
      orderId: params.id,
      productId: data.productId,
      productName: data.productName,
      productImage: data.productImage,
      productSku: data.productSku,
      sizeType: data.sizeType,
      size: data.size,
      quantity: data.quantity || 1,
      includedItems: data.includedItems || [],
      selectedAddOns: data.selectedAddOns || [],
      status: ORDER_ITEM_STATUS.RECEIVED,
      style: { type: "original", details: {}, attachments: [], image: null },
      color: { type: "original", details: "", attachments: [], image: null },
      fabric: { type: "original", details: "", attachments: [], image: null },
      measurementCategories: [],
      measurements: {},
      orderFormGenerated: false,
      orderFormApproved: false,
      orderForm: null,
      orderFormVersions: [],
      timeline: [
        {
          id: generateTimelineId(),
          action: "Order item added",
          user: data.addedBy || "System",
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    }
    mockOrderItems.push(newItem)
    mockOrders[orderIndex].itemIds.push(newItem.id)
    mockOrders[orderIndex].updatedAt = now
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 })
  }),

  http.delete(`${BASE_URL}/order-items/:id`, ({ params }) => {
    const itemIndex = mockOrderItems.findIndex((i) => i.id === params.id)
    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }
    const item = mockOrderItems[itemIndex]
    const orderIndex = mockOrders.findIndex((o) => o.id === item.orderId)
    if (orderIndex !== -1) {
      mockOrders[orderIndex].itemIds = mockOrders[orderIndex].itemIds.filter(
        (id) => id !== params.id
      )
      mockOrders[orderIndex].updatedAt = new Date().toISOString()
    }
    mockOrderItems.splice(itemIndex, 1)
    return HttpResponse.json({ success: true })
  }),

  http.post(`${BASE_URL}/order-items/:id/approve-form`, async ({ params, request }) => {
    const { id } = params

    // Safely parse JSON body (may be empty)
    let data = {}
    try {
      const text = await request.text()
      if (text) {
        data = JSON.parse(text)
      }
    } catch {
      // No body sent, use empty object
    }

    const itemIndex = mockOrderItems.findIndex((item) => item.id === id)
    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const item = mockOrderItems[itemIndex]
    const now = new Date().toISOString()

    // Mark form as approved
    mockOrderItems[itemIndex].orderFormApproved = true
    mockOrderItems[itemIndex].updatedAt = now

    // Determine next status based on size type
    let nextStatus
    let timelineAction

    if (item.sizeType === SIZE_TYPE.CUSTOM) {
      // Custom size items go to FABRICATION_BESPOKE for custom BOM creation
      nextStatus = ORDER_ITEM_STATUS.FABRICATION_BESPOKE
      timelineAction = "Customer approved form - Forwarded to Fabrication for custom BOM"
    } else {
      // Standard size items go directly to INVENTORY_CHECK
      nextStatus = ORDER_ITEM_STATUS.INVENTORY_CHECK
      timelineAction = "Customer approved form - Ready for inventory check"
    }

    mockOrderItems[itemIndex].status = nextStatus

    // Add timeline entry
    mockOrderItems[itemIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: timelineAction,
      user: data.approvedBy || "System",
      timestamp: now,
    })

    // Update parent order status to match (use the "furthest behind" item status)
    const order = mockOrders.find((o) => o.id === item.orderId)
    if (order) {
      const orderItems = mockOrderItems.filter((i) => i.orderId === order.id)
      // Simple approach: use this item's status for now
      // In a real app, you'd compute the "minimum" status across all items
      order.status = nextStatus
      order.updatedAt = now
    }

    return HttpResponse.json({
      success: true,
      data: mockOrderItems[itemIndex],
    })
  }),

  http.post(`${BASE_URL}/order-items/:id/generate-form`, async ({ params, request }) => {
    const data = await request.json()
    const itemIndex = mockOrderItems.findIndex((i) => i.id === params.id)
    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const now = new Date().toISOString()
    const versionId = `form-v-${Date.now()}`

    // Create the new form version
    const newFormVersion = {
      versionId,
      generatedAt: now,
      generatedBy: data.generatedBy || "System",
      ...data,
      includedItems: mockOrderItems[itemIndex].includedItems || [],
      selectedAddOns: mockOrderItems[itemIndex].selectedAddOns || [],
    }

    // Get existing versions or create empty array
    const existingVersions = mockOrderItems[itemIndex].orderFormVersions || []

    // If editing, add new version to history
    const updatedVersions = data.isEditMode
      ? [...existingVersions, newFormVersion]
      : [newFormVersion]

    mockOrderItems[itemIndex] = {
      ...mockOrderItems[itemIndex],
      style: data.style || mockOrderItems[itemIndex].style,
      color: data.color || mockOrderItems[itemIndex].color,
      fabric: data.fabric || mockOrderItems[itemIndex].fabric,
      measurementCategories: data.selectedCategories || data.measurementCategories || [],
      measurements: data.measurements || {},
      orderFormGenerated: true,
      orderForm: newFormVersion,
      orderFormVersions: updatedVersions,
      status: ORDER_ITEM_STATUS.AWAITING_CUSTOMER_FORM_APPROVAL,
      updatedAt: now,
    }

    mockOrderItems[itemIndex].timeline.push({
      id: generateTimelineId(),
      action: data.isEditMode ? "Order form updated (new version)" : "Order form generated",
      user: data.generatedBy || "System",
      timestamp: now,
    })

    return HttpResponse.json({
      success: true,
      data: {
        ...mockOrderItems[itemIndex],
        id: mockOrderItems[itemIndex].id,
        orderId: mockOrderItems[itemIndex].orderId,
      },
    })
  }),

  http.post(`${BASE_URL}/order-items/:id/inventory-check`, async ({ params, request }) => {
    const { id } = params

    let data = {}
    try {
      const text = await request.text()
      if (text) data = JSON.parse(text)
    } catch {
      // No body
    }

    const itemIndex = mockOrderItems.findIndex((item) => item.id === id)
    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const item = mockOrderItems[itemIndex]
    const now = new Date().toISOString()

    // Only allow inventory check for items in INVENTORY_CHECK status
    if (item.status !== ORDER_ITEM_STATUS.INVENTORY_CHECK) {
      return HttpResponse.json({ error: "Item must be in INVENTORY_CHECK status" }, { status: 400 })
    }

    // Get relevant pieces (includedItems + selectedAddOns)
    const relevantPieces = []
    if (item.includedItems) {
      item.includedItems.forEach((inc) => relevantPieces.push(inc.piece.toLowerCase()))
    }
    if (item.selectedAddOns) {
      item.selectedAddOns.forEach((addon) => relevantPieces.push(addon.piece.toLowerCase()))
    }

    console.log("[Inventory Check] Order Item:", item.id)
    console.log("[Inventory Check] Product ID:", item.productId)
    console.log("[Inventory Check] Size:", item.size)
    console.log("[Inventory Check] Relevant Pieces:", relevantPieces)

    let bomItems = []

    if (item.sizeType === SIZE_TYPE.CUSTOM && item.customBOM) {
      // Custom size - use custom BOM
      console.log("[Inventory Check] Using Custom BOM")
      bomItems = item.customBOM.items || []
      // Filter to only relevant pieces
      bomItems = bomItems.filter((bomItem) => {
        const piece = (bomItem.piece || "").toLowerCase()
        return relevantPieces.includes(piece)
      })
    } else {
      // Standard size - get product BOM using the helper functions
      console.log("[Inventory Check] Looking for Standard BOM")

      // Use the helper function from mockProducts.js
      const activeBOM = getActiveBOM(item.productId, item.size)
      console.log("[Inventory Check] Active BOM found:", activeBOM?.id)

      if (activeBOM) {
        // Get BOM items using the helper function
        const allBOMItems = getBOMItems(activeBOM.id)
        console.log("[Inventory Check] All BOM Items:", allBOMItems.length)

        // Filter to only relevant pieces and map to our expected format
        bomItems = allBOMItems
          .filter((bomItem) => {
            const piece = (bomItem.piece || "").toLowerCase()
            return relevantPieces.includes(piece)
          })
          .map((bomItem) => {
            // Look up the inventory item to get name and SKU
            const inventoryItem = mockInventoryItems.find(
              (inv) =>
                inv.id === parseInt(bomItem.inventory_item_id) ||
                inv.id.toString() === bomItem.inventory_item_id
            )

            return {
              inventory_item_id: bomItem.inventory_item_id,
              inventory_item_name: inventoryItem?.name || `Item ${bomItem.inventory_item_id}`,
              inventory_item_sku: inventoryItem?.sku || "",
              quantity: bomItem.quantity_per_unit,
              unit: bomItem.unit || inventoryItem?.unit || "Unit",
              piece: bomItem.piece,
            }
          })

        console.log("[Inventory Check] Filtered BOM Items:", bomItems.length)
      } else {
        console.log(
          "[Inventory Check] No active BOM found for product:",
          item.productId,
          "size:",
          item.size
        )
      }
    }

    // Consolidate requirements by inventory item
    const requirementsMap = new Map()
    bomItems.forEach((bomItem) => {
      const invId = bomItem.inventory_item_id || bomItem.inventoryItemId
      if (!invId) return

      const qty = parseFloat(bomItem.quantity || bomItem.quantity_per_unit) || 0
      const existing = requirementsMap.get(invId)

      if (existing) {
        existing.requiredQty += qty * (item.quantity || 1)
      } else {
        requirementsMap.set(invId, {
          inventoryItemId: invId,
          inventoryItemName:
            bomItem.inventory_item_name || bomItem.inventoryItemName || bomItem.name,
          inventoryItemSku: bomItem.inventory_item_sku || bomItem.inventoryItemSku || bomItem.sku,
          requiredQty: qty * (item.quantity || 1),
          unit: bomItem.unit || "Unit",
          piece: bomItem.piece || "General",
        })
      }
    })

    console.log("[Inventory Check] Requirements Map size:", requirementsMap.size)

    // Check against inventory
    // Check against inventory
    const materialRequirements = []
    const shortages = []

    requirementsMap.forEach((req) => {
      // Handle both string and numeric IDs
      const inventoryId =
        typeof req.inventoryItemId === "string"
          ? parseInt(req.inventoryItemId)
          : req.inventoryItemId

      const inventoryItem = mockInventoryItems.find(
        (inv) =>
          inv.id === inventoryId ||
          inv.id === req.inventoryItemId ||
          inv.sku === req.inventoryItemSku
      )

      const availableQty = inventoryItem?.remaining_stock || 0
      const shortageQty = Math.max(0, req.requiredQty - availableQty)
      const status = availableQty >= req.requiredQty ? "SUFFICIENT" : "SHORTAGE"

      console.log(
        `[Inventory Check] Material: ${inventoryItem?.name || req.inventoryItemId}, Required: ${req.requiredQty}, Available: ${availableQty}, Status: ${status}`
      )

      const requirement = {
        ...req,
        // Update with actual inventory item details
        inventoryItemName: inventoryItem?.name || `Unknown Item ${req.inventoryItemId}`,
        inventoryItemSku: inventoryItem?.sku || req.inventoryItemSku || "",
        unit: inventoryItem?.unit || req.unit || "Unit",
        availableQty,
        shortageQty,
        status,
      }
      materialRequirements.push(requirement)

      if (status === "SHORTAGE") {
        shortages.push(requirement)
      }
    })

    // Clear any existing procurement demands for this item
    const existingDemandIndices = []
    mockProcurementDemands.forEach((pd, index) => {
      if (pd.orderItemId === id) {
        existingDemandIndices.push(index)
      }
    })
    // Remove in reverse order to maintain indices
    for (let i = existingDemandIndices.length - 1; i >= 0; i--) {
      mockProcurementDemands.splice(existingDemandIndices[i], 1)
    }

    // Determine next status and create procurement demands if needed
    let nextStatus
    let timelineAction

    if (shortages.length === 0) {
      // All materials available
      nextStatus = ORDER_ITEM_STATUS.READY_FOR_PRODUCTION
      timelineAction = "Inventory check passed - Ready for production"
    } else {
      // Materials short - create procurement demands
      nextStatus = ORDER_ITEM_STATUS.AWAITING_MATERIAL
      timelineAction = `Inventory check found ${shortages.length} material shortage(s) - Awaiting material`

      // Create procurement demands for each shortage
      shortages.forEach((shortage) => {
        const demand = {
          id: generateProcurementDemandId(),
          orderId: item.orderId,
          orderItemId: id,
          inventoryItemId: shortage.inventoryItemId,
          inventoryItemName: shortage.inventoryItemName,
          inventoryItemSku: shortage.inventoryItemSku,
          requiredQty: shortage.requiredQty,
          availableQty: shortage.availableQty,
          shortageQty: shortage.shortageQty,
          unit: shortage.unit,
          status: "OPEN",
          createdAt: now,
          updatedAt: now,
          notes: "",
        }
        mockProcurementDemands.push(demand)
      })
    }

    console.log("[Inventory Check] Next Status:", nextStatus)
    console.log("[Inventory Check] Shortages:", shortages.length)

    // Update order item
    mockOrderItems[itemIndex].status = nextStatus
    mockOrderItems[itemIndex].materialRequirements = materialRequirements
    mockOrderItems[itemIndex].lastInventoryCheck = now
    mockOrderItems[itemIndex].updatedAt = now

    // Add timeline entry
    mockOrderItems[itemIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: timelineAction,
      user: data.checkedBy || "System",
      timestamp: now,
    })

    return HttpResponse.json({
      success: true,
      data: {
        item: mockOrderItems[itemIndex],
        materialRequirements,
        shortages,
        nextStatus,
        procurementDemandsCreated: shortages.length,
      },
    })
  }),
]
