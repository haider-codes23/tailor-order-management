/**
 * Sales Approval MSW Handlers
 * src/mocks/handlers/salesApprovalHandlers.js
 *
 * Phase 14: QA + Client Approval + Dispatch
 * Mock Service Worker handlers for Sales approval endpoints
 */

import { http, HttpResponse } from "msw"
import { appConfig } from "@/config/appConfig"
import { mockOrders, mockOrderItems } from "../data/mockOrders"
import { mockUsers } from "../data/mockUser"
import { SECTION_STATUS, ORDER_ITEM_STATUS } from "@/constants/orderConstants"

const BASE_URL = `${appConfig.apiBaseUrl}/sales`

// Helper functions
const findOrderItem = (orderItemId) => mockOrderItems.find((oi) => oi.id === orderItemId)
const findOrderItemIndex = (orderItemId) => mockOrderItems.findIndex((oi) => oi.id === orderItemId)
const findOrder = (orderId) => mockOrders.find((o) => o.id === orderId)
const findOrderIndex = (orderId) => mockOrders.findIndex((o) => o.id === orderId)
const findOrderByOrderItem = (orderItem) => mockOrders.find((o) => o.id === orderItem.orderId)
const findUser = (userId) => mockUsers.find((u) => u.id === parseInt(userId))

// Check if all sections of an order item are CLIENT_APPROVED
const checkAllSectionsApproved = (orderItem) => {
  if (!orderItem.sectionStatuses) return false
  return Object.values(orderItem.sectionStatuses).every(
    (s) => s.status === SECTION_STATUS.CLIENT_APPROVED
  )
}

// Check if all order items of an order are READY_FOR_DISPATCH
const checkAllItemsReadyForDispatch = (order) => {
  const orderItems = mockOrderItems.filter((oi) => oi.orderId === order.id)
  return orderItems.every((oi) => oi.status === ORDER_ITEM_STATUS.READY_FOR_DISPATCH)
}

// ============================================================================
// GET /api/sales/ready-for-client - Sections ready to send to client
// ============================================================================
const getSectionsReadyForClient = http.get(`${BASE_URL}/ready-for-client`, async () => {
  console.log("📋 GET /api/sales/ready-for-client")

  const sections = []

  mockOrderItems.forEach((orderItem) => {
    if (!orderItem.sectionStatuses) return
    const order = findOrderByOrderItem(orderItem)
    if (!order) return

    Object.entries(orderItem.sectionStatuses).forEach(([sectionKey, sectionData]) => {
      if (sectionData.status === SECTION_STATUS.READY_FOR_CLIENT_APPROVAL) {
        sections.push({
          orderItemId: orderItem.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customer?.name || "Unknown",
          customerPhone: order.customer?.phone,
          productName: orderItem.productName,
          productSku: orderItem.productSku,
          sectionName: sectionKey,
          sectionDisplayName: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
          status: sectionData.status,
          qaData: sectionData.qaData,
          fwdDate: order.fwdDate,
        })
      }
    })
  })

  console.log(`✅ Found ${sections.length} sections ready for client`)
  return HttpResponse.json({ success: true, data: sections })
})

// ============================================================================
// GET /api/sales/awaiting-approval - Sections sent to client, awaiting response
// ============================================================================
const getSectionsAwaitingApproval = http.get(`${BASE_URL}/awaiting-approval`, async () => {
  console.log("📋 GET /api/sales/awaiting-approval")

  const sections = []

  mockOrderItems.forEach((orderItem) => {
    if (!orderItem.sectionStatuses) return
    const order = findOrderByOrderItem(orderItem)
    if (!order) return

    Object.entries(orderItem.sectionStatuses).forEach(([sectionKey, sectionData]) => {
      if (sectionData.status === SECTION_STATUS.AWAITING_CLIENT_APPROVAL) {
        sections.push({
          orderItemId: orderItem.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customer?.name || "Unknown",
          customerPhone: order.customer?.phone,
          productName: orderItem.productName,
          sectionName: sectionKey,
          sectionDisplayName: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
          status: sectionData.status,
          qaData: sectionData.qaData,
          sentToClientAt: sectionData.sentToClientAt,
          sentToClientBy: sectionData.sentToClientBy,
          fwdDate: order.fwdDate,
        })
      }
    })
  })

  console.log(`✅ Found ${sections.length} sections awaiting client approval`)
  return HttpResponse.json({ success: true, data: sections })
})

