/**
 * QA MSW Handlers - Phase 14 Redesign
 * src/mocks/handlers/qaHandlers.js
 *
 * Complete rewrite for new QA workflow:
 * - Section-level approval/rejection with round tracking
 * - Order Item-level video uploads
 * - Sales re-video request handling
 */

import { http, HttpResponse } from "msw"
import { appConfig } from "@/config/appConfig"
import { mockOrders, mockOrderItems } from "../data/mockOrders"
import { mockUsers } from "../data/mockUser"
import {
  SECTION_STATUS,
  ORDER_ITEM_STATUS,
  ORDER_STATUS,
  QA_REJECTION_REASONS,
} from "@/constants/orderConstants"

const BASE_URL = `${appConfig.apiBaseUrl}/qa`

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const findOrderItem = (orderItemId) => {
  return mockOrderItems.find((oi) => oi.id === orderItemId)
}

const findOrderItemIndex = (orderItemId) => {
  return mockOrderItems.findIndex((oi) => oi.id === orderItemId)
}

const findOrder = (orderId) => {
  return mockOrders.find((o) => o.id === orderId)
}

const findOrderIndex = (orderId) => {
  return mockOrders.findIndex((o) => o.id === orderId)
}

const findOrderByOrderItem = (orderItem) => {
  return mockOrders.find((o) => o.id === orderItem.orderId)
}

const findUser = (userId) => {
  return mockUsers.find((u) => u.id === parseInt(userId))
}

// Check if all sections of an order item are QA_APPROVED
const areAllSectionsQAApproved = (orderItem) => {
  if (!orderItem.sectionStatuses) return false
  return Object.values(orderItem.sectionStatuses).every(
    (s) => s.status === SECTION_STATUS.QA_APPROVED
  )
}

// Check if order item already has video uploaded
const hasVideoUploaded = (orderItem) => {
  return !!(orderItem.videoData && orderItem.videoData.youtubeUrl)
}

// Check if all order items in an order have videos
const allOrderItemsHaveVideos = (order) => {
  const orderItems = mockOrderItems.filter((oi) => oi.orderId === order.id)
  return orderItems.every((oi) => hasVideoUploaded(oi))
}

// ============================================================================
// GET /api/qa/queue - Production Queue (sections pending QA review)
// ============================================================================
const getQAProductionQueue = http.get(`${BASE_URL}/queue`, async () => {
  console.log("📋 GET /api/qa/queue - Fetching QA Production Queue")

  // Group sections by order item
  const orderItemsMap = new Map()

  mockOrderItems.forEach((orderItem) => {
    if (!orderItem.sectionStatuses) return

    const order = findOrderByOrderItem(orderItem)
    if (!order) return

    // Find sections in QA_PENDING status
    const pendingSections = []
    const approvedSections = []
    const rejectedSections = []

    Object.entries(orderItem.sectionStatuses).forEach(([sectionKey, sectionData]) => {
      const sectionInfo = {
        name: sectionKey,
        displayName: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
        status: sectionData.status,
        qaData: sectionData.qaData || { currentRound: 1, rounds: [] },
      }

      if (sectionData.status === SECTION_STATUS.QA_PENDING) {
        pendingSections.push(sectionInfo)
      } else if (sectionData.status === SECTION_STATUS.QA_APPROVED) {
        approvedSections.push(sectionInfo)
      } else if (sectionData.status === SECTION_STATUS.QA_REJECTED) {
        rejectedSections.push(sectionInfo)
      }
    })

    // Only include if there are pending sections OR all sections approved (ready for video)
    const allApproved = areAllSectionsQAApproved(orderItem)
    const hasPending = pendingSections.length > 0

    if (
      hasPending ||
      (allApproved && !hasVideoUploaded(orderItem)) ||
      rejectedSections.length > 0
    ) {
      orderItemsMap.set(orderItem.id, {
        orderItemId: orderItem.id,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.name || "Unknown",
        productName: orderItem.productName,
        productSku: orderItem.productSku,
        fwdDate: order.fwdDate,
        totalSections: Object.keys(orderItem.sectionStatuses).length,
        pendingSections,
        approvedSections,
        rejectedSections,
        allSectionsApproved: allApproved,
        hasVideo: hasVideoUploaded(orderItem),
        videoData: orderItem.videoData || null,
        reVideoRequest: orderItem.reVideoRequest || null,
      })
    }
  })

  const queue = Array.from(orderItemsMap.values())

  // Sort: items with all sections approved (ready for video) first, then by pending count
  queue.sort((a, b) => {
    if (a.allSectionsApproved && !b.allSectionsApproved) return -1
    if (!a.allSectionsApproved && b.allSectionsApproved) return 1
    return b.pendingSections.length - a.pendingSections.length
  })

  console.log(`✅ Found ${queue.length} order items in QA queue`)

  return HttpResponse.json({
    success: true,
    data: queue,
  })
})

