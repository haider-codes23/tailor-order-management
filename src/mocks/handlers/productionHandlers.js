/**
 * Production Handlers - MSW handlers for Phase 13 Production Workflow
 * src/mocks/handlers/productionHandlers.js
 *
 * VERIFIED VERSION - Properly filters order items with sections ready for production
 */

import { http, HttpResponse } from "msw"
import { mockOrderItems, mockOrders } from "../data/mockOrders"
import {
  mockUsers,
  getActiveProductionHeads,
  getActiveProductionWorkers,
  getUserById,
} from "../data/mockUser"
import {
  mockProductionTasks,
  mockProductionAssignments,
  roundRobinState,
} from "../data/mockProductionTasks"
import {
  ORDER_ITEM_STATUS,
  SECTION_STATUS,
  PRODUCTION_TASK_STATUS,
} from "../../constants/orderConstants"

const BASE_URL = "/api/production"

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current user from auth token (simplified - in real app, decode JWT)
 */
const getCurrentUser = (request) => {
  // For now, return a mock logged-in user based on some logic
  // In production, this would decode the JWT token
  const authHeader = request.headers.get("Authorization")
  if (authHeader) {
    // Simplified: Return first production head or worker based on role
    // In real implementation, decode JWT to get user ID
  }
  // Default to admin for testing
  return mockUsers.find((u) => u.id === 1)
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
 * Get sections ready for production from an order item
 * FIXED: Properly handles sectionStatuses object structure
 */
const getSectionsReadyForProduction = (orderItem) => {
  if (!orderItem.sectionStatuses) return []

  const readySections = []

  // sectionStatuses is an object like { "shirt": { status: "...", ... }, "farshi": { ... } }
  Object.entries(orderItem.sectionStatuses).forEach(([sectionKey, sectionData]) => {
    if (
      sectionData.status === SECTION_STATUS.READY_FOR_PRODUCTION ||
      sectionData.status === SECTION_STATUS.DYEING_COMPLETED
    ) {
      readySections.push({
        name: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1), // Capitalize
        status: sectionData.status,
        ...sectionData,
      })
    }
  })

  return readySections
}

/**
 * Check if order item has any section ready for production
 */
const hasAnySectionReadyForProduction = (orderItem) => {
  if (!orderItem.sectionStatuses) {
    // Fallback: check order item status directly
    return (
      orderItem.status === ORDER_ITEM_STATUS.READY_FOR_PRODUCTION ||
      orderItem.status === ORDER_ITEM_STATUS.DYEING_COMPLETED ||
      orderItem.status === ORDER_ITEM_STATUS.PARTIAL_IN_PRODUCTION
    )
  }

  return Object.values(orderItem.sectionStatuses).some(
    (section) =>
      section.status === SECTION_STATUS.READY_FOR_PRODUCTION ||
      section.status === SECTION_STATUS.DYEING_COMPLETED
  )
}

/**
 * Check if order item already has a production head assigned
 */
const hasProductionHeadAssigned = (orderItemId) => {
  return mockProductionAssignments.some((a) => a.orderItemId === orderItemId)
}

/**
 * Get next production head using round robin
 */
