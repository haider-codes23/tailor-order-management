/**
 * Dyeing Handlers - MSW handlers for Phase 12.5 Dyeing Workflow
 * src/mocks/handlers/dyeingHandlers.js
 *
 * Endpoints:
 * - GET    /api/dyeing/available-tasks     - Get tasks with sections ready for dyeing
 * - GET    /api/dyeing/my-tasks            - Get current user's accepted tasks
 * - GET    /api/dyeing/completed-tasks     - Get completed tasks (with filters)
 * - GET    /api/dyeing/task/:orderItemId   - Get dyeing task details for an order item
 * - GET    /api/dyeing/stats               - Get dashboard statistics
 * - POST   /api/dyeing/task/:orderItemId/accept   - Accept sections for dyeing
 * - POST   /api/dyeing/task/:orderItemId/start    - Start dyeing for sections
 * - POST   /api/dyeing/task/:orderItemId/complete - Complete dyeing for sections
 * - POST   /api/dyeing/task/:orderItemId/reject   - Reject sections from dyeing
 */

import { http, HttpResponse } from "msw"
import { getDyeingTaskByOrderItemId } from "../data/mockDyeingTasks"
import { mockOrderItems, mockOrders } from "../data/mockOrders"
import { mockInventoryItems } from "../data/mockInventory"
import { mockPackets } from "../data/mockPackets"
import { mockUsers } from "../data/mockUser"
import {
  ORDER_ITEM_STATUS,
  SECTION_STATUS,
  PACKET_STATUS,
  DYEING_REJECTION_REASONS,
} from "../../constants/orderConstants"

const BASE_URL = "/api/dyeing"

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find user by ID
 */
const findUser = (userId) => {
  return mockUsers.find(
    (u) => u.id === userId || u.id === parseInt(userId) || u.id === String(userId)
  )
}

/**
 * Find order by ID
 */
const findOrder = (orderId) => {
  return mockOrders.find((o) => o.id === orderId)
}

/**
 * Find order item by ID
 */
const findOrderItem = (orderItemId) => {
  return mockOrderItems.find((item) => item.id === orderItemId)
}

/**
 * Calculate order item status based on section statuses
 */
const calculateOrderItemStatus = (orderItem) => {
  if (!orderItem.sectionStatuses) return orderItem.status

  const sections = Object.values(orderItem.sectionStatuses)

  // Check dyeing statuses
  const inDyeing = sections.filter((s) =>
    [
      SECTION_STATUS.READY_FOR_DYEING,
      SECTION_STATUS.DYEING_ACCEPTED,
      SECTION_STATUS.DYEING_IN_PROGRESS,
    ].includes(s.status)
  )
  const dyeingCompleted = sections.filter((s) => s.status === SECTION_STATUS.DYEING_COMPLETED)
  const readyForProduction = sections.filter(
    (s) => s.status === SECTION_STATUS.READY_FOR_PRODUCTION
  )
  const awaitingMaterial = sections.filter((s) => s.status === SECTION_STATUS.AWAITING_MATERIAL)
  const inPacketFlow = sections.filter((s) =>
    [
      SECTION_STATUS.PENDING_INVENTORY_CHECK,
      SECTION_STATUS.INVENTORY_PASSED,
      SECTION_STATUS.CREATE_PACKET,
      SECTION_STATUS.PACKET_CREATED,
      SECTION_STATUS.PACKET_VERIFIED,
    ].includes(s.status)
  )

  // All sections completed dyeing
  if (dyeingCompleted.length === sections.length) {
    return ORDER_ITEM_STATUS.DYEING_COMPLETED
  }

  // All sections ready for production (after dyeing)
  if (readyForProduction.length === sections.length) {
    return ORDER_ITEM_STATUS.READY_FOR_PRODUCTION
  }

  // All sections in dyeing
  if (inDyeing.length === sections.length) {
    return ORDER_ITEM_STATUS.IN_DYEING
  }

  // Some in dyeing, some elsewhere
  if (inDyeing.length > 0 || dyeingCompleted.length > 0) {
    return ORDER_ITEM_STATUS.PARTIALLY_IN_DYEING
  }

  // All sections ready for dyeing
  const allReadyForDyeing = sections.every((s) => s.status === SECTION_STATUS.READY_FOR_DYEING)
  if (allReadyForDyeing) {
    return ORDER_ITEM_STATUS.READY_FOR_DYEING
  }

  return orderItem.status
}

/**
 * Enrich task with order details
 */
