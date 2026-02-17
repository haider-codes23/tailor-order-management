/**
 * Sales Approval MSW Handlers - Phase 14 Redesign (COMPLETE REWRITE)
 * src/mocks/handlers/salesApprovalHandlers.js
 *
 * NEW: Order-level approval workflow (not section-level)
 *
 * Flow:
 *   QA sends order → READY_FOR_CLIENT_APPROVAL
 *   Sales sends to client → AWAITING_CLIENT_APPROVAL
 *   Client responds:
 *     ✓ Approved → upload screenshots → AWAITING_ACCOUNT_APPROVAL → verify payments → READY_FOR_DISPATCH
 *     📹 Re-video → store reVideoRequest on order item → QA Tab 2
 *     ✂️ Alteration → reset sections to production → ALTERATION_REQUIRED
 *     🔄 Start from scratch → reset everything → INVENTORY_CHECK
 *     ❌ Cancel → CANCELLED_BY_CLIENT
 *
 * Endpoints:
 *   GET  /api/sales/approval-queue     - Orders ready to send to client (Tab 1)
 *   GET  /api/sales/awaiting-response  - Orders sent to client (Tab 2)
 *   GET  /api/sales/awaiting-payment   - Orders approved, verifying payments (Tab 3)
 *   GET  /api/sales/stats              - Dashboard statistics
 *   GET  /api/sales/order/:orderId     - Full order details for approval
 *   POST /api/sales/order/:orderId/send-to-client       - Mark as sent to client
 *   POST /api/sales/order/:orderId/client-approved       - Client approved + screenshots
 *   POST /api/sales/order/:orderId/request-revideo       - Request re-video from QA
 *   POST /api/sales/order/:orderId/request-alteration    - Request alteration (back to production)
 *   POST /api/sales/order/:orderId/client-rejected       - Client rejected (cancel order)
 *   POST /api/sales/order/:orderId/start-from-scratch    - Reset order to inventory check
 *   POST /api/sales/order/:orderId/approve-payments      - Verify payments → dispatch
 */

import { http, HttpResponse } from "msw"
import { appConfig } from "@/config/appConfig"
import { mockOrders, mockOrderItems } from "../data/mockOrders"
import { mockUsers } from "../data/mockUser"
import { ORDER_STATUS, ORDER_ITEM_STATUS, SECTION_STATUS } from "@/constants/orderConstants"
import { mockProductionTasks, mockProductionAssignments } from "../data/mockProductionTasks"
import { mockProcurementDemands } from "../data/mockProcurementDemands"

const BASE_URL = `${appConfig.apiBaseUrl}/sales`

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const findOrder = (orderId) => mockOrders.find((o) => o.id === orderId)
const findOrderIndex = (orderId) => mockOrders.findIndex((o) => o.id === orderId)
const findUser = (userId) =>
  mockUsers.find((u) => u.id === userId || u.id === parseInt(userId) || u.id === String(userId))

const getOrderItems = (orderId) => mockOrderItems.filter((oi) => oi.orderId === orderId)

/**
 * Build enriched order object for API responses
 * Includes order items with video data, payment summary, etc.
 */
const buildOrderResponse = (order) => {
  const items = getOrderItems(order.id).map((oi) => ({
    id: oi.id,
    productName: oi.productName,
    productSku: oi.productSku,
    productImage: oi.productImage,
    size: oi.size,
    quantity: oi.quantity,
    unitPrice: oi.unitPrice,
    status: oi.status,
    videoData: oi.videoData || null,
    reVideoRequest: oi.reVideoRequest || null,
    sectionStatuses: oi.sectionStatuses || {},
  }))

  const totalPaid = (order.payments || []).reduce((sum, p) => sum + p.amount, 0)

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    destination: order.destination,
    fwdDate: order.fwdDate,
    totalAmount: order.totalAmount,
    totalPaid,
    remainingAmount: order.totalAmount - totalPaid,
    paymentStatus: order.paymentStatus,
    payments: order.payments || [],
    items,
    itemCount: items.length,
    // Sales-specific data
    clientApprovalData: order.clientApprovalData || null,
    cancellationData: order.cancellationData || null,
    // Timestamps
    sentToClientAt: order.sentToClientAt || null,
    sentToClientBy: order.sentToClientBy || null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }
}

