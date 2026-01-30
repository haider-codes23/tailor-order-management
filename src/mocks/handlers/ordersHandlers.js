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
  SECTION_STATUS,
} from "@/constants/orderConstants"
import { mockProducts, getActiveBOM, getBOMItems } from "../data/mockProducts"

import { mockInventoryItems, mockStockMovements } from "../data/mockInventory"
import {
  mockPackets,
  createPacketFromRequirements,
  createPartialPacketFromRequirements,
  addMaterialsToExistingPacket,
  getPacketByOrderItemId,
} from "../data/mockPackets"

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
      discount: data.discount || 0,
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
          unitPrice: itemData.unitPrice || 0,
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
      garmentNotes: data.garmentNotes || null,
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

  /**
   * POST /api/order-items/:id/inventory-check
   * NEW: Per-Section Inventory Check
   *
   * Runs inventory check for each included item/add-on separately.
   * - Sections that pass -> ready for packet creation
   * - Sections that fail -> create procurement demands
   * - Order item gets appropriate status based on results
   */
  http.post(`${BASE_URL}/order-items/:id/inventory-check`, async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

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

    // Build list of all sections (includedItems + selectedAddOns)
    const sections = []
    if (item.includedItems) {
      item.includedItems.forEach((inc) => {
        sections.push({
          piece: inc.piece,
          type: "includedItem",
          name: inc.piece,
          price: inc.price,
        })
      })
    }
    if (item.selectedAddOns) {
      item.selectedAddOns.forEach((addon) => {
        sections.push({
          piece: addon.piece,
          type: "addOn",
          name: addon.piece,
          price: addon.price,
        })
      })
    }

    console.log(
      "[Inventory Check] Sections to check:",
      sections.map((s) => s.piece)
    )

    // Initialize sectionStatuses if not exists
    if (!item.sectionStatuses) {
      mockOrderItems[itemIndex].sectionStatuses = {}
    }

    // Get BOM items (from standard BOM or custom BOM)
    let allBOMItems = []
    if (item.sizeType === SIZE_TYPE.CUSTOM && item.customBOM) {
      allBOMItems = item.customBOM.items || []
    } else {
      const activeBOM = getActiveBOM(item.productId, item.size)
      if (activeBOM) {
        allBOMItems = getBOMItems(activeBOM.id).map((bomItem) => {
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
      }
    }

    // Clear any existing procurement demands for this item
    const existingDemandIndices = []
    mockProcurementDemands.forEach((pd, index) => {
      if (pd.orderItemId === id) {
        existingDemandIndices.push(index)
      }
    })
    for (let i = existingDemandIndices.length - 1; i >= 0; i--) {
      mockProcurementDemands.splice(existingDemandIndices[i], 1)
    }

    // Process each section independently
    const sectionResults = []
    const passedSections = []
    const failedSections = []
    const allMaterialRequirements = []
    const allShortages = []
    const stockDeductions = []

    for (const section of sections) {
      const sectionPiece = section.piece.toLowerCase()

      // Filter BOM items for this section
      const sectionBOMItems = allBOMItems.filter(
        (bom) => (bom.piece || "").toLowerCase() === sectionPiece
      )

      console.log(`[Inventory Check] Section ${section.piece}: ${sectionBOMItems.length} BOM items`)

      // Calculate requirements for this section
      const sectionRequirements = []
      const sectionShortages = []

      sectionBOMItems.forEach((bomItem) => {
        const inventoryId =
          typeof bomItem.inventory_item_id === "string"
            ? parseInt(bomItem.inventory_item_id)
            : bomItem.inventory_item_id

        const inventoryItem = mockInventoryItems.find(
          (inv) => inv.id === inventoryId || inv.id === bomItem.inventory_item_id
        )

        const requiredQty =
          (parseFloat(bomItem.quantity) || parseFloat(bomItem.quantity_per_unit) || 0) *
          (item.quantity || 1)
        const availableQty = inventoryItem?.remaining_stock || 0
        const shortageQty = Math.max(0, requiredQty - availableQty)
        const status = availableQty >= requiredQty ? "SUFFICIENT" : "SHORTAGE"

        const requirement = {
          inventoryItemId: inventoryId,
          inventoryItemName: inventoryItem?.name || bomItem.inventory_item_name,
          inventoryItemSku: inventoryItem?.sku || bomItem.inventory_item_sku,
          requiredQty,
          availableQty,
          shortageQty,
          unit: inventoryItem?.unit || bomItem.unit || "Unit",
          piece: section.piece,
          status,
        }

        sectionRequirements.push(requirement)
        allMaterialRequirements.push(requirement)

        if (status === "SHORTAGE") {
          sectionShortages.push(requirement)
          allShortages.push(requirement)
        }
      })

      // Determine section result
      const sectionPassed = sectionShortages.length === 0 && sectionRequirements.length > 0

      // Update section status
      mockOrderItems[itemIndex].sectionStatuses[sectionPiece] = {
        status: sectionPassed ? SECTION_STATUS.INVENTORY_PASSED : SECTION_STATUS.AWAITING_MATERIAL,
        inventoryCheckResult: {
          passed: sectionPassed,
          checkedAt: now,
          materials: sectionRequirements,
          shortages: sectionShortages,
        },
        packetPickList: sectionPassed ? sectionRequirements : [],
        productionTaskId: null,
        qaStatus: null,
        updatedAt: now,
      }

      sectionResults.push({
        piece: section.piece,
        type: section.type,
        passed: sectionPassed,
        requirements: sectionRequirements,
        shortages: sectionShortages,
      })

      if (sectionPassed) {
        passedSections.push(section.piece)

        // Deduct stock for passed sections
        sectionRequirements.forEach((req) => {
          const inventoryItem = mockInventoryItems.find((inv) => inv.id === req.inventoryItemId)
          if (inventoryItem) {
            const previousStock = inventoryItem.remaining_stock
            inventoryItem.remaining_stock -= req.requiredQty

            // Create stock movement record
            const movement = {
              id: mockStockMovements.length + 1,
              inventory_item_id: req.inventoryItemId,
              variant_id: null,
              movement_type: "STOCK_OUT",
              quantity: req.requiredQty,
              remaining_stock_after: inventoryItem.remaining_stock,
              transaction_date: now,
              reference_number: `ORDER-${item.orderId}-ITEM-${id}`,
              notes: `Reserved for order item ${id}, section: ${section.piece}`,
              performed_by_user_id: 1,
              created_at: now,
            }
            mockStockMovements.push(movement)

            stockDeductions.push({
              inventoryItemId: req.inventoryItemId,
              inventoryItemName: inventoryItem.name,
              deductedQty: req.requiredQty,
              previousStock,
              newStock: inventoryItem.remaining_stock,
              piece: section.piece,
              movementId: movement.id,
            })
          }
        })
      } else {
        failedSections.push(section.piece)

        // Create procurement demands for failed sections
        sectionShortages.forEach((shortage) => {
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
            affectedSection: section.piece, // NEW: Track which section
            status: "OPEN",
            createdAt: now,
            updatedAt: now,
            notes: "",
          }
          mockProcurementDemands.push(demand)
        })
      }
    }

    // Determine overall order item status and create packet
    let nextStatus
    let timelineAction
    let createdPacket = null

    const inventoryItemsMap = {}
    mockInventoryItems.forEach((inv) => {
      inventoryItemsMap[inv.id] = inv
    })

    if (passedSections.length === sections.length && sections.length > 0) {
      // ALL sections passed - full CREATE_PACKET
      nextStatus = ORDER_ITEM_STATUS.CREATE_PACKET
      timelineAction = `Inventory check passed for all sections (${passedSections.join(", ")}). Ready for packet creation.`

      createdPacket = createPacketFromRequirements(
        id,
        item.orderId,
        allMaterialRequirements,
        inventoryItemsMap
      )
      // Add section tracking to full packet
      createdPacket.isPartial = false
      createdPacket.sectionsIncluded = passedSections
      createdPacket.sectionsPending = []
      mockPackets.push(createdPacket)
      mockOrderItems[itemIndex].packetId = createdPacket.id
    } else if (passedSections.length > 0) {
      // PARTIAL - some passed, some failed
      nextStatus = ORDER_ITEM_STATUS.PARTIAL_CREATE_PACKET
      timelineAction = `Partial inventory check: ${passedSections.join(", ")} passed. ${failedSections.join(", ")} awaiting material.`

      // Filter materials to only include passed sections
      const passedMaterials = allMaterialRequirements.filter((req) =>
        passedSections.map((s) => s.toLowerCase()).includes(req.piece.toLowerCase())
      )

      createdPacket = createPartialPacketFromRequirements(
        id,
        item.orderId,
        passedMaterials,
        inventoryItemsMap,
        passedSections,
        failedSections
      )
      mockPackets.push(createdPacket)
      mockOrderItems[itemIndex].packetId = createdPacket.id
    } else {
      // ALL failed - full AWAITING_MATERIAL
      nextStatus = ORDER_ITEM_STATUS.AWAITING_MATERIAL
      timelineAction = `Inventory check failed for all sections. ${allShortages.length} material shortage(s).`
    }

    // Update order item
    mockOrderItems[itemIndex].status = nextStatus
    mockOrderItems[itemIndex].materialRequirements = allMaterialRequirements
    mockOrderItems[itemIndex].lastInventoryCheck = now
    mockOrderItems[itemIndex].sectionsInventoryChecked = true
    mockOrderItems[itemIndex].updatedAt = now
    mockOrderItems[itemIndex].stockDeductions = stockDeductions

    mockOrderItems[itemIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: timelineAction,
      user: data.checkedBy || "System",
      timestamp: now,
    })

    console.log("[Inventory Check] Results:", {
      passedSections,
      failedSections,
      nextStatus,
      packetCreated: !!createdPacket,
    })

    return HttpResponse.json({
      success: true,
      data: {
        item: mockOrderItems[itemIndex],
        sectionResults,
        passedSections,
        failedSections,
        materialRequirements: allMaterialRequirements,
        shortages: allShortages,
        stockDeductions,
        nextStatus,
        procurementDemandsCreated: allShortages.length,
        packet: createdPacket,
        packetCreated: !!createdPacket,
      },
      message: timelineAction,
    })
  }),

  /**
   * POST /api/order-items/:id/rerun-section-inventory-check
   * Re-run inventory check for sections that are in AWAITING_MATERIAL status
   *
   * This is called after procurement demands have been fulfilled to check
   * if the remaining sections can now proceed.
   */
  http.post(
    `${BASE_URL}/order-items/:id/rerun-section-inventory-check`,
    async ({ params, request }) => {
      await new Promise((resolve) => setTimeout(resolve, 300))

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

      // Only allow for items that have sectionStatuses and are in a partial workflow state
      if (!item.sectionStatuses) {
        return HttpResponse.json(
          { error: "No section statuses found. Run initial inventory check first." },
          { status: 400 }
        )
      }

      // Find sections that are in AWAITING_MATERIAL or PENDING_INVENTORY_CHECK status
      // PENDING_INVENTORY_CHECK can occur after dyeing rejection when inventory was released
      const sectionsToRecheck = []
      Object.entries(item.sectionStatuses).forEach(([sectionName, sectionData]) => {
        if (
          sectionData.status === SECTION_STATUS.AWAITING_MATERIAL ||
          sectionData.status === SECTION_STATUS.PENDING_INVENTORY_CHECK
        ) {
          sectionsToRecheck.push(sectionName)
        }
      })

      console.log("[Rerun Section Inventory Check] Sections to recheck:", sectionsToRecheck)
      console.log(
        "[Rerun Section Inventory Check] Section statuses:",
        Object.entries(item.sectionStatuses).map(([name, data]) => ({
          name,
          status: data.status,
          dyeingRejectedAt: data.dyeingRejectedAt,
          dyeingRound: data.dyeingRound,
        }))
      )

      if (sectionsToRecheck.length === 0) {
        return HttpResponse.json(
          {
            error: "No sections in AWAITING_MATERIAL or PENDING_INVENTORY_CHECK status to recheck.",
          },
          { status: 400 }
        )
      }

      console.log("[Rerun Section Inventory Check] Sections to recheck:", sectionsToRecheck)

      // Check procurement demands status for these sections
      const demandsForItem = mockProcurementDemands.filter((pd) => pd.orderItemId === id)
      const pendingDemands = demandsForItem.filter(
        (pd) => pd.status !== "RECEIVED" && pd.status !== "CANCELLED"
      )

      // Group pending demands by section
      const pendingBySection = {}
      pendingDemands.forEach((pd) => {
        const section = pd.affectedSection?.toLowerCase() || "unknown"
        if (!pendingBySection[section]) pendingBySection[section] = []
        pendingBySection[section].push(pd)
      })

      // Get BOM items (from standard BOM or custom BOM)
      let allBOMItems = []
      if (item.sizeType === SIZE_TYPE.CUSTOM && item.customBOM) {
        allBOMItems = item.customBOM.items || []
      } else {
        const activeBOM = getActiveBOM(item.productId, item.size)
        if (activeBOM) {
          allBOMItems = getBOMItems(activeBOM.id).map((bomItem) => {
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
        }
      }

      // Process each section that needs rechecking
      const sectionResults = []
      const passedSections = []
      const stillFailedSections = []
      const newMaterialRequirements = []
      const stockDeductions = []

      for (const sectionName of sectionsToRecheck) {
        const sectionPiece = sectionName.toLowerCase()

        // Check if there are still pending procurement demands for this section
        if (pendingBySection[sectionPiece] && pendingBySection[sectionPiece].length > 0) {
          // Still has unfulfilled demands - skip this section
          stillFailedSections.push(sectionName)
          sectionResults.push({
            piece: sectionName,
            passed: false,
            reason: `Still has ${pendingBySection[sectionPiece].length} unfulfilled procurement demand(s)`,
            pendingDemands: pendingBySection[sectionPiece],
          })
          continue
        }

        // Filter BOM items for this section
        const sectionBOMItems = allBOMItems.filter(
          (bom) => (bom.piece || "").toLowerCase() === sectionPiece
        )

        // Calculate requirements for this section
        const sectionRequirements = []
        const sectionShortages = []

        sectionBOMItems.forEach((bomItem) => {
          const inventoryId =
            typeof bomItem.inventory_item_id === "string"
              ? parseInt(bomItem.inventory_item_id)
              : bomItem.inventory_item_id

          const inventoryItem = mockInventoryItems.find(
            (inv) => inv.id === inventoryId || inv.id === bomItem.inventory_item_id
          )

          const requiredQty =
            (parseFloat(bomItem.quantity) || parseFloat(bomItem.quantity_per_unit) || 0) *
            (item.quantity || 1)
          const availableQty = inventoryItem?.remaining_stock || 0
          const shortageQty = Math.max(0, requiredQty - availableQty)
          const status = availableQty >= requiredQty ? "SUFFICIENT" : "SHORTAGE"

          const requirement = {
            inventoryItemId: inventoryId,
            inventoryItemName: inventoryItem?.name || bomItem.inventory_item_name,
            inventoryItemSku: inventoryItem?.sku || bomItem.inventory_item_sku,
            requiredQty,
            availableQty,
            shortageQty,
            unit: inventoryItem?.unit || bomItem.unit || "Unit",
            piece: sectionName,
            status,
          }

          sectionRequirements.push(requirement)

          if (status === "SHORTAGE") {
            sectionShortages.push(requirement)
          }
        })

        // Determine section result
        const sectionPassed = sectionShortages.length === 0 && sectionRequirements.length > 0

        if (sectionPassed) {
          passedSections.push(sectionName)
          newMaterialRequirements.push(...sectionRequirements)

          // Update section status
          mockOrderItems[itemIndex].sectionStatuses[sectionPiece] = {
            ...mockOrderItems[itemIndex].sectionStatuses[sectionPiece],
            status: SECTION_STATUS.INVENTORY_PASSED,
            inventoryCheckResult: {
              passed: true,
              checkedAt: now,
              materials: sectionRequirements,
              shortages: [],
            },
            packetPickList: sectionRequirements,
            updatedAt: now,
          }

          // Deduct stock for passed sections
          sectionRequirements.forEach((req) => {
            const inventoryItem = mockInventoryItems.find((inv) => inv.id === req.inventoryItemId)
            if (inventoryItem) {
              const previousStock = inventoryItem.remaining_stock
              inventoryItem.remaining_stock -= req.requiredQty

              // Create stock movement record
              const movement = {
                id: mockStockMovements.length + 1,
                inventory_item_id: req.inventoryItemId,
                variant_id: null,
                movement_type: "STOCK_OUT",
                quantity: req.requiredQty,
                remaining_stock_after: inventoryItem.remaining_stock,
                transaction_date: now,
                reference_number: `ORDER-${item.orderId}-ITEM-${id}-RERUN`,
                notes: `Reserved for order item ${id}, section: ${sectionName} (rerun)`,
                performed_by_user_id: 1,
                created_at: now,
              }
              mockStockMovements.push(movement)

              stockDeductions.push({
                inventoryItemId: req.inventoryItemId,
                inventoryItemName: inventoryItem.name,
                deductedQty: req.requiredQty,
                previousStock,
                newStock: inventoryItem.remaining_stock,
                piece: sectionName,
                movementId: movement.id,
              })
            }
          })

          // Clear procurement demands for this section (mark as used)
          demandsForItem
            .filter((pd) => pd.affectedSection?.toLowerCase() === sectionPiece)
            .forEach((pd) => {
              const pdIndex = mockProcurementDemands.findIndex((d) => d.id === pd.id)
              if (pdIndex !== -1) {
                mockProcurementDemands[pdIndex].status = "FULFILLED"
                mockProcurementDemands[pdIndex].updatedAt = now
              }
            })

          sectionResults.push({
            piece: sectionName,
            passed: true,
            requirements: sectionRequirements,
          })
        } else {
          stillFailedSections.push(sectionName)

          // Update section status with new check results
          mockOrderItems[itemIndex].sectionStatuses[sectionPiece] = {
            ...mockOrderItems[itemIndex].sectionStatuses[sectionPiece],
            status: SECTION_STATUS.AWAITING_MATERIAL,
            inventoryCheckResult: {
              passed: false,
              checkedAt: now,
              materials: sectionRequirements,
              shortages: sectionShortages,
            },
            updatedAt: now,
          }

          sectionResults.push({
            piece: sectionName,
            passed: false,
            requirements: sectionRequirements,
            shortages: sectionShortages,
          })
        }
      }

      // Build inventory items map
      const inventoryItemsMap = {}
      mockInventoryItems.forEach((inv) => {
        inventoryItemsMap[inv.id] = inv
      })

      // If sections passed, add materials to existing packet
      let updatedPacket = null
      if (passedSections.length > 0 && item.packetId) {
        const packet = mockPackets.find((p) => p.id === item.packetId)
        if (packet) {
          updatedPacket = addMaterialsToExistingPacket(
            packet,
            newMaterialRequirements,
            inventoryItemsMap,
            passedSections
          )
        }
      }

      // Determine new order item status
      let newStatus = item.status
      let timelineAction = ""

      // Count sections by status
      const allSectionStatuses = Object.values(mockOrderItems[itemIndex].sectionStatuses)
      const awaitingSections = allSectionStatuses.filter(
        (s) => s.status === SECTION_STATUS.AWAITING_MATERIAL
      )
      const readySections = allSectionStatuses.filter(
        (s) =>
          s.status === SECTION_STATUS.INVENTORY_PASSED ||
          s.status === SECTION_STATUS.PACKET_CREATED ||
          s.status === SECTION_STATUS.PACKET_VERIFIED ||
          s.status === SECTION_STATUS.READY_FOR_PRODUCTION ||
          s.status === SECTION_STATUS.IN_PRODUCTION
      )

      if (awaitingSections.length === 0 && passedSections.length > 0) {
        // All sections are now ready - determine appropriate status
        // If packet exists and was updated, it needs to go through packet flow again
        if (updatedPacket) {
          newStatus = ORDER_ITEM_STATUS.PARTIAL_CREATE_PACKET // Or CREATE_PACKET if all ready
          timelineAction = `All sections now have materials. Packet updated with ${passedSections.join(", ")}. Ready for packet completion.`
        }
      } else if (passedSections.length > 0) {
        // Some sections passed, some still awaiting
        timelineAction = `Rerun inventory check: ${passedSections.join(", ")} passed. ${stillFailedSections.join(", ")} still awaiting material.`
      } else {
        timelineAction = `Rerun inventory check: No sections passed. ${stillFailedSections.join(", ")} still awaiting material.`
      }

      // Update order item
      mockOrderItems[itemIndex].lastInventoryCheck = now
      mockOrderItems[itemIndex].updatedAt = now

      if (timelineAction) {
        mockOrderItems[itemIndex].timeline.push({
          id: `log-${Date.now()}`,
          action: timelineAction,
          user: data.checkedBy || "System",
          timestamp: now,
        })
      }

      // Update materialRequirements to include new ones
      if (newMaterialRequirements.length > 0) {
        mockOrderItems[itemIndex].materialRequirements = [
          ...(mockOrderItems[itemIndex].materialRequirements || []),
          ...newMaterialRequirements,
        ]
      }

      console.log("[Rerun Section Inventory Check] Results:", {
        passedSections,
        stillFailedSections,
        newStatus,
        packetUpdated: !!updatedPacket,
      })

      return HttpResponse.json({
        success: true,
        data: {
          item: mockOrderItems[itemIndex],
          sectionResults,
          passedSections,
          stillFailedSections,
          newMaterialRequirements,
          stockDeductions,
          packet: updatedPacket,
        },
        message:
          passedSections.length > 0
            ? `Inventory check passed for: ${passedSections.join(", ")}`
            : "No sections passed inventory check",
      })
    }
  ),
]