const enrichTaskWithOrderDetails = (task) => {
  const orderItem = findOrderItem(task.orderItemId)
  const order = orderItem ? findOrder(orderItem.orderId) : null

  return {
    ...task,
    orderItemDetails: orderItem
      ? {
          productName: orderItem.productName,
          productSku: orderItem.productSku,
          productImage: orderItem.productImage,
          size: orderItem.size,
          quantity: orderItem.quantity,
          status: orderItem.status,
          sectionStatuses: orderItem.sectionStatuses,
        }
      : null,
    orderDetails: order
      ? {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          fwdDate: order.fwdDate,
          priority: order.priority,
        }
      : null,
  }
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * GET /api/dyeing/available-tasks
 * Get tasks with sections in READY_FOR_DYEING status (not yet accepted)
 */
const getAvailableTasks = http.get(`${BASE_URL}/available-tasks`, async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const url = new URL(request.url)
  const sortBy = url.searchParams.get("sortBy") || "fwdDate"
  const sortOrder = url.searchParams.get("sortOrder") || "asc"
  const priority = url.searchParams.get("priority")

  // Find order items that have sections in READY_FOR_DYEING
  // and don't have an assigned dyeing user yet (or have unassigned sections)
  const availableItems = mockOrderItems.filter((item) => {
    if (!item.sectionStatuses) return false

    // Check if any section is ready for dyeing
    const hasReadyForDyeing = Object.values(item.sectionStatuses).some(
      (s) => s.status === SECTION_STATUS.READY_FOR_DYEING
    )

    return hasReadyForDyeing
  })

  // Enrich with order details and group by order item
  let tasks = availableItems.map((item) => {
    const order = findOrder(item.orderId)
    const dyeingTask = getDyeingTaskByOrderItemId(item.id)

    // Get sections that are ready for dyeing
    const readyForDyeingSections = Object.entries(item.sectionStatuses || {})
      .filter(([_, data]) => data.status === SECTION_STATUS.READY_FOR_DYEING)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        status: data.status,
        round: data.dyeingRound || 1,
        materials:
          item.materialRequirements?.filter((m) => m.piece?.toLowerCase() === name.toLowerCase()) ||
          [],
      }))

    // Get other sections for context
    const otherSections = Object.entries(item.sectionStatuses || {})
      .filter(([_, data]) => data.status !== SECTION_STATUS.READY_FOR_DYEING)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        status: data.status,
      }))

    return {
      id: dyeingTask?.id || `pending-${item.id}`,
      orderItemId: item.id,
      orderId: item.orderId,
      orderNumber: order?.orderNumber || "",
      customerName: order?.customerName || "",
      productName: item.productName,
      productSku: item.productSku,
      productImage: item.productImage,
      size: item.size,
      quantity: item.quantity,
      fwdDate: order?.fwdDate || null,
      priority: order?.priority || dyeingTask?.priority || null,
      readyForDyeingSections,
      otherSections,
      assignedTo: dyeingTask?.assignedTo || null,
      assignedToName: dyeingTask?.assignedToName || null,
      timeline: item.timeline || [],
      createdAt: dyeingTask?.createdAt || item.createdAt,
    }
  })

  // Filter by priority if specified
  if (priority) {
    tasks = tasks.filter((t) => t.priority === priority)
  }

  // Sort tasks
  tasks.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "fwdDate":
        const dateA = a.fwdDate ? new Date(a.fwdDate) : new Date("2099-12-31")
        const dateB = b.fwdDate ? new Date(b.fwdDate) : new Date("2099-12-31")
        comparison = dateA - dateB
        break
      case "priority":
        const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3, null: 4 }
        comparison = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
        break
      case "createdAt":
        comparison = new Date(a.createdAt) - new Date(b.createdAt)
        break
      default:
        comparison = 0
    }

    return sortOrder === "desc" ? -comparison : comparison
  })

  return HttpResponse.json({
    success: true,
    data: tasks,
    meta: {
      total: tasks.length,
    },
  })
})

/**
 * GET /api/dyeing/my-tasks
 * Get tasks assigned to current user with sections they've accepted
 */