const getNextProductionHead = () => {
  const productionHeads = getActiveProductionHeads()
  if (productionHeads.length === 0) return null

  const nextIndex = (roundRobinState.lastAssignedIndex + 1) % productionHeads.length
  return productionHeads[nextIndex]
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * GET /api/production/round-robin-state
 * Get current round-robin state
 */
const getRoundRobinState = http.get(`${BASE_URL}/round-robin-state`, async () => {
  const productionHeads = getActiveProductionHeads()
  const nextHead = getNextProductionHead()

  return HttpResponse.json({
    success: true,
    data: {
      lastAssignedIndex: roundRobinState.lastAssignedIndex,
      productionHeadIds: productionHeads.map((h) => h.id),
      productionHeads: productionHeads.map((h) => ({ id: h.id, name: h.name })),
      nextProductionHead: nextHead ? { id: nextHead.id, name: nextHead.name } : null,
      totalProductionHeads: productionHeads.length,
      stats: {
        inProduction: mockOrderItems.filter(
          (oi) =>
            oi.status === ORDER_ITEM_STATUS.IN_PRODUCTION ||
            oi.status === ORDER_ITEM_STATUS.PARTIAL_IN_PRODUCTION
        ).length,
        completedToday: 0, // Would calculate based on timestamps
      },
      updatedAt: roundRobinState.updatedAt,
    },
  })
})

/**
 * GET /api/production/ready-for-assignment
 * Get order items ready for production head assignment
 * FIXED: Properly filters and structures the response
 * FIXED: Returns both 'id' and 'orderItemId' for backward compatibility
 */
const getReadyForAssignment = http.get(`${BASE_URL}/ready-for-assignment`, async () => {
  // Find order items that:
  // 1. Have at least one section with READY_FOR_PRODUCTION or DYEING_COMPLETED status
  // 2. Don't already have a production head assigned
  const readyItems = mockOrderItems
    .filter((orderItem) => {
      const hasReadySections = hasAnySectionReadyForProduction(orderItem)
      const alreadyAssigned = hasProductionHeadAssigned(orderItem.id)

      console.log(
        `[getReadyForAssignment] Item ${orderItem.id}: hasReadySections=${hasReadySections}, alreadyAssigned=${alreadyAssigned}`
      )

      return hasReadySections && !alreadyAssigned
    })
    .map((orderItem) => {
      const order = findOrder(orderItem.orderId)
      const readySections = getSectionsReadyForProduction(orderItem)
      const allSections = orderItem.sectionStatuses ? Object.keys(orderItem.sectionStatuses) : []

      return {
        // FIXED: Include both 'id' and 'orderItemId' for compatibility
        id: orderItem.id,
        orderItemId: orderItem.id, // Alias for backward compatibility
        orderId: orderItem.orderId,
        orderNumber: order?.orderNumber || `ORD-${orderItem.orderId}`,
        productId: orderItem.productId,
        productName: orderItem.productName,
        productImage: orderItem.productImage,
        customerName: order?.customerName || "N/A",
        fwdDate: order?.fwdDate || orderItem.fwdDate,
        status: orderItem.status,
        // Ready sections as array of names (for display)
        readySections: readySections.map((s) => s.name),
        // Full section data
        sections: readySections,
        totalSections: allSections.length,
        createdAt: orderItem.createdAt,
      }
    })

  const nextHead = getNextProductionHead()

  console.log(
    `[getReadyForAssignment] Found ${readyItems.length} ready items:`,
    readyItems.map((i) => ({ id: i.id, name: i.productName }))
  )

  return HttpResponse.json({
    success: true,
    data: {
      items: readyItems,
      nextProductionHead: nextHead ? { id: nextHead.id, name: nextHead.name } : null,
      total: readyItems.length,
    },
  })
})

/**
 * POST /api/production/assign-head/:orderItemId
 * Assign production head to an order item via round-robin
 */
const assignProductionHead = http.post(
  `${BASE_URL}/assign-head/:orderItemId`,
  async ({ params }) => {
    const { orderItemId } = params
    const orderItem = findOrderItem(orderItemId)

    if (!orderItem) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    // Check if already assigned
    if (hasProductionHeadAssigned(orderItemId)) {
      return HttpResponse.json(
        { success: false, error: "Order item already has a production head assigned" },
        { status: 400 }
      )
    }

    // Get next production head
    const productionHeads = getActiveProductionHeads()
    if (productionHeads.length === 0) {
      return HttpResponse.json(
        { success: false, error: "No active production heads available" },
        { status: 400 }
      )
    }

    const nextIndex = (roundRobinState.lastAssignedIndex + 1) % productionHeads.length
    const assignedHead = productionHeads[nextIndex]

    // Update round-robin state
    roundRobinState.lastAssignedIndex = nextIndex
    roundRobinState.updatedAt = new Date().toISOString()

    // Create assignment
    const assignment = {
      id: `assign-${Date.now()}`,
      orderItemId,
      productionHeadId: assignedHead.id,
      productionHeadName: assignedHead.name,
      assignedAt: new Date().toISOString(),
      assignedBy: 1, // Admin
      productionStartedAt: null,
    }
    mockProductionAssignments.push(assignment)

    // Update order item timeline
    const orderItemIndex = mockOrderItems.findIndex((oi) => oi.id === orderItemId)
    if (orderItemIndex !== -1) {
      mockOrderItems[orderItemIndex].timeline = mockOrderItems[orderItemIndex].timeline || []
      mockOrderItems[orderItemIndex].timeline.push({
        id: `log-${Date.now()}`,
        action: `Production head assigned: ${assignedHead.name}`,
        user: "System",
        timestamp: new Date().toISOString(),
      })
    }

    return HttpResponse.json({
      success: true,
      data: {
        assignment,
        nextProductionHead: getNextProductionHead(),
      },
      message: `Production head ${assignedHead.name} assigned successfully`,
    })
  }
)

/**
 * GET /api/production/my-assignments
 * Get order items assigned to current production head
 */
const getMyAssignments = http.get(`${BASE_URL}/my-assignments`, async ({ request }) => {
  // In real implementation, get user from JWT
  // For now, get all production head assignments or filter by a specific user
  const currentUser = getCurrentUser(request)

  // Get assignments for the current user (or all if admin)
  const assignments = mockProductionAssignments.filter((a) => {
    // If admin, show all. If production head, show only their assignments
    if (currentUser?.role === "ADMIN") return true
    return a.productionHeadId === currentUser?.id
  })

  const assignedItems = assignments.map((assignment) => {
    const orderItem = findOrderItem(assignment.orderItemId)
    const order = findOrder(orderItem?.orderId)

    // Get all sections with their statuses
    const sections = orderItem?.sectionStatuses
      ? Object.entries(orderItem.sectionStatuses).map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          status: value.status,
          ...value,
        }))
      : []

    // Count tasks for each section
    const sectionsWithTaskCounts = sections.map((section) => {
      const sectionTasks = mockProductionTasks.filter(
        (t) => t.orderItemId === assignment.orderItemId && t.sectionName === section.name
      )
      return {
        ...section,
        tasksCount: sectionTasks.length,
        completedTasks: sectionTasks.filter((t) => t.status === PRODUCTION_TASK_STATUS.COMPLETED)
          .length,
      }
    })

    return {
      id: orderItem?.id,
      orderId: orderItem?.orderId,
      orderNumber: order?.orderNumber || `ORD-${orderItem?.orderId}`,
      productName: orderItem?.productName,
      productImage: orderItem?.productImage,
      customerName: order?.customerName,
      fwdDate: order?.fwdDate,
      status: orderItem?.status,
      sections: sectionsWithTaskCounts,
      assignment: {
        productionHeadId: assignment.productionHeadId,
        productionHeadName: assignment.productionHeadName,
        assignedAt: assignment.assignedAt,
        productionStartedAt: assignment.productionStartedAt,
      },
    }
  })

  return HttpResponse.json({
    success: true,
    data: assignedItems,
  })
})