// ============================================================================
// GET /api/qa/sales-requests - Re-video requests from Sales
// ============================================================================
const getSalesRequests = http.get(`${BASE_URL}/sales-requests`, async () => {
  console.log("📋 GET /api/qa/sales-requests - Fetching Sales Re-video Requests")

  const requests = []

  mockOrderItems.forEach((orderItem) => {
    if (!orderItem.reVideoRequest) return

    const order = findOrderByOrderItem(orderItem)
    if (!order) return

    const requestedByUser = findUser(orderItem.reVideoRequest.requestedBy)

    requests.push({
      orderItemId: orderItem.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer?.name || "Unknown",
      productName: orderItem.productName,
      fwdDate: order.fwdDate,
      reVideoRequest: {
        ...orderItem.reVideoRequest,
        requestedByName: requestedByUser?.name || "Unknown",
      },
      previousVideo: orderItem.videoData || null,
    })
  })

  // Sort by request date (oldest first)
  requests.sort(
    (a, b) => new Date(a.reVideoRequest.requestedAt) - new Date(b.reVideoRequest.requestedAt)
  )

  console.log(`✅ Found ${requests.length} re-video requests from Sales`)

  return HttpResponse.json({
    success: true,
    data: requests,
  })
})

// ============================================================================
// GET /api/qa/stats - QA Dashboard Statistics
// ============================================================================
const getQAStats = http.get(`${BASE_URL}/stats`, async () => {
  console.log("📊 GET /api/qa/stats - Fetching QA stats")

  let pendingReviewCount = 0
  let readyForVideoCount = 0
  let salesRequestsCount = 0

  mockOrderItems.forEach((orderItem) => {
    if (!orderItem.sectionStatuses) return

    // Count pending sections
    const pendingSections = Object.values(orderItem.sectionStatuses).filter(
      (s) => s.status === SECTION_STATUS.QA_PENDING
    )
    pendingReviewCount += pendingSections.length

    // Count items ready for video
    if (areAllSectionsQAApproved(orderItem) && !hasVideoUploaded(orderItem)) {
      readyForVideoCount++
    }

    // Count re-video requests
    if (orderItem.reVideoRequest) {
      salesRequestsCount++
    }
  })

  console.log(
    `✅ QA Stats: ${pendingReviewCount} pending, ${readyForVideoCount} ready for video, ${salesRequestsCount} sales requests`
  )

  return HttpResponse.json({
    success: true,
    data: {
      pendingReview: pendingReviewCount,
      readyForVideo: readyForVideoCount,
      salesRequests: salesRequestsCount,
    },
  })
})