// ============================================================================
// GET /api/sales/stats - Sales approval statistics
// ============================================================================
const getSalesApprovalStats = http.get(`${BASE_URL}/stats`, async () => {
  console.log("📊 GET /api/sales/stats")

  let readyToSend = 0
  let awaitingResponse = 0
  let approvedToday = 0
  const today = new Date().toDateString()

  mockOrderItems.forEach((orderItem) => {
    if (!orderItem.sectionStatuses) return

    Object.values(orderItem.sectionStatuses).forEach((sectionData) => {
      if (sectionData.status === SECTION_STATUS.READY_FOR_CLIENT_APPROVAL) {
        readyToSend++
      } else if (sectionData.status === SECTION_STATUS.AWAITING_CLIENT_APPROVAL) {
        awaitingResponse++
      } else if (sectionData.status === SECTION_STATUS.CLIENT_APPROVED) {
        if (sectionData.clientApprovedAt) {
          const approvedDate = new Date(sectionData.clientApprovedAt).toDateString()
          if (approvedDate === today) approvedToday++
        }
      }
    })
  })

  return HttpResponse.json({
    success: true,
    data: { readyToSend, awaitingResponse, approvedToday },
  })
})

// ============================================================================
// GET /api/sales/order-item/:orderItemId - Order item approval details
// ============================================================================
const getOrderItemApprovalDetails = http.get(
  `${BASE_URL}/order-item/:orderItemId`,
  async ({ params }) => {
    const { orderItemId } = params
    console.log(`📋 GET /api/sales/order-item/${orderItemId}`)

    const orderItem = findOrderItem(orderItemId)
    if (!orderItem) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const order = findOrderByOrderItem(orderItem)

    // Build sections array with full details
    const sections = Object.entries(orderItem.sectionStatuses || {}).map(
      ([sectionKey, sectionData]) => ({
        sectionName: sectionKey,
        sectionDisplayName: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
        status: sectionData.status,
        qaData: sectionData.qaData,
        sentToClientAt: sectionData.sentToClientAt,
        sentToClientBy: sectionData.sentToClientBy,
        clientApprovedAt: sectionData.clientApprovedAt,
        clientApprovedBy: sectionData.clientApprovedBy,
        clientNotes: sectionData.clientNotes,
      })
    )

    return HttpResponse.json({
      success: true,
      data: {
        orderItemId: orderItem.id,
        orderId: order?.id,
        orderNumber: order?.orderNumber,
        customerName: order?.customer?.name,
        customerPhone: order?.customer?.phone,
        customerEmail: order?.customer?.email,
        productName: orderItem.productName,
        productSku: orderItem.productSku,
        size: orderItem.size,
        status: orderItem.status,
        fwdDate: order?.fwdDate,
        sections,
      },
    })
  }
)

// ============================================================================
// POST /api/sales/order-item/:orderItemId/section/:sectionName/send-to-client
// ============================================================================
const sendSectionToClient = http.post(
  `${BASE_URL}/order-item/:orderItemId/section/:sectionName/send-to-client`,
  async ({ params, request }) => {
    const { orderItemId, sectionName } = params
    const body = await request.json()
    const { sentBy } = body
    const now = new Date().toISOString()

    console.log(`📤 POST send to client: ${orderItemId}/${sectionName}`)

    const orderItemIndex = findOrderItemIndex(orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const sectionKey = sectionName.toLowerCase()
    const sectionData = mockOrderItems[orderItemIndex].sectionStatuses?.[sectionKey]
    if (!sectionData) {
      return HttpResponse.json({ success: false, error: "Section not found" }, { status: 404 })
    }

    if (sectionData.status !== SECTION_STATUS.READY_FOR_CLIENT_APPROVAL) {
      return HttpResponse.json(
        { success: false, error: "Section must be in READY_FOR_CLIENT_APPROVAL status" },
        { status: 400 }
      )
    }

    // Update section status
    mockOrderItems[orderItemIndex].sectionStatuses[sectionKey] = {
      ...sectionData,
      status: SECTION_STATUS.AWAITING_CLIENT_APPROVAL,
      sentToClientAt: now,
      sentToClientBy: sentBy,
      updatedAt: now,
    }

    // Add timeline entry
    const user = findUser(sentBy)
    const displayName = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)
    mockOrderItems[orderItemIndex].timeline = mockOrderItems[orderItemIndex].timeline || []
    mockOrderItems[orderItemIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: `${displayName} sent to client for approval by ${user?.name || "Sales"}`,
      user: user?.name || "Sales",
      timestamp: now,
    })

    console.log(`✅ ${displayName} sent to client`)
    return HttpResponse.json({
      success: true,
      message: `${displayName} sent to client for approval`,
      data: { sectionName: sectionKey, status: SECTION_STATUS.AWAITING_CLIENT_APPROVAL },
    })
  }
)

