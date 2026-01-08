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
    return HttpResponse.json({ success: true, data: mockOrderItems[itemIndex] })
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
]
