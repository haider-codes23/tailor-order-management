/**
 * QA MSW Handlers
 * src/mocks/handlers/qaHandlers.js
 *
 * Phase 14: QA + Client Approval + Dispatch
 * Mock Service Worker handlers for QA endpoints
 */

import { http, HttpResponse } from "msw"
import { appConfig } from "@/config/appConfig"
// import { mockOrderItems } from "../data/mockOrderItems"
import { mockOrders, mockOrderItems } from "../data/mockOrders"
import { mockUsers } from "../data/mockUser"
import { SECTION_STATUS, ORDER_ITEM_STATUS } from "@/constants/orderConstants"

const BASE_URL = `${appConfig.apiBaseUrl}/qa`

// Helper to find order item
const findOrderItem = (orderItemId) => {
  return mockOrderItems.find((oi) => oi.id === orderItemId)
}

// Helper to find order by order item
const findOrderByOrderItem = (orderItem) => {
  return mockOrders.find((o) => o.id === orderItem.orderId)
}

// Helper to find user by ID
const findUser = (userId) => {
  return mockUsers.find((u) => u.id === parseInt(userId))
}

// ============================================================================
// GET /api/qa/queue - Get sections in QA_PENDING status
// ============================================================================
const getQAQueue = http.get(`${BASE_URL}/queue`, async () => {
  console.log("📋 GET /api/qa/queue - Fetching QA queue")

  const qaSections = []

  mockOrderItems.forEach((orderItem) => {
    if (!orderItem.sectionStatuses) return

    const order = findOrderByOrderItem(orderItem)
    if (!order) return

    Object.entries(orderItem.sectionStatuses).forEach(([sectionKey, sectionData]) => {
      if (sectionData.status === SECTION_STATUS.QA_PENDING) {
        qaSections.push({
          orderItemId: orderItem.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customer?.name || "Unknown",
          productName: orderItem.productName,
          productSku: orderItem.productSku,
          sectionName: sectionKey,
          sectionDisplayName: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
          status: sectionData.status,
          fwdDate: order.fwdDate,
          sentToQAAt: sectionData.sentToQAAt,
          productionCompletedAt: sectionData.productionCompletedAt,
        })
      }
    })
  })

  // Sort by sentToQAAt (oldest first)
  qaSections.sort((a, b) => new Date(a.sentToQAAt) - new Date(b.sentToQAAt))

  console.log(`✅ Found ${qaSections.length} sections in QA_PENDING`)

  return HttpResponse.json({
    success: true,
    data: qaSections,
  })
})

// ============================================================================
// GET /api/qa/stats - Get QA statistics
// ============================================================================
const getQAStats = http.get(`${BASE_URL}/stats`, async () => {
  console.log("📊 GET /api/qa/stats - Fetching QA stats")

  let pendingCount = 0
  let readyForClientCount = 0
  let completedTodayCount = 0
  const today = new Date().toDateString()

  mockOrderItems.forEach((orderItem) => {
    if (!orderItem.sectionStatuses) return

    Object.values(orderItem.sectionStatuses).forEach((sectionData) => {
      if (sectionData.status === SECTION_STATUS.QA_PENDING) {
        pendingCount++
      } else if (sectionData.status === SECTION_STATUS.READY_FOR_CLIENT_APPROVAL) {
        readyForClientCount++
        // Check if video was added today
        if (sectionData.qaData?.uploadedAt) {
          const uploadDate = new Date(sectionData.qaData.uploadedAt).toDateString()
          if (uploadDate === today) {
            completedTodayCount++
          }
        }
      }
    })
  })

  return HttpResponse.json({
    success: true,
    data: {
      pendingReview: pendingCount,
      readyForClient: readyForClientCount,
      completedToday: completedTodayCount,
    },
  })
})

// ============================================================================
// GET /api/qa/order-item/:orderItemId/section/:sectionName - Section details
// ============================================================================
const getQASectionDetails = http.get(
  `${BASE_URL}/order-item/:orderItemId/section/:sectionName`,
  async ({ params }) => {
    const { orderItemId, sectionName } = params
    console.log(`📋 GET QA section details: ${orderItemId}/${sectionName}`)

    const orderItem = findOrderItem(orderItemId)
    if (!orderItem) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const sectionKey = sectionName.toLowerCase()
    const sectionData = orderItem.sectionStatuses?.[sectionKey]
    if (!sectionData) {
      return HttpResponse.json({ success: false, error: "Section not found" }, { status: 404 })
    }

    const order = findOrderByOrderItem(orderItem)

    return HttpResponse.json({
      success: true,
      data: {
        orderItemId: orderItem.id,
        orderId: order?.id,
        orderNumber: order?.orderNumber,
        customerName: order?.customer?.name,
        customerPhone: order?.customer?.phone,
        productName: orderItem.productName,
        productSku: orderItem.productSku,
        sectionName: sectionKey,
        sectionDisplayName: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
        status: sectionData.status,
        fwdDate: order?.fwdDate,
        qaData: sectionData.qaData || null,
        productionCompletedAt: sectionData.productionCompletedAt,
        sentToQAAt: sectionData.sentToQAAt,
      },
    })
  }
)