const getMyTasks = http.get(`${BASE_URL}/my-tasks`, async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")
  const sortBy = url.searchParams.get("sortBy") || "fwdDate"
  const sortOrder = url.searchParams.get("sortOrder") || "asc"

  if (!userId) {
    return HttpResponse.json({ success: false, error: "userId is required" }, { status: 400 })
  }

  // Find order items where this user has accepted dyeing tasks
  const myItems = mockOrderItems.filter((item) => {
    if (!item.sectionStatuses) return false

    // Check if any section was accepted by this user and is not yet completed/rejected
    return Object.values(item.sectionStatuses).some((s) => {
      const isAcceptedByUser =
        s.dyeingAcceptedBy === userId ||
        s.dyeingAcceptedBy === parseInt(userId) ||
        s.dyeingAcceptedBy === String(userId)
      const isActive = [SECTION_STATUS.DYEING_ACCEPTED, SECTION_STATUS.DYEING_IN_PROGRESS].includes(
        s.status
      )

      return isAcceptedByUser && isActive
    })
  })

  let tasks = myItems.map((item) => {
    const order = findOrder(item.orderId)
    const dyeingTask = getDyeingTaskByOrderItemId(item.id)

    // Get sections accepted by this user
    const mySections = Object.entries(item.sectionStatuses || {})
      .filter(([_, data]) => {
        const isAcceptedByUser =
          data.dyeingAcceptedBy === userId ||
          data.dyeingAcceptedBy === parseInt(userId) ||
          data.dyeingAcceptedBy === String(userId)
        return (
          isAcceptedByUser &&
          [
            SECTION_STATUS.DYEING_ACCEPTED,
            SECTION_STATUS.DYEING_IN_PROGRESS,
            SECTION_STATUS.DYEING_COMPLETED,
          ].includes(data.status)
        )
      })
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        status: data.status,
        round: data.dyeingRound || 1,
        acceptedAt: data.dyeingAcceptedAt,
        startedAt: data.dyeingStartedAt,
        completedAt: data.dyeingCompletedAt,
        materials:
          item.materialRequirements?.filter((m) => m.piece?.toLowerCase() === name.toLowerCase()) ||
          [],
      }))

    // Get other sections for context
    const otherSections = Object.entries(item.sectionStatuses || {})
      .filter(([_, data]) => {
        const isAcceptedByUser =
          data.dyeingAcceptedBy === userId ||
          data.dyeingAcceptedBy === parseInt(userId) ||
          data.dyeingAcceptedBy === String(userId)
        return !isAcceptedByUser
      })
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        status: data.status,
      }))

    return {
      id: dyeingTask?.id || `task-${item.id}`,
      orderItemId: item.id,
      orderId: item.orderId,
      orderNumber: order?.orderNumber || "",
      customerName: order?.customerName || "",
      productName: item.productName,
      productSku: item.productSku,
      productImage: item.productImage,
      size: item.size,
      quantity: item.quantity,
      fwdDate: order?.fwdDate || null,
      priority: order?.priority || dyeingTask?.priority || null,
      mySections,
      otherSections,
      acceptedAt: dyeingTask?.assignedAt,
    }
  })

  // Sort tasks
  tasks.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "fwdDate":
        const dateA = a.fwdDate ? new Date(a.fwdDate) : new Date("2099-12-31")
        const dateB = b.fwdDate ? new Date(b.fwdDate) : new Date("2099-12-31")
        comparison = dateA - dateB
        break
      case "acceptedAt":
        comparison = new Date(a.acceptedAt || 0) - new Date(b.acceptedAt || 0)
        break
      case "priority":
        const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3, null: 4 }
        comparison = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
        break
      default:
        comparison = 0
    }

    return sortOrder === "desc" ? -comparison : comparison
  })

  return HttpResponse.json({
    success: true,
    data: tasks,
    meta: {
      total: tasks.length,
      inProgress: tasks.filter((t) =>
        t.mySections.some((s) => s.status === SECTION_STATUS.DYEING_IN_PROGRESS)
      ).length,
      accepted: tasks.filter((t) =>
        t.mySections.some((s) => s.status === SECTION_STATUS.DYEING_ACCEPTED)
      ).length,
    },
  })
})

/**
 * GET /api/dyeing/completed-tasks
 * Get completed dyeing tasks with filters
 */
