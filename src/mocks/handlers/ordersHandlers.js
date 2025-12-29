/**
 * MSW Handlers for Orders
 * Handles all order-related API endpoints
 */

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
import { ORDER_ITEM_STATUS, ORDER_SOURCE } from "@/constants/orderConstants"

const BASE_URL = "/api"

export const ordersHandlers = [
  // ==================== ORDERS ====================

  // GET /api/orders - List all orders with filtering
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

    // Search by customer name or order number
    if (search) {
      filtered = filtered.filter(
        (o) =>
          o.customerName.toLowerCase().includes(search) ||
          o.orderNumber.toLowerCase().includes(search)
      )
    }

    // Filter by item status (if any item has this status)
    if (status) {
      filtered = filtered.filter((o) => {
        const items = getOrderItemsByOrderId(o.id)
        return items.some((item) => item.status === status)
      })
    }

    // Filter by source
    if (source) {
      filtered = filtered.filter((o) => o.source === source)
    }

    // Filter by urgent
    if (urgent) {
      filtered = filtered.filter((o) => o.urgent === urgent)
    }

    // Filter by consultant
    if (consultantId) {
      filtered = filtered.filter((o) => o.consultantId === consultantId)
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginated = filtered.slice(startIndex, startIndex + limit)

    // Add computed fields to each order
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

  // GET /api/orders/:id - Get single order with items
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

  // POST /api/orders - Create new order (manual)
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

    // Create order items
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
          status: ORDER_ITEM_STATUS.RECEIVED,
          style: { type: "original", details: {}, attachments: [] },
          color: { type: "original", details: "", attachments: [] },
          fabric: { type: "original", details: "", attachments: [] },
          measurementCategories: [],
          measurements: {},
          orderFormGenerated: false,
          orderFormApproved: false,
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

    return HttpResponse.json(getOrderWithItems(newOrder.id), { status: 201 })
  }),

  // PUT /api/orders/:id - Update order
  http.put(`${BASE_URL}/orders/:id`, async ({ params, request }) => {
    const data = await request.json()
    const orderIndex = mockOrders.findIndex((o) => o.id === params.id)

    if (orderIndex === -1) {
      return HttpResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const now = new Date().toISOString()
    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      ...data,
      updatedAt: now,
    }

    return HttpResponse.json(getOrderWithItems(params.id))
  }),

  // DELETE /api/orders/:id - Delete order
  http.delete(`${BASE_URL}/orders/:id`, ({ params }) => {
    const orderIndex = mockOrders.findIndex((o) => o.id === params.id)

    if (orderIndex === -1) {
      return HttpResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Delete associated items
    const order = mockOrders[orderIndex]
    order.itemIds.forEach((itemId) => {
      const itemIndex = mockOrderItems.findIndex((i) => i.id === itemId)
      if (itemIndex !== -1) mockOrderItems.splice(itemIndex, 1)
    })

    mockOrders.splice(orderIndex, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== PAYMENTS ====================

  // POST /api/orders/:id/payments - Add payment
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

    // Update payment status
    const totalPaid = mockOrders[orderIndex].payments.reduce((sum, p) => sum + p.amount, 0)
    const totalAmount = mockOrders[orderIndex].totalAmount
    if (totalPaid >= totalAmount) {
      mockOrders[orderIndex].paymentStatus = totalPaid > totalAmount ? "EXTRA_PAID" : "PAID"
    }

    return HttpResponse.json(getOrderWithItems(params.id))
  }),

  // DELETE /api/orders/:id/payments/:paymentId - Delete payment
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

    // Recalculate payment status
    const totalPaid = mockOrders[orderIndex].payments.reduce((sum, p) => sum + p.amount, 0)
    const totalAmount = mockOrders[orderIndex].totalAmount
    if (totalPaid >= totalAmount) {
      mockOrders[orderIndex].paymentStatus = totalPaid > totalAmount ? "EXTRA_PAID" : "PAID"
    } else {
      mockOrders[orderIndex].paymentStatus = "PENDING"
    }

    return HttpResponse.json(getOrderWithItems(params.orderId))
  }),

  // ==================== ORDER ITEMS ====================

  // GET /api/order-items/:id - Get single order item
  http.get(`${BASE_URL}/order-items/:id`, ({ params }) => {
    const item = getOrderItemById(params.id)

    if (!item) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    return HttpResponse.json(item)
  }),

  // PUT /api/order-items/:id - Update order item
  http.put(`${BASE_URL}/order-items/:id`, async ({ params, request }) => {
    const data = await request.json()
    const itemIndex = mockOrderItems.findIndex((i) => i.id === params.id)

    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const now = new Date().toISOString()
    const oldStatus = mockOrderItems[itemIndex].status

    mockOrderItems[itemIndex] = {
      ...mockOrderItems[itemIndex],
      ...data,
      updatedAt: now,
    }

    // Add timeline entry if status changed
    if (data.status && data.status !== oldStatus) {
      mockOrderItems[itemIndex].timeline.push({
        id: generateTimelineId(),
        action: `Status changed to ${data.status}`,
        user: data.updatedBy || "System",
        timestamp: now,
      })
    }

    return HttpResponse.json(mockOrderItems[itemIndex])
  }),

  // POST /api/order-items/:id/timeline - Add timeline entry
  http.post(`${BASE_URL}/order-items/:id/timeline`, async ({ params, request }) => {
    const data = await request.json()
    const itemIndex = mockOrderItems.findIndex((i) => i.id === params.id)

    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const newEntry = {
      id: generateTimelineId(),
      action: data.action,
      user: data.user,
      timestamp: new Date().toISOString(),
    }

    mockOrderItems[itemIndex].timeline.push(newEntry)
    mockOrderItems[itemIndex].updatedAt = new Date().toISOString()

    return HttpResponse.json(mockOrderItems[itemIndex])
  }),

  // POST /api/orders/:id/items - Add item to existing order
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
      status: ORDER_ITEM_STATUS.RECEIVED,
      style: { type: "original", details: {}, attachments: [] },
      color: { type: "original", details: "", attachments: [] },
      fabric: { type: "original", details: "", attachments: [] },
      measurementCategories: [],
      measurements: {},
      orderFormGenerated: false,
      orderFormApproved: false,
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

    return HttpResponse.json(newItem, { status: 201 })
  }),

  // DELETE /api/order-items/:id - Delete order item
  http.delete(`${BASE_URL}/order-items/:id`, ({ params }) => {
    const itemIndex = mockOrderItems.findIndex((i) => i.id === params.id)

    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const item = mockOrderItems[itemIndex]

    // Remove from order's itemIds
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

  // POST /api/order-items/:id/approve-form - Mark form as approved
  http.post(`${BASE_URL}/order-items/:id/approve-form`, async ({ params, request }) => {
    const data = await request.json()
    const itemIndex = mockOrderItems.findIndex((i) => i.id === params.id)

    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const now = new Date().toISOString()
    mockOrderItems[itemIndex].orderFormApproved = true
    mockOrderItems[itemIndex].status = ORDER_ITEM_STATUS.INVENTORY_CHECK
    mockOrderItems[itemIndex].updatedAt = now
    mockOrderItems[itemIndex].timeline.push({
      id: generateTimelineId(),
      action: "Customer approved order form",
      user: data.approvedBy || "System",
      timestamp: now,
    })

    return HttpResponse.json(mockOrderItems[itemIndex])
  }),

  // POST /api/order-items/:id/generate-form - Generate order form
  http.post(`${BASE_URL}/order-items/:id/generate-form`, async ({ params, request }) => {
    const data = await request.json()
    const itemIndex = mockOrderItems.findIndex((i) => i.id === params.id)

    if (itemIndex === -1) {
      return HttpResponse.json({ error: "Order item not found" }, { status: 404 })
    }

    const now = new Date().toISOString()
    mockOrderItems[itemIndex] = {
      ...mockOrderItems[itemIndex],
      style: data.style || mockOrderItems[itemIndex].style,
      color: data.color || mockOrderItems[itemIndex].color,
      fabric: data.fabric || mockOrderItems[itemIndex].fabric,
      measurementCategories: data.measurementCategories || [],
      measurements: data.measurements || {},
      orderFormGenerated: true,
      status: ORDER_ITEM_STATUS.AWAITING_CUSTOMER_FORM_APPROVAL,
      updatedAt: now,
    }

    mockOrderItems[itemIndex].timeline.push({
      id: generateTimelineId(),
      action: "Order form generated",
      user: data.generatedBy || "System",
      timestamp: now,
    })

    return HttpResponse.json(mockOrderItems[itemIndex])
  }),
]