/**
 * GET /api/production/order-item/:id/details
 * Get order item details for production (sanitized)
 */
const getOrderItemDetails = http.get(
  `${BASE_URL}/order-item/:orderItemId/details`,
  async ({ params }) => {
    const { orderItemId } = params
    const orderItem = findOrderItem(orderItemId)

    if (!orderItem) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const order = findOrder(orderItem.orderId)
    const assignment = mockProductionAssignments.find((a) => a.orderItemId === orderItemId)

    // Get sections with statuses
    const sections = orderItem.sectionStatuses
      ? Object.entries(orderItem.sectionStatuses).map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          status: value.status,
          ...value,
        }))
      : []

    return HttpResponse.json({
      success: true,
      data: {
        id: orderItem.id,
        orderId: orderItem.orderId,
        orderNumber: order?.orderNumber,
        productName: orderItem.productName,
        productImage: orderItem.productImage,
        sku: orderItem.sku,
        // Customer info (limited for production)
        customerName: order?.customerName,
        customerHeight: order?.clientHeight || order?.customerHeight,
        // Size & Measurements
        isCustomSize: orderItem.isCustomSize,
        standardSize: orderItem.standardSize,
        measurements: orderItem.measurements,
        // Style details
        color: orderItem.color,
        fabric: orderItem.fabric,
        modesty: orderItem.modesty,
        styleSketch: orderItem.styleSketch,
        // Dates
        fwdDate: order?.fwdDate,
        productionShipDate: order?.productionShipDate,
        orderDate: order?.createdAt,
        // Sections & Notes
        sections,
        addons: orderItem.addons || [],
        notes: orderItem.notes || order?.notes,
        // Assignment
        assignment: assignment
          ? {
              productionHeadId: assignment.productionHeadId,
              productionHeadName: assignment.productionHeadName,
              assignedAt: assignment.assignedAt,
              productionStartedAt: assignment.productionStartedAt,
            }
          : null,
        status: orderItem.status,
      },
    })
  }
)