// ============================================================================
// POST /api/sales/order-item/:orderItemId/section/:sectionName/client-approved
// ============================================================================
const markSectionClientApproved = http.post(
  `${BASE_URL}/order-item/:orderItemId/section/:sectionName/client-approved`,
  async ({ params, request }) => {
    const { orderItemId, sectionName } = params
    const body = await request.json()
    const { approvedBy, clientNotes } = body
    const now = new Date().toISOString()

    console.log(`✅ POST client approved: ${orderItemId}/${sectionName}`)

    const orderItemIndex = findOrderItemIndex(orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const sectionKey = sectionName.toLowerCase()
    const sectionData = mockOrderItems[orderItemIndex].sectionStatuses?.[sectionKey]
    if (!sectionData) {
      return HttpResponse.json({ success: false, error: "Section not found" }, { status: 404 })
    }

    if (sectionData.status !== SECTION_STATUS.AWAITING_CLIENT_APPROVAL) {
      return HttpResponse.json(
        { success: false, error: "Section must be in AWAITING_CLIENT_APPROVAL status" },
        { status: 400 }
      )
    }

    // Update section status
    mockOrderItems[orderItemIndex].sectionStatuses[sectionKey] = {
      ...sectionData,
      status: SECTION_STATUS.CLIENT_APPROVED,
      clientApprovedAt: now,
      clientApprovedBy: approvedBy,
      clientNotes: clientNotes || null,
      updatedAt: now,
    }

    const displayName = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)
    mockOrderItems[orderItemIndex].timeline = mockOrderItems[orderItemIndex].timeline || []
    mockOrderItems[orderItemIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: `${displayName} approved by client`,
      user: "Client",
      timestamp: now,
    })

    // Check if all sections are now CLIENT_APPROVED
    const allApproved = checkAllSectionsApproved(mockOrderItems[orderItemIndex])
    let orderReadyForDispatch = false

    if (allApproved) {
      mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.READY_FOR_DISPATCH
      mockOrderItems[orderItemIndex].timeline.push({
        id: `log-${Date.now() + 1}`,
        action: "All sections approved by client - Ready for dispatch",
        user: "System",
        timestamp: now,
      })

      // Check if order is ready for dispatch
      const order = findOrderByOrderItem(mockOrderItems[orderItemIndex])
      if (order) {
        const orderIndex = findOrderIndex(order.id)
        if (checkAllItemsReadyForDispatch(order)) {
          mockOrders[orderIndex].status = ORDER_ITEM_STATUS.READY_FOR_DISPATCH
          orderReadyForDispatch = true
          mockOrders[orderIndex].timeline = mockOrders[orderIndex].timeline || []
          mockOrders[orderIndex].timeline.push({
            id: `log-${Date.now() + 2}`,
            action: "All items approved - Order ready for dispatch",
            user: "System",
            timestamp: now,
          })
        }
      }
    }

    console.log(`✅ ${displayName} approved. All sections approved: ${allApproved}`)
    return HttpResponse.json({
      success: true,
      message: `${displayName} approved by client`,
      data: {
        sectionName: sectionKey,
        status: SECTION_STATUS.CLIENT_APPROVED,
        allSectionsApproved: allApproved,
        orderItemStatus: mockOrderItems[orderItemIndex].status,
        orderReadyForDispatch,
      },
    })
  }
)