// ============================================================================
// POST /api/qa/order-item/:orderItemId/section/:sectionName/add-video-link
// Add YouTube link and move to READY_FOR_CLIENT_APPROVAL
// ============================================================================
const addSectionVideoLink = http.post(
  `${BASE_URL}/order-item/:orderItemId/section/:sectionName/add-video-link`,
  async ({ params, request }) => {
    const { orderItemId, sectionName } = params
    const body = await request.json()
    const { youtubeUrl, uploadedBy } = body
    const now = new Date().toISOString()

    console.log(`🎬 POST add video link: ${orderItemId}/${sectionName}`)

    // Find order item
    const orderItemIndex = mockOrderItems.findIndex((oi) => oi.id === orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const sectionKey = sectionName.toLowerCase()
    if (!mockOrderItems[orderItemIndex].sectionStatuses?.[sectionKey]) {
      return HttpResponse.json({ success: false, error: "Section not found" }, { status: 404 })
    }

    const currentStatus = mockOrderItems[orderItemIndex].sectionStatuses[sectionKey].status
    if (currentStatus !== SECTION_STATUS.QA_PENDING) {
      return HttpResponse.json(
        { success: false, error: "Section must be in QA_PENDING status" },
        { status: 400 }
      )
    }

    // Validate YouTube URL
    if (!youtubeUrl || (!youtubeUrl.includes("youtube") && !youtubeUrl.includes("youtu.be"))) {
      return HttpResponse.json({ success: false, error: "Invalid YouTube URL" }, { status: 400 })
    }

    // Update section status and add QA data
    mockOrderItems[orderItemIndex].sectionStatuses[sectionKey] = {
      ...mockOrderItems[orderItemIndex].sectionStatuses[sectionKey],
      status: SECTION_STATUS.READY_FOR_CLIENT_APPROVAL,
      qaData: {
        youtubeUrl,
        uploadedBy,
        uploadedAt: now,
      },
      updatedAt: now,
    }

    // Get QA user name for timeline
    const qaUser = findUser(uploadedBy)
    const qaUserName = qaUser?.name || "QA User"
    const displaySectionName = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)

    // Add timeline entry
    mockOrderItems[orderItemIndex].timeline = mockOrderItems[orderItemIndex].timeline || []
    mockOrderItems[orderItemIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: `QA video link added for ${displaySectionName} by ${qaUserName}`,
      user: qaUserName,
      timestamp: now,
    })

    // Check if we need to update order item status
    const allSectionsHaveVideo = Object.values(
      mockOrderItems[orderItemIndex].sectionStatuses
    ).every(
      (s) =>
        s.status === SECTION_STATUS.READY_FOR_CLIENT_APPROVAL ||
        s.status === SECTION_STATUS.AWAITING_CLIENT_APPROVAL ||
        s.status === SECTION_STATUS.CLIENT_APPROVED
    )

    if (
      allSectionsHaveVideo &&
      mockOrderItems[orderItemIndex].status === ORDER_ITEM_STATUS.QUALITY_ASSURANCE
    ) {
      mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.AWAITING_CLIENT_APPROVAL
      mockOrderItems[orderItemIndex].timeline.push({
        id: `log-${Date.now() + 1}`,
        action: "All sections have QA videos - Ready for client approval",
        user: "System",
        timestamp: now,
      })
    }

    console.log(`✅ Video link added for ${displaySectionName}, status: READY_FOR_CLIENT_APPROVAL`)

    return HttpResponse.json({
      success: true,
      message: `Video link added for ${displaySectionName}`,
      data: {
        sectionName: sectionKey,
        status: SECTION_STATUS.READY_FOR_CLIENT_APPROVAL,
        qaData: mockOrderItems[orderItemIndex].sectionStatuses[sectionKey].qaData,
      },
    })
  }
)

// ============================================================================
// GET /api/qa/ready-for-client - Sections with video links ready for client
// ============================================================================
const getSectionsReadyForClient = http.get(`${BASE_URL}/ready-for-client`, async () => {
  console.log("📋 GET /api/qa/ready-for-client")

  const readySections = []

  mockOrderItems.forEach((orderItem) => {
    if (!orderItem.sectionStatuses) return

    const order = findOrderByOrderItem(orderItem)
    if (!order) return

    Object.entries(orderItem.sectionStatuses).forEach(([sectionKey, sectionData]) => {
      if (sectionData.status === SECTION_STATUS.READY_FOR_CLIENT_APPROVAL) {
        readySections.push({
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
          fwdDate: order.fwdDate,
        })
      }
    })
  })

  console.log(`✅ Found ${readySections.length} sections ready for client`)

  return HttpResponse.json({
    success: true,
    data: readySections,
  })
})

// ============================================================================
// EXPORT HANDLERS
// ============================================================================

export const qaHandlers = [
  getQAQueue,
  getQAStats,
  getQASectionDetails,
  addSectionVideoLink,
  getSectionsReadyForClient,
]

export default qaHandlers