/**
 * GET /api/production/workers
 * Get list of production workers for task assignment
 */
const getWorkers = http.get(`${BASE_URL}/workers`, async () => {
  const workers = getActiveProductionWorkers()

  return HttpResponse.json({
    success: true,
    data: workers.map((w) => ({
      id: w.id,
      name: w.name,
      email: w.email,
      phone: w.phone,
    })),
  })
})

/**
 * POST /api/production/order-item/:id/section/:section/tasks
 * Create tasks for a section (bulk)
 */
const createSectionTasks = http.post(
  `${BASE_URL}/order-item/:orderItemId/section/:sectionName/tasks`,
  async ({ params, request }) => {
    const { orderItemId, sectionName } = params
    const data = await request.json()
    const { tasks, notes } = data

    const orderItem = findOrderItem(orderItemId)
    if (!orderItem) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const now = new Date().toISOString()
    const createdTasks = []

    tasks.forEach((task, index) => {
      const worker = getUserById(task.workerId)
      const newTask = {
        id: `task-${Date.now()}-${index}`,
        orderItemId,
        sectionName: sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
        taskType: task.taskType,
        customTaskName: task.customTaskName || null,
        sequenceOrder: task.sequenceOrder || index + 1,
        notes: notes || "",
        assignedToId: parseInt(task.workerId),
        assignedToName: worker?.name || "Unknown",
        assignedAt: now,
        assignedBy: 3, // Production head
        status: index === 0 ? PRODUCTION_TASK_STATUS.READY : PRODUCTION_TASK_STATUS.PENDING,
        startedAt: null,
        completedAt: null,
        duration: null,
        createdAt: now,
        updatedAt: now,
      }
      mockProductionTasks.push(newTask)
      createdTasks.push(newTask)
    })

    return HttpResponse.json({
      success: true,
      data: {
        tasks: createdTasks,
        count: createdTasks.length,
      },
      message: `${createdTasks.length} tasks created for ${sectionName} section`,
    })
  }
)

/**
 * GET /api/production/order-item/:id/section/:section/tasks
 * Get all tasks for a section
 */
const getSectionTasks = http.get(
  `${BASE_URL}/order-item/:orderItemId/section/:sectionName/tasks`,
  async ({ params }) => {
    const { orderItemId, sectionName } = params

    const tasks = mockProductionTasks
      .filter(
        (t) =>
          t.orderItemId === orderItemId && t.sectionName.toLowerCase() === sectionName.toLowerCase()
      )
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)

    return HttpResponse.json({
      success: true,
      data: {
        tasks,
        count: tasks.length,
      },
    })
  }
)

/**
 * POST /api/production/order-item/:id/section/:section/start
 * Start production for a section
 */