// ============================================================================
// GET /api/sales/approval-queue - Orders ready to send to client (Tab 1)
// ============================================================================
const getApprovalQueue = http.get(`${BASE_URL}/approval-queue`, async () => {
  console.log("📋 GET /api/sales/approval-queue")

  const orders = mockOrders
    .filter((o) => o.status === ORDER_STATUS.READY_FOR_CLIENT_APPROVAL)
    .map(buildOrderResponse)
    .sort((a, b) => new Date(a.fwdDate || 0) - new Date(b.fwdDate || 0))

  console.log(`✅ Found ${orders.length} orders ready for client`)
  return HttpResponse.json({ success: true, data: orders })
})

// ============================================================================
// GET /api/sales/awaiting-response - Orders sent to client (Tab 2)
// ============================================================================
const getAwaitingResponse = http.get(`${BASE_URL}/awaiting-response`, async () => {
  console.log("📋 GET /api/sales/awaiting-response")

  const orders = mockOrders
    .filter((o) => o.status === ORDER_STATUS.AWAITING_CLIENT_APPROVAL)
    .map(buildOrderResponse)
    .sort((a, b) => new Date(a.sentToClientAt || 0) - new Date(b.sentToClientAt || 0))

  console.log(`✅ Found ${orders.length} orders awaiting client response`)
  return HttpResponse.json({ success: true, data: orders })
})

// ============================================================================
// GET /api/sales/awaiting-payment - Orders approved, verifying payments (Tab 3)
// ============================================================================
const getAwaitingPayment = http.get(`${BASE_URL}/awaiting-payment`, async () => {
  console.log("📋 GET /api/sales/awaiting-payment")

  const orders = mockOrders
    .filter((o) => o.status === ORDER_STATUS.AWAITING_ACCOUNT_APPROVAL)
    .map(buildOrderResponse)
    .sort((a, b) => new Date(a.fwdDate || 0) - new Date(b.fwdDate || 0))

  console.log(`✅ Found ${orders.length} orders awaiting payment verification`)
  return HttpResponse.json({ success: true, data: orders })
})

// ============================================================================
// GET /api/sales/stats - Dashboard statistics
// ============================================================================
const getSalesStats = http.get(`${BASE_URL}/stats`, async () => {
  console.log("📊 GET /api/sales/stats")

  let readyToSend = 0
  let awaitingResponse = 0
  let paymentPending = 0

  mockOrders.forEach((o) => {
    if (o.status === ORDER_STATUS.READY_FOR_CLIENT_APPROVAL) readyToSend++
    else if (o.status === ORDER_STATUS.AWAITING_CLIENT_APPROVAL) awaitingResponse++
    else if (o.status === ORDER_STATUS.AWAITING_ACCOUNT_APPROVAL) paymentPending++
  })

  console.log(
    `✅ Sales stats: ${readyToSend} ready, ${awaitingResponse} awaiting, ${paymentPending} payment`
  )

  return HttpResponse.json({
    success: true,
    data: { readyToSend, awaitingResponse, paymentPending },
  })
})

// ============================================================================
// GET /api/sales/order/:orderId - Full order details for approval
// ============================================================================
const getOrderDetails = http.get(`${BASE_URL}/order/:orderId`, async ({ params }) => {
  const { orderId } = params
  console.log(`📋 GET /api/sales/order/${orderId}`)

  const order = findOrder(orderId)
  if (!order) {
    return HttpResponse.json({ success: false, error: "Order not found" }, { status: 404 })
  }

  return HttpResponse.json({
    success: true,
    data: buildOrderResponse(order),
  })
})

