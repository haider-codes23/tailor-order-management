/**
 * Dispatch MSW Handlers - Phase 15
 * src/mocks/handlers/dispatchHandlers.js
 *
 * Handles the dispatch workflow after Sales approves payments:
 *   READY_FOR_DISPATCH → DISPATCHED → COMPLETED
 *
 * Endpoints:
 *   GET  /api/dispatch/queue         - Orders ready for dispatch
 *   GET  /api/dispatch/dispatched    - Orders already dispatched
 *   GET  /api/dispatch/completed     - Completed orders
 *   GET  /api/dispatch/stats         - Dashboard statistics
 *   POST /api/dispatch/order/:orderId/dispatch  - Mark order as dispatched
 *   POST /api/dispatch/order/:orderId/complete  - Mark order as completed
 */

import { http, HttpResponse } from "msw"
import { appConfig } from "@/config/appConfig"
import { mockOrders, mockOrderItems, getOrderWithItems, generateTimelineId } from "../data/mockOrders"
import { mockUsers } from "../data/mockUser"
import { ORDER_STATUS, ORDER_ITEM_STATUS } from "@/constants/orderConstants"

const BASE_URL = `${appConfig.apiBaseUrl}/dispatch`

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const findOrder = (orderId) => mockOrders.find((o) => o.id === orderId)
const findOrderIndex = (orderId) => mockOrders.findIndex((o) => o.id === orderId)
const findUser = (userId) =>
  mockUsers.find((u) => u.id === userId || u.id === parseInt(userId) || u.id === String(userId))

const getOrderItems = (orderId) => mockOrderItems.filter((oi) => oi.orderId === orderId)

/**
 * Build enriched order object for dispatch API responses
 */
const buildDispatchOrderResponse = (order) => {
  const items = getOrderItems(order.id).map((oi) => ({
    id: oi.id,
    productName: oi.productName,
    productSku: oi.productSku,
    productImage: oi.productImage,
    size: oi.size,
    quantity: oi.quantity,
    unitPrice: oi.unitPrice,
    status: oi.status,
  }))

  const totalPaid = (order.payments || []).reduce((sum, p) => sum + p.amount, 0)

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    source: order.source,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    destination: order.destination,
    shippingAddress: order.shippingAddress || null,
    fwdDate: order.fwdDate,
    totalAmount: order.totalAmount,
    currency: order.currency || "PKR",
    totalPaid,
    remainingAmount: order.totalAmount - totalPaid,
    paymentStatus: order.paymentStatus,
    items,
    itemCount: items.length,
    urgent: order.urgent,
    // Dispatch-specific data
    dispatchData: order.dispatchData || null,
    // Timestamps
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}

// ============================================================================
// GET /api/dispatch/queue - Orders ready for dispatch
// ============================================================================
const getDispatchQueue = http.get(`${BASE_URL}/queue`, async () => {
  console.log("📦 GET /api/dispatch/queue")

  const orders = mockOrders
    .filter((o) => o.status === ORDER_STATUS.READY_FOR_DISPATCH)
    .map(buildDispatchOrderResponse)
    .sort((a, b) => {
      // Urgent orders first, then by FWD date
      if (a.urgent && !b.urgent) return -1
      if (!a.urgent && b.urgent) return 1
      return new Date(a.fwdDate || 0) - new Date(b.fwdDate || 0)
    })

  console.log(`✅ Found ${orders.length} orders ready for dispatch`)
  return HttpResponse.json({ success: true, data: orders })
})

// ============================================================================
// GET /api/dispatch/dispatched - Orders already dispatched
// ============================================================================
const getDispatched = http.get(`${BASE_URL}/dispatched`, async () => {
  console.log("🚚 GET /api/dispatch/dispatched")

  const orders = mockOrders
    .filter((o) => o.status === ORDER_STATUS.DISPATCHED)
    .map(buildDispatchOrderResponse)
    .sort((a, b) => {
      // Most recently dispatched first
      const dateA = a.dispatchData?.dispatchedAt || a.updatedAt
      const dateB = b.dispatchData?.dispatchedAt || b.updatedAt
      return new Date(dateB) - new Date(dateA)
    })

  console.log(`✅ Found ${orders.length} dispatched orders`)
  return HttpResponse.json({ success: true, data: orders })
})

// ============================================================================
// GET /api/dispatch/completed - Completed orders
// ============================================================================
const getCompleted = http.get(`${BASE_URL}/completed`, async () => {
  console.log("✅ GET /api/dispatch/completed")

  const orders = mockOrders
    .filter((o) => o.status === ORDER_STATUS.COMPLETED)
    .map(buildDispatchOrderResponse)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  console.log(`✅ Found ${orders.length} completed orders`)
  return HttpResponse.json({ success: true, data: orders })
})

// ============================================================================
// GET /api/dispatch/stats - Dashboard statistics
// ============================================================================
const getDispatchStats = http.get(`${BASE_URL}/stats`, async () => {
  console.log("📊 GET /api/dispatch/stats")

  const readyForDispatch = mockOrders.filter(
    (o) => o.status === ORDER_STATUS.READY_FOR_DISPATCH
  ).length

  const today = new Date().toISOString().split("T")[0]
  const dispatchedToday = mockOrders.filter((o) => {
    if (o.status !== ORDER_STATUS.DISPATCHED && o.status !== ORDER_STATUS.COMPLETED) return false
    const dispatchDate = o.dispatchData?.dispatchDate || ""
    return dispatchDate === today
  }).length

  const totalDispatched = mockOrders.filter(
    (o) => o.status === ORDER_STATUS.DISPATCHED
  ).length

  const totalCompleted = mockOrders.filter(
    (o) => o.status === ORDER_STATUS.COMPLETED
  ).length

  return HttpResponse.json({
    success: true,
    data: {
      readyForDispatch,
      dispatchedToday,
      totalDispatched,
      totalCompleted,
    },
  })
})