const startSectionProduction = http.post(
  `${BASE_URL}/order-item/:orderItemId/section/:sectionName/start`,
  async ({ params }) => {
    const { orderItemId, sectionName } = params
    const now = new Date().toISOString()

    // Update section status
    const orderItemIndex = mockOrderItems.findIndex((oi) => oi.id === orderItemId)
    if (orderItemIndex !== -1 && mockOrderItems[orderItemIndex].sectionStatuses) {
      const sectionKey = sectionName.toLowerCase()
      if (mockOrderItems[orderItemIndex].sectionStatuses[sectionKey]) {
        mockOrderItems[orderItemIndex].sectionStatuses[sectionKey].status =
          SECTION_STATUS.IN_PRODUCTION
        mockOrderItems[orderItemIndex].sectionStatuses[sectionKey].productionStartedAt = now
        mockOrderItems[orderItemIndex].sectionStatuses[sectionKey].updatedAt = now
      }

      // Update overall order item status
      const allSections = Object.values(mockOrderItems[orderItemIndex].sectionStatuses)
      const hasInProduction = allSections.some((s) => s.status === SECTION_STATUS.IN_PRODUCTION)
      const allInProduction = allSections.every(
        (s) =>
          s.status === SECTION_STATUS.IN_PRODUCTION ||
          s.status === SECTION_STATUS.PRODUCTION_COMPLETED
      )

      if (allInProduction) {
        mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.IN_PRODUCTION
      } else if (hasInProduction) {
        mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.PARTIAL_IN_PRODUCTION
      }

      // Update assignment
      const assignmentIndex = mockProductionAssignments.findIndex(
        (a) => a.orderItemId === orderItemId
      )
      if (
        assignmentIndex !== -1 &&
        !mockProductionAssignments[assignmentIndex].productionStartedAt
      ) {
        mockProductionAssignments[assignmentIndex].productionStartedAt = now
      }

      // Add timeline entry
      mockOrderItems[orderItemIndex].timeline = mockOrderItems[orderItemIndex].timeline || []
      mockOrderItems[orderItemIndex].timeline.push({
        id: `log-${Date.now()}`,
        action: `Production started for ${sectionName} section`,
        user: "Production Head",
        timestamp: now,
      })
    }

    return HttpResponse.json({
      success: true,
      message: `Production started for ${sectionName}`,
    })
  }
)

/**
 * GET /api/production/worker/my-tasks
 * Get all tasks assigned to current worker
 */
const getWorkerTasks = http.get(`${BASE_URL}/worker/my-tasks`, async ({ request }) => {
  // In real implementation, get user from JWT
  // For now, return all tasks or filter by a specific worker
  const currentUser = getCurrentUser(request)

  // Get tasks - if worker, filter to their tasks only
  let tasks = mockProductionTasks
  if (currentUser?.role === "WORKER") {
    tasks = tasks.filter((t) => t.assignedToId === currentUser.id)
  }

  // Enrich tasks with order info and blocking task info
  const enrichedTasks = tasks.map((task) => {
    const orderItem = findOrderItem(task.orderItemId)
    const order = findOrder(orderItem?.orderId)

    // Find blocking task (previous task in sequence)
    let blockingTask = null
    if (task.status === PRODUCTION_TASK_STATUS.PENDING) {
      const sectionTasks = mockProductionTasks
        .filter(
          (t) =>
            t.orderItemId === task.orderItemId &&
            t.sectionName === task.sectionName &&
            t.sequenceOrder < task.sequenceOrder
        )
        .sort((a, b) => b.sequenceOrder - a.sequenceOrder)

      const previousTask = sectionTasks[0]
      if (previousTask && previousTask.status !== PRODUCTION_TASK_STATUS.COMPLETED) {
        const worker = getUserById(previousTask.assignedToId)
        blockingTask = {
          taskId: previousTask.id,
          taskName:
            previousTask.taskType === "CUSTOM"
              ? previousTask.customTaskName
              : previousTask.taskType,
          status: previousTask.status,
          workerName: worker?.name || previousTask.assignedToName,
        }
      }
    }

    return {
      ...task,
      orderNumber: order?.orderNumber || `ORD-${orderItem?.orderId}`,
      productName: orderItem?.productName,
      productImage: orderItem?.productImage,
      fwdDate: order?.fwdDate,
      blockingTask,
    }
  })

  return HttpResponse.json({
    success: true,
    data: enrichedTasks,
  })
})

/**
 * POST /api/production/tasks/:taskId/start
 * Start a task
 */
const startTaskHandler = http.post(`${BASE_URL}/tasks/:taskId/start`, async ({ params }) => {
  const { taskId } = params
  const now = new Date().toISOString()

  const taskIndex = mockProductionTasks.findIndex((t) => t.id === taskId)
  if (taskIndex === -1) {
    return HttpResponse.json({ success: false, error: "Task not found" }, { status: 404 })
  }

  const task = mockProductionTasks[taskIndex]

  // Check if task can be started (must be READY status)
  if (task.status !== PRODUCTION_TASK_STATUS.READY) {
    return HttpResponse.json(
      { success: false, error: "Task cannot be started. Status must be READY." },
      { status: 400 }
    )
  }

  // Update task
  mockProductionTasks[taskIndex].status = PRODUCTION_TASK_STATUS.IN_PROGRESS
  mockProductionTasks[taskIndex].startedAt = now
  mockProductionTasks[taskIndex].updatedAt = now

  return HttpResponse.json({
    success: true,
    data: mockProductionTasks[taskIndex],
    message: "Task started successfully",
  })
})