// ============================================================================
// POST /api/sales/order/:orderId/send-to-client - Mark as sent to client
// ============================================================================
const sendToClient = http.post(
  `${BASE_URL}/order/:orderId/send-to-client`,
  async ({ params, request }) => {
    const { orderId } = params
    const { sentBy } = await request.json()

    console.log(`📤 POST /api/sales/order/${orderId}/send-to-client`)

    const orderIndex = findOrderIndex(orderId)
    if (orderIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = mockOrders[orderIndex]

    // Validate order is in correct status
    if (order.status !== ORDER_STATUS.READY_FOR_CLIENT_APPROVAL) {
      return HttpResponse.json(
        {
          success: false,
          error: `Order must be in READY_FOR_CLIENT_APPROVAL status. Current: ${order.status}`,
        },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const sentByUser = findUser(sentBy)

    // Update order status
    mockOrders[orderIndex].status = ORDER_STATUS.AWAITING_CLIENT_APPROVAL
    mockOrders[orderIndex].sentToClientAt = now
    mockOrders[orderIndex].sentToClientBy = sentBy
    mockOrders[orderIndex].updatedAt = now

    // Update all order items status
    mockOrderItems.forEach((oi, idx) => {
      if (oi.orderId === orderId && oi.status === ORDER_ITEM_STATUS.READY_FOR_CLIENT_APPROVAL) {
        mockOrderItems[idx].status = ORDER_ITEM_STATUS.AWAITING_CLIENT_APPROVAL
        mockOrderItems[idx].updatedAt = now
      }
    })

    // Add timeline entry
    if (!order.timeline) mockOrders[orderIndex].timeline = []
    mockOrders[orderIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: `Order sent to client for approval`,
      user: sentByUser?.name || "Sales User",
      timestamp: now,
    })

    console.log(`✅ Order ${order.orderNumber} sent to client`)

    return HttpResponse.json({
      success: true,
      message: "Order sent to client for approval",
      data: {
        orderId,
        orderNumber: order.orderNumber,
        status: ORDER_STATUS.AWAITING_CLIENT_APPROVAL,
        sentToClientAt: now,
      },
    })
  }
)

// ============================================================================
// POST /api/sales/order/:orderId/client-approved - Client approved + screenshots
// ============================================================================
const clientApproved = http.post(
  `${BASE_URL}/order/:orderId/client-approved`,
  async ({ params, request }) => {
    const { orderId } = params
    const { screenshots, notes, approvedBy } = await request.json()

    console.log(`✅ POST /api/sales/order/${orderId}/client-approved`)

    const orderIndex = findOrderIndex(orderId)
    if (orderIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = mockOrders[orderIndex]

    if (order.status !== ORDER_STATUS.AWAITING_CLIENT_APPROVAL) {
      return HttpResponse.json(
        {
          success: false,
          error: `Order must be in AWAITING_CLIENT_APPROVAL status. Current: ${order.status}`,
        },
        { status: 400 }
      )
    }

    // Validate at least one screenshot
    if (!screenshots || screenshots.length === 0) {
      return HttpResponse.json(
        { success: false, error: "At least one approval screenshot is required" },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const approvedByUser = findUser(approvedBy)

    // Store client approval data on the order
    mockOrders[orderIndex].clientApprovalData = {
      approvalScreenshots: screenshots.map((ss, i) => ({
        id: `ss-${Date.now()}-${i}`,
        name: ss.name,
        dataUrl: ss.dataUrl,
        uploadedAt: now,
        uploadedBy: approvedBy,
      })),
      approvedAt: now,
      approvedBy,
      clientNotes: notes || null,
    }

    // Update order status → AWAITING_ACCOUNT_APPROVAL (payment verification)
    mockOrders[orderIndex].status = ORDER_STATUS.AWAITING_ACCOUNT_APPROVAL
    mockOrders[orderIndex].updatedAt = now

    // Update all order items to CLIENT_APPROVED
    mockOrderItems.forEach((oi, idx) => {
      if (oi.orderId === orderId && oi.status === ORDER_ITEM_STATUS.AWAITING_CLIENT_APPROVAL) {
        mockOrderItems[idx].status = ORDER_ITEM_STATUS.CLIENT_APPROVED
        mockOrderItems[idx].updatedAt = now
      }
    })

    // Timeline
    if (!order.timeline) mockOrders[orderIndex].timeline = []
    mockOrders[orderIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: `Client approved the order - screenshots uploaded`,
      user: approvedByUser?.name || "Sales User",
      timestamp: now,
    })

    console.log(`✅ Order ${order.orderNumber} approved by client → AWAITING_ACCOUNT_APPROVAL`)

    return HttpResponse.json({
      success: true,
      message: "Client approval recorded successfully",
      data: {
        orderId,
        orderNumber: order.orderNumber,
        status: ORDER_STATUS.AWAITING_ACCOUNT_APPROVAL,
        clientApprovalData: mockOrders[orderIndex].clientApprovalData,
      },
    })
  }
)

// ============================================================================
// POST /api/sales/order/:orderId/request-revideo - Request re-video from QA
// ============================================================================
const requestReVideo = http.post(
  `${BASE_URL}/order/:orderId/request-revideo`,
  async ({ params, request }) => {
    const { orderId } = params
    const { orderItemId, sections, requestedBy } = await request.json()

    console.log(`📹 POST /api/sales/order/${orderId}/request-revideo`)

    const orderIndex = findOrderIndex(orderId)
    if (orderIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = mockOrders[orderIndex]

    if (order.status !== ORDER_STATUS.AWAITING_CLIENT_APPROVAL) {
      return HttpResponse.json(
        { success: false, error: `Order must be in AWAITING_CLIENT_APPROVAL status` },
        { status: 400 }
      )
    }

    // Validate orderItemId
    const orderItemIndex = mockOrderItems.findIndex(
      (oi) => oi.id === orderItemId && oi.orderId === orderId
    )
    if (orderItemIndex === -1) {
      return HttpResponse.json(
        { success: false, error: "Order item not found in this order" },
        { status: 404 }
      )
    }

    // Validate sections
    if (!sections || sections.length === 0) {
      return HttpResponse.json(
        { success: false, error: "At least one section must be selected" },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const requestedByUser = findUser(requestedBy)

    // Build notes map from sections array
    const notesMap = {}
    const sectionNames = []
    sections.forEach((s) => {
      notesMap[s.name] = s.notes || ""
      sectionNames.push(s.name)
    })

    // Store re-video request on the order item
    mockOrderItems[orderItemIndex].reVideoRequest = {
      requestedBy,
      requestedByName: requestedByUser?.name || "Sales User",
      requestedAt: now,
      sections: sectionNames,
      notes: notesMap,
    }

    // Order stays in AWAITING_CLIENT_APPROVAL (re-video is a sub-flow)
    // Order item status stays as is (video will be re-uploaded by QA)

    // Timeline on order
    if (!order.timeline) mockOrders[orderIndex].timeline = []
    mockOrders[orderIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: `Re-video requested for ${mockOrderItems[orderItemIndex].productName} - Sections: ${sectionNames.join(", ")}`,
      user: requestedByUser?.name || "Sales User",
      timestamp: now,
    })

    console.log(
      `✅ Re-video requested for order item ${orderItemId}, sections: ${sectionNames.join(", ")}`
    )

    return HttpResponse.json({
      success: true,
      message: "Re-video request sent to QA",
      data: {
        orderId,
        orderItemId,
        reVideoRequest: mockOrderItems[orderItemIndex].reVideoRequest,
      },
    })
  }
)

// ============================================================================
// POST /api/sales/order/:orderId/request-alteration - Request alteration
// ============================================================================
const requestAlteration = http.post(
  `${BASE_URL}/order/:orderId/request-alteration`,
  async ({ params, request }) => {
    const { orderId } = params
    const { sections, requestedBy } = await request.json()
    // sections: [{ orderItemId, sectionName, notes }]

    console.log(`✂️ POST /api/sales/order/${orderId}/request-alteration`)

    const orderIndex = findOrderIndex(orderId)
    if (orderIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = mockOrders[orderIndex]

    if (order.status !== ORDER_STATUS.AWAITING_CLIENT_APPROVAL) {
      return HttpResponse.json(
        { success: false, error: `Order must be in AWAITING_CLIENT_APPROVAL status` },
        { status: 400 }
      )
    }

    if (!sections || sections.length === 0) {
      return HttpResponse.json(
        { success: false, error: "At least one section must be selected for alteration" },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const requestedByUser = findUser(requestedBy)
    const updatedItems = []

    sections.forEach(({ orderItemId, sectionName, notes }) => {
      const oiIndex = mockOrderItems.findIndex(
        (oi) => oi.id === orderItemId && oi.orderId === orderId
      )
      if (oiIndex === -1) return

      const sectionKey = sectionName.toLowerCase()
      if (!mockOrderItems[oiIndex].sectionStatuses?.[sectionKey]) return

      // Reset section to PRODUCTION_COMPLETED (ready for rework by production head)
      mockOrderItems[oiIndex].sectionStatuses[sectionKey] = {
        ...mockOrderItems[oiIndex].sectionStatuses[sectionKey],
        status: SECTION_STATUS.READY_FOR_PRODUCTION, // ← CORRECT
        alterationNotes: notes || "",
        alterationRequestedBy: requestedBy,
        alterationRequestedAt: now,
        isAlteration: true, // Flag for production to know this is an alteration
        updatedAt: now,
      }

      // Update order item status
      mockOrderItems[oiIndex].status = ORDER_ITEM_STATUS.ALTERATION_REQUIRED
      mockOrderItems[oiIndex].updatedAt = now

      updatedItems.push({ orderItemId, sectionName: sectionKey })
    })

    const affectedOrderItemIds = [...new Set(sections.map((s) => s.orderItemId))]
    affectedOrderItemIds.forEach((oiId) => {
      const oiIdx = mockOrderItems.findIndex((oi) => oi.id === oiId && oi.orderId === orderId)
      if (oiIdx !== -1) {
        // Clear video data — QA must re-upload after alteration completes
        delete mockOrderItems[oiIdx].videoData
        // Also clear any lingering reVideoRequest
        delete mockOrderItems[oiIdx].reVideoRequest
      }
    })

    // Update order status - goes back to a state where production can see it
    // Keep it in AWAITING_CLIENT_APPROVAL or set a specific alteration status
    // Per the data flow doc, we keep the order in AWAITING_CLIENT_APPROVAL
    // but the affected order items go to ALTERATION_REQUIRED
    mockOrders[orderIndex].updatedAt = now

    // Timeline
    const sectionList = sections.map((s) => `${s.sectionName} (${s.orderItemId})`).join(", ")
    if (!order.timeline) mockOrders[orderIndex].timeline = []
    mockOrders[orderIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: `Alteration requested for sections: ${sectionList}`,
      user: requestedByUser?.name || "Sales User",
      timestamp: now,
    })

    console.log(`✅ Alteration requested for ${updatedItems.length} sections`)

    return HttpResponse.json({
      success: true,
      message: `Alteration requested for ${updatedItems.length} section(s)`,
      data: {
        orderId,
        updatedItems,
        orderStatus: order.status,
      },
    })
  }
)

// ============================================================================
// POST /api/sales/order/:orderId/client-rejected - Client rejected (cancel)
// ============================================================================
const clientRejected = http.post(
  `${BASE_URL}/order/:orderId/client-rejected`,
  async ({ params, request }) => {
    const { orderId } = params
    const { reason, cancelledBy } = await request.json()

    console.log(`❌ POST /api/sales/order/${orderId}/client-rejected`)

    const orderIndex = findOrderIndex(orderId)
    if (orderIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = mockOrders[orderIndex]

    if (order.status !== ORDER_STATUS.AWAITING_CLIENT_APPROVAL) {
      return HttpResponse.json(
        { success: false, error: `Order must be in AWAITING_CLIENT_APPROVAL status` },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const cancelledByUser = findUser(cancelledBy)

    // Store cancellation data
    mockOrders[orderIndex].cancellationData = {
      cancelledAt: now,
      cancelledBy,
      reason: reason || "Client rejected order",
      type: "CLIENT_REJECTED",
    }

    // Update order status
    mockOrders[orderIndex].status = ORDER_STATUS.CANCELLED_BY_CLIENT
    mockOrders[orderIndex].updatedAt = now

    // Update all order items
    mockOrderItems.forEach((oi, idx) => {
      if (oi.orderId === orderId) {
        mockOrderItems[idx].status = ORDER_ITEM_STATUS.CANCELLED_BY_CLIENT
        mockOrderItems[idx].updatedAt = now
      }
    })

    // Timeline
    if (!order.timeline) mockOrders[orderIndex].timeline = []
    mockOrders[orderIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: `Order cancelled by client - Reason: ${reason || "Not specified"}`,
      user: cancelledByUser?.name || "Sales User",
      timestamp: now,
    })

    console.log(`✅ Order ${order.orderNumber} cancelled by client`)

    return HttpResponse.json({
      success: true,
      message: "Order cancelled",
      data: {
        orderId,
        orderNumber: order.orderNumber,
        status: ORDER_STATUS.CANCELLED_BY_CLIENT,
        cancellationData: mockOrders[orderIndex].cancellationData,
      },
    })
  }
)

// ============================================================================
// POST /api/sales/order/:orderId/start-from-scratch - Reset order
// ============================================================================
const startFromScratch = http.post(
  `${BASE_URL}/order/:orderId/start-from-scratch`,
  async ({ params, request }) => {
    const { orderId } = params
    const { confirmedBy, reason } = await request.json()

    console.log(`🔄 POST /api/sales/order/${orderId}/start-from-scratch`)

    const orderIndex = findOrderIndex(orderId)
    if (orderIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = mockOrders[orderIndex]

    if (order.status !== ORDER_STATUS.AWAITING_CLIENT_APPROVAL) {
      return HttpResponse.json(
        { success: false, error: `Order must be in AWAITING_CLIENT_APPROVAL status` },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const confirmedByUser = findUser(confirmedBy)

    // Reset order status to INVENTORY_CHECK
    mockOrders[orderIndex].status = ORDER_STATUS.INVENTORY_CHECK
    mockOrders[orderIndex].updatedAt = now
    // Clear sales-specific data
    delete mockOrders[orderIndex].sentToClientAt
    delete mockOrders[orderIndex].sentToClientBy
    delete mockOrders[orderIndex].clientApprovalData

    // Reset all order items
    // ── Step 1: Collect order item IDs for this order ──
    const orderItemIds = mockOrderItems.filter((oi) => oi.orderId === orderId).map((oi) => oi.id)

    for (let i = mockProcurementDemands.length - 1; i >= 0; i--) {
      if (orderItemIds.includes(mockProcurementDemands[i].orderItemId)) {
        mockProcurementDemands.splice(i, 1)
      }
    }

    // ── Step 2: Remove all production tasks for these order items ──
    // (In a real backend, you'd mark as SUPERSEDED; in MSW, we remove them)
    for (let i = mockProductionTasks.length - 1; i >= 0; i--) {
      if (orderItemIds.includes(mockProductionTasks[i].orderItemId)) {
        mockProductionTasks.splice(i, 1)
      }
    }

    // ── Step 3: Remove production head assignments for these order items ──
    for (let i = mockProductionAssignments.length - 1; i >= 0; i--) {
      if (orderItemIds.includes(mockProductionAssignments[i].orderItemId)) {
        mockProductionAssignments.splice(i, 1)
      }
    }

    // ── Step 4: Reset all order items ──
    mockOrderItems.forEach((oi, idx) => {
      if (oi.orderId === orderId) {
        mockOrderItems[idx].status = ORDER_ITEM_STATUS.INVENTORY_CHECK
        mockOrderItems[idx].updatedAt = now

        // Archive and clear video data
        if (oi.videoData) {
          mockOrderItems[idx].archivedVideoData = oi.videoData
          delete mockOrderItems[idx].videoData
        }

        // Clear re-video request
        delete mockOrderItems[idx].reVideoRequest

        // Clear packet-level data
        delete mockOrderItems[idx].packetId
        delete mockOrderItems[idx].packetCreatedAt
        delete mockOrderItems[idx].packetVerifiedAt

        // Reset all section statuses — CLEAN reset, no stale properties
        if (oi.sectionStatuses) {
          const cleanStatuses = {}
          Object.keys(oi.sectionStatuses).forEach((sectionKey) => {
            const normalized = sectionKey.toLowerCase()
            // Skip duplicates — keep only one entry per normalized key
            if (!cleanStatuses[normalized]) {
              const oldSection = oi.sectionStatuses[sectionKey]
              const archivedQaData = oldSection.qaData || null
              cleanStatuses[normalized] = {
                name: oldSection.name || sectionKey,
                status: SECTION_STATUS.PENDING_INVENTORY_CHECK,
                updatedAt: now,
                archivedQaData,
              }
            }
          })
          mockOrderItems[idx].sectionStatuses = cleanStatuses
        }

        // Clear stale inventory check data from previous lifecycle
        delete mockOrderItems[idx].materialRequirements
        delete mockOrderItems[idx].stockDeductions
        delete mockOrderItems[idx].lastInventoryCheck
        delete mockOrderItems[idx].sectionsInventoryChecked

        // Timeline on order item
        if (!oi.timeline) mockOrderItems[idx].timeline = []
        mockOrderItems[idx].timeline.push({
          id: `log-${Date.now()}-${idx}`,
          action:
            "Order reset to start from scratch - all sections, tasks, and assignments cleared",
          user: confirmedByUser?.name || "Sales User",
          timestamp: now,
        })
      }
    })

    // Timeline on order
    if (!order.timeline) mockOrders[orderIndex].timeline = []
    mockOrders[orderIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: `Order reset to start from scratch${reason ? ` - Reason: ${reason}` : ""}`,
      user: confirmedByUser?.name || "Sales User",
      timestamp: now,
    })

    console.log(`✅ Order ${order.orderNumber} reset to INVENTORY_CHECK (start from scratch)`)

    return HttpResponse.json({
      success: true,
      message: "Order reset to start from scratch",
      data: {
        orderId,
        orderNumber: order.orderNumber,
        status: ORDER_STATUS.INVENTORY_CHECK,
      },
    })
  }
)

// ============================================================================
// POST /api/sales/order/:orderId/approve-payments - Verify payments → dispatch
// ============================================================================
const approvePayments = http.post(
  `${BASE_URL}/order/:orderId/approve-payments`,
  async ({ params, request }) => {
    const { orderId } = params
    const { approvedBy } = await request.json()

    console.log(`💰 POST /api/sales/order/${orderId}/approve-payments`)

    const orderIndex = findOrderIndex(orderId)
    if (orderIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = mockOrders[orderIndex]

    if (order.status !== ORDER_STATUS.AWAITING_ACCOUNT_APPROVAL) {
      return HttpResponse.json(
        { success: false, error: `Order must be in AWAITING_ACCOUNT_APPROVAL status` },
        { status: 400 }
      )
    }

    // Validate total paid >= total amount
    const totalPaid = (order.payments || []).reduce((sum, p) => sum + p.amount, 0)
    if (totalPaid < order.totalAmount) {
      return HttpResponse.json(
        {
          success: false,
          error: `Payment insufficient. Total: PKR ${order.totalAmount}, Paid: PKR ${totalPaid}, Remaining: PKR ${order.totalAmount - totalPaid}`,
        },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const approvedByUser = findUser(approvedBy)

    // Update order status
    mockOrders[orderIndex].status = ORDER_STATUS.READY_FOR_DISPATCH
    mockOrders[orderIndex].updatedAt = now

    // Update all order items to READY_FOR_DISPATCH
    mockOrderItems.forEach((oi, idx) => {
      if (oi.orderId === orderId && oi.status === ORDER_ITEM_STATUS.CLIENT_APPROVED) {
        mockOrderItems[idx].status = ORDER_ITEM_STATUS.READY_FOR_DISPATCH
        mockOrderItems[idx].updatedAt = now
      }
    })

    // Timeline
    if (!order.timeline) mockOrders[orderIndex].timeline = []
    mockOrders[orderIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: `Payments verified and approved (PKR ${totalPaid} / PKR ${order.totalAmount}) - Ready for dispatch`,
      user: approvedByUser?.name || "Sales User",
      timestamp: now,
    })

    console.log(`✅ Order ${order.orderNumber} → READY_FOR_DISPATCH`)

    return HttpResponse.json({
      success: true,
      message: "Payments approved - Order ready for dispatch",
      data: {
        orderId,
        orderNumber: order.orderNumber,
        status: ORDER_STATUS.READY_FOR_DISPATCH,
        totalPaid,
        totalAmount: order.totalAmount,
      },
    })
  }
)

// ============================================================================
// EXPORT HANDLERS
// ============================================================================

export const salesApprovalHandlers = [
  getApprovalQueue,
  getAwaitingResponse,
  getAwaitingPayment,
  getSalesStats,
  getOrderDetails,
  sendToClient,
  clientApproved,
  requestReVideo,
  requestAlteration,
  clientRejected,
  startFromScratch,
  approvePayments,
]

export default salesApprovalHandlers