const getCompletedTasks = http.get(`${BASE_URL}/completed-tasks`, async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")
  const page = parseInt(url.searchParams.get("page")) || 1
  const limit = parseInt(url.searchParams.get("limit")) || 10
  const startDate = url.searchParams.get("startDate")
  const endDate = url.searchParams.get("endDate")

  // Find order items where sections are DYEING_COMPLETED by this user
  let completedItems = mockOrderItems.filter((item) => {
    if (!item.sectionStatuses) return false

    return Object.values(item.sectionStatuses).some((s) => {
      const isCompletedByUser =
        !userId ||
        s.dyeingAcceptedBy === userId ||
        s.dyeingAcceptedBy === parseInt(userId) ||
        s.dyeingAcceptedBy === String(userId)

      const isCompleted =
        [SECTION_STATUS.DYEING_COMPLETED, SECTION_STATUS.READY_FOR_PRODUCTION].includes(s.status) &&
        s.dyeingCompletedAt

      return isCompletedByUser && isCompleted
    })
  })

  // Filter by date range
  if (startDate || endDate) {
    completedItems = completedItems.filter((item) => {
      const completedSections = Object.values(item.sectionStatuses || {}).filter(
        (s) => s.dyeingCompletedAt
      )

      if (completedSections.length === 0) return false

      const latestCompletion = completedSections
        .map((s) => new Date(s.dyeingCompletedAt))
        .sort((a, b) => b - a)[0]

      if (startDate && latestCompletion < new Date(startDate)) return false
      if (endDate && latestCompletion > new Date(endDate)) return false

      return true
    })
  }

  // Sort by completion date (newest first)
  completedItems.sort((a, b) => {
    const getLatestCompletion = (item) => {
      const dates = Object.values(item.sectionStatuses || {})
        .filter((s) => s.dyeingCompletedAt)
        .map((s) => new Date(s.dyeingCompletedAt))
      return dates.length > 0 ? Math.max(...dates) : 0
    }
    return getLatestCompletion(b) - getLatestCompletion(a)
  })

  // Paginate
  const total = completedItems.length
  const startIndex = (page - 1) * limit
  const paginatedItems = completedItems.slice(startIndex, startIndex + limit)

  const tasks = paginatedItems.map((item) => {
    const order = findOrder(item.orderId)

    const completedSections = Object.entries(item.sectionStatuses || {})
      .filter(([_, data]) => data.dyeingCompletedAt)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        completedAt: data.dyeingCompletedAt,
        duration:
          data.dyeingStartedAt && data.dyeingCompletedAt
            ? new Date(data.dyeingCompletedAt) - new Date(data.dyeingStartedAt)
            : null,
      }))

    return {
      orderItemId: item.id,
      orderId: item.orderId,
      orderNumber: order?.orderNumber || "",
      customerName: order?.customerName || "",
      productName: item.productName,
      completedSections,
      completedAt: completedSections[0]?.completedAt,
    }
  })

  return HttpResponse.json({
    success: true,
    data: tasks,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
})

/**
 * GET /api/dyeing/task/:orderItemId
 * Get detailed dyeing task info for an order item
 */
const getTaskDetails = http.get(`${BASE_URL}/task/:orderItemId`, async ({ params }) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const { orderItemId } = params

  const orderItem = findOrderItem(orderItemId)
  if (!orderItem) {
    return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
  }

  const order = findOrder(orderItem.orderId)
  const dyeingTask = getDyeingTaskByOrderItemId(orderItemId)

  // Build comprehensive task details
  const sections = Object.entries(orderItem.sectionStatuses || {}).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    status: data.status,
    round: data.dyeingRound || 1,

    // Dyeing-specific fields
    dyeingAcceptedAt: data.dyeingAcceptedAt,
    dyeingAcceptedBy: data.dyeingAcceptedBy,
    dyeingAcceptedByName: data.dyeingAcceptedByName,
    dyeingStartedAt: data.dyeingStartedAt,
    dyeingCompletedAt: data.dyeingCompletedAt,
    dyeingRejectedAt: data.dyeingRejectedAt,
    dyeingRejectedBy: data.dyeingRejectedBy,
    dyeingRejectedByName: data.dyeingRejectedByName,
    dyeingRejectionReasonCode: data.dyeingRejectionReasonCode,
    dyeingRejectionReason: data.dyeingRejectionReason,
    dyeingRejectionNotes: data.dyeingRejectionNotes,

    // Materials for this section
    materials:
      orderItem.materialRequirements?.filter(
        (m) => m.piece?.toLowerCase() === name.toLowerCase()
      ) || [],
  }))

  return HttpResponse.json({
    success: true,
    data: {
      orderItemId: orderItem.id,
      orderId: orderItem.orderId,
      orderNumber: order?.orderNumber || "",
      customerName: order?.customerName || "",
      productName: orderItem.productName,
      productSku: orderItem.productSku,
      productImage: orderItem.productImage,
      size: orderItem.size,
      quantity: orderItem.quantity,
      fwdDate: order?.fwdDate || null,
      priority: order?.priority || dyeingTask?.priority || null,
      status: orderItem.status,
      sections,
      timeline: orderItem.timeline || [],
      dyeingTask: dyeingTask || null,
    },
  })
})

/**
 * GET /api/dyeing/stats
 * Get dyeing dashboard statistics
 */
/**
 * GET /api/dyeing/stats
 * Get dyeing dashboard statistics
 */