// ============================================================================
// POST /api/dispatch/order/:orderId/dispatch - Mark order as dispatched
// ============================================================================
const dispatchOrder = http.post(
  `${BASE_URL}/order/:orderId/dispatch`,
  async ({ params, request }) => {
    const { orderId } = params
    const { courier, trackingNumber, dispatchDate, notes, dispatchedBy } = await request.json()

    console.log(`🚚 POST /api/dispatch/order/${orderId}/dispatch`)

    const orderIndex = findOrderIndex(orderId)
    if (orderIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = mockOrders[orderIndex]

    // Validate status
    if (order.status !== ORDER_STATUS.READY_FOR_DISPATCH) {
      return HttpResponse.json(
        {
          success: false,
          error: `Order must be in READY_FOR_DISPATCH status. Current: ${order.status}`,
        },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!courier || !trackingNumber || !dispatchDate) {
      return HttpResponse.json(
        { success: false, error: "Courier, tracking number, and dispatch date are required" },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const dispatchedByUser = findUser(dispatchedBy)

    // Update order status
    mockOrders[orderIndex] = {
      ...order,
      status: ORDER_STATUS.DISPATCHED,
      actualShippingDate: dispatchDate,
      preTrackingId: trackingNumber,
      dispatchData: {
        courier,
        trackingNumber,
        dispatchDate,
        notes: notes || "",
        dispatchedBy,
        dispatchedByName: dispatchedByUser?.name || "Dispatch User",
        dispatchedAt: now,
      },
      updatedAt: now,
    }

    // Update all order items to DISPATCHED
    const orderItems = getOrderItems(orderId)
    orderItems.forEach((oi) => {
      const itemIndex = mockOrderItems.findIndex((i) => i.id === oi.id)
      if (itemIndex !== -1) {
        mockOrderItems[itemIndex] = {
          ...mockOrderItems[itemIndex],
          status: ORDER_ITEM_STATUS.DISPATCHED,
          updatedAt: now,
        }

        // Add timeline entry to each item
        if (!mockOrderItems[itemIndex].timeline) {
          mockOrderItems[itemIndex].timeline = []
        }
        mockOrderItems[itemIndex].timeline.push({
          id: generateTimelineId(),
          action: `Order dispatched via ${courier} — Tracking: ${trackingNumber}`,
          user: dispatchedByUser?.name || "Dispatch User",
          timestamp: now,
        })
      }
    })

    console.log(
      `✅ Order ${order.orderNumber} dispatched via ${courier} — Tracking: ${trackingNumber}`
    )

    return HttpResponse.json({
      success: true,
      message: "Order dispatched successfully",
      data: buildDispatchOrderResponse(mockOrders[orderIndex]),
    })
  }
)

// ============================================================================
// POST /api/dispatch/order/:orderId/complete - Mark order as completed
// ============================================================================
const completeOrder = http.post(
  `${BASE_URL}/order/:orderId/complete`,
  async ({ params, request }) => {
    const { orderId } = params
    const { completedBy } = await request.json()

    console.log(`✅ POST /api/dispatch/order/${orderId}/complete`)

    const orderIndex = findOrderIndex(orderId)
    if (orderIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = mockOrders[orderIndex]

    // Validate status
    if (order.status !== ORDER_STATUS.DISPATCHED) {
      return HttpResponse.json(
        {
          success: false,
          error: `Order must be in DISPATCHED status. Current: ${order.status}`,
        },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const completedByUser = findUser(completedBy)

    // Update order status
    mockOrders[orderIndex] = {
      ...order,
      status: ORDER_STATUS.COMPLETED,
      completedAt: now,
      completedBy,
      updatedAt: now,
    }

    // Update all order items to COMPLETED
    const orderItems = getOrderItems(orderId)
    orderItems.forEach((oi) => {
      const itemIndex = mockOrderItems.findIndex((i) => i.id === oi.id)
      if (itemIndex !== -1) {
        mockOrderItems[itemIndex] = {
          ...mockOrderItems[itemIndex],
          status: ORDER_ITEM_STATUS.COMPLETED,
          updatedAt: now,
        }

        if (!mockOrderItems[itemIndex].timeline) {
          mockOrderItems[itemIndex].timeline = []
        }
        mockOrderItems[itemIndex].timeline.push({
          id: generateTimelineId(),
          action: "Order marked as completed — delivery confirmed",
          user: completedByUser?.name || "Dispatch User",
          timestamp: now,
        })
      }
    })

    console.log(`✅ Order ${order.orderNumber} marked as COMPLETED`)

    return HttpResponse.json({
      success: true,
      message: "Order completed successfully",
      data: buildDispatchOrderResponse(mockOrders[orderIndex]),
    })
  }
)

// ============================================================================
// EXPORT
// ============================================================================

export const dispatchHandlers = [
  getDispatchQueue,
  getDispatched,
  getCompleted,
  getDispatchStats,
  dispatchOrder,
  completeOrder,
]