/**
 * POST /api/production/tasks/:taskId/complete
 * Complete a task
 */
const completeTaskHandler = http.post(`${BASE_URL}/tasks/:taskId/complete`, async ({ params }) => {
  const { taskId } = params
  const now = new Date().toISOString()

  const taskIndex = mockProductionTasks.findIndex((t) => t.id === taskId)
  if (taskIndex === -1) {
    return HttpResponse.json({ success: false, error: "Task not found" }, { status: 404 })
  }

  const task = mockProductionTasks[taskIndex]

  // Check if task can be completed
  if (task.status !== PRODUCTION_TASK_STATUS.IN_PROGRESS) {
    return HttpResponse.json(
      { success: false, error: "Task cannot be completed. Must be IN_PROGRESS." },
      { status: 400 }
    )
  }

  // Calculate duration in minutes
  const startTime = new Date(task.startedAt)
  const endTime = new Date(now)
  const durationMs = endTime - startTime
  const durationMinutes = Math.round(durationMs / (1000 * 60))

  // Update task
  mockProductionTasks[taskIndex].status = PRODUCTION_TASK_STATUS.COMPLETED
  mockProductionTasks[taskIndex].completedAt = now
  mockProductionTasks[taskIndex].duration = durationMinutes
  mockProductionTasks[taskIndex].updatedAt = now

  // Mark next task as READY
  const nextTask = mockProductionTasks.find(
    (t) =>
      t.orderItemId === task.orderItemId &&
      t.sectionName === task.sectionName &&
      t.sequenceOrder === task.sequenceOrder + 1
  )
  if (nextTask) {
    const nextIndex = mockProductionTasks.findIndex((t) => t.id === nextTask.id)
    if (nextIndex !== -1) {
      mockProductionTasks[nextIndex].status = PRODUCTION_TASK_STATUS.READY
      mockProductionTasks[nextIndex].updatedAt = now
    }
  }

  // Check if all tasks for this section are complete
  const sectionTasks = mockProductionTasks.filter(
    (t) => t.orderItemId === task.orderItemId && t.sectionName === task.sectionName
  )
  const allComplete = sectionTasks.every((t) => t.status === PRODUCTION_TASK_STATUS.COMPLETED)

  if (allComplete) {
    // Update section status to PRODUCTION_COMPLETED
    const orderItemIndex = mockOrderItems.findIndex((oi) => oi.id === task.orderItemId)
    if (orderItemIndex !== -1 && mockOrderItems[orderItemIndex].sectionStatuses) {
      const sectionKey = task.sectionName.toLowerCase()
      if (mockOrderItems[orderItemIndex].sectionStatuses[sectionKey]) {
        mockOrderItems[orderItemIndex].sectionStatuses[sectionKey].status =
          SECTION_STATUS.PRODUCTION_COMPLETED
        mockOrderItems[orderItemIndex].sectionStatuses[sectionKey].updatedAt = now
      }

      // Check if all sections are production completed
      const allSectionsComplete = Object.values(
        mockOrderItems[orderItemIndex].sectionStatuses
      ).every((s) => s.status === SECTION_STATUS.PRODUCTION_COMPLETED)

      if (allSectionsComplete) {
        mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.PRODUCTION_COMPLETED
      }

      // Add timeline entry
      mockOrderItems[orderItemIndex].timeline = mockOrderItems[orderItemIndex].timeline || []
      mockOrderItems[orderItemIndex].timeline.push({
        id: `log-${Date.now()}`,
        action: `Production completed for ${task.sectionName} section${allSectionsComplete ? " - All sections complete!" : ""}`,
        user: task.assignedToName,
        timestamp: now,
      })
    }
  }

  return HttpResponse.json({
    success: true,
    data: mockProductionTasks[taskIndex],
    message: `Task completed${allComplete ? ` - ${task.sectionName} section production finished!` : ""}`,
  })
})