// ============================================================================
// POST /api/sales/order-item/:orderItemId/send-all-to-client - Bulk send
// ============================================================================
const sendAllSectionsToClient = http.post(
  `${BASE_URL}/order-item/:orderItemId/send-all-to-client`,
  async ({ params, request }) => {
    const { orderItemId } = params
    const body = await request.json()
    const { sentBy } = body
    const now = new Date().toISOString()

    console.log(`📤 POST send all to client: ${orderItemId}`)

    const orderItemIndex = findOrderItemIndex(orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const sectionStatuses = mockOrderItems[orderItemIndex].sectionStatuses || {}
    const updatedSections = []

    Object.entries(sectionStatuses).forEach(([sectionKey, sectionData]) => {
      if (sectionData.status === SECTION_STATUS.READY_FOR_CLIENT_APPROVAL) {
        mockOrderItems[orderItemIndex].sectionStatuses[sectionKey] = {
          ...sectionData,
          status: SECTION_STATUS.AWAITING_CLIENT_APPROVAL,
          sentToClientAt: now,
          sentToClientBy: sentBy,
          updatedAt: now,
        }
        updatedSections.push(sectionKey)
      }
    })

    if (updatedSections.length > 0) {
      const user = findUser(sentBy)
      mockOrderItems[orderItemIndex].timeline = mockOrderItems[orderItemIndex].timeline || []
      mockOrderItems[orderItemIndex].timeline.push({
        id: `log-${Date.now()}`,
        action: `All sections (${updatedSections.join(", ")}) sent to client by ${user?.name || "Sales"}`,
        user: user?.name || "Sales",
        timestamp: now,
      })
    }

    console.log(`✅ Sent ${updatedSections.length} sections to client`)
    return HttpResponse.json({
      success: true,
      message: `${updatedSections.length} sections sent to client`,
      data: { updatedSections },
    })
  }
)

// ============================================================================
// POST /api/sales/order-item/:orderItemId/approve-all - Bulk approve
// ============================================================================
const approveAllSections = http.post(
  `${BASE_URL}/order-item/:orderItemId/approve-all`,
  async ({ params, request }) => {
    const { orderItemId } = params
    const body = await request.json()
    const { approvedBy, clientNotes } = body
    const now = new Date().toISOString()

    console.log(`✅ POST approve all: ${orderItemId}`)

    const orderItemIndex = findOrderItemIndex(orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const sectionStatuses = mockOrderItems[orderItemIndex].sectionStatuses || {}
    const updatedSections = []

    Object.entries(sectionStatuses).forEach(([sectionKey, sectionData]) => {
      if (sectionData.status === SECTION_STATUS.AWAITING_CLIENT_APPROVAL) {
        mockOrderItems[orderItemIndex].sectionStatuses[sectionKey] = {
          ...sectionData,
          status: SECTION_STATUS.CLIENT_APPROVED,
          clientApprovedAt: now,
          clientApprovedBy: approvedBy,
          clientNotes: clientNotes || null,
          updatedAt: now,
        }
        updatedSections.push(sectionKey)
      }
    })

    if (updatedSections.length > 0) {
      mockOrderItems[orderItemIndex].timeline = mockOrderItems[orderItemIndex].timeline || []
      mockOrderItems[orderItemIndex].timeline.push({
        id: `log-${Date.now()}`,
        action: `All sections (${updatedSections.join(", ")}) approved by client`,
        user: "Client",
        timestamp: now,
      })
    }

    // Check if all sections are now approved
    const allApproved = checkAllSectionsApproved(mockOrderItems[orderItemIndex])
    let orderReadyForDispatch = false

    if (allApproved) {
      mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.READY_FOR_DISPATCH
      mockOrderItems[orderItemIndex].timeline.push({
        id: `log-${Date.now() + 1}`,
        action: "All sections approved - Ready for dispatch",
        user: "System",
        timestamp: now,
      })

      const order = findOrderByOrderItem(mockOrderItems[orderItemIndex])
      if (order) {
        const orderIndex = findOrderIndex(order.id)
        if (checkAllItemsReadyForDispatch(order)) {
          mockOrders[orderIndex].status = ORDER_ITEM_STATUS.READY_FOR_DISPATCH
          orderReadyForDispatch = true
        }
      }
    }

    console.log(`✅ Approved ${updatedSections.length} sections. All approved: ${allApproved}`)
    return HttpResponse.json({
      success: true,
      message: `${updatedSections.length} sections approved`,
      data: {
        updatedSections,
        allSectionsApproved: allApproved,
        orderItemStatus: mockOrderItems[orderItemIndex].status,
        orderReadyForDispatch,
      },
    })
  }
)

// ============================================================================
// EXPORT HANDLERS
// ============================================================================

export const salesApprovalHandlers = [
  getSectionsReadyForClient,
  getSectionsAwaitingApproval,
  getSalesApprovalStats,
  getOrderItemApprovalDetails,
  sendSectionToClient,
  markSectionClientApproved,
  sendAllSectionsToClient,
  approveAllSections,
]

export default salesApprovalHandlers