const getStats = http.get(`${BASE_URL}/stats`, async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  let availableCount = 0
  let acceptedCount = 0
  let inProgressCount = 0
  let completedTodayCount = 0
  const today = new Date().toDateString()

  // Debug log to see what's happening
  console.log("📊 [Stats] Calculating dyeing stats for userId:", userId)

  mockOrderItems.forEach((item) => {
    if (!item.sectionStatuses) return

    Object.entries(item.sectionStatuses).forEach(([sectionName, section]) => {
      const status = section.status
      
      // Debug log
      console.log(`  Section ${sectionName}: status = "${status}"`)

      // Available: READY_FOR_DYEING and NOT yet accepted by anyone
      if (status === "READY_FOR_DYEING" && !section.dyeingAcceptedBy) {
        availableCount++
        console.log(`    ✅ Counted as available`)
      }

      // User-specific counts (only if userId provided)
      if (userId) {
        const userIdNum = parseInt(userId)
        const isMyTask = 
          section.dyeingAcceptedBy === userId || 
          section.dyeingAcceptedBy === userIdNum ||
          section.dyeingAcceptedBy === String(userId)

        if (isMyTask) {
          // Accepted: status is DYEING_ACCEPTED
          if (status === "DYEING_ACCEPTED") {
            acceptedCount++
          }

          // In Progress: status is DYEING_IN_PROGRESS
          if (status === "DYEING_IN_PROGRESS") {
            inProgressCount++
          }

          // Completed Today
          if (status === "DYEING_COMPLETED" && section.dyeingCompletedAt) {
            const completedDate = new Date(section.dyeingCompletedAt).toDateString()
            if (completedDate === today) {
              completedTodayCount++
            }
          }
        }
      }
    })
  })

  console.log("📊 [Stats] Results:", {
    availableCount,
    acceptedCount,
    inProgressCount,
    completedTodayCount,
  })

  return HttpResponse.json({
    success: true,
    data: {
      availableCount: availableCount,
      acceptedCount: acceptedCount,
      inProgressCount: inProgressCount,
      completedTodayCount: completedTodayCount,
    },
  })
})

/**
 * POST /api/dyeing/task/:orderItemId/accept
 * Accept sections for dyeing
 */
const acceptSections = http.post(
  `${BASE_URL}/task/:orderItemId/accept`,
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { orderItemId } = params
    const data = await request.json()
    const { userId, sections } = data // sections is array of section names to accept

    if (!userId || !sections || sections.length === 0) {
      return HttpResponse.json(
        { success: false, error: "userId and sections are required" },
        { status: 400 }
      )
    }

    const orderItemIndex = mockOrderItems.findIndex((item) => item.id === orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const orderItem = mockOrderItems[orderItemIndex]
    const user = findUser(userId)
    const now = new Date().toISOString()

    // Validate all sections are in READY_FOR_DYEING status
    const invalidSections = sections.filter((sectionName) => {
      const sectionKey = sectionName.toLowerCase()
      const section = orderItem.sectionStatuses?.[sectionKey]
      return !section || section.status !== SECTION_STATUS.READY_FOR_DYEING
    })

    if (invalidSections.length > 0) {
      return HttpResponse.json(
        {
          success: false,
          error: `Sections not ready for dyeing: ${invalidSections.join(", ")}`,
        },
        { status: 400 }
      )
    }

    // Check if order item already has a different user assigned
    const existingAssignee = Object.values(orderItem.sectionStatuses || {}).find(
      (s) =>
        s.dyeingAcceptedBy &&
        s.dyeingAcceptedBy !== userId &&
        s.dyeingAcceptedBy !== parseInt(userId) &&
        [SECTION_STATUS.DYEING_ACCEPTED, SECTION_STATUS.DYEING_IN_PROGRESS].includes(s.status)
    )

    if (existingAssignee) {
      return HttpResponse.json(
        {
          success: false,
          error: "Another user has already accepted tasks for this order item",
        },
        { status: 400 }
      )
    }

    // Accept the sections
    sections.forEach((sectionName) => {
      const sectionKey = sectionName.toLowerCase()
      if (orderItem.sectionStatuses[sectionKey]) {
        orderItem.sectionStatuses[sectionKey] = {
          ...orderItem.sectionStatuses[sectionKey],
          status: SECTION_STATUS.DYEING_ACCEPTED,
          dyeingAcceptedAt: now,
          dyeingAcceptedBy: userId,
          dyeingAcceptedByName: user?.name || "Unknown User",
          updatedAt: now,
        }
      }
    })

    // Update order item status
    orderItem.status = calculateOrderItemStatus(orderItem)
    orderItem.updatedAt = now

    // Add timeline entry
    orderItem.timeline.push({
      id: `log-${Date.now()}`,
      action: `Dyeing accepted for sections: ${sections.join(", ")}`,
      user: user?.name || "Unknown User",
      timestamp: now,
    })

    return HttpResponse.json({
      success: true,
      data: {
        orderItem,
        acceptedSections: sections,
      },
      message: `Accepted ${sections.length} section(s) for dyeing`,
    })
  }
)