// ============================================================================
// POST /api/qa/section/:orderItemId/:section/approve - Approve a section
// ============================================================================
const approveSection = http.post(
  `${BASE_URL}/section/:orderItemId/:section/approve`,
  async ({ params, request }) => {
    const { orderItemId, section: sectionName } = params
    const { approvedBy } = await request.json()

    console.log(`✅ POST /api/qa/section/${orderItemId}/${sectionName}/approve`)

    const orderItemIndex = findOrderItemIndex(orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const orderItem = mockOrderItems[orderItemIndex]
    const sectionKey = sectionName.toLowerCase()

    if (!orderItem.sectionStatuses?.[sectionKey]) {
      return HttpResponse.json({ success: false, error: "Section not found" }, { status: 404 })
    }

    const sectionData = orderItem.sectionStatuses[sectionKey]

    // Validate section is in QA_PENDING
    if (sectionData.status !== SECTION_STATUS.QA_PENDING) {
      return HttpResponse.json(
        {
          success: false,
          error: `Section must be in QA_PENDING status. Current: ${sectionData.status}`,
        },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const approvedByUser = findUser(approvedBy)
    const displaySectionName = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)

    // Initialize qaData if not exists
    if (!sectionData.qaData) {
      sectionData.qaData = { currentRound: 1, rounds: [] }
    }

    const currentRound = sectionData.qaData.currentRound || 1

    // Add approval to rounds history
    sectionData.qaData.rounds.push({
      round: currentRound,
      status: "APPROVED",
      reviewedBy: approvedBy,
      reviewedByName: approvedByUser?.name || "Unknown",
      reviewedAt: now,
    })

    // Update section status
    sectionData.status = SECTION_STATUS.QA_APPROVED
    sectionData.qaApprovedAt = now
    sectionData.qaApprovedBy = approvedBy
    sectionData.updatedAt = now

    // Add timeline entry
    if (!orderItem.timeline) orderItem.timeline = []
    orderItem.timeline.push({
      id: `log-${Date.now()}`,
      action: `${displaySectionName} approved by QA (Round ${currentRound})`,
      user: approvedByUser?.name || "QA User",
      timestamp: now,
    })

    // Check if all sections are now QA_APPROVED
    const allApproved = areAllSectionsQAApproved(orderItem)
    if (allApproved) {
      mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.ALL_SECTIONS_QA_APPROVED
      orderItem.timeline.push({
        id: `log-${Date.now() + 1}`,
        action: "All sections approved by QA - Ready for video upload",
        user: "System",
        timestamp: now,
      })
    }

    console.log(`✅ Section ${displaySectionName} approved (Round ${currentRound})`)

    return HttpResponse.json({
      success: true,
      message: `${displaySectionName} approved by QA`,
      data: {
        sectionName: sectionKey,
        status: SECTION_STATUS.QA_APPROVED,
        round: currentRound,
        allSectionsApproved: allApproved,
      },
    })
  }
)

// ============================================================================
// POST /api/qa/section/:orderItemId/:section/reject - Reject a section
// ============================================================================
const rejectSection = http.post(
  `${BASE_URL}/section/:orderItemId/:section/reject`,
  async ({ params, request }) => {
    const { orderItemId, section: sectionName } = params
    const { rejectedBy, reasonCode, notes } = await request.json()

    console.log(`❌ POST /api/qa/section/${orderItemId}/${sectionName}/reject`)

    const orderItemIndex = findOrderItemIndex(orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const orderItem = mockOrderItems[orderItemIndex]
    const sectionKey = sectionName.toLowerCase()

    if (!orderItem.sectionStatuses?.[sectionKey]) {
      return HttpResponse.json({ success: false, error: "Section not found" }, { status: 404 })
    }

    const sectionData = orderItem.sectionStatuses[sectionKey]

    // Validate section is in QA_PENDING
    if (sectionData.status !== SECTION_STATUS.QA_PENDING) {
      return HttpResponse.json(
        {
          success: false,
          error: `Section must be in QA_PENDING status. Current: ${sectionData.status}`,
        },
        { status: 400 }
      )
    }

    // Validate notes are provided (required for rejection)
    if (!notes || notes.trim() === "") {
      return HttpResponse.json(
        { success: false, error: "Rejection notes are required" },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const rejectedByUser = findUser(rejectedBy)
    const displaySectionName = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)
    const rejectionReason = QA_REJECTION_REASONS[reasonCode]?.label || reasonCode

    // Initialize qaData if not exists
    if (!sectionData.qaData) {
      sectionData.qaData = { currentRound: 1, rounds: [] }
    }

    const currentRound = sectionData.qaData.currentRound || 1

    // Add rejection to rounds history
    sectionData.qaData.rounds.push({
      round: currentRound,
      status: "REJECTED",
      reviewedBy: rejectedBy,
      reviewedByName: rejectedByUser?.name || "Unknown",
      reviewedAt: now,
      reasonCode,
      reasonLabel: rejectionReason,
      notes,
    })

    // Increment round for next review
    sectionData.qaData.currentRound = currentRound + 1

    // Update section status to QA_REJECTED (will be sent back to production)
    sectionData.status = SECTION_STATUS.QA_REJECTED
    sectionData.qaRejectedAt = now
    sectionData.qaRejectedBy = rejectedBy
    sectionData.qaRejectionReason = reasonCode
    sectionData.qaRejectionNotes = notes
    sectionData.updatedAt = now

    // Add timeline entry
    if (!orderItem.timeline) orderItem.timeline = []
    orderItem.timeline.push({
      id: `log-${Date.now()}`,
      action: `${displaySectionName} rejected by QA (Round ${currentRound}) - ${rejectionReason}: ${notes}`,
      user: rejectedByUser?.name || "QA User",
      timestamp: now,
    })

    console.log(`❌ Section ${displaySectionName} rejected (Round ${currentRound})`)

    return HttpResponse.json({
      success: true,
      message: `${displaySectionName} rejected - sent back to Production`,
      data: {
        sectionName: sectionKey,
        status: SECTION_STATUS.QA_REJECTED,
        round: currentRound,
        nextRound: currentRound + 1,
        rejectionReason,
        notes,
      },
    })
  }
)

// ============================================================================
// POST /api/qa/order-item/:orderItemId/upload-video - Upload video for order item
// ============================================================================

// Changed from JSON { youtubeUrl } to FormData { videoFile, uploadedBy }
const uploadOrderItemVideo = http.post(
  `${BASE_URL}/order-item/:orderItemId/upload-video`,
  async ({ params, request }) => {
    const { orderItemId } = params

    console.log(`🎬 POST /api/qa/order-item/${orderItemId}/upload-video`)

    // Parse FormData instead of JSON
    const formData = await request.formData()
    const videoFile = formData.get("videoFile")
    const uploadedBy = Number(formData.get("uploadedBy"))

    // Validate video file exists
    if (!videoFile || !(videoFile instanceof File)) {
      return HttpResponse.json({ success: false, error: "Video file is required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]
    if (!allowedTypes.includes(videoFile.type)) {
      return HttpResponse.json(
        {
          success: false,
          error: `Invalid file type: ${videoFile.type}. Allowed: MP4, MOV, AVI, WebM`,
        },
        { status: 400 }
      )
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB in bytes
    if (videoFile.size > maxSize) {
      return HttpResponse.json(
        { success: false, error: "File size exceeds 2GB limit" },
        { status: 400 }
      )
    }

    const orderItemIndex = findOrderItemIndex(orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const orderItem = mockOrderItems[orderItemIndex]

    // Validate all sections are QA_APPROVED
    if (!areAllSectionsQAApproved(orderItem)) {
      return HttpResponse.json(
        {
          success: false,
          error: "All sections must be QA_APPROVED before uploading video",
        },
        { status: 400 }
      )
    }

    // Simulate YouTube upload delay (1-2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const now = new Date().toISOString()
    const uploadedByUser = findUser(uploadedBy)

    // Generate simulated YouTube URL (as if uploaded to YouTube)
    const mockVideoId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    const simulatedYouTubeUrl = `https://youtube.com/watch?v=${mockVideoId}`

    // Store video data
    mockOrderItems[orderItemIndex].videoData = {
      youtubeUrl: simulatedYouTubeUrl,
      youtubeVideoId: mockVideoId,
      uploadedBy,
      uploadedByName: uploadedByUser?.name || "Unknown",
      uploadedAt: now,
      originalFileName: videoFile.name,
      originalFileSize: videoFile.size,
      originalFileType: videoFile.type,
      videoHistory: orderItem.videoData?.videoHistory || [],
    }

    // Update order item status
    mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.VIDEO_UPLOADED

    // Add timeline entry
    if (!orderItem.timeline) orderItem.timeline = []
    orderItem.timeline.push({
      id: `log-${Date.now()}`,
      action: `YouTube video uploaded (${videoFile.name})`,
      user: uploadedByUser?.name || "QA User",
      timestamp: now,
      metadata: {
        youtubeUrl: simulatedYouTubeUrl,
        fileName: videoFile.name,
        fileSize: videoFile.size,
      },
    })

    console.log(
      `✅ Video uploaded for order item ${orderItemId} → simulated URL: ${simulatedYouTubeUrl}`
    )

    return HttpResponse.json({
      success: true,
      message: "Video uploaded to YouTube successfully",
      data: {
        orderItemId,
        videoData: mockOrderItems[orderItemIndex].videoData,
        status: ORDER_ITEM_STATUS.VIDEO_UPLOADED,
      },
    })
  }
)

// ============================================================================
// POST /api/qa/order-item/:orderItemId/upload-revideo - Upload re-video for Sales request
// ============================================================================
const uploadReVideo = http.post(
  `${BASE_URL}/order-item/:orderItemId/upload-revideo`,
  async ({ params, request }) => {
    const { orderItemId } = params

    console.log(`🎬 POST /api/qa/order-item/${orderItemId}/upload-revideo`)

    // Parse FormData instead of JSON
    const formData = await request.formData()
    const videoFile = formData.get("videoFile")
    const uploadedBy = Number(formData.get("uploadedBy"))

    // Validate video file exists
    if (!videoFile || !(videoFile instanceof File)) {
      return HttpResponse.json({ success: false, error: "Video file is required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]
    if (!allowedTypes.includes(videoFile.type)) {
      return HttpResponse.json(
        {
          success: false,
          error: `Invalid file type: ${videoFile.type}. Allowed: MP4, MOV, AVI, WebM`,
        },
        { status: 400 }
      )
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024
    if (videoFile.size > maxSize) {
      return HttpResponse.json(
        { success: false, error: "File size exceeds 2GB limit" },
        { status: 400 }
      )
    }

    const orderItemIndex = findOrderItemIndex(orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const orderItem = mockOrderItems[orderItemIndex]

    // Validate there's a re-video request
    if (!orderItem.reVideoRequest) {
      return HttpResponse.json(
        { success: false, error: "No re-video request found for this order item" },
        { status: 400 }
      )
    }

    // Simulate YouTube upload delay (1-2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const now = new Date().toISOString()
    const uploadedByUser = findUser(uploadedBy)

    // Generate simulated YouTube URL
    const mockVideoId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    const simulatedYouTubeUrl = `https://youtube.com/watch?v=${mockVideoId}`

    // Move old video to history
    const videoHistory = orderItem.videoData?.videoHistory || []
    if (orderItem.videoData?.youtubeUrl) {
      videoHistory.push({
        version: videoHistory.length + 1,
        youtubeUrl: orderItem.videoData.youtubeUrl,
        uploadedAt: orderItem.videoData.uploadedAt,
        replacedAt: now,
        replacedReason: "Re-video requested by Sales",
      })
    }

    // Store new video data
    mockOrderItems[orderItemIndex].videoData = {
      youtubeUrl: simulatedYouTubeUrl,
      youtubeVideoId: mockVideoId,
      uploadedBy,
      uploadedByName: uploadedByUser?.name || "Unknown",
      uploadedAt: now,
      originalFileName: videoFile.name,
      originalFileSize: videoFile.size,
      originalFileType: videoFile.type,
      videoHistory,
    }

    // Clear re-video request
    delete mockOrderItems[orderItemIndex].reVideoRequest

    // Update status back to VIDEO_UPLOADED
    mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.VIDEO_UPLOADED

    // Add timeline entry
    if (!orderItem.timeline) orderItem.timeline = []
    orderItem.timeline.push({
      id: `log-${Date.now()}`,
      action: `New video uploaded - re-video request fulfilled (${videoFile.name})`,
      user: uploadedByUser?.name || "QA User",
      timestamp: now,
      metadata: {
        youtubeUrl: simulatedYouTubeUrl,
        fileName: videoFile.name,
        fileSize: videoFile.size,
      },
    })

    console.log(`✅ Re-video uploaded for order item ${orderItemId}`)

    return HttpResponse.json({
      success: true,
      message: "Re-video uploaded to YouTube successfully",
      data: {
        orderItemId,
        videoData: mockOrderItems[orderItemIndex].videoData,
        status: ORDER_ITEM_STATUS.VIDEO_UPLOADED,
      },
    })
  }
)

// ============================================================================
// POST /api/qa/order/:orderId/send-to-sales - Send order to Sales
// ============================================================================
const sendOrderToSales = http.post(
  `${BASE_URL}/order/:orderId/send-to-sales`,
  async ({ params, request }) => {
    const { orderId } = params
    const { sentBy } = await request.json()

    console.log(`📤 POST /api/qa/order/${orderId}/send-to-sales`)

    const orderIndex = findOrderIndex(orderId)
    if (orderIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const order = mockOrders[orderIndex]

    // Validate all order items have videos
    if (!allOrderItemsHaveVideos(order)) {
      return HttpResponse.json(
        {
          success: false,
          error: "All order items must have videos uploaded before sending to Sales",
        },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()
    const sentByUser = findUser(sentBy)

    // Update order status
    mockOrders[orderIndex].status = ORDER_STATUS.READY_FOR_CLIENT_APPROVAL

    // Add to order timeline
    if (!order.timeline) order.timeline = []
    order.timeline.push({
      id: `log-${Date.now()}`,
      action: "Order sent to Sales for client approval",
      user: sentByUser?.name || "QA User",
      timestamp: now,
    })

    // Update all order items status
    mockOrderItems.forEach((oi, idx) => {
      if (oi.orderId === orderId) {
        mockOrderItems[idx].status = ORDER_ITEM_STATUS.READY_FOR_CLIENT_APPROVAL
      }
    })

    console.log(`✅ Order ${order.orderNumber} sent to Sales`)

    return HttpResponse.json({
      success: true,
      message: "Order sent to Sales for client approval",
      data: {
        orderId,
        orderNumber: order.orderNumber,
        status: ORDER_STATUS.READY_FOR_CLIENT_APPROVAL,
      },
    })
  }
)

// ============================================================================
// GET /api/qa/order-item/:orderItemId - Get order item details for QA
// ============================================================================
const getOrderItemForQA = http.get(`${BASE_URL}/order-item/:orderItemId`, async ({ params }) => {
  const { orderItemId } = params

  console.log(`📋 GET /api/qa/order-item/${orderItemId}`)

  const orderItem = findOrderItem(orderItemId)
  if (!orderItem) {
    return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
  }

  const order = findOrderByOrderItem(orderItem)

  return HttpResponse.json({
    success: true,
    data: {
      ...orderItem,
      orderNumber: order?.orderNumber,
      customerName: order?.customer?.name,
      fwdDate: order?.fwdDate,
    },
  })
})

// ============================================================================
// EXPORT HANDLERS
// ============================================================================

export const qaHandlers = [
  getQAProductionQueue,
  getSalesRequests,
  getQAStats,
  approveSection,
  rejectSection,
  uploadOrderItemVideo,
  uploadReVideo,
  sendOrderToSales,
  getOrderItemForQA,
]

export default qaHandlers