/**
 * GET /api/production/order-item/:id/section/:section/timeline
 * Get section timeline with tasks
 */
const getSectionTimeline = http.get(
  `${BASE_URL}/order-item/:orderItemId/section/:sectionName/timeline`,
  async ({ params }) => {
    const { orderItemId, sectionName } = params

    const tasks = mockProductionTasks
      .filter(
        (t) =>
          t.orderItemId === orderItemId && t.sectionName.toLowerCase() === sectionName.toLowerCase()
      )
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)

    const orderItem = findOrderItem(orderItemId)
    const sectionKey = sectionName.toLowerCase()
    const sectionData = orderItem?.sectionStatuses?.[sectionKey]

    return HttpResponse.json({
      success: true,
      data: {
        sectionName,
        status: sectionData?.status,
        tasks,
        productionStartedAt: sectionData?.productionStartedAt,
      },
    })
  }
)

/**
 * POST /api/production/order-item/:id/section/:section/send-to-qa
 * Move section from PRODUCTION_COMPLETED to QA_PENDING
 */
const sendSectionToQA = http.post(
  `${BASE_URL}/order-item/:orderItemId/section/:sectionName/send-to-qa`,
  async ({ params }) => {
    const { orderItemId, sectionName } = params
    const now = new Date().toISOString()

    const orderItemIndex = mockOrderItems.findIndex((oi) => oi.id === orderItemId)
    if (orderItemIndex === -1) {
      return HttpResponse.json({ success: false, error: "Order item not found" }, { status: 404 })
    }

    const sectionKey = sectionName.toLowerCase()
    if (!mockOrderItems[orderItemIndex].sectionStatuses?.[sectionKey]) {
      return HttpResponse.json({ success: false, error: "Section not found" }, { status: 404 })
    }

    const currentStatus = mockOrderItems[orderItemIndex].sectionStatuses[sectionKey].status
    if (currentStatus !== SECTION_STATUS.PRODUCTION_COMPLETED) {
      return HttpResponse.json(
        { success: false, error: "Section must be PRODUCTION_COMPLETED to send to QA" },
        { status: 400 }
      )
    }

    // Update section status
    mockOrderItems[orderItemIndex].sectionStatuses[sectionKey].status = SECTION_STATUS.QA_PENDING
    mockOrderItems[orderItemIndex].sectionStatuses[sectionKey].sentToQAAt = now
    mockOrderItems[orderItemIndex].sectionStatuses[sectionKey].updatedAt = now

    // Check if all sections are now in QA
    const allSectionsInQA = Object.values(mockOrderItems[orderItemIndex].sectionStatuses).every(
      (s) => s.status === SECTION_STATUS.QA_PENDING || s.status === SECTION_STATUS.QA_APPROVED
    )

    if (allSectionsInQA) {
      mockOrderItems[orderItemIndex].status = ORDER_ITEM_STATUS.QUALITY_ASSURANCE
    }

    // Add timeline entry
    mockOrderItems[orderItemIndex].timeline = mockOrderItems[orderItemIndex].timeline || []
    mockOrderItems[orderItemIndex].timeline.push({
      id: `log-${Date.now()}`,
      action: `${sectionName} section sent to QA${allSectionsInQA ? " - All sections now in QA" : ""}`,
      user: "Production Head",
      timestamp: now,
    })

    return HttpResponse.json({
      success: true,
      message: `${sectionName} sent to QA${allSectionsInQA ? " - All sections now in QA" : ""}`,
    })
  }
)

// ============================================================================
// EXPORT HANDLERS
// ============================================================================

export const productionHandlers = [
  // Round Robin & Assignment
  getRoundRobinState,
  getReadyForAssignment,
  assignProductionHead,

  // Production Head Dashboard
  getMyAssignments,
  getOrderItemDetails,
  getWorkers,

  // Task Management
  createSectionTasks,
  getSectionTasks,
  startSectionProduction,

  // Worker Tasks
  getWorkerTasks,
  startTaskHandler,
  completeTaskHandler,
  getSectionTimeline,

  // Section Completion
  sendSectionToQA,
]

export default productionHandlers