/**
 * POST /api/dyeing/task/:orderItemId/start
 * Start dyeing for sections
 */
const startDyeing = http.post(
  `${BASE_URL}/task/:orderItemId/start`,
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { orderItemId } = params
    const data = await request.json()
    const { userId, sections } = data

    if (!userId || !sections || sections.length === 0) {
      return HttpResponse.json(
        { success: false, error: "userId and sections are required" },
        { status: 400 }
      )
    }

    const orderItemIndex = mockOrderItems.findIndex((item) => item.id === orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const orderItem = mockOrderItems[orderItemIndex]
    const user = findUser(userId)
    const now = new Date().toISOString()

    // Validate sections are in DYEING_ACCEPTED and belong to this user
    const invalidSections = sections.filter((sectionName) => {
      const sectionKey = sectionName.toLowerCase()
      const section = orderItem.sectionStatuses?.[sectionKey]
      if (!section || section.status !== SECTION_STATUS.DYEING_ACCEPTED) return true
      if (
        section.dyeingAcceptedBy !== userId &&
        section.dyeingAcceptedBy !== parseInt(userId) &&
        section.dyeingAcceptedBy !== String(userId)
      )
        return true
      return false
    })

    if (invalidSections.length > 0) {
      return HttpResponse.json(
        { success: false, error: `Invalid sections: ${invalidSections.join(", ")}` },
        { status: 400 }
      )
    }

    // Start dyeing for sections
    sections.forEach((sectionName) => {
      const sectionKey = sectionName.toLowerCase()
      if (orderItem.sectionStatuses[sectionKey]) {
        orderItem.sectionStatuses[sectionKey] = {
          ...orderItem.sectionStatuses[sectionKey],
          status: SECTION_STATUS.DYEING_IN_PROGRESS,
          dyeingStartedAt: now,
          updatedAt: now,
        }
      }
    })

    // Update order item status
    orderItem.status = calculateOrderItemStatus(orderItem)
    orderItem.updatedAt = now

    // Add timeline entry
    orderItem.timeline.push({
      id: `log-${Date.now()}`,
      action: `Dyeing started for sections: ${sections.join(", ")}`,
      user: user?.name || "Unknown User",
      timestamp: now,
    })

    return HttpResponse.json({
      success: true,
      data: { orderItem },
      message: `Started dyeing for ${sections.length} section(s)`,
    })
  }
)

const completeDyeing = http.post(
  `${BASE_URL}/task/:orderItemId/complete`,
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const { orderItemId } = params
    const data = await request.json()
    const { userId, sections } = data

    if (!userId || !sections || sections.length === 0) {
      return HttpResponse.json(
        { success: false, error: "userId and sections are required" },
        { status: 400 }
      )
    }

    const orderItemIndex = mockOrderItems.findIndex((item) => item.id === orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const orderItem = mockOrderItems[orderItemIndex]
    const user = findUser(userId)
    const now = new Date().toISOString()

    // Validate sections are in DYEING_IN_PROGRESS and belong to this user
    const invalidSections = sections.filter((sectionName) => {
      const sectionKey = sectionName.toLowerCase()
      const section = orderItem.sectionStatuses?.[sectionKey]
      if (!section) return true
      // Allow completing from either DYEING_ACCEPTED or DYEING_IN_PROGRESS
      if (
        ![SECTION_STATUS.DYEING_ACCEPTED, SECTION_STATUS.DYEING_IN_PROGRESS].includes(
          section.status
        )
      ) {
        return true
      }
      if (
        section.dyeingAcceptedBy !== userId &&
        section.dyeingAcceptedBy !== parseInt(userId) &&
        section.dyeingAcceptedBy !== String(userId)
      )
        return true
      return false
    })

    if (invalidSections.length > 0) {
      return HttpResponse.json(
        { success: false, error: `Invalid sections: ${invalidSections.join(", ")}` },
        { status: 400 }
      )
    }

    // Complete dyeing for sections - move to READY_FOR_PRODUCTION
    sections.forEach((sectionName) => {
      const sectionKey = sectionName.toLowerCase()
      if (orderItem.sectionStatuses[sectionKey]) {
        orderItem.sectionStatuses[sectionKey] = {
          ...orderItem.sectionStatuses[sectionKey],
          status: SECTION_STATUS.READY_FOR_PRODUCTION,
          dyeingCompletedAt: now,
          updatedAt: now,
        }
      }
    })

    // Update order item status
    orderItem.status = calculateOrderItemStatus(orderItem)

    // Check if ALL sections are now ready for production
    const allSectionsReady = Object.values(orderItem.sectionStatuses || {}).every(
      (s) => s.status === SECTION_STATUS.READY_FOR_PRODUCTION
    )

    if (allSectionsReady) {
      orderItem.status = ORDER_ITEM_STATUS.READY_FOR_PRODUCTION
    }

    orderItem.updatedAt = now

    // Add timeline entry
    orderItem.timeline.push({
      id: `log-${Date.now()}`,
      action: `Dyeing completed for sections: ${sections.join(", ")}. ${allSectionsReady ? "All sections ready for production." : ""}`,
      user: user?.name || "Unknown User",
      timestamp: now,
    })

    return HttpResponse.json({
      success: true,
      data: {
        orderItem,
        allSectionsReady,
      },
      message: `Dyeing completed for ${sections.length} section(s)${allSectionsReady ? ". Order item ready for production!" : ""}`,
    })
  }
)

/**
 * POST /api/dyeing/task/:orderItemId/reject
 * Reject sections from dyeing - releases inventory and sends back to fabrication
 */
const rejectSections = http.post(
  `${BASE_URL}/task/:orderItemId/reject`,
  async ({ params, request }) => {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const { orderItemId } = params
    const data = await request.json()
    const { userId, sections, reasonCode, notes } = data

    // Notes are required for rejection
    if (!userId || !sections || sections.length === 0 || !notes) {
      return HttpResponse.json(
        { success: false, error: "userId, sections, and notes are required" },
        { status: 400 }
      )
    }

    const orderItemIndex = mockOrderItems.findIndex((item) => item.id === orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const orderItem = mockOrderItems[orderItemIndex]
    const user = findUser(userId)
    const now = new Date().toISOString()

    // Get rejection reason label
    const rejectionReason =
      reasonCode && DYEING_REJECTION_REASONS[reasonCode]
        ? DYEING_REJECTION_REASONS[reasonCode].label
        : "Unspecified reason"

    // Validate sections are in a dyeing state
    const invalidSections = sections.filter((sectionName) => {
      const sectionKey = sectionName.toLowerCase()
      const section = orderItem.sectionStatuses?.[sectionKey]
      if (!section) return true

      // Can reject from READY_FOR_DYEING, DYEING_ACCEPTED, or DYEING_IN_PROGRESS
      return ![
        SECTION_STATUS.READY_FOR_DYEING,
        SECTION_STATUS.DYEING_ACCEPTED,
        SECTION_STATUS.DYEING_IN_PROGRESS,
      ].includes(section.status)
    })

    if (invalidSections.length > 0) {
      return HttpResponse.json(
        { success: false, error: `Cannot reject sections: ${invalidSections.join(", ")}` },
        { status: 400 }
      )
    }

    // Track what needs to happen for each rejected section
    const rejectedSections = []
    const inventoryReleased = []
    const packetsInvalidated = []

    // Process each rejected section
    sections.forEach((sectionName) => {
      const sectionKey = sectionName.toLowerCase()
      const sectionData = orderItem.sectionStatuses[sectionKey]

      // Store previous fabrication user for reassignment
      const previousFabricationUser = sectionData.packetCreatedBy || null
      const previousFabricationUserName = sectionData.packetCreatedByName || null

      // Update section status to PENDING_INVENTORY_CHECK (back to start)
      orderItem.sectionStatuses[sectionKey] = {
        ...sectionData,
        status: SECTION_STATUS.PENDING_INVENTORY_CHECK,

        // Clear dyeing data
        dyeingAcceptedAt: null,
        dyeingAcceptedBy: null,
        dyeingAcceptedByName: null,
        dyeingStartedAt: null,
        dyeingCompletedAt: null,

        // Set rejection data
        dyeingRejectedAt: now,
        dyeingRejectedBy: userId,
        dyeingRejectedByName: user?.name || "Unknown User",
        dyeingRejectionReasonCode: reasonCode || null,
        dyeingRejectionReason: rejectionReason,
        dyeingRejectionNotes: notes,

        // Increment round for tracking
        dyeingRound: (sectionData.dyeingRound || 1) + 1,

        // Store previous fabrication user for auto-reassignment
        previousFabricationUserId: previousFabricationUser,
        previousFabricationUserName: previousFabricationUserName,

        // Clear inventory check results to force re-check
        inventoryCheckResult: null,

        updatedAt: now,
      }

      rejectedSections.push({
        name: sectionName,
        round: (sectionData.dyeingRound || 1) + 1,
        previousFabricationUser: previousFabricationUserName,
      })

      // Release inventory for this section
      const sectionMaterials =
        orderItem.materialRequirements?.filter((m) => m.piece?.toLowerCase() === sectionKey) || []

      sectionMaterials.forEach((material) => {
        // Find inventory item and release stock
        const invIndex = mockInventoryItems.findIndex((inv) => inv.id === material.inventoryItemId)
        if (invIndex !== -1) {
          mockInventoryItems[invIndex].remaining_stock += material.requiredQty
          mockInventoryItems[invIndex].updatedAt = now

          inventoryReleased.push({
            inventoryItemId: material.inventoryItemId,
            name: material.inventoryItemName,
            quantity: material.requiredQty,
            section: sectionName,
          })
        }
      })

      // Mark packet as INVALIDATED for this section
      const packet = mockPackets.find((p) => p.orderItemId === orderItemId)
      if (packet) {
        // If packet tracks sections, mark this section's portion as invalidated
        if (packet.sectionsIncluded?.includes(sectionName)) {
          // Remove from sectionsIncluded, add to invalidated list
          packet.sectionsIncluded = packet.sectionsIncluded.filter(
            (s) => s.toLowerCase() !== sectionKey
          )
          packet.invalidatedSections = packet.invalidatedSections || []
          packet.invalidatedSections.push({
            section: sectionName,
            invalidatedAt: now,
            reason: `Dyeing rejection: ${rejectionReason}`,
          })

          // If all sections invalidated, mark entire packet as INVALIDATED
          if (packet.sectionsIncluded.length === 0) {
            packet.status = PACKET_STATUS.INVALIDATED
          }

          packet.updatedAt = now

          packetsInvalidated.push({
            packetId: packet.id,
            section: sectionName,
          })
        }
      }
    })

    // Update order item status
    orderItem.status = calculateOrderItemStatus(orderItem)

    // If some sections were in dyeing and got rejected, we might need to go back to partial states
    const sectionStatuses = Object.values(orderItem.sectionStatuses || {})
    const hasInDyeing = sectionStatuses.some((s) =>
      [
        SECTION_STATUS.DYEING_ACCEPTED,
        SECTION_STATUS.DYEING_IN_PROGRESS,
        SECTION_STATUS.DYEING_COMPLETED,
      ].includes(s.status)
    )
    const hasAwaitingOrPacket = sectionStatuses.some((s) =>
      [
        SECTION_STATUS.PENDING_INVENTORY_CHECK,
        SECTION_STATUS.AWAITING_MATERIAL,
        SECTION_STATUS.CREATE_PACKET,
        SECTION_STATUS.PACKET_CREATED,
        SECTION_STATUS.PACKET_VERIFIED,
      ].includes(s.status)
    )

    if (hasInDyeing && hasAwaitingOrPacket) {
      orderItem.status = ORDER_ITEM_STATUS.PARTIALLY_IN_DYEING
    } else if (!hasInDyeing && hasAwaitingOrPacket) {
      // Determine appropriate packet/inventory status
      const hasAwaiting = sectionStatuses.some((s) => s.status === SECTION_STATUS.AWAITING_MATERIAL)
      const hasPendingCheck = sectionStatuses.some(
        (s) => s.status === SECTION_STATUS.PENDING_INVENTORY_CHECK
      )

      if (hasPendingCheck) {
        orderItem.status = ORDER_ITEM_STATUS.INVENTORY_CHECK
      } else if (hasAwaiting) {
        orderItem.status = ORDER_ITEM_STATUS.AWAITING_MATERIAL
      }
    }

    orderItem.updatedAt = now

    // Add timeline entry
    orderItem.timeline.push({
      id: `log-${Date.now()}`,
      action: `Dyeing rejected for sections: ${sections.join(", ")}. Reason: ${rejectionReason}. Notes: ${notes}`,
      user: user?.name || "Unknown User",
      timestamp: now,
    })

    // Add separate timeline entries for inventory release
    if (inventoryReleased.length > 0) {
      orderItem.timeline.push({
        id: `log-${Date.now() + 1}`,
        action: `Inventory released back to stock for rejected sections`,
        user: "System",
        timestamp: now,
        details: inventoryReleased,
      })
    }

    return HttpResponse.json({
      success: true,
      data: {
        orderItem,
        rejectedSections,
        inventoryReleased,
        packetsInvalidated,
      },
      message: `Rejected ${sections.length} section(s). Inventory released, sections sent back to inventory check.`,
    })
  }
)

// ============================================================================
// EXPORT ALL HANDLERS
// ============================================================================

export const dyeingHandlers = [
  getAvailableTasks,
  getMyTasks,
  getCompletedTasks,
  getTaskDetails,
  getStats,
  acceptSections,
  startDyeing,
  completeDyeing,
  rejectSections,
]

// Export for Part 2
export {
  getAvailableTasks,
  getMyTasks,
  findUser,
  findOrder,
  findOrderItem,
  calculateOrderItemStatus,
  enrichTaskWithOrderDetails,
  BASE_URL,
}
